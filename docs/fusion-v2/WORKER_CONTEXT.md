# Togthr.life — Fusion v2 Worker Context

> **只读**上下文，给 4 个重构 worker 用
> 创建者：Mavis  ·  时间：2026-06-05
> 配套方案：`F:\Togthr_方案对比分析与融合方案.md`（v2.0 融合版）

---

## 1. 项目根 + 技术栈

- **项目根**: `F:\CloudDreamerApp\togthr`
- **Next.js 15** App Router + **React 19** + **TypeScript** + **Tailwind CSS 4** (CSS-first，无 tailwind.config.js)
- **Framer Motion 12**、**next-intl 4** (8 locales: en/zh-cn/zh-tw/ja/ko/de/fr/es)
- **Supabase** + **Drizzle ORM** + **Cloudflare Workers** (Node.js runtime)
- **Framer Motion** 用 `motion`, `AnimatePresence`, `useReducedMotion`
- **Tailwind v4** 用 `@theme inline` / `@utility` 暴露 token

---

## 2. 共享设计系统（已就绪，**不要修改**）

| 文件 | 内容 | 关键导出 |
|------|------|----------|
| `src/app/globals.css` | CSS 变量 + Tailwind v4 `@theme` 暴露 + 工具类 | `--bg-cosmic`, `--mood-sweet`, `.glass-card`, `animate-breath` 等 |
| `src/lib/design-tokens.ts` | TS 侧配色/动画/关系模式常量 | `RELATION_MODES`, `MOODS`, `RARITY_STYLES`, `PET_SERIES`, `PARTICLES`, `isNightMode()`, `getRelationModeLabel()` |
| `src/lib/utils.ts` | `cn()` 工具 | `cn(...inputs)` |
| `src/components/shared/EmotionParticles.tsx` | **5 种情感粒子 Canvas 2D 渲染器** | `<EmotionParticles kinds={['bubble','star']} intensity={0.5} interactive />` |
| `src/components/shared/PetCapsule.tsx` | **玻璃拟态宠物休眠舱** + 3D 视差 | `<PetCapsule src="..." size="lg" parallax glow sparkles status="hello" statusText="..." />` |
| `src/components/shared/RelationModeSelector.tsx` | **4 关系模式选择器**（横向滑动） | `<RelationModeSelector value={...} onChange={...} locale={...} />` |

### 关键 API

```tsx
// 1. 5 种粒子（每个页面都用）
import { EmotionParticles } from '@/components/shared/EmotionParticles'
<EmotionParticles kinds={['bubble', 'star', 'dust']} intensity={0.5} className="absolute inset-0" />

// 2. 宠物休眠舱
import { PetCapsule } from '@/components/shared/PetCapsule'
<PetCapsule src="/pets/hero-golden.png" size="xl" parallax glow status="miss" statusText={t('capsule.miss')} />

// 3. 关系模式选择器（仅首页需要，但 PetCapsule 也要接收 mode 来换 sprite）
import { RelationModeSelector } from '@/components/shared/RelationModeSelector'
import { RELATION_MODES, type RelationMode } from '@/lib/design-tokens'
<RelationModeSelector value={mode} onChange={setMode} locale={locale} />

// 4. 情绪状态（5 种）
import { MOODS, type Mood, MOOD_HEX } from '@/lib/design-tokens'
// mood='sweet' | 'fight' | 'calm' | 'sleepy' | 'think'

// 5. 宠物稀有度 + 6 大系列
import { RARITY_STYLES, PET_SERIES, type Rarity, type PetSeries } from '@/lib/design-tokens'

// 6. 深夜模式判断
import { isNightMode } from '@/lib/design-tokens'
const night = isNightMode()
```

### 已暴露的 Tailwind v4 工具类

- `glass-card`、`glass-card-emph` — 玻璃拟态
- `text-gradient-sweet`、`text-gradient-golden` — 渐变文字
- `animate-breath`、`animate-arc-drift`、`animate-cursor-blink`、`animate-float-y`、`animate-pulse-glow`、`animate-shimmer`
- 颜色：`bg-cosmic`, `bg-mood-sweet`, `text-mood-fight` 等

