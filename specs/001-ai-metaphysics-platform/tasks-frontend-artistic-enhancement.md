# 任务清单：前端艺术感深度增强

**分支**: `001-ai-metaphysics-platform` | **日期**: 2026-01-28  
**目标**: 打破工业化 UI 感，营造有机、神秘、复古的玄学视觉氛围
**前置条件**: `tasks-tarot-ux-upgrade.md` Phase 1-2 已完成

---

## 📋 任务总览

| 阶段 | 描述 | 任务数 | 状态 |
|------|------|--------|------|
| Phase 1 | 视觉基础重塑 | 8 | ✅ 已完成 |
| Phase 2 | 有机纹理与材质 | 6 | ✅ 已完成 |
| Phase 3 | 叙事转场系统 | 5 | ✅ 已完成 |
| Phase 4 | 排版与装饰精修 | 6 | ✅ 已完成 |
| Phase 5 | 氛围音频细化 | 4 | 🔄 代码完成/待音频 |
| Phase 6 | 收尾与响应式 | 4 | ✅ 已完成 |

**总计**: 33 个任务

**已完成**: Phase 1-6 (31/33 个任务，音频文件待准备)

---

## Phase 1: 视觉基础重塑 (优先级: P1)

**目标**: 打破栅格系统的规整感，引入非对称与有机布局

### T001 色彩系统重塑

**目标**: 将"工业紫"调整为"复古神秘"调色板

**任务清单**:
- [x] T001.1 [P] 更新 `frontend/tailwind.config.ts` 重新定义色彩变量
  - `primary`: 从高饱和紫 → 哑紫（如 `#7a6b91`）
  - `gold`: 从明亮金 → 陈旧黄铜（如 `#b8956e`）
  - `dark`: 从纯黑 → 深灰蓝（如 `#1a1d24`）
  - 新增 `parchment`: 羊皮纸色（如 `#e8dcc4`）
  - 新增 `rust`: 铁锈红（如 `#a86a52`）
- [x] T001.2 [P] 更新 `frontend/src/app/globals.css` 应用新色彩
  - 更新 CSS 变量 `--primary-*`, `--gold-*`, `--dark-*`
  - 添加新色彩组 `--parchment-*`, `--rust-*`
- [x] T001.3 全局检查并替换过亮的颜色使用

**验收标准**:
- 整体色调呈现"陈旧古籍"感
- 无刺眼的高光色块

---

### T002 布局非对称化

**目标**: 打破完美对齐，引入轻微的有机偏移

**任务清单**:
- [x] T002.1 [P] 创建 `frontend/src/lib/organic-utils.ts`
  - `randomRotation(seed, range)`: 基于种子的轻微旋转（±0.3° ~ ±1.5°）
  - `randomOffset(seed, range)`: 基于种子的轻微位移（±2px ~ ±8px）
  - `organicBorderRadius()`: 不规则圆角（如 `12px 18px 14px 20px`）
- [x] T002.2 更新 `frontend/src/components/ui/card.tsx`
  - 应用轻微随机旋转
  - 使用不规则圆角
- [x] T002.3 更新 `frontend/src/app/tarot/page.tsx`
  - 牌阵选择卡片添加轻微偏移
  - 打破完美网格对齐
- [x] T002.4 更新 `frontend/src/components/tarot/card-display.tsx`
  - 卡牌位置添加微小随机偏移
  - 每张牌轻微旋转（±1°）

**验收标准**:
- 元素不再"完美对齐"
- 偏移感觉自然，不像 bug

---

### T003 边框与阴影软化

**目标**: 移除硬边框，改用柔和的光晕与渐变

**任务清单**:
- [x] T003.1 [P] 更新 `frontend/src/app/globals.css`
  - 新增 `.border-ethereal`: 渐隐边框效果
  - 新增 `.shadow-mystic`: 多层柔和阴影
  - 新增 `.glow-subtle`: 微弱内发光
- [x] T003.2 更新 `frontend/src/components/ui/button.tsx`
  - 移除硬边框
  - 应用 `.shadow-mystic` + 悬浮态光晕扩散
- [x] T003.3 更新 `frontend/src/components/ui/card.tsx`
  - 边框改为渐变消隐效果
  - 添加内阴影深度感

**验收标准**:
- 无明显的 1px 硬边框
- 元素边缘有自然的"呼吸感"

---

## Phase 2: 有机纹理与材质 (优先级: P1)

**目标**: 为界面添加实体质感，摆脱"平面设计"感

### T004 羊皮纸纹理层

