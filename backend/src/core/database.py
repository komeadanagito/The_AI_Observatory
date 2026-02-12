"""
数据库连接与会话管理模块

使用 SQLAlchemy 2.0 异步引擎
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from src.core.config import get_settings


class Base(DeclarativeBase):
    """
    SQLAlchemy 声明式基类
    
    所有数据模型 MUST 继承此类
    """
    pass


# 创建异步引擎
# 注意：引擎在模块加载时创建，确保配置已就绪
def _create_engine():
    """
    创建数据库异步引擎
    
    配置说明:
    - echo: 开发环境打印 SQL 语句
    - pool_pre_ping: 连接前检测连接有效性
    - pool_size: 连接池大小
    - max_overflow: 允许的额外连接数
    """
    settings = get_settings()
    return create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )


# 延迟初始化引擎（避免模块加载时读取配置）
_engine = None


def get_engine():
    """获取数据库引擎单例"""
    global _engine
    if _engine is None:
        _engine = _create_engine()
    return _engine


# 创建异步会话工厂
def _create_session_factory():
    """创建会话工厂"""
    return async_sessionmaker(
        bind=get_engine(),
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )


_session_factory = None


def get_session_factory():
    """获取会话工厂单例"""
    global _session_factory
    if _session_factory is None:
        _session_factory = _create_session_factory()
    return _session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    获取数据库会话的依赖注入函数
    
    用于 FastAPI 依赖注入:
    
    ```python
    @router.get("/users")
    async def get_users(db: AsyncSession = Depends(get_db)):
        ...
    ```
    
    Yields:
        AsyncSession: 数据库会话，请求结束后自动关闭
    """
    session_factory = get_session_factory()
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    初始化数据库表结构
    
    注意：生产环境应使用 Alembic 迁移，此函数仅用于开发/测试
    """
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """
    关闭数据库连接
    
    应在应用关闭时调用
    """
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
