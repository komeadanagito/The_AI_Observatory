# 数据模型：AI 玄学洞见平台

**日期**: 2026-01-28  
**分支**: `001-ai-metaphysics-platform`

## 实体关系图 (ERD)

```
┌─────────────┐       ┌─────────────────┐
│    User     │───1:N─│     Reading     │
└─────────────┘       └─────────────────┘
       │                      │
       │                      │ (多态关联)
       │                      ▼
       │        ┌─────────────────────────────┐
       │        │  TarotReading  │ BaziResult │
       │        │  ZiweiResult   │ HoroscopeResult │
       │        │  MBTIResult    │
       │        └─────────────────────────────┘
       │
       └──────1:N──────┐
                       ▼
              ┌─────────────────┐
              │   MBTISession   │
              └─────────────────┘
```

---

## 核心实体

### 1. User (用户)

```python
class User(Base):
    """
    用户实体 - 统一用户数据模型
    
    所有玄学系统共享此模型，系统特有数据通过关联表扩展
    """
    __tablename__ = "users"
    
    # 主键
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    
    # 认证信息
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    
    # 个人资料 (加密存储)
    birth_date_encrypted: Mapped[Optional[bytes]] = mapped_column(LargeBinary)  # AES-256-GCM
    birth_time_encrypted: Mapped[Optional[bytes]] = mapped_column(LargeBinary)  # 出生时辰
    birth_place_encrypted: Mapped[Optional[bytes]] = mapped_column(LargeBinary) # 出生地
    gender: Mapped[Optional[str]] = mapped_column(String(10))  # male/female/other
    
    # 偏好设置
    language: Mapped[str] = mapped_column(String(5), default="zh")  # zh/en
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())
    
    # 关联
    readings: Mapped[List["Reading"]] = relationship(back_populates="user")
    mbti_sessions: Mapped[List["MBTISession"]] = relationship(back_populates="user")
```

**验证规则**:
- `email`: 有效邮箱格式，全局唯一
- `password_hash`: bcrypt 哈希，原始密码至少 8 位含字母和数字
- `gender`: 枚举值 `male`, `female`, `other`
- `language`: 枚举值 `zh`, `en`

---

### 2. Reading (解读记录)

```python
class ReadingType(str, Enum):
    """解读类型枚举"""
    TAROT = "tarot"
    BAZI = "bazi"              # 八字
    ZIWEI = "ziwei"            # 紫微斗数
    HOROSCOPE = "horoscope"    # 星座
    MBTI = "mbti"

class Reading(Base):
    """
    解读记录 - 所有玄学解读的统一存储
    
    永久保留直到用户手动删除或注销账户
    """
    __tablename__ = "readings"
    
    # 主键
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    
    # 外键
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    
    # 解读类型
    reading_type: Mapped[ReadingType] = mapped_column(String(20), index=True)
    
    # 输入数据 (JSON)
    input_data: Mapped[dict] = mapped_column(JSON)
    # 示例: {"question": "...", "spread_type": "celtic_cross", "cards": [...]}
    
    # AI 输出 (JSON)
    output_data: Mapped[dict] = mapped_column(JSON)
    # 示例: {"interpretation": "...", "summary": "...", "keywords": [...]}
    
    # 原始 AI 交互记录 (可审计)
    prompt_used: Mapped[Optional[str]] = mapped_column(Text)
    raw_ai_response: Mapped[Optional[str]] = mapped_column(Text)
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(default=func.now(), index=True)
    
    # 关联
    user: Mapped["User"] = relationship(back_populates="readings")
```

**验证规则**:
- `reading_type`: 必须是有效枚举值
- `input_data`: 根据 `reading_type` 有不同的 schema 约束
- `output_data`: 必须包含 `interpretation` 字段

---

### 3. TarotCard (塔罗牌)