### 已有的 Tailwind 工具类（现有项目约定）

- 文本色：`text-zinc-100`, `text-zinc-300`, `text-zinc-400`, `text-zinc-500`
- 渐变：`bg-gradient-to-b/r/l`, `from-{color}-{shade}`, `via-{color}-{shade}`, `to-{color}-{shade}`
- 模糊：`blur-2xl`, `blur-3xl`
- 圆角：`rounded-full`, `rounded-2xl`, `rounded-3xl`, `rounded-[28px]`
- 间距：`px-4`, `py-20`, `gap-4`, `mx-auto max-w-6xl`
- 现有项目代码遵循这一约定（见 `HomeClient.tsx`）

---

## 3. 已有 IP 资产（`public/pets/`）

**22+ 张 sprite/png，全部可用**：

| 类别 | 文件 |
|------|------|
| 基础角色 | `robot-base.png`, `character-sheet.png`, `golden.png`, `hero-golden.png` |
| 职业系列 | `programmer.png`, `doctor.png`, `astronaut.png`, `chef.png`, `firefighter.png`, `police.png`, `diver.png`, `driver.png` |
| 节日系列 | `holiday-christmas.png`, `holiday-valentine.png`, `holiday-halloween.png` |
| 表情系列 | `expression-happy.png`, `expression-angry.png`, `expression-sleeping.png`, `expression-charging.png` |
| 贴纸/互动 | `sticker-loveyou.png`, `sticker-crying.png`, `sticker-fighting.png`, `sticker-shy.png`, `sticker-sleepy.png`, `sticker-surprised.png`, `sticker-thumbsup.png`, `sticker-wink.png` |
| 场景 | `scene-moon.png`, `scene-rainy.png`, `scene-autumn.png`, `scene-birthday.png`, `scene-battery.png`, `scene-megaphone.png`, `scene-progress.png` |
| 动画帧 | `anim-idle-1/2.png`, `anim-thinking-1/2.png`, `anim-working-1/2.png`, `anim-success-1/2.png`, `anim-breath.png`, `anim-blink.png`, `anim-antenna.png` |

**使用示例**：
```tsx
// eslint-disable-next-line @next/next/no-img-element
<img src="/pets/hero-golden.png" alt="Togthr golden companion" className="..." />
```

---

## 4. 严格文件边界（避免冲突）

| 路径 | 谁可以改 |
|------|---------|
| `src/app/[locale]/page.tsx` + `HomeClient.tsx` | **仅 worker-home** |
| `src/app/[locale]/pricing/**` | **仅 worker-pricing** |
| `src/app/[locale]/chat/**` | **仅 worker-chat** |
| `src/app/[locale]/pet/**` | **仅 worker-pet** |
| `src/app/[locale]/layout.tsx` | **禁止改**（共享 nav/footer） |
| `src/app/globals.css` | **禁止改**（已配齐 token） |
| `src/lib/design-tokens.ts` / `src/lib/utils.ts` | **禁止改** |
| `src/components/shared/**` | **禁止改**（共享组件） |
| `src/i18n/**` | **禁止改** |
| `messages/en.json` | **4 个 worker 都可以加 key**（注意：JSON 并发写会冲突，请只加必要的 key） |
| `messages/{zh-cn,zh-tw,ja,ko,de,fr,es}.json` | **禁止手动改**。改完 en.json 后跑 `npm run fix-messages` 自动同步 |

---

## 5. i18n 同步流程

1. 在 `messages/en.json` 加新 key（这是 source of truth）
2. 跑 `npm run fix-messages` — 4 闸门会**自动**把缺失的 key 填充到 7 个其他语言
3. 跑 `npm run build` 验证（build 前会自动跑 `sync-messages`）

**建议**: worker 在 en.json 加 key 时用 `{{var}}` placeholder 形式，方便其他语言用同结构。

