# AI 玄学洞见平台后端

AI Metaphysics Insight Platform - Backend Service

## 技术栈

- **框架**: FastAPI
- **数据库**: PostgreSQL + SQLAlchemy 2.0
- **缓存**: Redis
- **认证**: JWT (python-jose)
- **AI**: OpenAI 兼容 API

## 快速开始

```bash
# 安装依赖
uv sync

# 复制配置文件
cp .env.example .env

# 运行开发服务器
uv run uvicorn src.main:app --reload
```

## 项目结构

```
backend/
├── src/
│   ├── core/           # 核心模块（配置、数据库、安全）
│   ├── auth/           # 认证模块
│   ├── tarot/          # 塔罗牌模块
│   ├── ai/             # AI 服务封装
│   ├── history/        # 历史记录模块
│   └── main.py         # FastAPI 应用入口
├── tests/              # 测试
├── alembic/            # 数据库迁移
└── pyproject.toml
```

## API 文档

启动服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