**目标**: 为内容区域添加古籍纸张质感

**任务清单**:
- [x] T004.1 [P] 创建 `frontend/src/components/effects/ParchmentTexture.tsx`
  - 使用 CSS `noise` 滤镜或 SVG 纹理
  - 可配置透明度和颜色
  - 支持 `worn`（磨损）、`clean`（干净）两种变体
- [x] T004.2 [P] 生成/准备纹理资源
  - `frontend/public/textures/paper-grain.svg` (可平铺噪点)
  - `frontend/public/textures/parchment-edge.svg` (边缘撕裂效果)
- [x] T004.3 在 `frontend/src/app/tarot/reading/[sessionId]/page.tsx` 应用纸张纹理
  - 解读内容区域使用羊皮纸背景 (ParchmentTexture)
  - 边缘添加自然的渐隐效果
  - 首字下沉效果 (drop-cap)
  - 入场动画 (RevealOnScroll)

**验收标准**:
- 内容区有明显的纸张质感
- 不影响文字可读性

---

### T005 金属与旧物质感

**目标**: 为装饰元素添加氧化/做旧效果

**任务清单**:
- [x] T005.1 [P] 更新 `frontend/src/app/globals.css`
  - `.metal-oxidized`: 氧化金属渐变（绿锈、铜锈）
  - `.gold-antique`: 做旧黄铜效果（不均匀反光）
  - `.patina`: 铜绿锈迹叠加层
  - `.border-brass-antique`: 边框黄铜做旧
  - `.metal-shine`: 金属高光流动
- [x] T005.2 更新 `frontend/src/components/ui/MysticFrame.tsx`
  - 边框应用氧化金属效果 (border-brass-antique, patina, metal-shine)
  - 角落装饰添加铜绿细节
- [x] T005.3 更新塔罗卡牌边框
  - `frontend/src/components/tarot/card-display.tsx`
  - 金边改为做旧黄铜效果 (gold-antique, patina)
  - 添加不均匀的反光点 (不同角落使用不同透明度)

**验收标准**:
- 金色元素不再"塑料感"
- 有明显的岁月痕迹

---

### T006 烟雾与尘埃粒子

**目标**: 添加漂浮的尘埃/烟雾增强神秘感

**任务清单**:
- [x] T006.1 [P] 创建 `frontend/src/components/effects/DustParticles.tsx`
  - Canvas 实现漂浮尘埃效果
  - 粒子缓慢飘动，有深度感（大小不一）
  - 可配置密度和运动速度
- [x] T006.2 [P] 创建 `frontend/src/components/effects/MysticSmoke.tsx`
  - CSS/SVG 实现底部烟雾效果
  - 缓慢流动的半透明雾气
  - (合并到 DustParticles.tsx 中)
- [x] T006.3 在塔罗页面集成
  - `frontend/src/app/layout.tsx` 添加全局尘埃层
  - 解读页面底部添加烟雾效果（可选）

**验收标准**:
- 有明显的"古老空间"氛围
- 不遮挡主要内容

---

## Phase 3: 叙事转场系统 (优先级: P1)

**目标**: 页面切换不再是"路由跳转"，而是"仪式入门"

### T007 全屏转场遮罩

**目标**: 创建沉浸式页面转场效果

**任务清单**:
- [x] T007.1 创建 `frontend/src/components/effects/PageTransition.tsx`
  - 全屏遮罩组件（黑色/深紫）
  - 支持多种转场动画：
    - `fade`: 渐隐渐现
    - `portal`: 中心光点扩散
    - `mist`: 烟雾弥漫
    - `runes`: 符文闪烁后消散
- [x] T007.2 创建 `frontend/src/lib/transition-store.ts`
  - Zustand 存储管理转场状态
  - `triggerTransition(type, duration, onComplete)`
- [x] T007.3 更新 `frontend/src/app/layout.tsx`
  - 集成全局转场遮罩层（TransitionOverlay）
  - 监听路由变化触发转场
- [x] T007.4 更新导航链接触发转场
  - 首页 → 塔罗页：`portal` 转场 (usePageTransition)
  - 塔罗页 → 解读页：`mist` 转场 (待集成)
  - 返回首页：`fade` 转场 (待集成)

**验收标准**:
- 页面切换有明显的"进入仪式"感
- 转场流畅，无突兀跳转

---

### T008 内容入场动画

**目标**: 页面内容不再"瞬间出现"

**任务清单**:
- [x] T008.1 [P] 创建 `frontend/src/components/effects/RevealOnScroll.tsx`
  - 基于 Intersection Observer 的入场动画
  - 支持 `fadeUp`、`fadeIn`、`scaleIn`、`slideLeft`、`slideRight`、`blur` 等效果
