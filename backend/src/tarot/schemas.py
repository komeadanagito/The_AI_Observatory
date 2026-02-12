"""
塔罗牌 Pydantic 模式定义

定义 API 请求和响应的数据结构
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ==========================================
# 塔罗牌基础模式
# ==========================================

class TarotCardBase(BaseModel):
    """塔罗牌基础信息"""
    id: int
    name_en: str = Field(description="英文名称")
    name_zh: str = Field(description="中文名称")
    short_code: str = Field(description="短代码")
    arcana: str = Field(description="大/小阿卡纳: major/minor")
    suit: Optional[str] = Field(None, description="花色 (仅小阿卡纳)")
    image_filename: str = Field(description="图片文件名")


class TarotCardDetail(TarotCardBase):
    """塔罗牌详细信息（含牌义）"""
    number: Optional[int] = Field(None, description="数字")
    rank: Optional[str] = Field(None, description="牌阶")
    meaning_upright: str = Field(description="正位含义")
    meaning_reversed: str = Field(description="逆位含义")
    keywords_upright: Optional[str] = Field(None, description="正位关键词")
    keywords_reversed: Optional[str] = Field(None, description="逆位关键词")
    
    class Config:
        from_attributes = True


class TarotCardListResponse(BaseModel):
    """塔罗牌列表响应"""
    cards: list[TarotCardBase]
    total: int


# ==========================================
# 牌阵模式
# ==========================================

class SpreadPosition(BaseModel):
    """牌阵位置"""
    index: int
    name_zh: str
    name_en: str
    description_zh: str


class SpreadInfo(BaseModel):
    """牌阵基础信息"""
    type: str = Field(description="牌阵类型标识")
    name_zh: str = Field(description="中文名称")
    name_en: str = Field(description="英文名称")
    description_zh: str = Field(description="描述")
    card_count: int = Field(description="牌数")


class SpreadDetail(SpreadInfo):
    """牌阵详细信息（含位置）"""
    positions: list[SpreadPosition]


class SpreadListResponse(BaseModel):
    """牌阵列表响应"""
    spreads: list[SpreadInfo]


# ==========================================
# 抽牌模式
# ==========================================

class DrawCardRequest(BaseModel):
    """抽牌请求"""
    spread_type: str = Field(description="牌阵类型")
    question: Optional[str] = Field(None, max_length=500, description="问题（可选）")
    selected_card_ids: Optional[list[int]] = Field(
        None, 
        description="用户手动选择的牌 ID 列表（可选）。如果提供，将使用这些牌而非随机抽取。"
    )


class DrawnCard(BaseModel):
    """抽到的单张牌"""
    card_id: int
    position: int = Field(description="位置索引")
    is_reversed: bool = Field(description="是否逆位")
    card: TarotCardBase


class DrawCardResponse(BaseModel):
    """抽牌响应"""
    session_id: str = Field(description="会话ID，用于后续解读")
    spread_type: str
    spread_name_zh: str
    question: Optional[str]
    cards: list[DrawnCard]
    positions: list[SpreadPosition]


# ==========================================
# AI 解读模式
# ==========================================

class InterpretRequest(BaseModel):
    """AI解读请求"""
    session_id: str = Field(description="抽牌会话ID")
    question: Optional[str] = Field(None, max_length=500, description="问题（可覆盖抽牌时的问题）")


class InterpretResponse(BaseModel):
    """AI解读响应（非流式）"""
    reading_id: UUID = Field(description="解读记录ID")
    interpretation: str = Field(description="解读内容")
    disclaimer: str = Field(
        default="本内容纯属娱乐参考，不构成任何预测、建议或决策依据。",
        description="免责声明"
    )


# ==========================================
# 历史记录模式
# ==========================================

class ReadingHistoryItem(BaseModel):
    """历史记录列表项"""
    id: UUID
    spread_type: str
    spread_name_zh: str
    question: Optional[str]
    cards_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReadingHistoryDetail(BaseModel):
    """历史记录详情"""
    id: UUID
    spread_type: str
    spread_name_zh: str
    question: Optional[str]
    cards: list[DrawnCard]
    positions: list[SpreadPosition]
    interpretation: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReadingHistoryListResponse(BaseModel):
    """历史记录列表响应"""
    readings: list[ReadingHistoryItem]
    total: int
    page: int
    page_size: int


# ==========================================
# 通用响应
# ==========================================

class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str
    success: bool = True