**减少冲突技巧**:
- 不同的 worker 在 en.json 不同 namespace 下加 key：
  - `home` worker → `home.*`
  - `pricing` worker → `pricing.*`
  - `chat` worker → `chat.*`
  - `pet` worker → `pet.*`
- 各 worker 在自己 namespace 下加 key，互不干扰

---

## 6. 关键技术约束

### 6.1 Server/Client 组件边界

- `page.tsx` 顶层 → **Server Component**（SEO metadata、getTranslations、获取数据）
- 交互部分（粒子、宠物休眠舱、视差、状态切换） → **Client Component**（`'use client'`）
- 拆分到子文件：`page.tsx` 导入 `XxxClient.tsx`

### 6.2 性能

- **粒子系统必须**用 `requestAnimationFrame`（已实现，**不要**用 setInterval）
- 重组件用 `next/dynamic` 懒加载（粒子/Three.js）
- `Suspense` 边界 + `loading.tsx` 提供宠物等待态骨架屏
- `prefers-reduced-motion` 必须尊重（EmotionParticles 内部已处理）

### 6.3 颜色硬约束

- **不要用纯黑** `#000` — 用 `var(--bg-cosmic)` = `#0B0B1A`
- **不要用纯白** `#fff` — 用 `var(--text-primary)` = `#F4F4F5`
- 玻璃拟态边框统一 `rgba(255,255,255,0.10)` (CSS var `--glass-border`)
- 模糊统一 `blur(16px)` (CSS var `--glass-blur`)

### 6.4 i18n key 命名约定

```json
{
  "home": {
    "hero": { "title": "...", "subtitle": "..." },
    "companions": { "title": "...", "subtitle": "..." }
  },
  "pricing": {
    "title": "...",
    "tier": { "free": "...", "plus": "...", "eternal": "..." }
  },
  "chat": {
    "mood": { "sweet": "...", "fight": "...", "calm": "...", "sleepy": "...", "think": "..." },
    "capsule": { "miss": "...", "tired": "..." }
  },
  "pet": {
    "mood": { "sweet": "甜蜜", "fight": "吵架", "think": "思考", "sleep": "睡觉" },
    "rarity": { "common": "...", "epic": "...", "legendary": "..." },
    "series": { "basic": "...", "career": "...", "festival": "...", "emotion": "...", "fantasy": "...", "legendary": "..." }
  }
}
```

### 6.5 现有 import 习惯

```ts
import { useTranslations } from 'next-intl'           // client
import { getTranslations } from 'next-intl/server'   // server
import { routing, type Locale } from '@/i18n/routing'
import { Link, useRouter } from '@/i18n/routing'      // i18n-aware Link
import { ts, ta } from '@/lib/safe-t'                 // safe t() wrapper
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Calendar, MessageCircle, Camera, Sparkles, Star, ShoppingBag, Heart, Lock } from 'lucide-react'
```

---

## 7. 验收标准（4 个 worker 都要过）

| 维度 | 验收 |
|------|------|
| **类型** | `npm run build` 通过（0 错误） |
| **i18n** | `npm run sync-messages` 通过（8 语言对齐） |
| **视觉** | 深空紫黑 `#0B0B1A`、玻璃拟态、毛玻璃 blur(16px) |
| **粒子** | 至少 1 个页面包含 `EmotionParticles` 渲染（5 种粒子之一） |
| **宠物** | 至少 1 个 `PetCapsule` 实例（首页/定价/聊天/宠物按方案分布） |
| **响应式** | 移动端 360px 宽度可用（不溢出） |
| **可访问性** | 关键交互元素有 `aria-*`、键盘可达、prefers-reduced-motion 兼容 |
| **i18n** | 所有用户可见文案用 `t()` / `useTranslations()`，**没有**硬编码中文/英文 |
| **不污染** | **没有**改 `globals.css` / `layout.tsx` / `src/lib/design-tokens.ts` / `src/components/shared/**` / 其他 worker 的路由文件 |

---

## 8. 4 个 Worker 各自任务（详情见 `F:\Togthr_方案对比分析与融合方案.md`）

