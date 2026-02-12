"""
流式响应处理模块

提供 SSE (Server-Sent Events) 格式的流式响应
"""

import json
from typing import Any, AsyncGenerator

from fastapi import Response
from fastapi.responses import StreamingResponse


async def sse_generator(
    data_generator: AsyncGenerator[str, None],
    event_type: str = "message",
) -> AsyncGenerator[bytes, None]:
    """
    将数据生成器转换为 SSE 格式
    
    SSE 格式:
    ```
    event: message
    data: {"content": "..."}
    
    ```
    
    Args:
        data_generator: 异步数据生成器
        event_type: SSE 事件类型
        
    Yields:
        SSE 格式的字节数据
    """
    async for content in data_generator:
        # 构造 SSE 消息
        data = json.dumps({"content": content}, ensure_ascii=False)
        message = f"event: {event_type}\ndata: {data}\n\n"
        yield message.encode("utf-8")
    
    # 发送结束事件
    end_data = json.dumps({"done": True}, ensure_ascii=False)
    yield f"event: done\ndata: {end_data}\n\n".encode("utf-8")


def create_sse_response(
    data_generator: AsyncGenerator[str, None],
    event_type: str = "message",
) -> StreamingResponse:
    """
    创建 SSE 流式响应
    
    Args:
        data_generator: 异步数据生成器
        event_type: SSE 事件类型
        
    Returns:
        FastAPI StreamingResponse 对象
    """
    return StreamingResponse(
        sse_generator(data_generator, event_type),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用 nginx 缓冲
        },
    )


async def wrap_with_disclaimer(
    data_generator: AsyncGenerator[str, None],
    disclaimer: str = "本内容纯属娱乐参考，不构成任何预测、建议或决策依据。",
) -> AsyncGenerator[str, None]:
    """
    在流式输出开头添加免责声明
    
    Args:
        data_generator: 原始数据生成器
        disclaimer: 免责声明文本
        
    Yields:
        包含免责声明的数据流
    """
    # 先输出免责声明
    yield f"⚠️ {disclaimer}\n\n---\n\n"
    
    # 然后输出原始内容
    async for content in data_generator:
        yield content
