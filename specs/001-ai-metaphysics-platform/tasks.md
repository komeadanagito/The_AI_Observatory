# 任务清单：AI 玄学洞见平台

**分支**: `001-ai-metaphysics-platform` | **日期**: 2026-01-28  
**规范**: [spec.md](./spec.md) | **计划**: [plan.md](./plan.md)

---

## 📋 任务总览

| 阶段 | 模块 | 任务数 | 状态 |
|------|------|--------|------|
| Phase 1 | 基础设施 | 8 | ✅ 已完成 |
| Phase 2 | 塔罗牌系统 | 12 | 🔄 进行中 |
| Phase 3 | 中式算命系统 | - | ⏸️ 暂缓 |
| Phase 4 | 星座系统 | - | ⏸️ 暂缓 |
| Phase 5 | MBTI 系统 | - | ⏸️ 暂缓 |

---

## Phase 1: 基础设施 (优先级: P0)

> 所有模块的共享基础，必须先完成

### T1.1 后端项目初始化

**目标**: 创建后端项目骨架，配置 uv 依赖管理

**任务清单**:
- [x] 创建 `backend/` 目录结构
- [x] 初始化 `pyproject.toml` (Python 3.10)
- [x] 使用 `uv add` 安装核心依赖:
  - fastapi
  - uvicorn[standard]
  - sqlalchemy[asyncio]
  - asyncpg
  - pydantic
  - pydantic-settings
  - python-jose[cryptography]
  - passlib[bcrypt]
  - httpx
  - openai
  - redis
  - structlog
- [x] 创建 `.env.example` 配置模板
- [x] 创建 `backend/src/__init__.py` 包结构

**验收标准**:
- `uv run python -c "import fastapi; print('OK')"` 执行成功
- 项目结构符合 `plan.md` 规划

**关联需求**: 宪法 I.配置解耦

---

### T1.2 核心配置模块

**目标**: 实现 pydantic-settings 配置管理

**任务清单**:
- [x] 创建 `backend/src/core/config.py`
- [x] 定义 `Settings` 类，从 `.env` 加载配置:
  ```python
  class Settings(BaseSettings):
      # 数据库
      DATABASE_URL: str
      REDIS_URL: str
      
      # AI 模型 (OpenAI 兼容格式)
      MODEL_API_BASE: str
      MODEL_API_KEY: str
      MODEL_NAME: str
      
      # JWT 认证
      JWT_SECRET_KEY: str
      JWT_ALGORITHM: str = "HS256"
      ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
      
      # 加密
      ENCRYPTION_KEY: str
  ```
- [x] 创建 `get_settings()` 依赖函数
- [ ] 单元测试：配置加载验证

**验收标准**:
- 所有配置从 `.env` 读取，代码中无硬编码值
- 缺少必需配置时抛出明确错误

**关联需求**: FR-005 (敏感数据加密), 宪法 IV.配置解耦

---

### T1.3 数据库连接与 ORM 基础

**目标**: 配置 SQLAlchemy 异步引擎和会话管理

**任务清单**:
- [x] 创建 `backend/src/core/database.py`
- [x] 配置 AsyncEngine 和 async_sessionmaker
- [x] 创建 Base 声明式基类
- [x] 实现 `get_db()` 依赖注入
- [x] 配置 Alembic 数据库迁移
  - [x] `alembic init alembic`
  - [x] 配置 `alembic.ini` 使用 async
  - [x] 修改 `env.py` 支持异步迁移

**验收标准**:
- 数据库连接池正常工作
- `alembic revision --autogenerate` 可生成迁移脚本

**关联需求**: 数据模型基础

---

### T1.4 用户模型与认证服务

**目标**: 实现用户注册、登录、JWT 认证

**任务清单**:
- [x] 创建 `backend/src/auth/models.py`
  ```python
  class User(Base):
      __tablename__ = "users"
      
      id: Mapped[UUID] = mapped_column(primary_key=True)
      email: Mapped[str] = mapped_column(unique=True, index=True)
      password_hash: Mapped[str]
      # 加密存储的敏感字段
      encrypted_birthday: Mapped[Optional[bytes]]
      encrypted_birth_time: Mapped[Optional[bytes]]
      encrypted_birthplace: Mapped[Optional[str]]
      gender: Mapped[Optional[str]]
      created_at: Mapped[datetime]
      updated_at: Mapped[datetime]
  ```
