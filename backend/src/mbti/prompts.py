"""MBTI prompt 模板。"""

import json

from src.mbti.schemas import MBTIQuestion


def build_next_question_prompt(
    answer_history: list[dict], question_count: int
) -> tuple[str, str]:
    system_prompt = (
        "你是 MBTI 动态问卷生成器。"
        "你只能输出 JSON，不得输出解释性文字。"
        "你不能引用塔罗、星座、中式算命。"
        "你必须输出 question_text、question_type、dimension、options。"
        "options 必须是 2 到 4 个选项，每个选项都要包含 id、text、weight。"
    )
    user_prompt = json.dumps(
        {
            "question_count": question_count,
            "answer_history": answer_history,
            "required_schema": {
                "question_text": "string",
                "question_type": "scenario|preference|agreement",
                "dimension": "EI|SN|TF|JP",
                "options": [
                    {
                        "id": "a",
                        "text": "option text",
                        "weight": {"E": 2, "I": 0},
                    }
                ],
            },
        },
        ensure_ascii=False,
    )
    return system_prompt, user_prompt


def build_result_prompt(
    answer_history: list[dict],
    scores: dict[str, int],
    type_code: str,
    type_meta: dict[str, object],
) -> tuple[str, str]:
    system_prompt = (
        "你是 MBTI 结果解读生成器。"
        "你只能输出 JSON。"
        "不能引用塔罗、星座、中式算命。"
        "语言应现代、反思、清晰，不要神秘化。"
    )
    user_prompt = json.dumps(
        {
            "answer_history": answer_history,
            "scores": scores,
            "type_code": type_code,
            "type_meta": type_meta,
            "required_schema": {
                "summary": "string",
                "strengths": ["string"],
                "weaknesses": ["string"],
                "career_matches": ["string"],
                "relationship_advice": "string",
                "famous_people": ["string"],
            },
        },
        ensure_ascii=False,
    )
    return system_prompt, user_prompt
