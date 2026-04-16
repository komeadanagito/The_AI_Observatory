"""MBTI 静态人格类型数据。"""

from typing import Final


MBTI_TYPES: Final[dict[str, dict[str, object]]] = {
    "INTJ": {
        "type_name_zh": "建筑师",
        "type_name_en": "Architect",
        "cognitive_functions": ["Ni", "Te", "Fi", "Se"],
        "summary": "以战略洞察和独立判断著称，擅长构建长期结构。",
    },
    "INTP": {
        "type_name_zh": "逻辑学家",
        "type_name_en": "Logician",
        "cognitive_functions": ["Ti", "Ne", "Si", "Fe"],
        "summary": "偏好抽象分析与概念建模，重视逻辑一致性。",
    },
    "ENTJ": {
        "type_name_zh": "指挥官",
        "type_name_en": "Commander",
        "cognitive_functions": ["Te", "Ni", "Se", "Fi"],
        "summary": "目标驱动、善于组织与决策，倾向推动系统前进。",
    },
    "ENTP": {
        "type_name_zh": "辩论家",
        "type_name_en": "Debater",
        "cognitive_functions": ["Ne", "Ti", "Fe", "Si"],
        "summary": "反应快、点子多，善于从不同角度拆解问题。",
    },
    "INFJ": {
        "type_name_zh": "提倡者",
        "type_name_en": "Advocate",
        "cognitive_functions": ["Ni", "Fe", "Ti", "Se"],
        "summary": "洞察人心并关注意义，常把理想与现实协调在一起。",
    },
    "INFP": {
        "type_name_zh": "调停者",
        "type_name_en": "Mediator",
        "cognitive_functions": ["Fi", "Ne", "Si", "Te"],
        "summary": "价值观鲜明，富有想象力，重视真实与自我表达。",
    },
    "ENFJ": {
        "type_name_zh": "主人公",
        "type_name_en": "Protagonist",
        "cognitive_functions": ["Fe", "Ni", "Se", "Ti"],
        "summary": "擅长鼓舞与整合他人，在关系中有较强引导力。",
    },
    "ENFP": {
        "type_name_zh": "竞选者",
        "type_name_en": "Campaigner",
        "cognitive_functions": ["Ne", "Fi", "Te", "Si"],
        "summary": "热情开放，善于联想，喜欢把创意转化成体验。",
    },
    "ISTJ": {
        "type_name_zh": "物流师",
        "type_name_en": "Logistician",
        "cognitive_functions": ["Si", "Te", "Fi", "Ne"],
        "summary": "稳健务实，重视秩序、责任与可验证的结果。",
    },
    "ISFJ": {
        "type_name_zh": "守卫者",
        "type_name_en": "Defender",
        "cognitive_functions": ["Si", "Fe", "Ti", "Ne"],
        "summary": "细致可靠，习惯通过照顾与支持维持稳定关系。",
    },
    "ESTJ": {
        "type_name_zh": "总经理",
        "type_name_en": "Executive",
        "cognitive_functions": ["Te", "Si", "Ne", "Fi"],
        "summary": "强调执行、规则与效率，擅长推动事务落地。",
    },
    "ESFJ": {
        "type_name_zh": "执政官",
        "type_name_en": "Consul",
        "cognitive_functions": ["Fe", "Si", "Ne", "Ti"],
        "summary": "关注群体氛围与责任分工，重视可见的互助。",
    },
    "ISTP": {
        "type_name_zh": "鉴赏家",
        "type_name_en": "Virtuoso",
        "cognitive_functions": ["Ti", "Se", "Ni", "Fe"],
        "summary": "冷静直接，擅长快速判断与问题拆解。",
    },
    "ISFP": {
        "type_name_zh": "探险家",
        "type_name_en": "Adventurer",
        "cognitive_functions": ["Fi", "Se", "Ni", "Te"],
        "summary": "重视体验与审美，倾向用行动表达内在感受。",
    },
    "ESTP": {
        "type_name_zh": "企业家",
        "type_name_en": "Entrepreneur",
        "cognitive_functions": ["Se", "Ti", "Fe", "Ni"],
        "summary": "擅长快速应变，偏好在真实情境中即时决策。",
    },
    "ESFP": {
        "type_name_zh": "表演者",
        "type_name_en": "Entertainer",
        "cognitive_functions": ["Se", "Fi", "Te", "Ni"],
        "summary": "有感染力、重现场感，乐于让关系更轻松有活力。",
    },
}