- [x] 创建 `backend/src/auth/schemas.py` (Pydantic 模型)
- [x] 创建 `backend/src/core/security.py`
  - [x] 密码哈希 (bcrypt)
  - [x] JWT 生成/验证
  - [x] 敏感数据加密 (AES-256-GCM)
- [x] 创建 `backend/src/auth/service.py`
  - [x] `register_user()` - 用户注册
  - [x] `authenticate_user()` - 用户验证
  - [x] `create_access_token()` - 生成 JWT
- [x] 创建 `backend/src/auth/router.py`
  - [x] `POST /api/auth/register`
  - [x] `POST /api/auth/login`
  - [x] `POST /api/auth/forgot-password`
- [x] 生成数据库迁移并执行

**验收标准**:
- 用户可注册并登录
- JWT token 正确生成和验证
- 敏感数据加密存储

**关联需求**: FR-001, FR-001a, FR-002, FR-002a, FR-003, FR-005

---

### T1.5 认证中间件与路由保护

**目标**: 实现 JWT 认证中间件，保护需要登录的路由

**任务清单**:
- [x] 创建 `backend/src/core/dependencies.py`
  - [x] `get_current_user()` 依赖
  - [x] `get_current_user_optional()` 可选认证
- [x] 实现 JWT Bearer 认证
- [x] 未登录访问受保护路由返回 401

**验收标准**:
- 受保护路由需要有效 JWT
- 无效/过期 token 返回适当错误

**关联需求**: FR-004

---

### T1.6 AI 服务封装

**目标**: 封装 OpenAI 兼容 API 客户端，支持流式响应

**任务清单**:
- [x] 创建 `backend/src/ai/__init__.py`
- [x] 创建 `backend/src/ai/client.py`
  ```python
  from openai import AsyncOpenAI
  
  class AIClient:
      def __init__(self, settings: Settings):
          self.client = AsyncOpenAI(
              api_key=settings.MODEL_API_KEY,
              base_url=settings.MODEL_API_BASE,
          )
          self.model = settings.MODEL_NAME
      
      async def generate(self, prompt: str, system: str = None) -> str:
          """非流式生成"""
          ...
      
      async def stream_generate(self, prompt: str, system: str = None):
          """流式生成 (SSE)"""
          ...
  ```
- [x] 创建 `backend/src/ai/streaming.py`
  - [x] SSE 响应格式化
  - [x] 错误处理和超时
- [ ] 单元测试 (mock OpenAI API)

**验收标准**:
- 支持任意 OpenAI 兼容 API (通过 .env 配置)
- 流式响应正常工作

**关联需求**: SC-003 (15秒内开始输出)

---

### T1.7 结构化日志与可观测性

**目标**: 配置 structlog 结构化日志

**任务清单**:
- [x] 创建 `backend/src/core/logging.py`
- [x] 配置 structlog 处理器链
- [x] 添加请求 ID 追踪
- [x] 配置 JSON 格式输出 (生产环境)
- [x] 关键事件日志记录:
  - [x] 用户登录/注册
  - [x] AI 解读请求
  - [x] 错误异常

**验收标准**:
- 日志输出为结构化 JSON
- 包含 trace_id 用于请求追踪

**关联需求**: FR-050, FR-051, FR-052

---

### T1.8 FastAPI 应用入口

**目标**: 创建 FastAPI 应用主入口，注册路由

**任务清单**:
- [x] 创建 `backend/src/main.py`
- [x] 配置 CORS 中间件
- [x] 注册全局异常处理器
- [x] 挂载 auth 路由
- [x] 创建健康检查端点 `/api/health`
- [x] 配置 OpenAPI 文档

**验收标准**:
- `uvicorn backend.src.main:app --reload` 启动成功
- `/docs` 显示 API 文档
- `/api/health` 返回 200

**关联需求**: 基础设施

---

## Phase 2: 塔罗牌系统 (优先级: P1)

> 第一个核心功能模块，依赖 Phase 1 完成

