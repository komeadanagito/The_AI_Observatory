"""
用户数据模型

定义 User 实体，作为所有玄学系统的统一用户模型
"""

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional
from uuid import uuid4

from sqlalchemy import DateTime, LargeBinary, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database import Base

if TYPE_CHECKING:
    from src.tarot.models import TarotReading


class User(Base):
    """
    用户实体
    
    统一用户数据模型，所有玄学系统共享
    敏感数据（生日、出生时间、出生地）使用 AES-256-GCM 加密存储
    """
    __tablename__ = "users"
    
    # ==========================================
    # 主键
    # ==========================================
    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
        comment="用户唯一标识 (UUID)"
    )
    
    # ==========================================
    # 认证信息
    # ==========================================
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="邮箱地址（登录凭证）"
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="密码哈希 (bcrypt)"
    )
    
    # ==========================================
    # 个人资料（加密存储）
    # ==========================================
    birth_date_encrypted: Mapped[Optional[bytes]] = mapped_column(
        LargeBinary,
        nullable=True,
        comment="出生日期（AES-256-GCM 加密）"
    )
    birth_time_encrypted: Mapped[Optional[bytes]] = mapped_column(
        LargeBinary,
        nullable=True,
        comment="出生时间（AES-256-GCM 加密）"
    )
    birth_place_encrypted: Mapped[Optional[bytes]] = mapped_column(
        LargeBinary,
        nullable=True,
        comment="出生地点（AES-256-GCM 加密）"
    )
    gender: Mapped[Optional[str]] = mapped_column(
        String(10),
        nullable=True,
        comment="性别: male/female/other"
    )
    
    # ==========================================
    # 偏好设置
    # ==========================================
    language: Mapped[str] = mapped_column(
        String(5),
        default="zh",
        nullable=False,
        comment="界面语言: zh/en"
    )
    
    # ==========================================
    # 时间戳
    # ==========================================
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="更新时间"
    )
    
    # ==========================================
    # 关联关系
    # ==========================================
    # 塔罗牌解读历史
    tarot_readings: Mapped[List["TarotReading"]] = relationship(
        "TarotReading",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
