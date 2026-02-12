"""
核心配置模块

使用 pydantic-settings 从环境变量加载配置
所有配置项 MUST 通过 .env 文件管理，禁止硬编码
"""

from functools import lru_cache
from typing import List, Optional

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    应用配置类
    
    所有配置从环境变量或 .env 文件加载
    必需配置项缺失时会抛出 ValidationError
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )
    
    # ==========================================
    # 数据库配置
    # ==========================================
    DATABASE_URL: str = Field(
        ...,
        description="PostgreSQL 异步连接字符串",
        examples=["postgresql+asyncpg://user:pass@localhost:5432/db"]
    )
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis 连接字符串"
    )
    
    # ==========================================
    # AI 模型配置 (OpenAI 兼容格式)
    # ==========================================
    MODEL_API_BASE: str = Field(
        default="https://api.openai.com/v1",
        description="AI 模型 API 基础地址"
    )
    MODEL_API_KEY: str = Field(
        ...,
        description="AI 模型 API 密钥"
    )
    MODEL_NAME: str = Field(
        default="gpt-4",
        description="AI 模型名称"
    )
    
    # ==========================================
    # JWT 认证配置
    # ==========================================
    JWT_SECRET_KEY: str = Field(
        ...,
        min_length=32,
        description="JWT 签名密钥，至少 32 字符"
    )
    JWT_ALGORITHM: str = Field(
        default="HS256",
        description="JWT 签名算法"
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=15,
        ge=1,
        description="访问令牌过期时间（分钟）"
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        ge=1,
        description="刷新令牌过期时间（天）"
    )
    
    # ==========================================
    # 数据加密配置
    # ==========================================
    ENCRYPTION_KEY: str = Field(
        ...,
        description="用户敏感数据加密密钥 (Base64 编码)"
    )
    
    # ==========================================
    # 邮件服务配置
    # ==========================================
    SMTP_HOST: Optional[str] = Field(
        default=None,
        description="SMTP 服务器地址"
    )
    SMTP_PORT: int = Field(
        default=587,
        description="SMTP 服务器端口"
    )
    SMTP_USER: Optional[str] = Field(
        default=None,
        description="SMTP 用户名"
    )
    SMTP_PASSWORD: Optional[str] = Field(
        default=None,
        description="SMTP 密码"
    )
    SMTP_FROM_EMAIL: Optional[str] = Field(
        default=None,
        description="发件人邮箱"
    )
    SMTP_FROM_NAME: str = Field(
        default="AI玄学洞见平台",
        description="发件人名称"
    )
    
    # ==========================================
    # 应用配置
    # ==========================================
    APP_NAME: str = Field(
        default="AI玄学洞见平台",
        description="应用名称"
    )
    APP_ENV: str = Field(
        default="development",
        description="运行环境: development / staging / production"
    )
    DEBUG: bool = Field(
        default=False,
        description="是否开启调试模式"
    )
    LOG_LEVEL: str = Field(
        default="INFO",
        description="日志级别"
    )
    
    # ==========================================
    # CORS 配置
    # ==========================================
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000",
        description="允许的跨域来源，逗号分隔"
    )
    
    @property
    def cors_origins_list(self) -> List[str]:
        """将逗号分隔的 CORS 来源转换为列表"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    @property
    def is_production(self) -> bool:
        """是否为生产环境"""
        return self.APP_ENV == "production"
    
    @property
    def is_development(self) -> bool:
        """是否为开发环境"""
        return self.APP_ENV == "development"
    
    @field_validator("APP_ENV")
    @classmethod
    def validate_app_env(cls, v: str) -> str:
        """验证运行环境值"""
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"APP_ENV 必须是 {allowed} 之一")
        return v
    
    @field_validator("LOG_LEVEL")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """验证日志级别"""
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        v_upper = v.upper()
        if v_upper not in allowed:
            raise ValueError(f"LOG_LEVEL 必须是 {allowed} 之一")
        return v_upper


@lru_cache()
def get_settings() -> Settings:
    """
    获取配置单例
    
    使用 lru_cache 确保整个应用生命周期内只加载一次配置
    
    Returns:
        Settings: 配置实例
        
    Raises:
        ValidationError: 必需配置项缺失或格式错误时抛出
    """
    return Settings()


# 导出便捷访问
settings = get_settings
