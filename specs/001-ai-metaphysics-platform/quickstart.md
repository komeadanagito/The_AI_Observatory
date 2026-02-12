# 快速入门：AI 玄学洞见平台

**日期**: 2026-01-28  
**分支**: `001-ai-metaphysics-platform`

## 前置条件

### 系统要求

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (推荐)

### 必需账户

- **AI 模型 API Key** (任选其一):
  - OpenAI API Key
  - DeepSeek API Key  
  - 智谱 GLM API Key
  - 或本地运行 Ollama/vLLM (无需 Key)
- 邮件服务 (SMTP，用于密码重置)

---

## 方式一：Docker 一键启动 (推荐)

### 1. 克隆仓库

```bash
git clone https://github.com/your-org/The_AI_Observatory.git
cd The_AI_Observatory
git checkout 001-ai-metaphysics-platform
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写必需配置：

```env
# 数据库
DATABASE_URL=postgresql://postgres:password@db:5432/ai_observatory
REDIS_URL=redis://redis:6379/0

# AI 服务 (OpenAI 兼容格式，支持任意大模型)
# --- OpenAI 官方 ---
MODEL_API_BASE=https://api.openai.com/v1
MODEL_API_KEY=sk-your-api-key
MODEL_NAME=gpt-4

# --- 或使用 DeepSeek ---
# MODEL_API_BASE=https://api.deepseek.com/v1
# MODEL_API_KEY=sk-your-deepseek-key
# MODEL_NAME=deepseek-chat

# --- 或使用本地 Ollama ---
# MODEL_API_BASE=http://localhost:11434/v1
# MODEL_API_KEY=ollama
# MODEL_NAME=llama3

# --- 或使用智谱 GLM ---
# MODEL_API_BASE=https://open.bigmodel.cn/api/paas/v4
# MODEL_API_KEY=your-glm-key
# MODEL_NAME=glm-4

# 认证
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# 加密
ENCRYPTION_KEY=your-32-byte-encryption-key

# 邮件 (密码重置)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-smtp-password
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 初始化数据库

```bash
docker-compose exec backend alembic upgrade head
docker-compose exec backend python -m scripts.seed_data
```

### 5. 访问应用

- 前端: http://localhost:3000
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs

---

## 方式二：本地开发环境

### 后端设置

```bash
cd backend

# 使用 uv 创建虚拟环境并安装依赖
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
uv sync

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 数据库迁移
alembic upgrade head

# 导入种子数据
python -m scripts.seed_data

# 启动开发服务器
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，设置 NEXT_PUBLIC_API_URL=http://localhost:8000

# 启动开发服务器
npm run dev
```

---

## 验证安装

### 1. 健康检查

```bash
curl http://localhost:8000/health
# 预期响应: {"status": "healthy"}
```

### 2. API 文档

访问 http://localhost:8000/docs 查看 Swagger UI

### 3. 注册测试账户

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test1234"}'
```

### 4. 测试塔罗抽牌

```bash
# 登录获取 token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test1234"}' \
  | jq -r '.access_token')

# 抽取单张塔罗牌
curl -X POST http://localhost:8000/api/tarot/draw \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spread_type": "single"}'
```

---

## 项目结构速览

```
The_AI_Observatory/
├── backend/                    # FastAPI 后端
│   ├── src/
│   │   ├── core/              # 共享核心 (配置、数据库、安全)
│   │   ├── auth/              # 认证模块
│   │   ├── tarot/             # 塔罗牌模块
│   │   ├── chinese_astrology/ # 中式算命模块
│   │   ├── constellation/     # 星座模块
│   │   ├── mbti/              # MBTI 模块
│   │   └── main.py            # 应用入口
│   └── tests/                 # 测试
├── frontend/                  # Next.js 前端
│   ├── src/app/              # 页面路由
│   └── src/components/       # React 组件
├── Tarot/                    # 塔罗牌资源
├── specs/                    # 规范文档
└── docker-compose.yml        # Docker 配置
```

---

## 常用命令

### 后端

```bash
# 运行测试
pytest

# 运行测试 (带覆盖率)
pytest --cov=src --cov-report=html

# 创建数据库迁移
alembic revision --autogenerate -m "描述"

# 应用迁移
alembic upgrade head

# 代码格式化
ruff format src tests
ruff check src tests --fix
```

### 前端

```bash
# 运行测试
npm test

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

### Docker

```bash
# 查看日志
docker-compose logs -f backend

# 重启服务
docker-compose restart backend

# 进入容器
docker-compose exec backend bash
```

---

## 故障排除

### 问题：数据库连接失败

```
确保 PostgreSQL 正在运行，且 DATABASE_URL 配置正确
docker-compose ps  # 检查服务状态
```

### 问题：AI API 调用失败

```
检查 MODEL_API_KEY 是否有效
检查 MODEL_API_BASE 地址是否正确
确保 MODEL_NAME 在该服务商可用
检查网络代理设置 (部分海外 API 需要代理)
本地模型需确保 Ollama/vLLM 服务已启动
```

### 问题：邮件发送失败

```
检查 SMTP 配置
部分邮箱需要开启"应用专用密码"
```

---

## 下一步

1. 阅读 [API 契约文档](./contracts/) 了解完整 API
2. 阅读 [数据模型文档](./data-model.md) 了解数据结构
3. 运行 `/speckit.tasks` 生成任务清单开始开发