```python
class TarotCard(Base):
    """
    塔罗牌元数据 - 78 张牌的静态数据
    """
    __tablename__ = "tarot_cards"
    
    # 主键
    id: Mapped[int] = mapped_column(primary_key=True)
    
    # 牌面信息
    name_en: Mapped[str] = mapped_column(String(50))       # THE FOOL
    name_zh: Mapped[str] = mapped_column(String(50))       # 愚人
    short_code: Mapped[str] = mapped_column(String(10), unique=True)  # ar00
    
    # 分类
    arcana: Mapped[str] = mapped_column(String(10))        # major/minor
    suit: Mapped[Optional[str]] = mapped_column(String(10))  # wands/cups/swords/pentacles
    number: Mapped[Optional[int]] = mapped_column()        # 1-14 for minor
    
    # 含义
    meaning_upright: Mapped[str] = mapped_column(Text)     # 正位含义
    meaning_reversed: Mapped[str] = mapped_column(Text)    # 逆位含义
    
    # 图像
    image_path: Mapped[str] = mapped_column(String(255))   # 相对路径
```

**初始化数据**: 从 `Tarot/scraper/maj_text_zh.json` 和 `min_text_zh.json` 导入

---

### 4. MBTISession (MBTI 测试会话)

```python
class MBTISession(Base):
    """
    MBTI 测试会话 - 支持中断恢复
    """
    __tablename__ = "mbti_sessions"
    
    # 主键
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    
    # 外键
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    
    # 状态
    status: Mapped[str] = mapped_column(String(20), default="in_progress")
    # in_progress / completed / abandoned
    
    # 问答历史 (JSON 数组)
    qa_history: Mapped[List[dict]] = mapped_column(JSON, default=[])
    # 示例: [{"question": "...", "answer": "...", "dimension_scores": {...}}]
    
    # 维度得分 (实时更新)
    dimension_scores: Mapped[dict] = mapped_column(JSON, default={
        "E": 0, "I": 0,  # 外向/内向
        "S": 0, "N": 0,  # 感觉/直觉
        "T": 0, "F": 0,  # 思考/情感
        "J": 0, "P": 0   # 判断/知觉
    })
    
    # 最终结果 (完成后填充)
    result_type: Mapped[Optional[str]] = mapped_column(String(4))  # e.g., "INTJ"
    result_reading_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("readings.id"))
    
    # 时间戳
    created_at: Mapped[datetime] = mapped_column(default=func.now())
    updated_at: Mapped[datetime] = mapped_column(default=func.now(), onupdate=func.now())
    
    # 关联
    user: Mapped["User"] = relationship(back_populates="mbti_sessions")
```

**状态转换**:
```
in_progress ──(完成测试)──> completed
     │
     └──(超时/用户放弃)──> abandoned
```

---

### 5. Zodiac (星座)

```python
class Zodiac(Base):
    """
    星座元数据 - 12 星座静态数据
    """
    __tablename__ = "zodiacs"
    
    # 主键
    id: Mapped[int] = mapped_column(primary_key=True)
    
    # 基本信息
    name_en: Mapped[str] = mapped_column(String(20))       # Aries
    name_zh: Mapped[str] = mapped_column(String(10))       # 白羊座
    symbol: Mapped[str] = mapped_column(String(5))         # ♈
    
    # 日期范围
    start_month: Mapped[int] = mapped_column()             # 3
    start_day: Mapped[int] = mapped_column()               # 21
    end_month: Mapped[int] = mapped_column()               # 4
    end_day: Mapped[int] = mapped_column()                 # 19
    
    # 属性
    element: Mapped[str] = mapped_column(String(10))       # fire/earth/air/water
    quality: Mapped[str] = mapped_column(String(10))       # cardinal/fixed/mutable
    ruling_planet: Mapped[str] = mapped_column(String(20)) # Mars
    
    # 描述
    description_zh: Mapped[str] = mapped_column(Text)
    description_en: Mapped[str] = mapped_column(Text)
```

---

## 输入数据 Schema (按解读类型)

### Tarot 输入

