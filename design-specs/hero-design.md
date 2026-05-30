# We2 Hero 区域设计规格 (Design Spec)

## 1. 布局结构

### 桌面端 (≥1024px)
```
┌──────────────────────────────────────────────────┐
│              [浮动装饰: 心形/光晕/粒子]            │
│                                                    │
│              ✦ Grow Together, Love Deeper ✦        │
│           (渐变文字, 居中, 60px/5xl)               │
│                                                    │
│        The couple's app that turns everyday        │
│        moments into lasting emotional habits.      │
│           (副标题, 居中, 18px/lg)                   │
│                                                    │
│     [Start Free]    [See How It Works →]           │
│     (主CTA渐变)      (次CTA描边)                    │
│                                                    │
│        ❤️ Trusted by 10,000+ couples               │
│        (社交证明, 小字+emoji)                       │
│                                                    │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ...     │
│  │ Feature│  │Feature│  │Feature│  │Feature│        │
│  │ Card  │  │ Card  │  │ Card  │  │ Card  │        │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
└──────────────────────────────────────────────────┘
```

### 移动端 (<640px)
- 标题: 36px/4xl
- 副标题: 16px/base
- 按钮全宽堆叠
- Feature 卡片单列

## 2. 色彩方案

### 主渐变
| 用途 | 色值 | 说明 |
|------|------|------|
| Hero 标题渐变 | `from-rose-500 via-purple-500 to-indigo-500` | #F43F5E → #A855F7 → #6366F1 |
| 主 CTA 渐变 | `from-rose-500 to-purple-600` | #F43F5E → #9333EA |
| 主 CTA 阴影 | `shadow-purple-500/25` | 紫色光晕 |
| 背景（亮色） | `from-rose-50 via-pink-50 to-white` | 柔和暖色 |
| 背景（暗色） | `from-rose-950/40 via-purple-950/30 to-zinc-950` | 深紫暖调 |

### 装饰元素色彩
| 元素 | 色值 | 透明度 |
|------|------|--------|
| 浮动心形 | `#F43F5E` (rose-500) | 10%-20% |
| 光晕球1 | `#EC4899` (pink-500) | 8% |
| 光晕球2 | `#A855F7` (purple-500) | 6% |
| 光晕球3 | `#6366F1` (indigo-500) | 5% |
| 闪烁粒子 | `#F9A8D4` (pink-300) | 40%-80% |

## 3. 动画概念

### 入场动画 (Framer Motion)
| 元素 | 动画 | Duration | Delay | Easing |
|------|------|----------|-------|--------|
| 背景光晕 | `opacity: 0→1, scale: 0.8→1` | 1.2s | 0s | easeOut |
| 标题 | `opacity: 0→1, y: 40→0, scale: 0.95→1` | 0.8s | 0.1s | easeOut |
| 副标题 | `opacity: 0→1` | 0.6s | 0.35s | easeOut |
| CTA 按钮组 | `opacity: 0→1, y: 16→0` | 0.5s | 0.5s | easeOut |
| 社交证明 | `opacity: 0→1, y: 8→0` | 0.4s | 0.7s | easeOut |
| Feature 卡片 | stagger, `opacity: 0→1, y: 24→0` | 0.5s | 0.12s间隔 | easeOut |

### 持续动画 (CSS/Framer)
| 元素 | 动画 | 参数 |
|------|------|------|
| 浮动心形 | 上下浮动 | `y: ±12px, duration: 3-5s, repeat: Infinity, ease: easeInOut` |
| 光晕球 | 缓慢漂移 | `x: ±20px, y: ±15px, duration: 8-12s, repeat: Infinity, ease: easeInOut` |
| 闪烁粒子 | 透明度脉冲 | `opacity: 0.3↔0.8, duration: 2-3s, repeat: Infinity, ease: easeInOut` |

### 交互反馈
| 交互 | 效果 | 参数 |
|------|------|------|
| CTA hover | 微放大+阴影增强 | `scale: 1.03, shadow增强, duration: 0.3s` |
| CTA tap | 微缩小 | `scale: 0.97` |
| Feature 卡片 hover | 上浮+粉色光晕 | `y: -4, boxShadow: 粉紫光晕, duration: 0.3s` |

## 4. 装饰元素清单

| # | 元素 | 位置 | 大小 | 动画 |
|---|------|------|------|------|
| 1 | 渐变光晕球 (pink) | 左上 (10%, 15%) | 400×400px | 缓慢漂移 |
| 2 | 渐变光晕球 (purple) | 右下 (85%, 70%) | 350×350px | 缓慢漂移 |
| 3 | 渐变光晕球 (indigo) | 中右 (70%, 25%) | 300×300px | 缓慢漂移 |
| 4 | 浮动心形 ♡ | 左侧 (5%, 40%) | 24px | 上下浮动 |
| 5 | 浮动心形 ♡ | 右侧 (90%, 30%) | 18px | 上下浮动 (反相) |
| 6 | 浮动心形 ♡ | 中左 (15%, 75%) | 20px | 上下浮动 |
| 7 | 闪烁粒子 ✦ | 随机分布 ×6 | 4-8px | 透明度脉冲 |

## 5. 响应式策略

| 断点 | 标题 | 副标题 | 按钮 | Feature网格 | 装饰 |
|------|------|--------|------|-------------|------|
| <640px | 4xl/36px | base/16px | 全宽堆叠 | 1列 | 缩小50%, 减少2个粒子 |
| 640-1023px | 5xl/48px | lg/18px | 水平排列 | 2列 | 正常大小 |
| ≥1024px | 6xl/60px | lg/18px | 水平排列 | 3列 | 完整装饰 |

## 6. 新增元素：社交证明

在 CTA 按钮下方添加信任指标：
- 文字: "Trusted by 10,000+ couples worldwide ❤️"
- 样式: 小字 (text-sm), 柔和色 (text-zinc-400)
- 动画: 淡入 (delay 0.7s)