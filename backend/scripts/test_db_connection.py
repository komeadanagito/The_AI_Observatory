"""
数据库连接测试脚本
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


async def test_connection():
    """测试数据库连接"""
    # 测试密码为 root
    url = "postgresql+asyncpg://postgres:root@localhost:5432/postgres"
    
    print(f"正在测试连接: {url}")
    
    try:
        engine = create_async_engine(url)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ 连接成功！")
            print(f"PostgreSQL 版本: {version}")
        await engine.dispose()
        return True
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return False


if __name__ == "__main__":
    asyncio.run(test_connection())