```python
class TarotInputSchema(BaseModel):
    """塔罗牌解读输入"""
    spread_type: Literal[
        "single",           # 单张
        "three_cards",      # 时间之流
        "celtic_cross",     # 凯尔特十字
        "two_options",      # 二择一
        "love_relationship",# 爱情关系
        "hexagram",         # 六芒星
        "horseshoe"         # 马蹄铁
    ]
    question: Optional[str] = None  # 用户问题 (可选)
    cards: List[TarotCardDraw]      # 抽取的牌
    
class TarotCardDraw(BaseModel):
    """单张牌抽取"""
    card_id: int
    is_reversed: bool  # 是否逆位
    position: int      # 在牌阵中的位置
```

### Bazi 输入

```python
class BaziInputSchema(BaseModel):
    """八字解读输入"""
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int  # 0-23
    gender: Literal["male", "female"]
    birth_place: Optional[str] = None  # 出生地 (用于真太阳时校正)
```

### Ziwei 输入

```python
class ZiweiInputSchema(BaseModel):
    """紫微斗数输入"""
    birth_year: int
    birth_month: int
    birth_day: int
    birth_hour: int
    gender: Literal["male", "female"]
    calendar_type: Literal["lunar", "solar"] = "solar"  # 农历/公历
```

### Horoscope 输入

```python
class HoroscopeInputSchema(BaseModel):
    """星座解读输入"""
    reading_type: Literal["personality", "daily", "weekly", "compatibility"]
    zodiac_sign: str  # 太阳星座
    birth_time: Optional[str] = None    # HH:MM (用于计算上升)
    birth_place: Optional[str] = None   # 出生地
    target_sign: Optional[str] = None   # 配对星座 (compatibility 时需要)
```

---

## 输出数据 Schema

### 通用解读输出

```python
class InterpretationOutput(BaseModel):
    """通用 AI 解读输出"""
    interpretation: str      # 主要解读文本
    summary: str             # 一句话摘要
    keywords: List[str]      # 关键词标签
    disclaimer: str = "本内容纯属娱乐参考，不构成任何预测、建议或决策依据。"
```

### Tarot 输出扩展

```python
class TarotOutputSchema(InterpretationOutput):
    """塔罗牌解读输出"""
    card_meanings: List[CardMeaning]  # 每张牌的单独解读
    overall_theme: str                # 整体主题
    advice: str                       # 建议

class CardMeaning(BaseModel):
    """单张牌解读"""
    card_name: str
    position_meaning: str  # 在该位置的含义
    individual_interpretation: str
```

### Bazi 输出扩展

```python
class BaziOutputSchema(InterpretationOutput):
    """八字解读输出"""
    four_pillars: FourPillars  # 四柱
    five_elements: FiveElements # 五行分布
    day_master: str            # 日主
    strength_analysis: str     # 身强/身弱分析

class FourPillars(BaseModel):
    """四柱"""
    year: Pillar   # 年柱
    month: Pillar  # 月柱
    day: Pillar    # 日柱
    hour: Pillar   # 时柱

class Pillar(BaseModel):
    """单柱"""
    heavenly_stem: str   # 天干
    earthly_branch: str  # 地支
    hidden_stems: List[str]  # 藏干
```

### MBTI 输出扩展

```python
class MBTIOutputSchema(InterpretationOutput):
    """MBTI 解读输出"""
    personality_type: str           # e.g., "INTJ"
    type_name: str                  # e.g., "建筑师"
    cognitive_functions: List[str]  # 认知功能栈
    strengths: List[str]            # 优势
    weaknesses: List[str]           # 劣势
    career_matches: List[str]       # 职业匹配
    relationship_advice: str        # 关系建议
    famous_people: List[str]        # 同类型名人
```

---

## 索引策略

| 表 | 索引 | 用途 |
|-----|------|------|
| users | email (UNIQUE) | 登录查询 |
| readings | user_id + created_at DESC | 用户历史列表 |
| readings | reading_type + created_at DESC | 按模块筛选 |
| mbti_sessions | user_id + status | 恢复未完成测试 |

---

## 数据迁移策略

1. **初始迁移**: 创建所有表结构
2. **种子数据**: 
   - 导入 78 张塔罗牌数据
   - 导入 12 星座数据
3. **索引创建**: 分批创建索引避免锁表
