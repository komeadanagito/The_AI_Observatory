"""
AI 服务客户端

封装 OpenAI 兼容 API 调用，支持任意大模型
"""

from typing import Any, AsyncGenerator, Optional

import structlog
from openai import AsyncOpenAI

from src.core.config import get_settings


logger = structlog.get_logger(__name__)


class AIClient:
    """
    AI 模型客户端
    
    使用 OpenAI 兼容 API 格式，通过配置切换不同模型提供商:
    - OpenAI (GPT-4, GPT-4o)
    - DeepSeek
    - 智谱 GLM
    - 本地模型 (Ollama, vLLM)
    """
    
    def __init__(self):
        """初始化 AI 客户端"""
        settings = get_settings()
        
        self.client = AsyncOpenAI(
            api_key=settings.MODEL_API_KEY,
            base_url=settings.MODEL_API_BASE,
        )
        self.model = settings.MODEL_NAME
        
        logger.info(
            "AI 客户端初始化",
            model=self.model,
            base_url=settings.MODEL_API_BASE,
        )
    
    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 8192,
        **kwargs: Any,
    ) -> str:
        """
        非流式生成文本
        
        Args:
            prompt: 用户提示词
            system: 系统提示词（可选）
            temperature: 温度参数，控制随机性
            max_tokens: 最大生成令牌数
            **kwargs: 其他 OpenAI API 参数
            
        Returns:
            生成的文本内容
        """
        messages = []
        
        if system:
            messages.append({"role": "system", "content": system})
        
        messages.append({"role": "user", "content": prompt})
        
        logger.debug(
            "AI 生成请求",
            model=self.model,
            prompt_length=len(prompt),
            system_length=len(system) if system else 0,
        )
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            **kwargs,
        )
        
        content = response.choices[0].message.content or ""
        
        logger.debug(
            "AI 生成完成",
            model=self.model,
            response_length=len(content),
            usage=response.usage.model_dump() if response.usage else None,
        )
        
        return content
    
    async def stream_generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 8192,
        **kwargs: Any,
    ) -> AsyncGenerator[str, None]:
        """
        流式生成文本
        
        Args:
            prompt: 用户提示词
            system: 系统提示词（可选）
            temperature: 温度参数
            max_tokens: 最大生成令牌数
            **kwargs: 其他 OpenAI API 参数
            
        Yields:
            生成的文本片段
        """
        messages = []
        
        if system:
            messages.append({"role": "system", "content": system})
        
        messages.append({"role": "user", "content": prompt})
        
        logger.debug(
            "AI 流式生成请求",
            model=self.model,
            prompt_length=len(prompt),
        )
        
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
            **kwargs,
        )
        
        total_length = 0
        chunk_count = 0
        
        async for chunk in stream:
            chunk_count += 1
            
            # 调试：记录每个 chunk 的结构
            if chunk_count <= 3:
                logger.debug(
                    "AI 流式 chunk",
                    chunk_count=chunk_count,
                    has_choices=bool(chunk.choices),
                    choice_count=len(chunk.choices) if chunk.choices else 0,
                )
            
            if chunk.choices:
                delta = chunk.choices[0].delta
                
                # 检查不同可能的内容字段
                content = getattr(delta, 'content', None)
                
                if content:
                    total_length += len(content)
                    yield content
                    
                # 检查是否有结束标记
                finish_reason = chunk.choices[0].finish_reason
                if finish_reason:
                    logger.debug(
                        "AI 流式结束",
                        finish_reason=finish_reason,
                    )
        
        logger.debug(
            "AI 流式生成完成",
            model=self.model,
            total_length=total_length,
            total_chunks=chunk_count,
        )
        
        # 如果没有生成任何内容，记录警告
        if total_length == 0:
            logger.warning(
                "AI 流式生成返回空内容",
                model=self.model,
                chunk_count=chunk_count,
            )


# 全局客户端实例（延迟初始化）
_client: Optional[AIClient] = None


def get_ai_client() -> AIClient:
    """
    获取 AI 客户端单例
    
    Returns:
        AIClient 实例
    """
    global _client
    if _client is None:
        _client = AIClient()
    return _client
