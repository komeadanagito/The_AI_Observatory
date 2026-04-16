"""MBTI 服务。"""

from __future__ import annotations

import json
from datetime import datetime
from uuid import uuid4

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.ai.client import AIClient
from src.auth.models import User
from src.mbti.models import MBTISession
from src.mbti.prompts import build_next_question_prompt, build_result_prompt
from src.mbti.schemas import (
    CompletedMBTIResponse,
    MBTIProgress,
    MBTIQuestion,
    MBTIResult,
    MBTITypeInfo,
    NextMBTIQuestionResponse,
    ResumeMBTISessionResponse,
    StartMBTISessionResponse,
)
from src.mbti.type_data import MBTI_TYPES

logger = structlog.get_logger(__name__)

QUESTION_BANK: dict[str, list[dict]] = {
    "EI": [
        {
            "text": "在一个陌生聚会里，你更可能如何进入状态？",
            "type": "scenario",
            "options": [
                {"id": "a", "text": "主动和几个人快速聊起来", "weight": {"E": 2}},
                {
                    "id": "b",
                    "text": "先观察气氛，再选择熟悉的人深入聊",
                    "weight": {"I": 2},
                },
                {"id": "c", "text": "找一个安静角落，等别人来找我", "weight": {"I": 1}},
            ],
        },
        {
            "text": "长时间高强度社交后，你通常怎么恢复？",
            "type": "preference",
            "options": [
                {"id": "a", "text": "继续安排活动，越热闹越快恢复", "weight": {"E": 2}},
                {"id": "b", "text": "需要独处或只和少数熟人待着", "weight": {"I": 2}},
            ],
        },
        {
            "text": "当你想到‘有活力的一天’，更像哪一种？",
            "type": "preference",
            "options": [
                {"id": "a", "text": "与人碰撞、即时交流、现场推进", "weight": {"E": 2}},
                {"id": "b", "text": "自己沉浸、安静专注、逐步成形", "weight": {"I": 2}},
            ],
        },
    ],
    "SN": [
        {
            "text": "面对一个新项目时，你先抓什么？",
            "type": "scenario",
            "options": [
                {
                    "id": "a",
                    "text": "先看现实条件、已知资源、具体步骤",
                    "weight": {"S": 2},
                },
                {"id": "b", "text": "先看可能性、方向感和未来延展", "weight": {"N": 2}},
            ],
        },
        {
            "text": "别人讲一段经历时，你更容易记住什么？",
            "type": "preference",
            "options": [
                {"id": "a", "text": "细节、场景、发生顺序", "weight": {"S": 2}},
                {"id": "b", "text": "隐含意义、趋势、背后模式", "weight": {"N": 2}},
            ],
        },
        {
            "text": "你更信任哪种判断基础？",
            "type": "agreement",
            "options": [
                {"id": "a", "text": "可验证经验和已有事实", "weight": {"S": 2}},
                {"id": "b", "text": "直觉连接和潜在方向", "weight": {"N": 2}},
            ],
        },
    ],
    "TF": [
        {
            "text": "当你必须做一个艰难决定时，更先衡量什么？",
            "type": "scenario",
            "options": [
                {
                    "id": "a",
                    "text": "哪种方案更合理、更一致、更有效",
                    "weight": {"T": 2},
                },
                {"id": "b", "text": "哪种方案更照顾关系与人的感受", "weight": {"F": 2}},
            ],
        },
        {
            "text": "朋友来倾诉时，你自然的第一反应更像？",
            "type": "preference",
            "options": [
                {"id": "a", "text": "帮他拆原因、给方案", "weight": {"T": 2}},
                {"id": "b", "text": "先理解情绪、让他感觉被接住", "weight": {"F": 2}},
            ],
        },
        {
            "text": "在团队中，你更重视哪件事？",
            "type": "agreement",
            "options": [
                {"id": "a", "text": "标准统一、公平清晰、结果靠谱", "weight": {"T": 2}},
                {"id": "b", "text": "氛围协调、价值认同、关系稳定", "weight": {"F": 2}},
            ],
        },
    ],
    "JP": [
        {
            "text": "面对行程安排时，你通常更喜欢？",
            "type": "preference",
            "options": [
                {"id": "a", "text": "提前定好节奏和节点", "weight": {"J": 2}},
                {"id": "b", "text": "保留弹性，临场调整", "weight": {"P": 2}},
            ],
        },
        {
            "text": "一个任务接近完成时，你更常见的状态是？",
            "type": "scenario",
            "options": [
                {"id": "a", "text": "想尽快收口、定稿、结束", "weight": {"J": 2}},
                {
                    "id": "b",
                    "text": "还想继续试不同版本或补充可能性",
                    "weight": {"P": 2},
                },
            ],
        },
        {
            "text": "你更舒服的节奏是哪种？",
            "type": "agreement",
            "options": [
                {"id": "a", "text": "明确边界、计划先行、心里踏实", "weight": {"J": 2}},
                {"id": "b", "text": "开放探索、边走边调、更有空间", "weight": {"P": 2}},
            ],
        },
    ],
}