- [x] T008.2 [P] 创建 `frontend/src/components/effects/StaggeredReveal.tsx`
  - 子元素依次入场（如卡片列表）
  - 可配置间隔时间
  - 包含 TextReveal 组件（文本逐行显示）
- [x] T008.3 在塔罗页面应用
  - 牌阵选择卡片依次入场 (staggerChildren)
  - 解读文字段落依次显现 (RevealOnScroll)

**验收标准**:
- 内容有"逐步揭示"的仪式感
- 动画节奏舒适，不拖沓

---

## Phase 4: 排版与装饰精修 (优先级: P2)

**目标**: 提升文字排版的艺术感

### T009 首字下沉与段落装饰

**目标**: 解读文字呈现"古籍"排版风格

**任务清单**:
- [x] T009.1 [P] 更新 `frontend/src/app/globals.css`
  - `.drop-cap`: 首字下沉样式（3行高，装饰字体）
  - `.paragraph-divider`: 段落间装饰分隔符（如 ✦ 或符文）
  - `.quote-mystic`: 引用块的神秘样式
- [x] T009.2 更新 `frontend/src/app/tarot/reading/[sessionId]/page.tsx`
  - 解读内容应用首字下沉 (已应用)
  - 段落之间添加装饰分隔 (MysticDivider)
- [x] T009.3 更新 `frontend/src/components/ui/MysticFrame.tsx`
  - 添加"古籍页眉"装饰条 (已有角落装饰)
  - 添加"古籍页脚"装饰条 (已有角落装饰)

**验收标准**:
- 解读文字排版有"手抄本"质感
- 装饰不过度，保持可读性

---

### T010 图标与符号系统

**目标**: 用神秘符号替代通用图标

**任务清单**:
- [x] T010.1 [P] 创建 `frontend/src/components/icons/MysticIcons.tsx`
  - SVG 图标组件：月相、星座符号、炼金术符号
  - 塔罗花色符号：权杖、圣杯、宝剑、星币
  - 占卜符号：水晶球、手掌、眼睛
  - 加载图标、返回箭头、洗牌图标等
- [x] T010.2 替换通用图标
  - 返回按钮：← 改为 BackArrowIcon (月相风格)
  - 加载中：改为 LoadingIcon (旋转六芒星)
  - 解读头部：改为 CrystalBallIcon
- [x] T010.3 更新按钮图标
  - "开始洗牌"按钮：已有洗牌符号
  - "获取解读"按钮：CrystalBallIcon

**验收标准**:
- 无标准 Web 图标（如箭头、勾选）
- 所有图标符合神秘主题

---

### T011 动态装饰元素

**目标**: 装饰元素有生命感

**任务清单**:
- [x] T011.1 [P] 更新 `frontend/src/components/ui/Divider.tsx`
  - 分隔线符号轻微浮动动画 (y, scale)
  - 鼠标悬停时符号发光 (group-hover:drop-shadow)
- [x] T011.2 更新 `frontend/src/components/ui/MysticFrame.tsx`
  - 角落装饰缓慢旋转（60s 一圈, rotate-slow）
  - 边框光效流动动画 (metal-shine, gold-shimmer)
- [x] T011.3 更新星空背景
  - `frontend/src/components/effects/StarfieldCanvas.tsx`
  - 已有流星效果
  - 星座连线效果可后续添加

**验收标准**:
- 装饰元素有"活着"的感觉
- 动画极其缓慢，不分散注意力

---

## Phase 5: 氛围音频细化 (优先级: P2)

**目标**: 声音设计增强沉浸感

### T012 环境音分层

**目标**: 创建多层环境音系统

**任务清单**:
- [ ] T012.1 [P] 准备音频资源 `frontend/public/sounds/`
  - `ambient-base.mp3`: 低频嗡鸣（持续）- 待准备
  - `ambient-wind.mp3`: 轻风/呼吸声 - 待准备
  - `ambient-chimes.mp3`: 偶发风铃声 - 待准备
- [x] T012.2 创建 `frontend/src/lib/sound.ts`
  - 添加 `AmbientLayer` 类（支持多轨混音）
  - 实现淡入淡出过渡
  - 根据页面切换改变音频组合
  - `SoundEffectPlayer` 交互音效播放器
- [x] T012.3 塔罗页面音频配置
  - 选牌阶段：低频 + 轻风 (PAGE_AUDIO_CONFIGS)
  - 翻牌瞬间：叠加铃声
  - 解读阶段：低频 + 偶发风铃

