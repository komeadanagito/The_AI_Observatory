"""
认证业务逻辑服务

处理用户注册、登录、令牌刷新等核心认证逻辑
"""

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.models import User
from src.auth.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserProfileUpdate,
    UserBasicInfo,
)
from src.core.config import get_settings
from src.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    encrypt_sensitive_data,
    decrypt_sensitive_data,
)


logger = structlog.get_logger(__name__)


class AuthService:
    """认证服务类"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def register_user(self, request: UserRegisterRequest) -> User:
        """
        注册新用户
        
        Args:
            request: 注册请求数据
            
        Returns:
            新创建的用户实例
            
        Raises:
            ValueError: 邮箱已存在
        """
        # 检查邮箱是否已存在
        existing = await self.get_user_by_email(request.email)
        if existing:
            logger.warning("注册失败：邮箱已存在", email=request.email)
            raise ValueError("该邮箱已被注册")
        
        # 创建用户
        user = User(
            email=request.email,
            password_hash=hash_password(request.password),
        )
        
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        
        logger.info("用户注册成功", user_id=user.id, email=user.email)
        return user
    
    async def authenticate_user(self, request: UserLoginRequest) -> User:
        """
        验证用户登录
        
        Args:
            request: 登录请求数据
            
        Returns:
            验证成功的用户实例
            
        Raises:
            ValueError: 邮箱或密码错误
        """
        user = await self.get_user_by_email(request.email)
        
        if not user:
            logger.warning("登录失败：用户不存在", email=request.email)
            raise ValueError("邮箱或密码错误")
        
        if not verify_password(request.password, user.password_hash):
            logger.warning("登录失败：密码错误", email=request.email)
            raise ValueError("邮箱或密码错误")
        
        logger.info("用户登录成功", user_id=user.id, email=user.email)
        return user
    
    async def get_user_by_email(self, email: str) -> User | None:
        """
        通过邮箱查询用户
        
        Args:
            email: 邮箱地址
            
        Returns:
            用户实例或 None
        """
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: str) -> User | None:
        """
        通过 ID 查询用户
        
        Args:
            user_id: 用户 ID
            
        Returns:
            用户实例或 None
        """
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
    
    def create_tokens(self, user: User) -> TokenResponse:
        """
        为用户创建访问令牌和刷新令牌
        
        Args:
            user: 用户实例
            
        Returns:
            包含令牌的响应对象
        """
        settings = get_settings()
        
        token_data = {"sub": user.id, "email": user.email}
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        # 构建用户基本信息
        user_info = UserBasicInfo(
            id=user.id,
            email=user.email,
            gender=user.gender,
            language=user.language,
            created_at=user.created_at,
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_info,
        )
    
    async def update_user_profile(
        self,
        user: User,
        request: UserProfileUpdate,
    ) -> User:
        """
        更新用户资料
        
        敏感数据（生日、出生时间、出生地）会加密存储
        
        Args:
            user: 用户实例
            request: 更新请求数据
            
        Returns:
            更新后的用户实例
        """
        # 更新加密字段
        if request.birth_date is not None:
            user.birth_date_encrypted = encrypt_sensitive_data(request.birth_date)
        
        if request.birth_time is not None:
            user.birth_time_encrypted = encrypt_sensitive_data(request.birth_time)
        
        if request.birth_place is not None:
            user.birth_place_encrypted = encrypt_sensitive_data(request.birth_place)
        
        # 更新普通字段
        if request.gender is not None:
            user.gender = request.gender
        
        if request.language is not None:
            user.language = request.language
        
        await self.db.flush()
        await self.db.refresh(user)
        
        logger.info("用户资料更新成功", user_id=user.id)
        return user
    
    def get_decrypted_profile(self, user: User) -> dict:
        """
        获取解密后的用户资料
        
        Args:
            user: 用户实例
            
        Returns:
            包含解密敏感数据的字典
        """
        profile = {
            "id": user.id,
            "email": user.email,
            "gender": user.gender,
            "language": user.language,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "birth_date": None,
            "birth_time": None,
            "birth_place": None,
        }
        
        # 解密敏感数据
        if user.birth_date_encrypted:
            try:
                profile["birth_date"] = decrypt_sensitive_data(user.birth_date_encrypted)
            except Exception as e:
                logger.error("解密出生日期失败", user_id=user.id, error=str(e))
        
        if user.birth_time_encrypted:
            try:
                profile["birth_time"] = decrypt_sensitive_data(user.birth_time_encrypted)
            except Exception as e:
                logger.error("解密出生时间失败", user_id=user.id, error=str(e))
        
        if user.birth_place_encrypted:
            try:
                profile["birth_place"] = decrypt_sensitive_data(user.birth_place_encrypted)
            except Exception as e:
                logger.error("解密出生地点失败", user_id=user.id, error=str(e))
        
        return profile
    
    async def delete_user(self, user: User) -> None:
        """
        删除用户及其所有数据
        
        Args:
            user: 要删除的用户实例
        """
        logger.warning("删除用户账户", user_id=user.id, email=user.email)
        await self.db.delete(user)
        await self.db.flush()
