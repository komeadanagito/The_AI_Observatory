"""
FastAPI 依赖注入模块

提供认证相关的依赖函数
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.auth.service import AuthService
from src.core.database import get_db
from src.core.security import verify_token_type


# HTTP Bearer 认证方案
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    获取当前登录用户
    
    验证 JWT 令牌并返回用户实例
    未登录或令牌无效时抛出 401 错误
    
    Args:
        credentials: HTTP Authorization 头中的 Bearer token
        db: 数据库会话
        
    Returns:
        当前登录的用户实例
        
    Raises:
        HTTPException: 401 未授权
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未提供认证令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 验证访问令牌
    payload = verify_token_type(credentials.credentials, "access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效或已过期的访问令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 获取用户
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="令牌格式无效",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    service = AuthService(db)
    user = await service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在或已被删除",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    可选的用户认证
    
    如果提供了有效令牌则返回用户，否则返回 None
    用于同时支持登录和访客访问的接口
    
    Args:
        credentials: HTTP Authorization 头中的 Bearer token
        db: 数据库会话
        
    Returns:
        当前登录的用户实例，或 None
    """
    if not credentials:
        return None
    
    # 验证访问令牌
    payload = verify_token_type(credentials.credentials, "access")
    if not payload:
        return None
    
    # 获取用户
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    service = AuthService(db)
    return await service.get_user_by_id(user_id)
