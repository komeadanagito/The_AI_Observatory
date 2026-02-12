"""
塔罗牌种子数据导入脚本

从 JSON 文件导入 78 张塔罗牌数据到数据库
"""

import asyncio
import json
import re
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# 项目路径
PROJECT_ROOT = Path(__file__).parent.parent.parent
TAROT_DATA_DIR = PROJECT_ROOT / "Tarot" / "scraper"
TAROT_IMAGES_DIR = PROJECT_ROOT / "Tarot" / "Tarot_card_images"

# 导入模型和配置
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.config import get_settings
from src.core.database import Base
from src.auth.models import User  # noqa: F401 - 需要导入以解析关系
from src.tarot.models import TarotCard, TarotReading  # noqa: F401


# ==========================================
# 中文牌名映射
# ==========================================
MAJOR_ARCANA_NAMES_ZH = {
    "ar00": "愚者",
    "ar01": "魔法师",
    "ar02": "女祭司",
    "ar03": "皇后",
    "ar04": "皇帝",
    "ar05": "教皇",
    "ar06": "恋人",
    "ar07": "战车",
    "ar08": "力量",
    "ar09": "隐士",
    "ar10": "命运之轮",
    "ar11": "正义",
    "ar12": "倒吊人",
    "ar13": "死神",
    "ar14": "节制",
    "ar15": "恶魔",
    "ar16": "塔",
    "ar17": "星星",
    "ar18": "月亮",
    "ar19": "太阳",
    "ar20": "审判",
    "ar21": "世界",
}

# 小阿卡纳花色映射
SUIT_MAP = {
    "wa": "wands",      # 权杖
    "cu": "cups",       # 圣杯
    "sw": "swords",     # 宝剑
    "pe": "pentacles",  # 星币
}

SUIT_NAMES_ZH = {
    "wands": "权杖",
    "cups": "圣杯",
    "swords": "宝剑",
    "pentacles": "星币",
}

# 宫廷牌映射
COURT_CARDS = {
    "pa": ("page", "侍从", 11),
    "kn": ("knight", "骑士", 12),
    "qu": ("queen", "皇后", 13),
    "ki": ("king", "国王", 14),
    "ac": ("ace", "首牌", 1),
}


# ==========================================
# 图片文件名映射
# ==========================================
MAJOR_ARCANA_IMAGES = {
    "ar00": "RWS_Tarot_00_Fool.jpg",
    "ar01": "RWS_Tarot_01_Magician.jpg",
    "ar02": "RWS_Tarot_02_High_Priestess.jpg",
    "ar03": "RWS_Tarot_03_Empress.jpg",
    "ar04": "RWS_Tarot_04_Emperor.jpg",
    "ar05": "RWS_Tarot_05_Hierophant.jpg",
    "ar06": "RWS_Tarot_06_Lovers.jpg",
    "ar07": "RWS_Tarot_07_Chariot.jpg",
    "ar08": "RWS_Tarot_08_Strength.jpg",
    "ar09": "RWS_Tarot_09_Hermit.jpg",
    "ar10": "RWS_Tarot_10_Wheel_of_Fortune.jpg",
    "ar11": "RWS_Tarot_11_Justice.jpg",
    "ar12": "RWS_Tarot_12_Hanged_Man.jpg",
    "ar13": "RWS_Tarot_13_Death.jpg",
    "ar14": "RWS_Tarot_14_Temperance.jpg",
    "ar15": "RWS_Tarot_15_Devil.jpg",
    "ar16": "RWS_Tarot_16_Tower.jpg",
    "ar17": "RWS_Tarot_17_Star.jpg",
    "ar18": "RWS_Tarot_18_Moon.jpg",
    "ar19": "RWS_Tarot_19_Sun.jpg",
    "ar20": "RWS_Tarot_20_Judgement.jpg",
    "ar21": "RWS_Tarot_21_World.jpg",
}


