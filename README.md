# AI 玄学洞见平台

一个前后端分离的 AI 塔罗占卜项目。

- 前端：Next.js 14
- 后端：FastAPI
- 数据库：PostgreSQL
- 缓存：Redis
- AI 接口：OpenAI 兼容格式 / Ollama

## 目录结构

```text
The_AI_Observatory/
├─ frontend/   # Next.js 前端
├─ backend/    # FastAPI 后端
└─ README.md
```

## 启动前准备

本项目本地开发至少需要：

- Python 3.10
- `uv`
- Node.js
- Docker Desktop（用于 PostgreSQL 和 Redis）

如果你不用 Docker，也可以使用你本机自己的 PostgreSQL / Redis，但要自己改 `backend/.env`。

## 一键理解启动顺序

按下面顺序启动：

1. 启动 PostgreSQL 和 Redis
2. 配置并启动后端
3. 配置并启动前端

## 1. 启动数据库和 Redis

在 `backend/` 目录执行：

```powershell
cd E:\project\The_AI_Observatory\backend
docker compose up -d
```

默认会启动：

- PostgreSQL：`localhost:5432`
- Redis：`localhost:6379`

## 2. 配置并启动后端

### 2.1 复制配置文件

```powershell
cd E:\project\The_AI_Observatory\backend
Copy-Item .env.example .env
```

### 2.2 至少确认这些配置

`backend/.env` 里至少要能用：

- `DATABASE_URL`
- `REDIS_URL`
- `MODEL_API_BASE`
- `MODEL_API_KEY`
- `MODEL_NAME`
- `JWT_SECRET_KEY`
- `ENCRYPTION_KEY`

如果你使用本地 Ollama，例如：

```env
MODEL_API_BASE=http://localhost:11434/v1
MODEL_API_KEY=ollama
MODEL_NAME=qwen3:8b
```

如果你本机 PostgreSQL 的 `postgres` 密码是 `root`，则数据库连接类似：

```env
DATABASE_URL=postgresql+asyncpg://postgres:root@localhost:5432/ai_observatory
```

### 2.3 安装依赖并启动后端

```powershell
cd E:\project\The_AI_Observatory\backend
uv sync
uv run uvicorn src.main:app --reload
```

启动成功后访问：

- 后端接口：`http://127.0.0.1:8000`
- Swagger 文档：`http://127.0.0.1:8000/docs`

## 3. 配置并启动前端

### 3.1 复制前端配置

```powershell
cd E:\project\The_AI_Observatory\frontend
Copy-Item .env.example .env.local
```

建议把 `frontend/.env.local` 改成下面这样：

```env
BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

说明：

- `NEXT_PUBLIC_API_URL` 给前端页面使用
- `BACKEND_URL` 给 Next.js 代理路由 `/api/[...path]` 使用

### 3.2 安装依赖并启动前端

```powershell
cd E:\project\The_AI_Observatory\frontend
npm install
npm run dev
```

启动后访问：

- 前端页面：`http://localhost:3000`

如果 `3000` 被占用，Next.js 会自动切到 `3001`。

## 推荐的本地开发终端分配

### 终端 1：数据库和 Redis

```powershell
cd E:\project\The_AI_Observatory\backend
docker compose up -d
```

### 终端 2：后端

```powershell
cd E:\project\The_AI_Observatory\backend
uv run uvicorn src.main:app --reload
```

### 终端 3：前端

```powershell
cd E:\project\The_AI_Observatory\frontend
npm run dev
```

## ngrok 内网穿透

这个项目推荐只穿透前端端口，因为前端已经有 `/api/*` 代理到后端。

如果前端跑在 `3000`：

```powershell
cd D:\ngrok-v3-stable-windows-amd64
.\ngrok.exe http 3000
```

如果前端跑在 `3001`：

```powershell
cd D:\ngrok-v3-stable-windows-amd64
.\ngrok.exe http 3001
```

拿到 ngrok 地址后，直接访问该地址即可。

## 常见问题

### 1. 前端报 `Module not found`

先确认你已经拉到最新代码，并在 `frontend/` 下执行过：

```powershell
npm install
```

### 2. 后端报 `password authentication failed for user "postgres"`

说明 `backend/.env` 里的 `DATABASE_URL` 密码和你本机 PostgreSQL 不一致。

例如如果密码是 `root`：

```env
DATABASE_URL=postgresql+asyncpg://postgres:root@localhost:5432/ai_observatory
```

### 3. 前端代理报 `502` / `fetch failed`

通常说明前端能启动，但后端没起来，或者 `BACKEND_URL` 配错了。

优先检查：

- 后端是否在 `127.0.0.1:8000`
- `frontend/.env.local` 是否配置了 `BACKEND_URL=http://127.0.0.1:8000`

### 4. ngrok 打开后提示 endpoint offline

说明 ngrok 隧道已经断开，重新执行：

```powershell
.\ngrok.exe http 3000
```

并使用新生成的 ngrok 地址。

## 开发验证

前端构建验证：

```powershell
cd E:\project\The_AI_Observatory\frontend
npm run build
```

后端如果环境里已安装测试依赖，可执行：

```powershell
cd E:\project\The_AI_Observatory\backend
uv run pytest
```
