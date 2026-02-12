# 技术研究：AI 玄学洞见平台

**日期**: 2026-01-28  
**分支**: `001-ai-metaphysics-platform`

## 研究摘要

本文档记录实现 AI 玄学洞见平台所需的技术决策与研究结论。

---

## 1. 后端框架选型

### 决策: FastAPI

**理由**:
- 原生异步支持，适合 AI 流式响应场景
- 自动生成 OpenAPI 文档，契合宪法"契约优先"原则
- Pydantic v2 深度集成，类型安全
- 宪法已明确推荐 FastAPI

**备选方案评估**:
| 框架 | 优势 | 劣势 | 结论 |
|------|------|------|------|
| FastAPI | 异步、自动文档、类型安全 | 生态较 Django 小 | ✅ 采用 |
| Django + DRF | 成熟生态、ORM 完善 | 同步为主，异步支持弱 | ❌ 放弃 |
| Flask | 轻量灵活 | 无内置异步、需手动集成 | ❌ 放弃 |

---

## 2. 前端框架选型

### 决策: Next.js 14 (App Router)

**理由**:
- 服务端渲染 (SSR) 提升首屏加载速度，满足 SC-007 (<3秒)
- App Router 支持 React Server Components，优化性能
- 内置 i18n 路由支持，便于中英双语切换
- Tailwind CSS 集成良好，暗黑模式实现简单

**备选方案评估**:
| 框架 | 优势 | 劣势 | 结论 |
|------|------|------|------|
| Next.js 14 | SSR/SSG、i18n、生态丰富 | 学习曲线 | ✅ 采用 |
| Vue 3 + Nuxt 3 | 选项式 API 友好 | 生态略逊于 React | ❌ 放弃 |
| React SPA | 简单 | 无 SSR，首屏慢 | ❌ 放弃 |

---

## 3. 数据库选型

### 决策: PostgreSQL 15 + Redis

**理由**:
- PostgreSQL: 关系型存储，支持 JSON 字段存储 AI 解读结果
- Redis: 缓存重复请求 (FR-043 防滥用机制)
- 宪法已明确推荐 PostgreSQL

**数据库职责划分**:
| 存储 | 用途 |
|------|------|
| PostgreSQL | 用户数据、解读记录、塔罗牌元数据 |
| Redis | 请求缓存 (5分钟 TTL)、会话存储 |

---

## 4. AI 服务集成

### 决策: OpenAI 兼容 API 格式 (通用大模型接口)

**理由**:
- 采用 OpenAI API 格式作为通用标准，几乎所有主流大模型都支持该格式
- 通过 `.env` 配置 `MODEL_API_BASE` 和 `MODEL_API_KEY`，无需修改代码即可切换模型
- 支持的模型提供商:
  - OpenAI (GPT-4, GPT-4o, GPT-3.5)
  - Anthropic Claude (通过兼容代理)
  - Google Gemini (通过兼容代理)
  - DeepSeek
  - 智谱 GLM
  - 阿里通义千问
  - 本地模型 (Ollama, vLLM, LocalAI)
  - 任何兼容 OpenAI API 格式的服务

**配置示例** (.env):
```env
# OpenAI 官方
MODEL_API_BASE=https://api.openai.com/v1
MODEL_API_KEY=sk-xxx
MODEL_NAME=gpt-4

# DeepSeek
MODEL_API_BASE=https://api.deepseek.com/v1
MODEL_API_KEY=sk-xxx
MODEL_NAME=deepseek-chat

# 本地 Ollama
MODEL_API_BASE=http://localhost:11434/v1
MODEL_API_KEY=ollama
MODEL_NAME=llama3

# 智谱 GLM
MODEL_API_BASE=https://open.bigmodel.cn/api/paas/v4
MODEL_API_KEY=xxx
MODEL_NAME=glm-4
```

**Prompt 工程策略**:
- 每个解读类型独立 Prompt 模板文件
- 系统提示词强调"娱乐性、不构成建议"
- 注入用户上下文 (问题、历史解读摘要)
- 输出格式约束为 JSON，便于结构化解析