def get_minor_arcana_image(short_code: str) -> str:
    """
    获取小阿卡纳图片文件名
    
    映射规则:
    - wapa -> Wands11.jpg (侍从=11)
    - cu02 -> Cups02.jpg
    - swac -> Swords01.jpg (首牌=1)
    """
    suit_prefix = short_code[:2]
    rank_suffix = short_code[2:]
    
    # 确定花色
    suit = SUIT_MAP.get(suit_prefix)
    if not suit:
        raise ValueError(f"Unknown suit prefix: {suit_prefix}")
    
    # 图片文件名中的花色名称
    image_suit_names = {
        "wands": "Wands",
        "cups": "Cups",
        "swords": "Swords",
        "pentacles": "Pents",
    }
    image_suit = image_suit_names[suit]
    
    # 确定数字
    if rank_suffix in COURT_CARDS:
        _, _, number = COURT_CARDS[rank_suffix]
    elif rank_suffix.isdigit():
        number = int(rank_suffix)
    else:
        raise ValueError(f"Unknown rank suffix: {rank_suffix}")
    
    return f"{image_suit}{number:02d}.jpg"


def parse_meaning_text(text: str) -> tuple[str, str]:
    """
    解析牌义文本，分离正位和逆位含义
    
    文本格式示例:
    "1. 魔法师.--技能、外交手段...逆位：医生、法师..."
    """
    # 查找 "逆位" 或 "逆位：" 的位置
    reversed_patterns = [
        r"逆位[：:]",
        r"逆位[,，]",
        r"\.逆位",
    ]
    
    upright = text
    reversed_text = ""
    
    for pattern in reversed_patterns:
        match = re.search(pattern, text)
        if match:
            upright = text[:match.start()].strip()
            reversed_text = text[match.end():].strip()
            break
    
    # 如果没有找到逆位标记，尝试用 "逆位" 关键词分割
    if not reversed_text and "逆位" in text:
        parts = text.split("逆位", 1)
        upright = parts[0].strip().rstrip("。.，,：:")
        reversed_text = parts[1].strip().lstrip("：:，,")
    
    # 清理文本
    upright = upright.strip().rstrip("。.")
    reversed_text = reversed_text.strip().rstrip("。.")
    
    return upright, reversed_text


def process_major_arcana(data: list[dict]) -> list[dict]:
    """处理大阿卡纳数据"""
    cards = []
    
    for item in data:
        short_code = item["name_short"]
        name_en = item["name"]
        text = item["text"]
        
        upright, reversed_meaning = parse_meaning_text(text)
        
        card = {
            "name_en": name_en,
            "name_zh": MAJOR_ARCANA_NAMES_ZH.get(short_code, name_en),
            "short_code": short_code,
            "arcana": "major",
            "suit": None,
            "number": None,
            "rank": item.get("value", ""),
            "image_filename": MAJOR_ARCANA_IMAGES.get(short_code, ""),
            "meaning_upright": upright,
            "meaning_reversed": reversed_meaning,
            "keywords_upright": None,
            "keywords_reversed": None,
        }
        cards.append(card)
    
    return cards


def process_minor_arcana(data: list[dict]) -> list[dict]:
    """处理小阿卡纳数据"""
    cards = []
    
    for item in data:
        short_code = item["name_short"]
        name_zh = item["name"]  # 小阿卡纳 JSON 中 name 是中文
        text = item["text"]
        
        # 解析花色和牌阶
        suit_prefix = short_code[:2]
        rank_suffix = short_code[2:]
        
        suit = SUIT_MAP.get(suit_prefix)
        
        # 确定数字和英文名
        if rank_suffix in COURT_CARDS:
            rank, rank_zh, number = COURT_CARDS[rank_suffix]
            name_en = f"{rank.upper()} OF {suit.upper()}"
        elif rank_suffix.isdigit():
            number = int(rank_suffix)
            rank = str(number)
            name_en = f"{number} OF {suit.upper()}"
        else:
            # 特殊情况处理
            number = None
            rank = rank_suffix
            name_en = name_zh
        
        upright, reversed_meaning = parse_meaning_text(text)
        
        card = {
            "name_en": name_en,
            "name_zh": name_zh,
            "short_code": short_code,
            "arcana": "minor",
            "suit": suit,
            "number": number,
            "rank": rank,
            "image_filename": get_minor_arcana_image(short_code),
            "meaning_upright": upright,
            "meaning_reversed": reversed_meaning,
            "keywords_upright": None,
            "keywords_reversed": None,
        }
        cards.append(card)
    
    return cards


