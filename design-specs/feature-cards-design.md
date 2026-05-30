# We2 Feature Cards 区域设计规格 (Design Spec)

## 1. 布局结构

### 整体区域定位
Feature Cards 位于 Hero 区域（社交证明）下方，作为首页第二屏的核心内容。
区域顶部有标题 + 副标题，下方是 6 张功能卡片。

### 桌面端 (≥1024px) — 3×2 网格 + Bento 变体
```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│            ✦ Built for Real Couples ✦                         │
│       (渐变文字, 居中, 36px/3xl, 同 Hero 标题渐变)             │
│                                                                │
│    Every feature designed to bring you closer,                │
│    no matter the distance.                                     │
│       (副标题, 居中, 16px/base, text-zinc-500)                 │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  🩷 Daily     │  │  💜 Time     │  │  💙 Virtual  │        │
│  │  Check-in    │  │  Capsules    │  │  Pet         │        │
│  │              │  │              │  │              │        │
│  │  desc...     │  │  desc...     │  │  desc...     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  🧡 Private  │  │  💚 Shared   │  │  💛 Dream    │        │
│  │  Community   │  │  Journal     │  │  Wall        │        │
│  │              │  │              │  │              │        │
│  │  desc...     │  │  desc...     │  │  desc...     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### 平板端 (640-1023px) — 2×3 网格
```
┌──────────────────────────────┐
│     Built for Real Couples   │
│                                │
│  ┌──────────┐ ┌──────────┐   │
│  │ Check-in │ │ Capsules │   │
│  └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐   │
│  │ V.Pet    │ │ Community│   │
│  └──────────┘ └──────────┘   │
│  ┌──────────┐ ┌──────────┐   │
│  │ Journal  │ │ DreamWall│   │
│  └──────────┘ └──────────┘   │
└──────────────────────────────┘
```

### 移动端 (<640px) — 单列堆叠 + 横向滑动（双模式）
```
默认：单列堆叠
┌──────────────┐
│  Daily Check │
│  -in         │
└──────────────┘
┌──────────────┐
│  Time Caps.  │
└──────────────┘
...

可选：横向滑动（snap scroll）
← [Card1] [Card2] [Card3] →
    snap    snap    snap