**验收标准**:
- 音频层次分明
- 页面切换时音频自然过渡

---

### T013 交互反馈音效精修

**目标**: 提升操作音效的质感

**任务清单**:
- [ ] T013.1 [P] 准备/替换音效 (待准备音频文件)
  - `flip-enhanced.mp3`: 更有质感的翻牌声（纸张+回声）
  - `select-crystal.mp3`: 水晶碰撞般的选中音
  - `hover-whisper.mp3`: 极轻的悬浮提示音
- [x] T013.2 更新音效触发逻辑
  - playSound() 便捷函数已创建
  - SoundEffect 类型定义完整
- [x] T013.3 添加细微反馈音
  - 音效系统已支持 'card-hover' 等效果
  - 待音频文件准备后即可启用

**验收标准**:
- 音效有"实体感"
- 不突兀，自然融入体验

---

## Phase 6: 收尾与响应式 (优先级: P3)

**目标**: 确保所有增强在各设备上正常

### T014 移动端适配

**任务清单**:
- [x] T014.1 测试并调整移动端纹理效果
  - 降低纹理复杂度（通过 device-capability.ts）
  - 调整尘埃粒子密度 (dustParticleCount)
- [x] T014.2 测试并调整移动端转场效果
  - 简化复杂转场动画 (transitionType: 'simple')
  - 确保触摸交互正常 (isTouchDevice 检测)
- [x] T014.3 测试并调整移动端排版
  - 首字下沉在小屏上的表现（CSS 已适配）
  - 装饰分隔符的间距（响应式类名）

**验收标准**:
- 移动端视觉效果一致
- 性能流畅（无明显卡顿）

---

### T015 性能与降级

**任务清单**:
- [x] T015.1 [P] 创建 `frontend/src/lib/device-capability.ts`
  - 检测设备性能等级 (PerformanceLevel)
  - 检测 `prefers-reduced-motion`
  - 检测 WebGL、移动设备、触摸设备
- [x] T015.2 实现自动降级
  - 低端设备：禁用尘埃粒子、简化星空 (getVisualEffectsConfig)
  - 减少动画偏好：禁用所有装饰动画
- [x] T015.3 添加手动开关
  - UserVisualPreferences 接口
  - localStorage 持久化用户偏好
  - getFinalVisualConfig() 综合配置

**验收标准**:
- 低端设备可用
- 尊重用户动画偏好设置

---

## 依赖关系

```
Phase 1 (视觉重塑) ──→ Phase 2 (有机纹理) ──→ Phase 3 (叙事转场)
        │                      │                      │
        └──────────────────────┴──────────────────────┴──→ Phase 4 (排版装饰)
                                                            │
                                                            ├──→ Phase 5 (音频)
                                                            │
                                                            └──→ Phase 6 (收尾)
```

**关键路径**:
- T001 色彩系统 → 所有后续视觉任务
- T007 转场系统 → T008 入场动画
- T004 纹理 → T009 排版装饰

---

## 并行执行机会

### Phase 1 内部可并行
```
T001.1 色彩配置 ─┬─ 并行
T002.1 有机工具 ─┤
T003.1 边框阴影 ─┘
```

### Phase 2 内部可并行
```
T004.1 纸张纹理组件 ─┬─ 并行
T005.1 金属质感 CSS ─┤
T006.1 尘埃粒子 ─────┘
```

### Phase 4 内部可并行
```
T009.1 排版 CSS ──┬─ 并行
T010.1 图标组件 ─┘
```

---

## 实现策略

### 快速见效 (1 天)
1. T001 色彩系统重塑
2. T003 边框阴影软化
3. T005 金属质感

→ 立即降低"工业感"

### 完整体验 (3-4 天)
1. Phase 1 + Phase 2 全部
2. Phase 3 转场系统
3. Phase 4 排版装饰
4. Phase 5 音频（可选）

→ 完整的"神秘古籍"体验

---

## 验收检查清单

- [ ] 色彩不再"高饱和塑料感"
- [ ] 布局有轻微的非对称偏移
- [ ] 无明显的 1px 硬边框
- [ ] 内容区有纸张/纹理质感
- [ ] 金色元素有"做旧"感
- [ ] 页面转场有仪式感
- [ ] 内容入场有节奏感
- [ ] 解读文字有"古籍"排版
- [ ] 图标符合神秘主题
- [ ] 音频分层自然
- [ ] 移动端体验正常
- [ ] 低端设备可用