### T2.1 塔罗牌数据模型

**目标**: 定义塔罗牌相关数据库模型

**已有资源**:
- `Tarot/Tarot_card_images/`: 78 张牌图片
  - 大阿卡纳: `RWS_Tarot_XX_Name.jpg` (22张)
  - 小阿卡纳: `Cups01-14.jpg`, `Wands01-14.jpg`, `Swords01-14.jpg`, `Pents01-14.jpg` (56张)
- `Tarot/scraper/maj_text_zh.json`: 大阿卡纳中文描述
- `Tarot/scraper/min_text_zh.json`: 小阿卡纳中文描述

**任务清单**:
- [x] 创建 `backend/src/tarot/models.py`
  ```python
  class TarotCard(Base):
      """78张塔罗牌元数据"""
      __tablename__ = "tarot_cards"
      
      id: Mapped[int] = mapped_column(primary_key=True)
      name_en: Mapped[str]           # THE MAGICIAN
      name_zh: Mapped[str]           # 魔法师
      short_code: Mapped[str]        # ar01, wapa, cu02...
      arcana: Mapped[str]            # major / minor
      suit: Mapped[Optional[str]]    # wands/cups/swords/pentacles
      number: Mapped[Optional[int]]  # 1-14 for minor
      image_path: Mapped[str]        # 图片文件路径
      meaning_upright: Mapped[str]   # 正位含义
      meaning_reversed: Mapped[str]  # 逆位含义
  
  class TarotReading(Base):
      """塔罗占卜记录"""
      __tablename__ = "tarot_readings"
      
      id: Mapped[UUID] = mapped_column(primary_key=True)
      user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
      spread_type: Mapped[str]       # single/three_cards/celtic_cross...
      question: Mapped[Optional[str]]
      cards_json: Mapped[str]        # 抽到的牌 JSON
      interpretation: Mapped[str]    # AI 解读结果
      created_at: Mapped[datetime]
  ```
- [x] 创建数据库迁移
- [x] 编写种子数据脚本，从 JSON 导入 78 张牌数据

**验收标准**:
- 数据库包含 78 张塔罗牌数据
- 中英文名称、含义正确导入

**关联需求**: 数据模型 - TarotCard

---

### T2.2 塔罗牌种子数据导入

**目标**: 将现有 JSON 数据导入数据库

**任务清单**:
- [x] 创建 `backend/scripts/seed_tarot.py`
- [x] 解析 `maj_text_zh.json` 和 `min_text_zh.json`
- [x] 映射字段:
  - `name_short` → `short_code`
  - `name` → `name_en`
  - `text` → 解析为 `meaning_upright` 和 `meaning_reversed`
- [x] 自动匹配图片路径:
  - `ar01` → `RWS_Tarot_01_Magician.jpg`
  - `wapa` → `Wands11.jpg` (侍从 = Page = 11)
  - `cu02` → `Cups02.jpg`
- [x] 添加中文牌名翻译
- [x] 执行导入并验证

**验收标准**:
- 78 张牌全部导入
- 图片路径正确映射

**关联需求**: T2.1

---

### T2.3 牌阵配置定义

**目标**: 定义 7 种牌阵的配置和位置含义