**通用客户端实现**:
```python
from openai import AsyncOpenAI
from src.core.config import settings

# 通用 AI 客户端 - 兼容任意 OpenAI 格式 API
ai_client = AsyncOpenAI(
    api_key=settings.MODEL_API_KEY,
    base_url=settings.MODEL_API_BASE,
)

async def stream_interpretation(prompt: str):
    """
    流式生成 AI 解读
    通过 .env 配置可切换任意模型
    """
    async for chunk in await ai_client.chat.completions.create(
        model=settings.MODEL_NAME,
        messages=[
            {"role": "system", "content": "你是一位专业的玄学解读师..."},
            {"role": "user", "content": prompt}
        ],
        stream=True
    ):
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

**模型选择建议**:
| 场景 | 推荐模型 | 理由 |
|------|----------|------|
| 生产环境 | GPT-4o / Claude-3 | 解读质量高，稳定 |
| 成本敏感 | DeepSeek / GLM-4 | 性价比高 |
| 本地部署 | Llama 3 / Qwen | 数据隐私，无 API 费用 |
| 开发测试 | GPT-3.5 / 本地模型 | 响应快，成本低 |

---

## 5. 认证方案

### 决策: JWT (无状态) + bcrypt

**理由**:
- 无状态认证，易于横向扩展
- 前后端分离架构标准实践
- 澄清确认：无需邮箱验证，注册后立即可用

**Token 策略**:
| Token 类型 | 有效期 | 用途 |
|------------|--------|------|
| Access Token | 15分钟 | API 认证 |
| Refresh Token | 7天 | 刷新 Access Token |

**密码策略**:
- 最少 8 位，包含字母和数字
- bcrypt 哈希存储 (cost factor = 12)

---

## 6. 八字/紫微斗数计算

### 决策: 自研计算模块 + AI 解读

**理由**:
- 八字排盘涉及农历换算、天干地支推算，需精确算法
- 紫微斗数涉及星曜布局，算法复杂但确定性
- 计算结果作为 AI 解读的输入上下文

**实现方案**:
1. **农历换算**: 使用 `lunardate` 或 `cnlunar` 库
2. **八字计算**: 基于年月日时推算四柱 (年柱、月柱、日柱、时柱)
3. **五行分析**: 统计金木水火土分布
4. **紫微排盘**: 基于命宫定位，安星规则布局十二宫

**第三方库评估**:
| 库 | 功能 | 结论 |
|-----|------|------|
| `cnlunar` | 农历/节气换算 | ✅ 采用 |
| `bazi` | 八字排盘 | ⚠️ 功能有限，需扩展 |
| 自研 | 完整八字+紫微 | ✅ 核心逻辑自研 |

---

## 7. 星座计算

### 决策: 基于日期范围 + 星历计算

**理由**:
- 太阳星座: 简单日期范围判断
- 月亮/上升星座: 需要精确出生时间和地点，使用星历算法

**实现方案**:
- **太阳星座**: 硬编码日期范围表
- **月亮星座**: 使用 `ephem` 或 `skyfield` 库计算
- **上升星座**: 基于出生时间、地点计算东升点

---

## 8. MBTI 动态问卷

### 决策: AI 动态生成 + 维度评分

**理由**:
- 规范要求 AI 根据回答动态生成下一题 (FR-035)
- 传统固定题库无法实现个性化

**实现方案**:
1. **初始问题**: AI 生成开放式情境题
2. **动态追问**: 基于回答分析，针对性深挖
3. **维度评分**: 后台跟踪 E/I、S/N、T/F、J/P 四维度得分
4. **终止条件**: 8-20 题后，各维度置信度达标时结束
5. **结果计算**: 综合得分确定 16 型人格

---

## 9. 可观测性方案

### 决策: structlog + Prometheus + OpenTelemetry

**理由**:
- 澄清确认：需要完整可观测性 (结构化日志 + 性能指标 + 分布式追踪)

**技术栈**:
| 层面 | 工具 | 用途 |
|------|------|------|
| 日志 | structlog | 结构化 JSON 日志 |
| 指标 | prometheus-client | 请求延迟、AI 响应时间、并发数 |
| 追踪 | opentelemetry-python | 请求链路追踪 |

**关键指标**:
- `http_request_duration_seconds` - 请求延迟分布
- `ai_interpretation_duration_seconds` - AI 解读耗时
- `active_users_total` - 在线用户数
- `reading_requests_total` - 解读请求计数 (按模块)

---

## 10. 国际化方案

### 决策: next-intl + 后端翻译键

**理由**:
- Next.js 生态中 `next-intl` 最为成熟
- 后端返回翻译键，前端渲染实际文本

**实现方案**:
- 前端: `/messages/zh.json`, `/messages/en.json`
- 语言检测: 优先浏览器语言，用户可手动切换
- 存储偏好: localStorage + 用户 profile

---

## 11. 动画实现

### 决策: Framer Motion

**理由**:
- React 生态最流行的动画库
- 声明式 API，易于实现翻牌动画 (FR-046)

**关键动画**:
| 场景 | 动画效果 |
|------|----------|
| 塔罗翻牌 | 3D 翻转 (rotateY) |
| 命盘展示 | 渐入 + 环形布局动画 |
| 结果加载 | 骨架屏 + 流式文字打印 |

---

## 12. 敏感数据加密

### 决策: 应用层加密 (AES-256-GCM)

**理由**:
- FR-005 要求敏感数据加密存储
- 应用层加密确保数据库泄露不暴露明文

**实现方案**:
- 加密字段: 生日、出生时间、出生地
- 算法: AES-256-GCM
- 密钥管理: 通过 .env 配置，不入库

---

## 总结

所有 NEEDS CLARIFICATION 已解决，技术选型完成。下一步进入 Phase 1 数据模型与契约设计。
