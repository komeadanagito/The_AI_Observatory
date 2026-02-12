# 实现计划：AI 玄学洞见平台

**分支**: `001-ai-metaphysics-platform` | **日期**: 2026-01-28 | **规范**: [spec.md](./spec.md)  
**输入**: 功能规范 `/specs/001-ai-metaphysics-platform/spec.md`

## 摘要

构建一个 AI 驱动的玄学解读 Web 平台，提供塔罗牌、中式算命（八字/紫微斗数）、星座运势、MBTI 人格测试四大核心功能。采用前后端分离架构，后端使用 FastAPI + PostgreSQL，前端使用 Next.js，通过 OpenAI API 实现 AI 解读生成。

## 技术上下文

**语言/版本**: Python 3.10 (后端) + TypeScript 5.x (前端)  
**主要依赖**:
- 后端: FastAPI, SQLAlchemy 2.0, Pydantic v2, python-jose (JWT), passlib, httpx
- 前端: Next.js 14, React 18, Tailwind CSS, Framer Motion (动画), i18next (国际化)
- AI: OpenAI 兼容 API 格式 (支持任意大模型: OpenAI/Claude/Gemini/DeepSeek/本地模型等)
- 可观测性: structlog (结构化日志), prometheus-client (指标), opentelemetry (追踪)

**存储**: PostgreSQL 15 (主数据库), Redis (缓存重复请求)  
**测试**: pytest + pytest-asyncio (后端), Jest + React Testing Library (前端)  
**目标平台**: Linux 服务器 (Docker 容器化部署)  
**项目类型**: Web 应用 (前后端分离)  
**性能目标**:
- AI 解读响应: 15秒内开始流式输出
- 页面首屏加载: <3秒 (3G网络)
- 八字排盘计算: <3秒
- 并发支持: 500用户同时在线

**约束**:
- 所有配置通过 .env 管理，禁止硬编码
- 仅使用 `uv add` 安装依赖
- 代码注释使用中文

**规模/范围**: 
- 4个独立玄学模块
- 7种塔罗牌阵
- 52条功能需求
- 预计 50+ API 端点

## 宪法合规检查

*GATE: 必须在 Phase 0 研究前通过。Phase 1 设计后重新检查。*

| 原则 | 状态 | 说明 |
|------|------|------|
| I. 模块独立性 | ✅ 通过 | 四大系统独立目录，通过统一用户服务通信 |
| II. AI 驱动解读 | ✅ 通过 | 所有解读使用 Prompt 模板 + 结构化输出 |
| III. 统一用户数据 | ✅ 通过 | 单一 User 模型，系统特有数据通过关联表扩展 |
| IV. 配置解耦 | ✅ 通过 | 所有配置写入 .env，使用 pydantic-settings |
| V. 契约优先 | ✅ 通过 | 先定义 Pydantic 模型和 OpenAPI 契约 |
| VI. 中文规范 | ✅ 通过 | 所有注释、文档使用中文 |
| VII. 测试驱动 | ✅ 通过 | pytest 覆盖率目标 ≥80% |

## 项目结构

### 文档 (本功能)

```text
specs/001-ai-metaphysics-platform/
├── plan.md              # 本文件 (/speckit.plan 输出)
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── contracts/           # Phase 1 输出 (OpenAPI 契约)
│   ├── auth.yaml
│   ├── tarot.yaml
│   ├── chinese-astrology.yaml
│   ├── constellation.yaml
│   ├── mbti.yaml
│   └── user.yaml
└── tasks.md             # Phase 2 输出 (/speckit.tasks)
```

### 源代码 (仓库根目录)