**任务清单**:
- [x] 创建 `backend/src/tarot/spreads.py`
  ```python
  SPREADS = {
      "single": {
          "name_zh": "单张抽牌",
          "name_en": "Single Card",
          "card_count": 1,
          "positions": [
              {"index": 1, "name_zh": "指引", "name_en": "Guidance"}
          ]
      },
      "three_cards": {
          "name_zh": "时间之流",
          "name_en": "Past-Present-Future",
          "card_count": 3,
          "positions": [
              {"index": 1, "name_zh": "过去", "name_en": "Past"},
              {"index": 2, "name_zh": "现在", "name_en": "Present"},
              {"index": 3, "name_zh": "未来", "name_en": "Future"}
          ]
      },
      "celtic_cross": {
          "name_zh": "凯尔特十字",
          "name_en": "Celtic Cross",
          "card_count": 10,
          "positions": [
              {"index": 1, "name_zh": "现状", "name_en": "Present"},
              {"index": 2, "name_zh": "挑战", "name_en": "Challenge"},
              {"index": 3, "name_zh": "根源", "name_en": "Foundation"},
              {"index": 4, "name_zh": "过去", "name_en": "Past"},
              {"index": 5, "name_zh": "可能", "name_en": "Possible"},
              {"index": 6, "name_zh": "近未来", "name_en": "Near Future"},
              {"index": 7, "name_zh": "自我", "name_en": "Self"},
              {"index": 8, "name_zh": "环境", "name_en": "Environment"},
              {"index": 9, "name_zh": "希望/恐惧", "name_en": "Hopes/Fears"},
              {"index": 10, "name_zh": "结果", "name_en": "Outcome"}
          ]
      },
      "two_options": {
          "name_zh": "二择一",
          "name_en": "Two Options",
          "card_count": 5,
          "positions": [
              {"index": 1, "name_zh": "现状", "name_en": "Current"},
              {"index": 2, "name_zh": "选项A", "name_en": "Option A"},
              {"index": 3, "name_zh": "选项A结果", "name_en": "Option A Outcome"},
              {"index": 4, "name_zh": "选项B", "name_en": "Option B"},
              {"index": 5, "name_zh": "选项B结果", "name_en": "Option B Outcome"}
          ]
      },
      "love_relationship": {
          "name_zh": "爱情关系",
          "name_en": "Love Relationship",
          "card_count": 7,
          "positions": [
              {"index": 1, "name_zh": "你", "name_en": "You"},
              {"index": 2, "name_zh": "对方", "name_en": "Partner"},
              {"index": 3, "name_zh": "关系现状", "name_en": "Relationship"},
              {"index": 4, "name_zh": "阻碍", "name_en": "Obstacle"},
              {"index": 5, "name_zh": "外部影响", "name_en": "External"},
              {"index": 6, "name_zh": "建议", "name_en": "Advice"},
              {"index": 7, "name_zh": "发展方向", "name_en": "Direction"}
          ]
      },
      "hexagram": {
          "name_zh": "六芒星",
          "name_en": "Hexagram",
          "card_count": 7,
          "positions": [
              {"index": 1, "name_zh": "过去", "name_en": "Past"},
              {"index": 2, "name_zh": "现在", "name_en": "Present"},
              {"index": 3, "name_zh": "未来", "name_en": "Future"},
              {"index": 4, "name_zh": "建议", "name_en": "Advice"},
              {"index": 5, "name_zh": "环境", "name_en": "Environment"},
              {"index": 6, "name_zh": "希望", "name_en": "Hopes"},
              {"index": 7, "name_zh": "结果", "name_en": "Outcome"}
          ]
      },
      "horseshoe": {
          "name_zh": "马蹄铁",
          "name_en": "Horseshoe",
          "card_count": 7,
          "positions": [
              {"index": 1, "name_zh": "过去", "name_en": "Past"},
              {"index": 2, "name_zh": "现在", "name_en": "Present"},
              {"index": 3, "name_zh": "隐藏影响", "name_en": "Hidden"},
              {"index": 4, "name_zh": "障碍", "name_en": "Obstacle"},
              {"index": 5, "name_zh": "周围环境", "name_en": "Surrounding"},
              {"index": 6, "name_zh": "建议", "name_en": "Advice"},
              {"index": 7, "name_zh": "结果", "name_en": "Outcome"}
          ]
      }
  }
  ```

**验收标准**:
- 7 种牌阵配置完整
- 位置含义中英双语

**关联需求**: FR-011 ~ FR-017

---

### T2.4 塔罗牌 API - 基础端点

**目标**: 实现获取牌组和牌阵信息的 API

**任务清单**:
- [x] 创建 `backend/src/tarot/schemas.py` (Pydantic)
- [x] 创建 `backend/src/tarot/router.py`
- [x] 实现端点:
  - [x] `GET /api/tarot/cards` - 获取所有牌
  - [x] `GET /api/tarot/cards/{id}` - 获取单张牌详情
  - [x] `GET /api/tarot/spreads` - 获取牌阵列表
  - [x] `GET /api/tarot/spreads/{type}` - 获取牌阵详情
- [x] 注册路由到 main.py