```

## 2. 卡片结构（单张）

```
┌─────────────────────────────────┐
│                                   │
│   ┌─────┐                        │
│   │ ICON│  ← 渐变背景圆角方块     │
│   │ 24px│     48×48px            │
│   └─────┘                        │
│                                   │
│   Feature Title                  │
│   (font-semibold, 16px/base)     │
│                                   │
│   Feature description text that  │
│   wraps to two lines max...      │
│   (text-sm, 14px, text-zinc-500) │
│                                   │
│   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│   虚线分隔（可选）                 │
│                                   │
│   Learn more →                   │
│   (text-xs, 渐变色, hover箭头右移)│
│                                   │
└─────────────────────────────────┘
```

### 卡片尺寸
| 属性 | 桌面端 | 平板端 | 移动端 |
|------|--------|--------|--------|
| 宽度 | 自适应网格 | 自适应网格 | 100% / 280px(slider) |
| 内边距 | p-6 (24px) | p-5 (20px) | p-5 (20px) |
| 圆角 | rounded-2xl (16px) | rounded-2xl | rounded-2xl |
| 间距 | gap-6 | gap-5 | gap-4 |

## 3. 色彩方案

### 区域标题
| 元素 | 色值 | 说明 |
|------|------|------|
| 标题渐变 | `from-rose-500 via-purple-500 to-indigo-500` | 同 Hero 标题 |
| 副标题 | `text-zinc-500` / `dark:text-zinc-400` | 柔和灰 |

### 卡片基础样式
| 属性 | 亮色模式 | 暗色模式 |
|------|----------|----------|
| 背景 | `bg-white/70` (70%白) | `bg-purple-950/30` |
| 边框 | `border-rose-100/60` | `border-purple-800/40` |
| 毛玻璃 | `backdrop-blur-md` (12px) | `backdrop-blur-md` |
| 阴影 | `shadow-sm` | `shadow-none` |

### 每张卡片的独特渐变标识
每张卡片左上角的图标容器使用不同的渐变背景色，形成视觉区分但整体和谐：

| # | 功能 | 图标容器渐变 | 色值 | 图标色 |
|---|------|-------------|------|--------|
| 1 | Daily Check-in | `from-rose-400 to-pink-500` | #FB7185→#EC4899 | `text-white` |
| 2 | Time Capsules | `from-violet-400 to-purple-500` | #A78BFA→#A855F7 | `text-white` |
| 3 | Virtual Pet | `from-blue-400 to-indigo-500` | #60A5FA→#6366F1 | `text-white` |
| 4 | Private Community | `from-amber-400 to-orange-500` | #FBBF24→#F97316 | `text-white` |
| 5 | Shared Journal | `from-emerald-400 to-teal-500` | #34D399→#14B8A6 | `text-white` |
| 6 | Dream Wall | `from-yellow-400 to-amber-500` | #FACC15→#F59E0B | `text-white` |

### 卡片 hover 光晕色（与图标渐变呼应）
| # | 功能 | Hover 光晕色 | 透明度 |
|---|------|-------------|--------|
| 1 | Daily Check-in | `rgba(251,113,133,0.15)` | 15% |
| 2 | Time Capsules | `rgba(167,139,250,0.15)` | 15% |
| 3 | Virtual Pet | `rgba(96,165,250,0.15)` | 15% |
| 4 | Private Community | `rgba(251,191,36,0.12)` | 12% |
| 5 | Shared Journal | `rgba(52,211,153,0.12)` | 12% |
| 6 | Dream Wall | `rgba(250,204,21,0.12)` | 12% |

## 4. 图标清单 (Lucide React)

| # | 功能 | Lucide 图标名 | 图标含义 | 备选图标 |
|---|------|--------------|----------|----------|
| 1 | Daily Check-in | `HeartHandshake` | 心手相握=每日关怀 | `CalendarHeart` |
| 2 | Time Capsules | `Clock` | 时间=时光胶囊 | `Hourglass` |
| 3 | Virtual Pet | `PawPrint` | 爪印=虚拟宠物 | `Cat` / `Dog` |
| 4 | Private Community | `Users` | 用户群=社区 | `ShieldCheck` |
| 5 | Shared Journal | `BookOpen` | 打开的书=共享日记 | `PenLine` |
| 6 | Dream Wall | `Sparkles` | 闪光=梦想墙 | `Star` / `Pin` |

### 图标容器规格
```
┌──────────────────────┐
│  尺寸: 48×48px       │
│  圆角: rounded-xl (12px) │
│  内边距: 无 (图标居中) │
│  图标大小: 24px (w-6 h-6)│
│  阴影: shadow-sm     │
└──────────────────────┘
```

## 5. 动画参数

### 入场动画 (Framer Motion — whileInView)
| 元素 | 属性 | Duration | Delay | Easing |
|------|------|----------|-------|--------|
| 区域标题 | `opacity: 0→1, y: 30→0` | 0.6s | 0s | easeOut |
| 区域副标题 | `opacity: 0→1, y: 20→0` | 0.5s | 0.15s | easeOut |
| 卡片 #1 | `opacity: 0→1, y: 24→0, scale: 0.96→1` | 0.5s | 0.3s | easeOut |
| 卡片 #2 | 同上 | 0.5s | 0.4s | easeOut |
| 卡片 #3 | 同上 | 0.5s | 0.5s | easeOut |
| 卡片 #4 | 同上 | 0.5s | 0.6s | easeOut |
| 卡片 #5 | 同上 | 0.5s | 0.7s | easeOut |
| 卡片 #6 | 同上 | 0.5s | 0.8s | easeOut |

> Stagger 间隔: 0.1s（比 Hero 的 0.12s 略快，因为卡片数量多）
> Viewport trigger: `once: true, amount: 0.15`

### 交互动画
| 交互 | 效果 | 参数 |
|------|------|------|
| 卡片 hover | 上浮 + 光晕阴影 + 图标微旋转 | `y: -6, rotate(图标): 3deg, boxShadow: 对应色光晕, duration: 0.3s, ease: easeOut` |
| 卡片 hover 离开 | 回弹 | `y: 0, rotate: 0, boxShadow: 原始, duration: 0.25s, ease: easeIn` |
| 卡片 tap | 微缩小 | `scale: 0.97, duration: 0.1s` |
| "Learn more" hover | 箭头右移 | `x: 4px, duration: 0.2s` |
| 图标容器 hover | 微放大 + 阴影增强 | `scale: 1.08, shadow: shadow-md, duration: 0.3s` |

### 持续微动画（可选，低性能设备跳过）
| 元素 | 动画 | 参数 |
|------|------|------|
| 图标容器 | 微呼吸效果 | `scale: [1, 1.04, 1], duration: 3s, repeat: Infinity, ease: easeInOut, delay: 各卡片不同` |

## 6. 响应式策略

| 断点 | 网格 | 卡片宽度 | 区域标题 | 图标容器 | 间距 |
|------|------|----------|----------|----------|------|
| <640px | 1列 (堆叠) | 100% | 2xl/24px | 40×40px, icon 20px | gap-4 |
| 640-1023px | 2列 | ~50% | 3xl/30px | 44×44px, icon 22px | gap-5 |
| ≥1024px | 3列 | ~33% | 3xl/30px | 48×48px, icon 24px | gap-6 |

### 移动端横向滑动模式（可选增强）
- 容器: `overflow-x-auto snap-x snap-mandatory`
- 卡片: `snap-center shrink-0 w-[280px]`
- 底部指示器: 6 个小圆点，当前激活项为渐变色
- 滚动条: 隐藏 (`scrollbar-hide`)

## 7. 暗色模式适配

| 元素 | 亮色 | 暗色 |
|------|------|------|
| 卡片背景 | `bg-white/70 backdrop-blur-md` | `bg-purple-950/30 backdrop-blur-md` |
| 卡片边框 | `border-rose-100/60` | `border-purple-800/40` |
| 卡片标题 | `text-zinc-900` | `text-zinc-100` |
| 卡片描述 | `text-zinc-500` | `text-zinc-400` |
| "Learn more" | `text-rose-600` | `text-purple-300` |
| 图标容器 | 渐变不变 | 渐变不变（但降低亮度 10%） |
| Hover 阴影 | 粉紫光晕 | 紫蓝光晕（更暗的变体） |

## 8. 区域分隔与背景

### 与 Hero 的过渡
- Feature Cards 区域与 Hero 之间使用 **渐变过渡**，不使用硬分隔线
- 背景: 延续 Hero 的 `from-rose-50 via-pink-50 to-white`，但 Feature 区域更偏白
- 可选: 在 Feature 区域顶部添加一条极淡的渐变分割线（1px, from-transparent via-rose-200 to-transparent）

### 区域内装饰（极简）
- 左下角一个模糊光晕球 (purple, 300×300px, opacity 5%)
- 右上角一个模糊光晕球 (rose, 250×250px, opacity 4%)
- 不再添加额外粒子（避免与 Hero 重复，保持视觉层次）

## 9. 无障碍 (Accessibility)

| 项目 | 规格 |
|------|------|
| 卡片 | `role="article"` 或语义化 `<article>` |
| 图标 | `aria-hidden="true"` (装饰性) |
| "Learn more" | `aria-label="Learn more about {feature name}"` |
| 键盘导航 | 卡片可 focus (`tabIndex={0}`), focus 时显示 `ring-2 ring-purple-400/50` |
| 动画 | 尊重 `prefers-reduced-motion`: 入场动画改为即时显示，hover 仅变色不位移 |
| 对比度 | 描述文字 ≥ 4.5:1 对比度 |

## 10. 设计原则总结

1. **情感化**: 每张卡片的渐变色暗示功能情感（粉色=亲密、紫色=回忆、蓝色=陪伴、橙色=温暖、绿色=成长、金色=梦想）
2. **层次感**: 图标容器渐变 → 卡片白底 → 区域淡色背景，三层递进
3. **一致性**: 圆角、毛玻璃、渐变方向与 Hero 完全统一
4. **克制**: 不过度装饰，Feature 区域比 Hero 更"安静"，让内容说话
5. **微交互**: hover 时的上浮和光晕给用户"活的"感觉，但不喧宾夺主