"""
认证 API 路由

提供用户注册、登录、令牌刷新等接口
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.auth.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    RefreshTokenRequest,
    PasswordResetRequest,
    TokenResponse,
    UserResponse,
    UserBasicInfo,
    MessageResponse,
)
from src.auth.service import AuthService
from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.core.security import verify_token_type, create_access_token


router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="用户注册",
    description="使用邮箱和密码注册新账户，注册成功后自动登录返回令牌",
)
async def register(
    request: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    用户注册
    
    - 邮箱必须唯一
    - 密码至少 8 位，包含字母和数字
    - 注册成功后无需邮箱验证，立即可用
    """
    service = AuthService(db)
    
    try:
        user = await service.register_user(request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    
    return service.create_tokens(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="用户登录",
    description="使用邮箱和密码登录，返回访问令牌和刷新令牌",
)
async def login(
    request: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    用户登录
    
    - 登录失败仅记录日志，不限制重试次数
    - 返回 access_token 和 refresh_token
    """
    service = AuthService(db)
    
    try:
        user = await service.authenticate_user(request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return service.create_tokens(user)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="刷新令牌",
    description="使用刷新令牌获取新的访问令牌",
)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    刷新访问令牌
    
    使用有效的 refresh_token 获取新的 access_token
    """
    # 验证刷新令牌
    payload = verify_token_type(request.refresh_token, "refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效或已过期的刷新令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 获取用户
    service = AuthService(db)
    user = await service.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
        )
    
    return service.create_tokens(user)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="忘记密码",
    description="发送密码重置链接到邮箱",
)
async def forgot_password(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """
    发送密码重置邮件
    
    无论邮箱是否存在都返回成功消息（防止邮箱枚举）
    
    TODO: [待实现] 需完成邮件发送功能
    前置条件: SMTP 配置就绪
    """
    # 无论邮箱是否存在都返回相同消息
    return MessageResponse(
        message="如果该邮箱已注册，您将收到密码重置链接",
        success=True,
    )


@router.get(
    "/me",
    response_model=UserBasicInfo,
    summary="获取当前用户信息",
    description="获取当前登录用户的基本信息",
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> UserBasicInfo:
    """
    获取当前用户信息
    
    需要提供有效的 Bearer Token
    """
    return UserBasicInfo(
        id=current_user.id,
        email=current_user.email,
        gender=current_user.gender,
        language=current_user.language,
        created_at=current_user.created_at,
    )