**验收标准**:
- API 返回正确数据
- OpenAPI 文档正确显示

**关联需求**: tarot.yaml 契约

---

### T2.5 塔罗牌 API - 抽牌逻辑

**目标**: 实现随机抽牌 API

**任务清单**:
- [x] 创建 `backend/src/tarot/service.py`
- [x] 实现 `draw_cards(spread_type: str)`:
  - [x] 验证牌阵类型
  - [x] 随机抽取对应数量的牌 (无重复)
  - [x] 随机决定正/逆位 (50%概率)
  - [x] 生成 session_id
  - [x] 临时存储抽牌结果 (内存缓存, 用于后续解读)
- [x] 创建端点 `POST /api/tarot/draw`
- [x] 需要 JWT 认证

**验收标准**:
- 抽牌数量与牌阵匹配
- 同一次抽牌无重复牌
- 返回 session_id 用于解读

**关联需求**: FR-011 ~ FR-017

---

### T2.6 塔罗牌 Prompt 模板

**目标**: 为每种牌阵创建 AI 解读 Prompt 模板

**任务清单**:
- [x] 创建 `backend/src/tarot/prompts/` 目录
- [x] 创建基础系统提示词 `system.txt`:
  ```
  你是一位神秘而智慧的塔罗牌解读师。你的解读风格：
  - 富有诗意和象征性
  - 注重图像意象和直觉感受
  - 温暖而富有洞察力
  - 绝不涉及中式算命、星座或MBTI的概念
  
  重要：这是一个娱乐性质的解读，不是真实预测。
  ```
- [x] 创建各牌阵模板 (已在 service.py 中动态生成)
- [x] 模板变量: `{question}`, `{cards}`, `{positions}`
- [x] 输出格式: 自然语言文本

**验收标准**:
- 每种牌阵有专属 Prompt
- 解读风格符合塔罗直觉式特色

**关联需求**: FR-020, FR-021

---

### T2.7 塔罗牌 API - AI 解读 (流式)

**目标**: 实现 AI 解读 API，支持 SSE 流式响应

**任务清单**:
- [x] 扩展 `backend/src/tarot/service.py`:
  - [x] `build_interpretation_prompt()` 方法
  - [x] 从内存缓存获取抽牌结果
  - [x] 组装 Prompt
  - [x] 调用 AI 客户端
- [x] 创建端点 `POST /api/tarot/interpret`
  - [x] 返回 SSE 流
  - [x] 解读完成后保存到数据库
- [x] 实现重复请求缓存 (5分钟内相同问题)

**验收标准**:
- 流式响应正常工作
- 解读在 15 秒内开始输出
- 重复请求返回缓存

**关联需求**: FR-018, FR-043, SC-003

---

### T2.8 塔罗牌历史记录

**目标**: 塔罗解读结果保存和查询

**任务清单**:
- [x] 扩展 `TarotReading` 模型操作
- [x] 实现历史记录服务:
  - [x] `save_reading()` - 保存解读
  - [x] `get_user_readings()` - 获取用户历史
  - [x] `delete_reading()` - 删除单条记录
- [x] 创建端点:
  - [x] `GET /api/tarot/history` - 用户塔罗历史
  - [x] `GET /api/tarot/history/{id}` - 单条记录详情
  - [x] `DELETE /api/tarot/history/{id}` - 删除记录

**验收标准**:
- 解读自动保存
- 用户可查看和删除历史

**关联需求**: FR-039, FR-039a, FR-040, FR-041

---

### T2.9 前端项目初始化

**目标**: 创建 Next.js 14 前端项目

**任务清单**:
- [x] 创建 `frontend/` 目录
- [x] 初始化 Next.js 14 (App Router)
- [x] 安装依赖:
  - [x] framer-motion (动画)
  - [x] @tanstack/react-query (数据获取)
  - [x] zustand (状态管理)
- [x] 配置暗黑主题 (Tailwind)
- [x] 创建基础布局 `app/layout.tsx`
- [ ] 配置国际化 (中/英) - 暂缓

**验收标准**:
- `npm run dev` 启动成功
- 暗黑主题生效
- 支持中英切换

**关联需求**: FR-044, FR-048

---

### T2.10 前端 - 认证页面