DIMENSION_PAIRS = [("E", "I"), ("S", "N"), ("T", "F"), ("J", "P")]


class MBTIService:
    def __init__(self, db: AsyncSession | None):
        self.db = db
        self.ai_client: AIClient | None = None

    def _get_ai_client(self) -> AIClient:
        if self.ai_client is None:
            self.ai_client = AIClient()
        return self.ai_client

    async def get_active_session(self, user_id: str) -> MBTISession | None:
        result = await self.db.execute(
            select(MBTISession)
            .where(
                MBTISession.user_id == user_id,
                MBTISession.status.in_(["pending", "running"]),
            )
            .order_by(MBTISession.updated_at.desc())
        )
        return result.scalars().first()

    async def start_session(self, user: User) -> StartMBTISessionResponse:
        existing = await self.get_active_session(user.id)
        if existing and existing.current_question_json:
            return self._build_start_response(existing)

        question = await self._generate_next_question([], 0)
        session = MBTISession(
            user_id=user.id,
            status="running",
            question_count=0,
            answers_json=[],
            current_question_json=question.model_dump(),
            result_json=None,
        )
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session)
        return self._build_start_response(session)

    async def resume_session(
        self, user: User, session_id: str
    ) -> ResumeMBTISessionResponse:
        session = await self._get_user_session(user.id, session_id)
        return self._build_resume_response(session)

    async def submit_answer(
        self, user: User, session_id: str, question_id: str, selected_option: str
    ):
        session = await self._get_user_session(user.id, session_id)
        if session.status == "completed":
            return CompletedMBTIResponse(
                status="completed", result=MBTIResult(**session.result_json)
            )

        current_question = MBTIQuestion(**session.current_question_json)
        if current_question.question_id != question_id:
            raise ValueError("问题已过期，请刷新后重试")

        option = next(
            (item for item in current_question.options if item.id == selected_option),
            None,
        )
        if option is None:
            raise ValueError("无效的选项")

        answers = list(session.answers_json or [])
        answers.append(
            {
                "question_id": question_id,
                "question_text": current_question.question_text,
                "dimension": current_question.dimension,
                "selected_option": selected_option,
                "selected_text": option.text,
                "weight": option.weight,
                "answered_at": datetime.utcnow().isoformat(),
            }
        )
        session.answers_json = answers
        session.question_count = len(answers)

        scores = self._score_answers(answers)
        should_finish = self._should_finish(scores, session.question_count)

        if should_finish:
            result = await self._build_result(session.id, answers, scores)
            session.status = "completed"
            session.current_question_json = None
            session.result_json = result.model_dump()
            await self.db.flush()
            return CompletedMBTIResponse(status="completed", result=result)

        next_question = await self._generate_next_question(
            answers, session.question_count
        )
        session.status = "running"
        session.current_question_json = next_question.model_dump()
        await self.db.flush()
        return NextMBTIQuestionResponse(
            status="running",
            next_question=next_question,
            progress=self._build_progress(session.question_count),
        )

    async def get_result(self, user: User, session_id: str) -> MBTIResult:
        session = await self._get_user_session(user.id, session_id)
        if session.status != "completed" or not session.result_json:
            raise ValueError("测试尚未完成")
        return MBTIResult(**session.result_json)

    def get_type_list(self) -> list[MBTITypeInfo]:
        return [
            MBTITypeInfo(type_code=type_code, **meta)
            for type_code, meta in MBTI_TYPES.items()
        ]

    def get_type_detail(self, type_code: str) -> MBTITypeInfo:
        meta = MBTI_TYPES.get(type_code)
        if not meta:
            raise ValueError("无效的 MBTI 类型")
        return MBTITypeInfo(type_code=type_code, **meta)

    async def _get_user_session(self, user_id: str, session_id: str) -> MBTISession:
        result = await self.db.execute(
            select(MBTISession).where(
                MBTISession.id == session_id, MBTISession.user_id == user_id
            )
        )
        session = result.scalars().first()
        if not session:
            raise ValueError("MBTI 会话不存在")
        return session

    async def _generate_next_question(
        self, answers: list[dict], question_count: int
    ) -> MBTIQuestion:
        target_dimension = self._pick_dimension(answers)
        fallback = self._fallback_question(target_dimension, question_count)

        try:
            system_prompt, user_prompt = build_next_question_prompt(
                answers, question_count
            )
            content = await self._get_ai_client().generate(
                prompt=user_prompt,
                system=system_prompt,
                temperature=0.4,
                response_format={"type": "json_object"},
            )
            payload = json.loads(content)
            payload.setdefault("question_id", str(uuid4()))
            if payload.get("dimension") not in QUESTION_BANK:
                payload["dimension"] = target_dimension
            return MBTIQuestion(**payload)
        except Exception as exc:
            logger.warning("MBTI 下一题 AI 生成失败，使用回退题库", error=str(exc))
            return fallback

    def _fallback_question(self, dimension: str, question_count: int) -> MBTIQuestion:
        bank = QUESTION_BANK[dimension]
        item = bank[question_count % len(bank)]
        return MBTIQuestion(
            question_id=str(uuid4()),
            question_text=item["text"],
            question_type=item["type"],
            dimension=dimension,
            options=item["options"],
        )

    def _pick_dimension(self, answers: list[dict]) -> str:
        if not answers:
            return "EI"

        scores = self._score_answers(answers)
        gaps = {
            "EI": abs(scores["E"] - scores["I"]),
            "SN": abs(scores["S"] - scores["N"]),
            "TF": abs(scores["T"] - scores["F"]),
            "JP": abs(scores["J"] - scores["P"]),
        }
        return min(gaps, key=gaps.get)

    def _score_answers(self, answers: list[dict]) -> dict[str, int]:
        scores = {key: 0 for pair in DIMENSION_PAIRS for key in pair}
        for answer in answers:
            for key, value in answer.get("weight", {}).items():
                scores[key] = scores.get(key, 0) + int(value)
        return scores

    def _should_finish(self, scores: dict[str, int], question_count: int) -> bool:
        if question_count < 8:
            return False
        if question_count >= 12:
            return True
        return all(
            abs(scores[left] - scores[right]) >= 2 for left, right in DIMENSION_PAIRS
        )

    async def _build_result(
        self, session_id: str, answers: list[dict], scores: dict[str, int]
    ) -> MBTIResult:
        type_code = "".join(
            left if scores[left] >= scores[right] else right
            for left, right in DIMENSION_PAIRS
        )
        meta = MBTI_TYPES[type_code]

        try:
            system_prompt, user_prompt = build_result_prompt(
                answers, scores, type_code, meta
            )
            content = await self._get_ai_client().generate(
                prompt=user_prompt,
                system=system_prompt,
                temperature=0.6,
                response_format={"type": "json_object"},
            )
            payload = json.loads(content)
        except Exception as exc:
            logger.warning("MBTI 结果 AI 生成失败，使用默认结果模板", error=str(exc))
            payload = {
                "summary": meta["summary"],
                "strengths": [
                    "在熟悉场景中能稳定发挥判断力",
                    "面对复杂问题时能形成自己的方法",
                    "在关系或任务中能呈现连续性",
                ],
                "weaknesses": [
                    "容易在压力下放大自己的惯性偏好",
                    "对相反维度的需求容忍度较低",
                    "有时会忽略节奏调整",
                ],
                "career_matches": ["策略规划", "研究分析", "产品设计"],
                "relationship_advice": "在关系中尝试说明你的决策依据，同时给对方留出理解和回应的空间。",
                "famous_people": [],
            }

        return MBTIResult(
            session_id=session_id,
            personality_type=type_code,
            type_name_zh=str(meta["type_name_zh"]),
            type_name_en=str(meta["type_name_en"]),
            summary=str(payload.get("summary") or meta["summary"]),
            cognitive_functions=list(meta["cognitive_functions"]),
            strengths=[str(item) for item in payload.get("strengths", [])][:5],
            weaknesses=[str(item) for item in payload.get("weaknesses", [])][:5],
            career_matches=[str(item) for item in payload.get("career_matches", [])][
                :6
            ],
            relationship_advice=str(
                payload.get("relationship_advice")
                or "请在关系里更明确地表达边界、期待与反馈。"
            ),
            famous_people=[str(item) for item in payload.get("famous_people", [])][:6],
            dimension_scores=scores,
        )

    def _build_progress(self, answered: int) -> MBTIProgress:
        remaining = 12 - answered
        if answered < 8:
            remaining = max(8 - answered, 1)
        return MBTIProgress(answered=answered, estimated_remaining=remaining)

    def _build_start_response(self, session: MBTISession) -> StartMBTISessionResponse:
        return StartMBTISessionResponse(
            session_id=session.id,
            status=session.status,  # type: ignore[arg-type]
            question_count=session.question_count,
            current_question=MBTIQuestion(**session.current_question_json),
            progress=self._build_progress(session.question_count),
        )

    def _build_resume_response(self, session: MBTISession) -> ResumeMBTISessionResponse:
        completed_result = (
            MBTIResult(**session.result_json) if session.result_json else None
        )
        return ResumeMBTISessionResponse(
            session_id=session.id,
            status=session.status,  # type: ignore[arg-type]
            question_count=session.question_count,
            current_question=MBTIQuestion(**session.current_question_json)
            if session.current_question_json
            else None,
            progress=self._build_progress(session.question_count),
            completed_result=completed_result,
        )