```text
The_AI_Observatory/
├── backend/
│   ├── src/
│   │   ├── core/                    # 共享核心模块
│   │   │   ├── __init__.py
│   │   │   ├── config.py            # 配置管理 (pydantic-settings)
│   │   │   ├── database.py          # 数据库连接
│   │   │   ├── security.py          # JWT/密码哈希
│   │   │   ├── dependencies.py      # FastAPI 依赖注入
│   │   │   └── logging.py           # 结构化日志配置
│   │   ├── auth/                    # 认证模块
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # User 模型
│   │   │   ├── schemas.py           # Pydantic 请求/响应
│   │   │   ├── router.py            # API 路由
│   │   │   └── service.py           # 业务逻辑
│   │   ├── tarot/                   # 塔罗牌模块
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # TarotCard, TarotReading
│   │   │   ├── schemas.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   └── prompts/             # Prompt 模板
│   │   │       ├── single_card.txt
│   │   │       ├── three_cards.txt
│   │   │       └── celtic_cross.txt
│   │   ├── chinese_astrology/       # 中式算命模块
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # BaziChart, ZiweiChart
│   │   │   ├── schemas.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── calculator.py        # 八字/紫微计算引擎
│   │   │   └── prompts/
│   │   ├── constellation/           # 星座模块
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # Zodiac, HoroscopeReading
│   │   │   ├── schemas.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   └── prompts/
│   │   ├── mbti/                    # MBTI 模块
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # MBTISession, MBTIResult
│   │   │   ├── schemas.py
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   └── prompts/
│   │   ├── history/                 # 历史记录模块
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # Reading (通用解读记录)
│   │   │   ├── schemas.py
│   │   │   ├── router.py
│   │   │   └── service.py
│   │   ├── ai/                      # AI 服务封装
│   │   │   ├── __init__.py
│   │   │   ├── client.py            # OpenAI 客户端
│   │   │   └── streaming.py         # 流式响应处理
│   │   └── main.py                  # FastAPI 应用入口
│   ├── tests/
│   │   ├── conftest.py              # pytest fixtures
│   │   ├── unit/
│   │   ├── integration/
│   │   └── contract/
│   ├── alembic/                     # 数据库迁移
│   │   └── versions/
│   ├── pyproject.toml
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── layout.tsx           # 根布局 (暗黑主题)
│   │   │   ├── page.tsx             # 首页
│   │   │   ├── (auth)/              # 认证路由组
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── tarot/               # 塔罗牌页面
│   │   │   ├── chinese-astrology/   # 中式算命页面
│   │   │   ├── constellation/       # 星座页面
│   │   │   ├── mbti/                # MBTI 页面
│   │   │   ├── history/             # 历史记录页面
│   │   │   └── settings/            # 用户设置页面
│   │   ├── components/
│   │   │   ├── ui/                  # 基础 UI 组件
│   │   │   ├── tarot/               # 塔罗牌专用组件 (翻牌动画)
│   │   │   ├── astrology/           # 命盘图形组件
│   │   │   └── layout/              # 布局组件
│   │   ├── lib/
│   │   │   ├── api.ts               # API 客户端
│   │   │   ├── auth.ts              # 认证状态管理
│   │   │   └── i18n.ts              # 国际化配置
│   │   └── styles/
│   │       └── globals.css          # Tailwind + 主题变量
│   ├── public/
│   │   └── tarot/                   # 塔罗牌图片
│   ├── messages/                    # i18n 翻译文件
│   │   ├── zh.json
│   │   └── en.json
│   ├── package.json
│   └── tailwind.config.ts
│
├── Tarot/                           # 塔罗牌资源数据
│   ├── scraper/
│   │   ├── maj_text_zh.json
│   │   └── min_text_zh.json
│   └── Tarot_card_images/
│
├── docker-compose.yml               # 本地开发环境
├── .env.example
└── README.md
```

**结构决策**: 采用 Web 应用架构 (前后端分离)，后端 FastAPI 提供 REST API，前端 Next.js 14 App Router 实现 SSR/CSR 混合渲染。每个玄学系统作为独立模块，遵循宪法模块独立性原则。

## 复杂性追踪

> **仅在宪法检查有需要说明的违规时填写**

| 违规项 | 必要性说明 | 拒绝更简单方案的原因 |
|--------|------------|----------------------|
| 无 | - | - |
