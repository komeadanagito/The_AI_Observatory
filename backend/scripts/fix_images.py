"""
修复塔罗牌图片文件名

确保所有 78 张牌都有正确的图片文件名
"""

import asyncio
from pathlib import Path

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.config import get_settings
from src.core.database import Base
from src.auth.models import User  # noqa: F401
from src.tarot.models import TarotCard, TarotReading  # noqa: F401


# 大阿卡纳图片映射
MAJOR_IMAGES = {
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

# 花色映射
SUIT_MAP = {
    "wa": "Wands",
    "cu": "Cups",
    "sw": "Swords",
    "pe": "Pents",
}

# 宫廷牌数字映射
COURT_NUMBERS = {
    "ac": 1,   # Ace
    "pa": 11,  # Page
    "kn": 12,  # Knight
    "qu": 13,  # Queen
    "ki": 14,  # King
}


def get_image_filename(short_code: str) -> str:
    """根据 short_code 获取正确的图片文件名"""
    
    # 大阿卡纳
    if short_code.startswith("ar"):
        return MAJOR_IMAGES.get(short_code, "")
    
    # 小阿卡纳
    suit_prefix = short_code[:2]
    rank_suffix = short_code[2:]
    
    suit_name = SUIT_MAP.get(suit_prefix)
    if not suit_name:
        return ""
    
    # 确定数字
    if rank_suffix in COURT_NUMBERS:
        number = COURT_NUMBERS[rank_suffix]
    elif rank_suffix.isdigit():
        number = int(rank_suffix)
    else:
        return ""
    
    return f"{suit_name}{number:02d}.jpg"


async def fix_all_images():
    """修复所有塔罗牌的图片文件名"""
    settings = get_settings()
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # 获取所有塔罗牌
        result = await session.execute(select(TarotCard))
        cards = result.scalars().all()
        
        print(f"检查 {len(cards)} 张塔罗牌...")
        
        fixed_count = 0
        for card in cards:
            correct_filename = get_image_filename(card.short_code)
            
            if card.image_filename != correct_filename:
                print(f"  修复: {card.name_zh} ({card.short_code})")
                print(f"    旧: {card.image_filename}")
                print(f"    新: {correct_filename}")
                
                card.image_filename = correct_filename
                fixed_count += 1
        
        if fixed_count > 0:
            await session.commit()
            print(f"\n✅ 修复了 {fixed_count} 张牌的图片文件名")
        else:
            print("\n✅ 所有图片文件名都正确")
        
        # 验证
        print("\n验证结果:")
        result = await session.execute(select(TarotCard))
        cards = result.scalars().all()
        
        missing = []
        for card in cards:
            if not card.image_filename:
                missing.append(f"{card.name_zh} ({card.short_code})")
        
        if missing:
            print(f"  ❌ {len(missing)} 张牌缺少图片文件名:")
            for m in missing:
                print(f"    - {m}")
        else:
            print(f"  ✅ 所有 {len(cards)} 张牌都有图片文件名")
        
        # 显示示例
        print("\n随机示例:")
        import random
        samples = random.sample(list(cards), min(5, len(cards)))
        for card in samples:
            print(f"  - {card.name_zh}: {card.image_filename}")
    
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(fix_all_images())
