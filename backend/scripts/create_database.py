"""
创建项目数据库脚本
"""

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


async def create_database():
    """创建 ai_observatory 数据库"""
    # 连接到默认的 postgres 数据库
    url = "postgresql+asyncpg://postgres:root@localhost:5432/postgres"
    
    print("正在创建数据库 ai_observatory...")
    
    try:
        engine = create_async_engine(url, isolation_level="AUTOCOMMIT")
        async with engine.connect() as conn:
            # 检查数据库是否已存在
            result = await conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = 'ai_observatory'")
            )
            exists = result.scalar()
            
            if exists:
                print("✅ 数据库 ai_observatory 已存在")
            else:
                await conn.execute(text("CREATE DATABASE ai_observatory"))
                print("✅ 数据库 ai_observatory 创建成功！")
        
        await engine.dispose()
        return True
    except Exception as e:
        print(f"❌ 创建失败: {e}")
        return False


if __name__ == "__main__":
    asyncio.run(create_database())
