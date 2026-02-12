"""
认证模块 Pydantic 模型

定义请求/响应的数据结构
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
import re


# ==========================================
# 请求模型
# ==========================================

class UserRegisterRequest(BaseModel):
    """用户注册请求"""
    email: EmailStr = Field(
        ...,
        description="邮箱地址",
        examples=["user@example.com"]
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="密码（至少8位，包含字母和数字）"
    )
    
    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("密码必须包含至少一个字母")
        if not re.search(r"\d", v):
            raise ValueError("密码必须包含至少一个数字")
        return v


class UserLoginRequest(BaseModel):
    """用户登录请求"""
    email: EmailStr = Field(
        ...,
        description="邮箱地址"
    )
    password: str = Field(
        ...,
        description="密码"
    )


class PasswordResetRequest(BaseModel):
    """密码重置请求（发送重置链接）"""
    email: EmailStr = Field(
        ...,
        description="注册邮箱"
    )


class PasswordResetConfirm(BaseModel):
    """密码重置确认（设置新密码）"""
    token: str = Field(
        ...,
        description="重置令牌"
    )
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="新密码"
    )
    
    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        if not re.search(r"[a-zA-Z]", v):
            raise ValueError("密码必须包含至少一个字母")
        if not re.search(r"\d", v):
            raise ValueError("密码必须包含至少一个数字")
        return v


class RefreshTokenRequest(BaseModel):
    """刷新令牌请求"""
    refresh_token: str = Field(
        ...,
        description="刷新令牌"
    )


class UserProfileUpdate(BaseModel):
    """用户资料更新请求"""
    birth_date: Optional[str] = Field(
        None,
        description="出生日期 (YYYY-MM-DD)",
        pattern=r"^\d{4}-\d{2}-\d{2}$"
    )
    birth_time: Optional[str] = Field(
        None,
        description="出生时间 (HH:MM)",
        pattern=r"^\d{2}:\d{2}$"
    )
    birth_place: Optional[str] = Field(
        None,
        max_length=200,
        description="出生地点"
    )
    gender: Optional[str] = Field(
        None,
        description="性别: male/female/other"
    )
    language: Optional[str] = Field(
        None,
        description="界面语言: zh/en"
    )
    
    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in {"male", "female", "other"}:
            raise ValueError("性别必须是 male/female/other 之一")
        return v
    
    @field_validator("language")
    @classmethod
    def validate_language(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in {"zh", "en"}:
            raise ValueError("语言必须是 zh/en 之一")
        return v


# ==========================================
# 响应模型
# ==========================================

class UserBasicInfo(BaseModel):
    """用户基本信息（用于登录响应）"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(..., description="用户 ID")
    email: str = Field(..., description="邮箱地址")
    gender: Optional[str] = Field(None, description="性别")
    language: str = Field(..., description="界面语言")
    created_at: datetime = Field(..., description="创建时间")


class TokenResponse(BaseModel):
    """令牌响应"""
    access_token: str = Field(
        ...,
        description="访问令牌"
    )
    refresh_token: str = Field(
        ...,
        description="刷新令牌"
    )
    token_type: str = Field(
        default="bearer",
        description="令牌类型"
    )
    expires_in: int = Field(
        ...,
        description="访问令牌过期时间（秒）"
    )
    user: Optional[UserBasicInfo] = Field(
        None,
        description="用户信息"
    )


class UserResponse(BaseModel):
    """用户信息响应"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str = Field(
        ...,
        description="用户 ID"
    )
    email: str = Field(
        ...,
        description="邮箱地址"
    )
    language: str = Field(
        ...,
        description="界面语言"
    )
    created_at: datetime = Field(
        ...,
        description="创建时间"
    )


class UserProfileResponse(BaseModel):
    """用户完整资料响应（包含解密后的敏感数据）"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    email: str
    birth_date: Optional[str] = None
    birth_time: Optional[str] = None
    birth_place: Optional[str] = None
    gender: Optional[str] = None
    language: str
    created_at: datetime
    updated_at: datetime


class MessageResponse(BaseModel):
    """通用消息响应"""
    message: str = Field(
        ...,
        description="消息内容"
    )
    success: bool = Field(
        default=True,
        description="是否成功"
    )
