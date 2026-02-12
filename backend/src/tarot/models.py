"""
塔罗牌数据模型

定义塔罗牌和占卜记录的数据库模型
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base


class TarotCard(Base):
    """
    塔罗牌元数据模型
    
    存储78张塔罗牌的基本信息，包括：
    - 22张大阿卡纳 (Major Arcana)
    - 56张小阿卡纳 (Minor Arcana): 权杖、圣杯、宝剑、星币各14张
    """
    __tablename__ = "tarot_cards"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    
    # 基本信息
    name_en: Mapped[str] = mapped_column(comment="英文名称，如 THE MAGICIAN")
    name_zh: Mapped[str] = mapped_column(comment="中文名称，如 魔法师")
    short_code: Mapped[str] = mapped_column(unique=True, index=True, comment="短代码，如 ar01, wapa, cu02")
    
    # 分类信息
    arcana: Mapped[str] = mapped_column(comment="大/小阿卡纳: major / minor")
    suit: Mapped[Optional[str]] = mapped_column(nullable=True, comment="花色: wands/cups/swords/pentacles (仅小阿卡纳)")
    number: Mapped[Optional[int]] = mapped_column(nullable=True, comment="数字: 1-14 (仅小阿卡纳)")
    rank: Mapped[Optional[str]] = mapped_column(nullable=True, comment="牌阶: ace/page/knight/queen/king 或数字")
    
    # 图片路径
    image_filename: Mapped[str] = mapped_column(comment="图片文件名")
    
    # 牌义解读
    meaning_upright: Mapped[str] = mapped_column(Text, comment="正位含义")
    meaning_reversed: Mapped[str] = mapped_column(Text, comment="逆位含义")
    keywords_upright: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="正位关键词")
    keywords_reversed: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="逆位关键词")
    
    # 元数据
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    def __repr__(self) -> str:
        return f"<TarotCard {self.short_code}: {self.name_zh}>"


class TarotReading(Base):
    """
    塔罗占卜记录模型
    
    存储用户的占卜历史，包括抽到的牌、问题和AI解读结果
    """
    __tablename__ = "tarot_readings"
    
    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )
    
    # 关联用户
    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    
    # 占卜信息
    spread_type: Mapped[str] = mapped_column(
        index=True,
        comment="牌阵类型: single/three_cards/celtic_cross/two_options/love_relationship/hexagram/horseshoe"
    )
    question: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="用户提问")
    
    # 抽牌结果 (JSON格式)
    # 结构: [{"card_id": 1, "position": 1, "is_reversed": false}, ...]
    cards_drawn: Mapped[dict] = mapped_column(
        JSONB,
        comment="抽到的牌，JSON数组格式"
    )
    
    # AI解读结果
    interpretation: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="AI解读结果"
    )
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, index=True)
    
    # 关系
    user = relationship("User", back_populates="tarot_readings")
    
    # 索引优化：用户+时间 复合索引，用于历史记录查询
    __table_args__ = (
        Index("ix_tarot_readings_user_created", "user_id", "created_at"),
    )
    
    def __repr__(self) -> str:
        return f"<TarotReading {self.id}: {self.spread_type}>"