**目标**: 实现登录/注册/忘记密码页面

**任务清单**:
- [x] 创建认证相关路由
- [x] 实现页面:
  - [x] `/login` - 登录页
  - [x] `/register` - 注册页
  - [ ] `/forgot-password` - 忘记密码 (暂缓)
- [x] 创建 `lib/api.ts` API 客户端
- [x] 创建 `lib/auth.ts` 认证状态管理
- [x] 实现 JWT token 存储 (Cookie)
- [x] 路由保护 (未登录重定向)

**验收标准**:
- 用户可注册、登录
- Token 正确存储和使用
- 未登录访问 /tarot 跳转登录页

**关联需求**: FR-001, FR-002, FR-003, FR-004

---

### T2.11 前端 - 塔罗牌主页面

**目标**: 实现塔罗牌抽牌界面

**任务清单**:
- [x] 创建 `app/tarot/page.tsx`
- [x] 实现牌阵选择器组件
- [x] 实现问题输入框
- [x] 实现抽牌按钮
- [x] 创建牌面展示组件 `components/tarot/card-display.tsx`
- [x] 实现翻牌动画 (Framer Motion)
  - [x] 牌背 → 牌面翻转
  - [x] 逆位牌标识
- [x] 响应式布局 (移动端适配)

**验收标准**:
- 用户可选择牌阵
- 抽牌后展示翻牌动画
- 移动端正常使用

**关联需求**: FR-019, FR-045, FR-046

---

### T2.12 前端 - 塔罗解读结果页

**目标**: 展示 AI 解读结果，包含免责声明

**任务清单**:
- [x] 创建 `app/tarot/reading/[sessionId]/page.tsx`
- [x] 实现流式文字显示效果
- [x] 显示牌阵布局图
- [x] 显示每张牌的位置含义
- [x] 顶部固定免责声明组件
- [x] 自动保存到历史记录
- [ ] 分享功能 (复制链接) - 暂缓

**验收标准**:
- 免责声明在顶部显著位置
- AI 解读流式显示
- 牌阵布局正确展示

**关联需求**: FR-009, FR-010, SC-004

---

## Phase 3: 中式算命系统 (暂缓)

> 等待 Phase 2 完成后开始规划

- [ ] T3.1 八字排盘算法
- [ ] T3.2 紫微斗数命盘
- [ ] T3.3 中式算命 API
- [ ] T3.4 中式算命前端

---

## Phase 4: 星座系统 (暂缓)

> 等待 Phase 3 完成后开始规划

- [ ] T4.1 星座计算逻辑
- [ ] T4.2 运势生成
- [ ] T4.3 星座 API
- [ ] T4.4 星座前端

---

## Phase 5: MBTI 系统 (暂缓)

> 等待 Phase 4 完成后开始规划

- [ ] T5.1 动态问卷生成
- [ ] T5.2 维度计算
- [ ] T5.3 MBTI API
- [ ] T5.4 MBTI 前端

---

## 依赖关系图

```
T1.1 ──┬── T1.2 ──── T1.3 ──── T1.4 ──── T1.5
       │                         │
       └── T1.6 ────────────────┬┘
                                │
       T1.7 ───────────────────┬┘
                               │
       T1.8 ←──────────────────┘
         │
         ▼
       T2.1 ──── T2.2
         │
         ▼
       T2.3 ──── T2.4 ──── T2.5
                            │
       T2.6 ───────────────┬┘
                           │
                           ▼
                         T2.7 ──── T2.8
                           │
       T2.9 ──── T2.10 ────┤
                           │
                           ▼
                   T2.11 ──── T2.12
```

---

## 执行指南

### 开始任务

```bash
# 1. 创建任务分支
git checkout -b task/T1.1-backend-init

# 2. 完成任务后提交
git add .
git commit -m "feat(backend): 完成 T1.1 后端项目初始化"

# 3. 合并回主分支
git checkout 001-ai-metaphysics-platform
git merge task/T1.1-backend-init
```

### 任务状态标记

- 🔲 待开始
- 🔄 进行中
- ✅ 已完成
- ⏸️ 暂缓
- ❌ 已取消

---

*最后更新: 2026-01-28*
