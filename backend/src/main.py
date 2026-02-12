"""
FastAPI 应用主入口

AI 玄学洞见平台后端服务
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.core.config import get_settings
from src.core.database import init_db, close_db
from src.core.logging import configure_logging
from src.auth.router import router as auth_router
from src.tarot.router import router as tarot_router


# 配置日志（在模块加载时）
configure_logging()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    应用生命周期管理
    
    启动时初始化资源，关闭时清理资源
    """
    settings = get_settings()
    
    # 启动
    logger.info(
        "应用启动",
        app_name=settings.APP_NAME,
        env=settings.APP_ENV,
        debug=settings.DEBUG,
    )
    
    # 注意：生产环境应使用 Alembic 迁移，不要在这里创建表
    # if settings.is_development:
    #     await init_db()
    #     logger.info("开发环境：数据库表已创建")
    
    yield
    
    # 关闭
    logger.info("应用关闭")
    await close_db()


def create_app() -> FastAPI:
    """
    创建并配置 FastAPI 应用
    
    Returns:
        配置完成的 FastAPI 应用实例
    """
    settings = get_settings()
    
    app = FastAPI(
        title=settings.APP_NAME,
        description="AI 驱动的玄学解读平台，提供塔罗牌、中式算命、星座、MBTI 等个性化解读服务。",
        version="0.1.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )
    
    # 配置 CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册全局异常处理器
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """全局异常处理器"""
        logger.exception(
            "未处理的异常",
            path=request.url.path,
            method=request.method,
            error=str(exc),
        )
        
        if settings.DEBUG:
            # 开发环境返回详细错误信息
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": str(exc),
                    "type": type(exc).__name__,
                },
            )
        else:
            # 生产环境返回通用错误信息
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "服务器内部错误，请稍后重试"},
            )
    
    # 注册路由
    app.include_router(auth_router)
    app.include_router(tarot_router)
    
    # 健康检查端点
    @app.get(
        "/api/health",
        tags=["系统"],
        summary="健康检查",
        description="检查服务是否正常运行",
    )
    async def health_check():
        """健康检查端点"""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "env": settings.APP_ENV,
        }
    
    # 根路径
    @app.get("/", include_in_schema=False)
    async def root():
        """根路径重定向到文档"""
        return {
            "message": f"欢迎使用 {settings.APP_NAME} API",
            "docs": "/docs" if settings.DEBUG else "生产环境已禁用文档",
            "health": "/api/health",
        }
    
    return app


# 创建应用实例
app = create_app()
