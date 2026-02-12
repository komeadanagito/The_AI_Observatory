"""
塔罗牌阵配置

定义7种牌阵的配置信息，包括名称、牌数、位置含义
"""

from typing import TypedDict


class SpreadPosition(TypedDict):
    """牌阵位置定义"""
    index: int
    name_zh: str
    name_en: str
    description_zh: str  # 位置的详细描述


class SpreadConfig(TypedDict):
    """牌阵配置"""
    name_zh: str
    name_en: str
    description_zh: str
    card_count: int
    positions: list[SpreadPosition]


# 7种牌阵配置
SPREADS: dict[str, SpreadConfig] = {
    "single": {
        "name_zh": "单张抽牌",
        "name_en": "Single Card",
        "description_zh": "最简单的占卜方式，抽取一张牌获得当下的指引和启示。适合日常占卜或快速获取答案。",
        "card_count": 1,
        "positions": [
            {
                "index": 1,
                "name_zh": "指引",
                "name_en": "Guidance",
                "description_zh": "这张牌代表当前情况的核心信息和宇宙给你的指引"
            }
        ]
    },
    
    "three_cards": {
        "name_zh": "时间之流",
        "name_en": "Past-Present-Future",
        "description_zh": "经典的三张牌阵，展示事情的时间线发展。帮助理解事情的来龙去脉和未来走向。",
        "card_count": 3,
        "positions": [
            {
                "index": 1,
                "name_zh": "过去",
                "name_en": "Past",
                "description_zh": "影响当前情况的过去因素和根源"
            },
            {
                "index": 2,
                "name_zh": "现在",
                "name_en": "Present",
                "description_zh": "当前的处境、挑战和机遇"
            },
            {
                "index": 3,
                "name_zh": "未来",
                "name_en": "Future",
                "description_zh": "如果保持当前路径，可能的发展方向"
            }
        ]
    },
    
    "celtic_cross": {
        "name_zh": "凯尔特十字",
        "name_en": "Celtic Cross",
        "description_zh": "最经典、最全面的塔罗牌阵，提供深度的情况分析。适合重要问题的深入探索。",
        "card_count": 10,
        "positions": [
            {
                "index": 1,
                "name_zh": "现状",
                "name_en": "Present",
                "description_zh": "当前的核心情况和你所面对的"
            },
            {
                "index": 2,
                "name_zh": "挑战",
                "name_en": "Challenge",
                "description_zh": "横跨现状的障碍或需要面对的挑战"
            },
            {
                "index": 3,
                "name_zh": "根源",
                "name_en": "Foundation",
                "description_zh": "情况的根本原因和基础"
            },
            {
                "index": 4,
                "name_zh": "过去",
                "name_en": "Past",
                "description_zh": "正在消退的影响，过去的经历"
            },
            {
                "index": 5,
                "name_zh": "可能",
                "name_en": "Possible",
                "description_zh": "最佳可能结果，如果一切顺利"
            },
            {
                "index": 6,
                "name_zh": "近未来",
                "name_en": "Near Future",
                "description_zh": "即将发生的事情，近期会遇到的"
            },
            {
                "index": 7,
                "name_zh": "自我",
                "name_en": "Self",
                "description_zh": "你对情况的态度和内在状态"
            },
            {
                "index": 8,
                "name_zh": "环境",
                "name_en": "Environment",
                "description_zh": "周围人和外部因素的影响"
            },
            {
                "index": 9,
                "name_zh": "希望与恐惧",
                "name_en": "Hopes/Fears",
                "description_zh": "你内心深处的期望和担忧"
            },
            {
                "index": 10,
                "name_zh": "结果",
                "name_en": "Outcome",
                "description_zh": "基于当前路径的最终结果"
            }
        ]
    },
    
    "two_options": {
        "name_zh": "二择一",
        "name_en": "Two Options",
        "description_zh": "当面临两个选择时的决策辅助牌阵。清晰展示每个选择的可能结果。",
        "card_count": 5,
        "positions": [
            {
                "index": 1,
                "name_zh": "现状",
                "name_en": "Current",
                "description_zh": "当前的处境和决策背景"
            },
            {
                "index": 2,
                "name_zh": "选项A",
                "name_en": "Option A",
                "description_zh": "第一个选择的特性和影响"
            },
            {
                "index": 3,
                "name_zh": "选项A结果",
                "name_en": "Option A Outcome",
                "description_zh": "选择A的可能发展和结果"
            },
            {
                "index": 4,
                "name_zh": "选项B",
                "name_en": "Option B",
                "description_zh": "第二个选择的特性和影响"
            },
            {
                "index": 5,
                "name_zh": "选项B结果",
                "name_en": "Option B Outcome",
                "description_zh": "选择B的可能发展和结果"
            }
        ]
    },
    
    "love_relationship": {
        "name_zh": "爱情关系",
        "name_en": "Love Relationship",
        "description_zh": "专门用于分析感情关系的牌阵。深入了解双方的状态和关系发展。",
        "card_count": 7,
        "positions": [
            {
                "index": 1,
                "name_zh": "你",
                "name_en": "You",
                "description_zh": "你在这段关系中的状态和能量"
            },
            {
                "index": 2,
                "name_zh": "对方",
                "name_en": "Partner",
                "description_zh": "对方在这段关系中的状态和感受"
            },
            {
                "index": 3,
                "name_zh": "关系现状",
                "name_en": "Relationship",
                "description_zh": "你们之间关系的当前状态"
            },
            {
                "index": 4,
                "name_zh": "阻碍",
                "name_en": "Obstacle",
                "description_zh": "影响关系发展的障碍和挑战"
            },
            {
                "index": 5,
                "name_zh": "外部影响",
                "name_en": "External",
                "description_zh": "外部因素对关系的影响"
            },
            {
                "index": 6,
                "name_zh": "建议",
                "name_en": "Advice",
                "description_zh": "改善关系的建议和指引"
            },
            {
                "index": 7,
                "name_zh": "发展方向",
                "name_en": "Direction",
                "description_zh": "关系可能的发展方向"
            }
        ]
    },
    
    "hexagram": {
        "name_zh": "六芒星",
        "name_en": "Hexagram",
        "description_zh": "六芒星牌阵提供全面的情况分析，融合过去、现在、未来与内外因素。",
        "card_count": 7,
        "positions": [
            {
                "index": 1,
                "name_zh": "过去",
                "name_en": "Past",
                "description_zh": "影响当前情况的过去因素"
            },
            {
                "index": 2,
                "name_zh": "现在",
                "name_en": "Present",
                "description_zh": "当前的核心情况"
            },
            {
                "index": 3,
                "name_zh": "未来",
                "name_en": "Future",
                "description_zh": "事情的发展趋势"
            },
            {
                "index": 4,
                "name_zh": "建议",
                "name_en": "Advice",
                "description_zh": "应对当前情况的建议"
            },
            {
                "index": 5,
                "name_zh": "环境",
                "name_en": "Environment",
                "description_zh": "周围环境和他人的影响"
            },
            {
                "index": 6,
                "name_zh": "希望",
                "name_en": "Hopes",
                "description_zh": "你的期望和愿景"
            },
            {
                "index": 7,
                "name_zh": "结果",
                "name_en": "Outcome",
                "description_zh": "综合所有因素后的可能结果"
            }
        ]
    },
    
    "horseshoe": {
        "name_zh": "马蹄铁",
        "name_en": "Horseshoe",
        "description_zh": "马蹄铁牌阵提供问题的全面视角，揭示隐藏的影响和可能的解决方案。",
        "card_count": 7,
        "positions": [
            {
                "index": 1,
                "name_zh": "过去",
                "name_en": "Past",
                "description_zh": "过去对现在的影响"
            },
            {
                "index": 2,
                "name_zh": "现在",
                "name_en": "Present",
                "description_zh": "当前的情况和状态"
            },
            {
                "index": 3,
                "name_zh": "隐藏影响",
                "name_en": "Hidden",
                "description_zh": "你可能没有意识到的隐藏因素"
            },
            {
                "index": 4,
                "name_zh": "障碍",
                "name_en": "Obstacle",
                "description_zh": "需要克服的障碍和困难"
            },
            {
                "index": 5,
                "name_zh": "周围环境",
                "name_en": "Surrounding",
                "description_zh": "周围人和环境的影响"
            },
            {
                "index": 6,
                "name_zh": "建议",
                "name_en": "Advice",
                "description_zh": "前进的建议和指引"
            },
            {
                "index": 7,
                "name_zh": "结果",
                "name_en": "Outcome",
                "description_zh": "可能的最终结果"
            }
        ]
    }
}


def get_spread(spread_type: str) -> SpreadConfig | None:
    """
    获取牌阵配置
    
    Args:
        spread_type: 牌阵类型标识
        
    Returns:
        牌阵配置，如果不存在返回 None
    """
    return SPREADS.get(spread_type)


def get_all_spreads() -> dict[str, SpreadConfig]:
    """获取所有牌阵配置"""
    return SPREADS


def get_spread_types() -> list[str]:
    """获取所有牌阵类型标识"""
    return list(SPREADS.keys())
