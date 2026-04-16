"""MBTI Pydantic 模型。"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


SessionStatus = Literal["pending", "running", "completed", "failed", "cancelled"]


class MBTIOption(BaseModel):
    id: str
    text: str
    weight: dict[str, int] = Field(default_factory=dict)


class MBTIQuestion(BaseModel):
    question_id: str
    question_text: str
    question_type: Literal["scenario", "preference", "agreement"] = "scenario"
    dimension: Literal["EI", "SN", "TF", "JP"]
    options: list[MBTIOption]


class MBTIProgress(BaseModel):
    answered: int
    min_questions: int = 8
    max_questions: int = 12
    estimated_remaining: int


class StartMBTISessionResponse(BaseModel):
    session_id: str
    status: SessionStatus
    question_count: int
    current_question: MBTIQuestion
    progress: MBTIProgress


class ResumeMBTISessionResponse(BaseModel):
    session_id: str
    status: SessionStatus
    question_count: int
    current_question: MBTIQuestion | None = None
    progress: MBTIProgress
    completed_result: "MBTIResult | None" = None


class SubmitMBTIAnswerRequest(BaseModel):
    question_id: str
    selected_option: str


class NextMBTIQuestionResponse(BaseModel):
    status: Literal["running"] = "running"
    next_question: MBTIQuestion
    progress: MBTIProgress


class MBTITypeInfo(BaseModel):
    type_code: str
    type_name_zh: str
    type_name_en: str
    summary: str
    cognitive_functions: list[str]


class MBTIResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    session_id: str
    personality_type: str
    type_name_zh: str
    type_name_en: str
    summary: str
    cognitive_functions: list[str]
    strengths: list[str]
    weaknesses: list[str]
    career_matches: list[str]
    relationship_advice: str
    famous_people: list[str]
    dimension_scores: dict[str, int]
    disclaimer: str = "本内容纯属娱乐参考，不构成医疗、法律、投资或人生决策建议。"


class CompletedMBTIResponse(BaseModel):
    status: Literal["completed"] = "completed"
    result: MBTIResult


class MBTISessionSummary(BaseModel):
    id: str
    status: SessionStatus
    question_count: int
    created_at: datetime
    updated_at: datetime


ResumeMBTISessionResponse.model_rebuild()