### Worker 1: Home（首页）
- **文件**: `src/app/[locale]/page.tsx` + `HomeClient.tsx`
- **目标**: 替换现有 cinematic redesign，**用休眠舱 + 关系模式选择器**做"Always Here"主视觉
- **核心组件**: `PetCapsule` (xl) + `RelationModeSelector` + `EmotionParticles` (bubble/star/dust)
- **关键体验**:
  - 单行 "Always Here" 打字机（光标闪烁）
  - 关系模式选择器（4 种模式 → 切换 PetCapsule 内的 sprite + 弧光颜色）
  - 首次访问 vs 回访：localStorage 检测
  - 深夜模式：isNightMode() → 切换弧光强度
  - 3D 视差：已内置在 PetCapsule
  - 鼠标交互：点击触发粒子（已内置在 EmotionParticles）

### Worker 2: Pricing（定价页）
- **文件**: `src/app/[locale]/pricing/**`
- **目标**: 全屏 100vh 沉浸剧场 + 视觉落差（免费灰暗 / 付费发光 / 传说金边）+ 宠物选择矩阵
- **核心组件**: 3 列定价卡 + 宠物矩阵网格 + 粒子爆发特效
- **关键体验**:
  - 3 卡片：免费（灰白） / Plus（粉紫渐变） / Eternal（金传说 + 呼吸动画）
  - 卡片底部宠物预览矩阵：3 灰 → 10+ 彩 → 全亮金
  - 6 大系列分类（基础/职业/节日/表情/奇幻/限定）
  - 盲盒概率 1/72 展示
  - 倒计时（节日限定稀缺感）
  - 保留现有 pricing engine 集成（`getPricing` / `getGateway` / `getCountryFromRequest`）

### Worker 3: Chat（聊天页）
- **文件**: `src/app/[locale]/chat/**`
- **目标**: 情绪响应背景 + 宠物在场感 + 满屏星云渐变
- **核心组件**: `EmotionBackground`（mood Prop 切换 5 种渐变） + `PetCapsule` (sm 角落) + `CapsuleInput`（发光胶囊）
- **关键体验**:
  - 5 种 mood（sweet/fight/calm/sleepy/think）切换背景弧光 + 切换快捷回复胶囊
  - 消息气泡弹性入场（scale spring）
  - 宠物在场感（角落 48x48 sprite，检测消息情绪变表情）
  - 深夜模式自动切换
  - 纪念日特效（>100 消息触发烟花）

### Worker 4: Pet（宠物页）
- **文件**: `src/app/[locale]/pet/**`
- **目标**: 全屏召唤阵 + 6 大系列分类 + 稀有度光效 + 抚摸交互
- **核心组件**: `PetDetailPage` + `PetSelectionModal` (召唤阵) + `EmotionFeedback` + `PetCard`
- **关键体验**:
  - 中央 300x300 宠物主展示（PetCapsule xl）
  - 4 心情按钮（甜蜜/吵架/思考/睡觉）→ 触发 `EmotionParticles` shard/star/dust 爆发
  - "更换外观" 按钮 → 全屏召唤阵（黑色半透明遮罩 + 4 列 Grid）
  - 召唤阵 6 Tab 分类
  - 稀有度光效：白光/紫光/金光 + 呼吸动画
  - 未解锁宠物：灰度 + 🔒 + hover 显示获取方式
  - 抚摸交互：鼠标移动 → 眯眼 + 蹭手

---

## 9. 工具参考

```bash
# 验证类型 + i18n
cd F:\CloudDreamerApp\togthr
npm run build            # 含 sync-messages 闸门
npm run sync-messages    # 检查 8 语言对齐
npm run fix-messages     # 自动补缺失 key
npm run lint             # eslint
```

---

## 10. 提交要求

每个 worker 完成后**必须**写 `deliverable.md` 到自己的工作目录根，列出：
- 改了哪些文件（相对项目根）
- 新建了哪些文件
- 如何验证（`npm run build` 输出 + 视觉描述）
- 已知限制 / TODO
- 验收清单自检（每项 ✅ / ❌）

