"""
塔罗牌业务服务

提供抽牌、AI解读、历史记录等核心功能
"""

import json
import random
import hashlib
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID, uuid4

import structlog
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.tarot.models import TarotCard, TarotReading
from src.tarot.spreads import get_spread, SPREADS

logger = structlog.get_logger(__name__)


class TarotService:
    """塔罗牌服务"""
    
    # 内存缓存：session_id -> 抽牌结果
    # 生产环境应使用 Redis
    _draw_cache: dict[str, dict] = {}
    
    # 解读缓存：question_hash -> (interpretation, timestamp)
    _interpret_cache: dict[str, tuple[str, datetime]] = {}
    
    # 缓存过期时间
    DRAW_CACHE_TTL = timedelta(minutes=30)
    INTERPRET_CACHE_TTL = timedelta(minutes=5)
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.settings = get_settings()
    
    # ==========================================
    # 抽牌功能
    # ==========================================
    
    async def draw_cards(
        self,
        spread_type: str,
        question: Optional[str] = None,
        selected_card_ids: Optional[list[int]] = None,
    ) -> dict:
        """
        根据牌阵类型抽牌
        
        Args:
            spread_type: 牌阵类型
            question: 用户问题（可选）
            selected_card_ids: 用户选择的牌 ID 列表（可选）。如果提供，将使用这些牌而非随机抽取。
            
        Returns:
            抽牌结果，包含 session_id、牌阵信息、抽到的牌
            
        Raises:
            ValueError: 无效的牌阵类型或牌 ID
        """
        # 验证牌阵类型
        spread = get_spread(spread_type)
        if not spread:
            raise ValueError(f"无效的牌阵类型: {spread_type}")
        
        card_count = spread["card_count"]
        
        # 获取所有牌
        result = await self.db.execute(select(TarotCard))
        all_cards = result.scalars().all()
        all_cards_dict = {card.id: card for card in all_cards}
        
        if len(all_cards) < card_count:
            raise ValueError("数据库中塔罗牌数量不足")
        
        # 确定要使用的牌
        if selected_card_ids:
            # 用户手动选择模式
            if len(selected_card_ids) != card_count:
                raise ValueError(f"选择的牌数量({len(selected_card_ids)})与牌阵要求({card_count})不符")
            
            # 验证牌 ID 有效性且无重复
            if len(set(selected_card_ids)) != len(selected_card_ids):
                raise ValueError("选择的牌中有重复")
            
            drawn_cards = []
            for card_id in selected_card_ids:
                if card_id not in all_cards_dict:
                    raise ValueError(f"无效的牌 ID: {card_id}")
                drawn_cards.append(all_cards_dict[card_id])
            
            logger.info(
                "用户手动选牌",
                spread_type=spread_type,
                selected_ids=selected_card_ids,
            )
        else:
            # 随机抽取模式（无重复）
            drawn_cards = random.sample(all_cards, card_count)
        
        # 为每张牌随机决定正/逆位 (50%概率)
        cards_data = []
        for i, card in enumerate(drawn_cards):
            is_reversed = random.choice([True, False])
            cards_data.append({
                "card_id": card.id,
                "position": i + 1,
                "is_reversed": is_reversed,
                "card": {
                    "id": card.id,
                    "name_en": card.name_en,
                    "name_zh": card.name_zh,
                    "short_code": card.short_code,
                    "arcana": card.arcana,
                    "suit": card.suit,
                    "image_filename": card.image_filename,
                    "meaning_upright": card.meaning_upright,
                    "meaning_reversed": card.meaning_reversed,
                }
            })
        
        # 生成 session_id
        session_id = str(uuid4())
        
        # 缓存抽牌结果（用于后续解读）
        draw_result = {
            "session_id": session_id,
            "spread_type": spread_type,
            "spread_name_zh": spread["name_zh"],
            "question": question,
            "cards": cards_data,
            "positions": spread["positions"],
            "created_at": datetime.utcnow().isoformat(),
        }
        
        self._draw_cache[session_id] = draw_result
        
        logger.info(
            "抽牌完成",
            session_id=session_id,
            spread_type=spread_type,
            card_count=card_count,
        )
        
        return draw_result
    
    def get_draw_result(self, session_id: str) -> Optional[dict]:
        """获取缓存的抽牌结果"""
        result = self._draw_cache.get(session_id)
        
        if result:
            # 检查是否过期
            created_at = datetime.fromisoformat(result["created_at"])
            if datetime.utcnow() - created_at > self.DRAW_CACHE_TTL:
                del self._draw_cache[session_id]
                return None
        
        return result
    
    # ==========================================
    # AI 解读功能
    # ==========================================
    
    def _get_question_hash(self, spread_type: str, cards: list, question: Optional[str]) -> str:
        """生成问题哈希，用于缓存"""
        card_ids = sorted([c["card_id"] for c in cards])
        content = f"{spread_type}:{card_ids}:{question or ''}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get_cached_interpretation(
        self,
        spread_type: str,
        cards: list,
        question: Optional[str],
    ) -> Optional[str]:
        """获取缓存的解读结果（防止重复请求）"""
        cache_key = self._get_question_hash(spread_type, cards, question)
        cached = self._interpret_cache.get(cache_key)
        
        if cached:
            interpretation, timestamp = cached
            if datetime.utcnow() - timestamp < self.INTERPRET_CACHE_TTL:
                logger.info("返回缓存的解读结果", cache_key=cache_key[:8])
                return interpretation
            else:
                del self._interpret_cache[cache_key]
        
        return None
    
    def cache_interpretation(
        self,
        spread_type: str,
        cards: list,
        question: Optional[str],
        interpretation: str,
    ) -> None:
        """缓存解读结果"""
        cache_key = self._get_question_hash(spread_type, cards, question)
        self._interpret_cache[cache_key] = (interpretation, datetime.utcnow())
    
    def build_interpretation_prompt(
        self,
        spread_type: str,
        cards: list,
        positions: list,
        question: Optional[str],
    ) -> tuple[str, str]:
        """
        构建 AI 解读的 prompt
        
        Returns:
            (system_prompt, user_prompt)
        """
        spread = get_spread(spread_type)
        
        # 系统提示词
        system_prompt = """你是一位神秘而智慧的塔罗牌解读师，拥有深厚的塔罗知识和敏锐的直觉洞察力。

你的解读风格：
- 富有诗意和象征性，善于使用意象和比喻
- 注重图像意象和直觉感受，而非机械的牌义罗列
- 温暖而富有洞察力，给予启发而非定论
- 语言优美流畅，富有神秘感
- 解读深入浅出，既有专业深度又易于理解

重要规则：
1. 这是一个娱乐性质的解读，不是真实预测
2. 绝不涉及中式算命、星座或MBTI的概念和术语
3. 不提供医疗、法律、投资等专业建议
4. 保持积极正向的引导，即使是负面牌也要指出其中的启示
5. 每张牌的解读要结合其位置含义，而非孤立解读

输出格式要求：
- 使用中文回复
- 分段清晰，每个位置的牌单独成段
- 最后给出整体总结和建议
- 不要使用 markdown 格式，直接输出文字"""

        # 构建用户提示词
        cards_description = []
        for card in cards:
            position_info = next(
                (p for p in positions if p["index"] == card["position"]),
                None
            )
            position_name = position_info["name_zh"] if position_info else f"位置{card['position']}"
            
            card_info = card["card"]
            orientation = "逆位" if card["is_reversed"] else "正位"
            meaning = card_info["meaning_reversed"] if card["is_reversed"] else card_info["meaning_upright"]
            
            cards_description.append(
                f"【{position_name}】{card_info['name_zh']}（{orientation}）\n"
                f"  牌义参考：{meaning[:100]}..."
            )
        
        cards_text = "\n\n".join(cards_description)
        
        user_prompt = f"""请为以下塔罗牌阵进行解读：

牌阵类型：{spread["name_zh"]}（{spread["name_en"]}）
牌阵说明：{spread["description_zh"]}

"""
        
        if question:
            user_prompt += f"求问者的问题：{question}\n\n"
        
        user_prompt += f"""抽到的牌：

{cards_text}

请根据以上信息，为求问者提供一份深入、有洞察力的塔罗解读。"""

        return system_prompt, user_prompt
    
    # ==========================================
    # 历史记录功能
    # ==========================================
    
    async def save_reading(
        self,
        user_id: UUID,
        session_id: str,
        interpretation: str,
    ) -> TarotReading:
        """保存解读记录到数据库"""
        draw_result = self.get_draw_result(session_id)
        if not draw_result:
            raise ValueError("抽牌会话不存在或已过期")
        
        # 准备 cards_drawn 数据（移除完整的 card 信息，只保留必要字段）
        cards_drawn = [
            {
                "card_id": c["card_id"],
                "position": c["position"],
                "is_reversed": c["is_reversed"],
            }
            for c in draw_result["cards"]
        ]
        
        reading = TarotReading(
            user_id=user_id,
            spread_type=draw_result["spread_type"],
            question=draw_result["question"],
            cards_drawn=cards_drawn,
            interpretation=interpretation,
        )
        
        self.db.add(reading)
        await self.db.commit()
        await self.db.refresh(reading)
        
        logger.info(
            "保存解读记录",
            reading_id=str(reading.id),
            user_id=str(user_id),
            spread_type=draw_result["spread_type"],
        )
        
        return reading
    
    async def get_user_readings(
        self,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[TarotReading], int]:
        """获取用户的历史解读记录"""
        # 总数
        count_result = await self.db.execute(
            select(func.count(TarotReading.id)).where(TarotReading.user_id == user_id)
        )
        total = count_result.scalar()
        
        # 分页查询
        offset = (page - 1) * page_size
        result = await self.db.execute(
            select(TarotReading)
            .where(TarotReading.user_id == user_id)
            .order_by(TarotReading.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        readings = result.scalars().all()
        
        return list(readings), total
    
    async def get_reading_by_id(
        self,
        reading_id: UUID,
        user_id: UUID,
    ) -> Optional[TarotReading]:
        """获取单条解读记录"""
        result = await self.db.execute(
            select(TarotReading).where(
                TarotReading.id == reading_id,
                TarotReading.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()
    
    async def delete_reading(
        self,
        reading_id: UUID,
        user_id: UUID,
    ) -> bool:
        """删除解读记录"""
        result = await self.db.execute(
            delete(TarotReading).where(
                TarotReading.id == reading_id,
                TarotReading.user_id == user_id,
            )
        )
        await self.db.commit()
        
        deleted = result.rowcount > 0
        if deleted:
            logger.info(
                "删除解读记录",
                reading_id=str(reading_id),
                user_id=str(user_id),
            )
        
        return deleted
    
    async def delete_all_readings(self, user_id: UUID) -> int:
        """删除用户所有解读记录"""
        result = await self.db.execute(
            delete(TarotReading).where(TarotReading.user_id == user_id)
        )
        await self.db.commit()
        
        deleted_count = result.rowcount
        logger.info(
            "删除所有解读记录",
            user_id=str(user_id),
            deleted_count=deleted_count,
        )
        
        return deleted_count


def get_tarot_service(db: AsyncSession) -> TarotService:
    """获取塔罗牌服务实例"""
    return TarotService(db)
