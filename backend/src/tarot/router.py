"""
塔罗牌 API 路由

提供塔罗牌相关的所有 API 端点
"""

from typing import Optional
from uuid import UUID

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.dependencies import get_current_user, get_current_user_optional
from src.auth.models import User
from src.ai.client import AIClient
from src.ai.streaming import create_sse_response, wrap_with_disclaimer
from src.tarot.models import TarotCard, TarotReading
from src.tarot.spreads import SPREADS, get_spread, get_all_spreads
from src.tarot.service import TarotService, get_tarot_service
from src.tarot.schemas import (
    TarotCardBase,
    TarotCardDetail,
    TarotCardListResponse,
    SpreadInfo,
    SpreadDetail,
    SpreadListResponse,
    SpreadPosition,
    DrawCardRequest,
    DrawCardResponse,
    DrawnCard,
    InterpretRequest,
    ReadingHistoryItem,
    ReadingHistoryDetail,
    ReadingHistoryListResponse,
    MessageResponse,
)

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/tarot", tags=["塔罗牌"])


# ==========================================
# 塔罗牌数据端点
# ==========================================


@router.get("/cards", response_model=TarotCardListResponse)
async def get_all_cards(
    arcana: Optional[str] = None,
    suit: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    获取所有塔罗牌

    可选筛选:
    - arcana: major / minor
    - suit: wands / cups / swords / pentacles (仅小阿卡纳)
    """
    query = select(TarotCard)

    if arcana:
        query = query.where(TarotCard.arcana == arcana)
    if suit:
        query = query.where(TarotCard.suit == suit)

    query = query.order_by(TarotCard.id)

    result = await db.execute(query)
    cards = result.scalars().all()

    return TarotCardListResponse(
        cards=[
            TarotCardBase.model_validate(card, from_attributes=True) for card in cards
        ],
        total=len(cards),
    )


@router.get("/cards/{card_id}", response_model=TarotCardDetail)
async def get_card_detail(
    card_id: int,
    db: AsyncSession = Depends(get_db),
):
    """获取单张塔罗牌详情"""
    result = await db.execute(select(TarotCard).where(TarotCard.id == card_id))
    card = result.scalar_one_or_none()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="塔罗牌不存在"
        )

    return TarotCardDetail.model_validate(card, from_attributes=True)


@router.get("/cards/code/{short_code}", response_model=TarotCardDetail)
async def get_card_by_code(
    short_code: str,
    db: AsyncSession = Depends(get_db),
):
    """通过短代码获取塔罗牌详情"""
    result = await db.execute(
        select(TarotCard).where(TarotCard.short_code == short_code)
    )
    card = result.scalar_one_or_none()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="塔罗牌不存在"
        )

    return TarotCardDetail.model_validate(card, from_attributes=True)


# ==========================================
# 牌阵端点
# ==========================================


@router.get("/spreads", response_model=SpreadListResponse)
async def get_spreads():
    """获取所有牌阵列表"""
    spreads = []
    for spread_type, config in SPREADS.items():
        spreads.append(
            SpreadInfo(
                type=spread_type,
                name_zh=config["name_zh"],
                name_en=config["name_en"],
                description_zh=config["description_zh"],
                card_count=config["card_count"],
            )
        )

    return SpreadListResponse(spreads=spreads)


@router.get("/spreads/{spread_type}", response_model=SpreadDetail)
async def get_spread_detail(spread_type: str):
    """获取单个牌阵详情"""
    config = get_spread(spread_type)

    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"牌阵类型 '{spread_type}' 不存在",
        )

    return SpreadDetail(
        type=spread_type,
        name_zh=config["name_zh"],
        name_en=config["name_en"],
        description_zh=config["description_zh"],
        card_count=config["card_count"],
        positions=[SpreadPosition(**pos) for pos in config["positions"]],
    )


# ==========================================
# 统计端点
# ==========================================


@router.get("/stats")
async def get_tarot_stats(
    db: AsyncSession = Depends(get_db),
):
    """获取塔罗牌统计信息"""
    # 总牌数
    total_result = await db.execute(select(func.count(TarotCard.id)))
    total = total_result.scalar()

    # 大阿卡纳数量
    major_result = await db.execute(
        select(func.count(TarotCard.id)).where(TarotCard.arcana == "major")
    )
    major_count = major_result.scalar()

    # 小阿卡纳数量
    minor_result = await db.execute(
        select(func.count(TarotCard.id)).where(TarotCard.arcana == "minor")
    )
    minor_count = minor_result.scalar()

    # 各花色数量
    suits = {}
    for suit in ["wands", "cups", "swords", "pentacles"]:
        result = await db.execute(
            select(func.count(TarotCard.id)).where(TarotCard.suit == suit)
        )
        suits[suit] = result.scalar()

    return {
        "total_cards": total,
        "major_arcana": major_count,
        "minor_arcana": minor_count,
        "suits": suits,
        "spreads_count": len(SPREADS),
    }


# ==========================================
# 抽牌端点（需要登录）
# ==========================================


@router.post("/draw", response_model=DrawCardResponse)
async def draw_cards(
    request: DrawCardRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    抽取塔罗牌

    根据选择的牌阵抽取对应数量的牌。

    - 如果 `selected_card_ids` 为空，则随机抽取
    - 如果 `selected_card_ids` 提供，则使用用户手动选择的牌

    返回 session_id 用于后续解读
    """
    service = get_tarot_service(db)

    try:
        result = await service.draw_cards(
            spread_type=request.spread_type,
            question=request.question,
            selected_card_ids=request.selected_card_ids,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    logger.info(
        "用户抽牌",
        user_id=current_user.id,
        spread_type=request.spread_type,
        session_id=result["session_id"],
    )

    # 构建响应
    drawn_cards = [
        DrawnCard(
            card_id=c["card_id"],
            position=c["position"],
            is_reversed=c["is_reversed"],
            card=TarotCardBase(
                id=c["card"]["id"],
                name_en=c["card"]["name_en"],
                name_zh=c["card"]["name_zh"],
                short_code=c["card"]["short_code"],
                arcana=c["card"]["arcana"],
                suit=c["card"]["suit"],
                image_filename=c["card"]["image_filename"],
            ),
        )
        for c in result["cards"]
    ]

    return DrawCardResponse(
        session_id=result["session_id"],
        spread_type=result["spread_type"],
        spread_name_zh=result["spread_name_zh"],
        question=result["question"],
        cards=drawn_cards,
        positions=[SpreadPosition(**p) for p in result["positions"]],
    )


# ==========================================
# AI 解读端点（需要登录）
# ==========================================


@router.post("/interpret")
async def interpret_reading(
    request: InterpretRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 解读塔罗牌（流式响应）

    使用 Server-Sent Events (SSE) 返回流式解读结果
    """
    service = get_tarot_service(db)

    # 获取抽牌结果
    draw_result = service.get_draw_result(request.session_id)
    if not draw_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="抽牌会话不存在或已过期，请重新抽牌",
        )

    # 使用请求中的问题覆盖（如果提供）
    question = request.question or draw_result["question"]

    # 检查缓存（防止重复请求）
    cached = service.get_cached_interpretation(
        draw_result["spread_type"],
        draw_result["cards"],
        question,
    )

    if cached:
        # 返回缓存结果（非流式）
        return {
            "cached": True,
            "interpretation": cached,
            "disclaimer": "本内容纯属娱乐参考，不构成任何预测、建议或决策依据。",
        }

    # 构建 prompt
    system_prompt, user_prompt = service.build_interpretation_prompt(
        spread_type=draw_result["spread_type"],
        cards=draw_result["cards"],
        positions=draw_result["positions"],
        question=question,
    )

    logger.info(
        "开始 AI 解读",
        user_id=current_user.id,
        session_id=request.session_id,
        spread_type=draw_result["spread_type"],
    )

    # 创建 AI 客户端
    ai_client = AIClient()

    # 用于收集完整响应的变量
    full_response = []
    has_content = False

    async def generate_with_save():
        """生成解读并在完成后保存"""
        nonlocal full_response, has_content

        # 尝试流式生成
        try:
            async for chunk in ai_client.stream_generate(
                prompt=user_prompt,
                system=system_prompt,
            ):
                if chunk:
                    has_content = True
                    full_response.append(chunk)
                    yield chunk
        except Exception as e:
            logger.error("流式生成失败", error=str(e))

        # 如果流式没有返回内容，尝试非流式
        if not has_content:
            logger.warning("流式生成返回空，尝试非流式生成")
            try:
                interpretation = await ai_client.generate(
                    prompt=user_prompt,
                    system=system_prompt,
                )
                if interpretation:
                    has_content = True
                    full_response.append(interpretation)
                    yield interpretation
                else:
                    yield "抱歉，AI 暂时无法生成解读，请稍后重试。"
            except Exception as e:
                logger.error("非流式生成也失败", error=str(e))
                yield f"AI 服务暂时不可用：{str(e)}"

        # 保存到数据库
        interpretation = "".join(full_response)

        if has_content and interpretation:
            # 缓存解读结果
            service.cache_interpretation(
                draw_result["spread_type"],
                draw_result["cards"],
                question,
                interpretation,
            )
            service.cache_session_interpretation(request.session_id, interpretation)

            # 保存到数据库
            try:
                await service.save_reading(
                    user_id=UUID(current_user.id),
                    session_id=request.session_id,
                    interpretation=interpretation,
                )
            except Exception as e:
                logger.error("保存解读记录失败", error=str(e))

    # 包装免责声明
    wrapped_generator = wrap_with_disclaimer(generate_with_save())

    return create_sse_response(wrapped_generator)


@router.post("/interpret/sync")
async def interpret_reading_sync(
    request: InterpretRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 解读塔罗牌（非流式）

    返回完整的解读结果，适合不支持 SSE 的场景
    """
    service = get_tarot_service(db)

    # 获取抽牌结果
    draw_result = service.get_draw_result(request.session_id)
    if not draw_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="抽牌会话不存在或已过期，请重新抽牌",
        )

    question = request.question or draw_result["question"]

    # 检查缓存
    cached = service.get_cached_interpretation(
        draw_result["spread_type"],
        draw_result["cards"],
        question,
    )

    if cached:
        return {
            "cached": True,
            "interpretation": cached,
            "disclaimer": "本内容纯属娱乐参考，不构成任何预测、建议或决策依据。",
        }

    # 构建 prompt
    system_prompt, user_prompt = service.build_interpretation_prompt(
        spread_type=draw_result["spread_type"],
        cards=draw_result["cards"],
        positions=draw_result["positions"],
        question=question,
    )

    # 非流式生成
    ai_client = AIClient()
    interpretation = await ai_client.generate(
        prompt=user_prompt,
        system=system_prompt,
    )

    # 缓存
    service.cache_interpretation(
        draw_result["spread_type"],
        draw_result["cards"],
        question,
        interpretation,
    )
    service.cache_session_interpretation(request.session_id, interpretation)

    # 保存
    reading = await service.save_reading(
        user_id=UUID(current_user.id),
        session_id=request.session_id,
        interpretation=interpretation,
    )

    return {
        "reading_id": str(reading.id),
        "interpretation": interpretation,
        "disclaimer": "本内容纯属娱乐参考，不构成任何预测、建议或决策依据。",
    }


@router.get("/interpret/result/{session_id}")
async def get_interpretation_result(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """查询某次 session 的最终解读结果，供 SSE 不稳定时兜底。"""
    service = get_tarot_service(db)

    draw_result = service.get_draw_result(session_id)
    if not draw_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="抽牌会话不存在或已过期，请重新抽牌",
        )

    interpretation = service.get_session_interpretation(session_id)
    if not interpretation:
        return {"ready": False}

    return {
        "ready": True,
        "interpretation": interpretation,
        "disclaimer": "本内容纯属娱乐参考，不构成任何预测、建议或决策依据。",
    }


# ==========================================
# 历史记录端点（需要登录）
# ==========================================


@router.get("/history", response_model=ReadingHistoryListResponse)
async def get_reading_history(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户的塔罗牌解读历史"""
    service = get_tarot_service(db)

    readings, total = await service.get_user_readings(
        user_id=UUID(current_user.id),
        page=page,
        page_size=page_size,
    )

    items = []
    for reading in readings:
        spread = get_spread(reading.spread_type)
        items.append(
            ReadingHistoryItem(
                id=reading.id,
                spread_type=reading.spread_type,
                spread_name_zh=spread["name_zh"] if spread else reading.spread_type,
                question=reading.question,
                cards_count=len(reading.cards_drawn) if reading.cards_drawn else 0,
                created_at=reading.created_at,
            )
        )

    return ReadingHistoryListResponse(
        readings=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/history/{reading_id}")
async def get_reading_detail(
    reading_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取单条解读记录详情"""
    service = get_tarot_service(db)

    reading = await service.get_reading_by_id(
        reading_id=reading_id,
        user_id=UUID(current_user.id),
    )

    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="解读记录不存在"
        )

    # 获取牌阵信息
    spread = get_spread(reading.spread_type)

    # 获取牌详情
    card_ids = [c["card_id"] for c in reading.cards_drawn]
    result = await db.execute(select(TarotCard).where(TarotCard.id.in_(card_ids)))
    cards_map = {card.id: card for card in result.scalars().all()}

    # 构建响应
    drawn_cards = []
    for c in reading.cards_drawn:
        card = cards_map.get(c["card_id"])
        if card:
            drawn_cards.append(
                {
                    "card_id": c["card_id"],
                    "position": c["position"],
                    "is_reversed": c["is_reversed"],
                    "card": {
                        "id": card.id,
                        "name_en": card.name_en,
                        "name_zh": card.name_zh,
                        "short_code": card.short_code,
                        "arcana": card.arcana,
                        "suit": card.suit,
                        "image_filename": card.image_filename,
                    },
                }
            )

    return {
        "id": reading.id,
        "spread_type": reading.spread_type,
        "spread_name_zh": spread["name_zh"] if spread else reading.spread_type,
        "question": reading.question,
        "cards": drawn_cards,
        "positions": spread["positions"] if spread else [],
        "interpretation": reading.interpretation,
        "created_at": reading.created_at,
        "disclaimer": "本内容纯属娱乐参考，不构成任何预测、建议或决策依据。",
    }


@router.delete("/history/{reading_id}", response_model=MessageResponse)
async def delete_reading(
    reading_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除单条解读记录"""
    service = get_tarot_service(db)

    deleted = await service.delete_reading(
        reading_id=reading_id,
        user_id=UUID(current_user.id),
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="解读记录不存在"
        )

    return MessageResponse(message="删除成功")


@router.delete("/history", response_model=MessageResponse)
async def delete_all_readings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除所有解读记录"""
    service = get_tarot_service(db)

    deleted_count = await service.delete_all_readings(
        user_id=UUID(current_user.id),
    )

    return MessageResponse(message=f"已删除 {deleted_count} 条记录")