async def seed_tarot_cards():
    """导入塔罗牌数据到数据库"""
    settings = get_settings()
    
    print("正在连接数据库...")
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    # 读取 JSON 数据
    print("正在读取 JSON 数据...")
    
    maj_file = TAROT_DATA_DIR / "maj_text_zh.json"
    min_file = TAROT_DATA_DIR / "min_text_zh.json"
    
    with open(maj_file, "r", encoding="utf-8") as f:
        major_data = json.load(f)
    
    with open(min_file, "r", encoding="utf-8") as f:
        minor_data = json.load(f)
    
    print(f"  - 大阿卡纳: {len(major_data)} 张")
    print(f"  - 小阿卡纳: {len(minor_data)} 张")
    
    # 处理数据
    print("正在处理数据...")
    major_cards = process_major_arcana(major_data)
    minor_cards = process_minor_arcana(minor_data)
    all_cards = major_cards + minor_cards
    
    print(f"总计: {len(all_cards)} 张牌")
    
    # 导入数据库
    async with async_session() as session:
        # 检查是否已有数据
        result = await session.execute(select(TarotCard).limit(1))
        existing = result.scalar_one_or_none()
        
        if existing:
            print("数据库中已存在塔罗牌数据，跳过导入")
            print("如需重新导入，请先清空 tarot_cards 表")
            return
        
        print("正在导入数据库...")
        for card_data in all_cards:
            card = TarotCard(**card_data)
            session.add(card)
        
        await session.commit()
        print(f"✅ 成功导入 {len(all_cards)} 张塔罗牌!")
    
    await engine.dispose()


async def verify_cards():
    """验证导入的数据"""
    settings = get_settings()
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # 统计数量
        from sqlalchemy import func
        
        result = await session.execute(
            select(func.count(TarotCard.id))
        )
        total = result.scalar()
        
        result = await session.execute(
            select(func.count(TarotCard.id)).where(TarotCard.arcana == "major")
        )
        major_count = result.scalar()
        
        result = await session.execute(
            select(func.count(TarotCard.id)).where(TarotCard.arcana == "minor")
        )
        minor_count = result.scalar()
        
        print("\n数据验证:")
        print(f"  - 总计: {total} 张")
        print(f"  - 大阿卡纳: {major_count} 张")
        print(f"  - 小阿卡纳: {minor_count} 张")
        
        # 检查每个花色
        for suit, name_zh in SUIT_NAMES_ZH.items():
            result = await session.execute(
                select(func.count(TarotCard.id)).where(TarotCard.suit == suit)
            )
            count = result.scalar()
            print(f"    - {name_zh}: {count} 张")
        
        # 显示几张示例
        print("\n示例数据:")
        result = await session.execute(
            select(TarotCard).limit(3)
        )
        for card in result.scalars():
            print(f"  - {card.short_code}: {card.name_zh} ({card.name_en})")
            print(f"    图片: {card.image_filename}")
            print(f"    正位: {card.meaning_upright[:50]}...")
    
    await engine.dispose()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="塔罗牌种子数据导入")
    parser.add_argument("--verify", action="store_true", help="仅验证数据")
    args = parser.parse_args()
    
    if args.verify:
        asyncio.run(verify_cards())
    else:
        asyncio.run(seed_tarot_cards())
        asyncio.run(verify_cards())
