# We2 Features 交互系统设计规格 (Interaction System Design Spec)

## 目录
1. [全局交互反馈系统](#全局交互反馈系统)
2. [功能详情页交互体验区设计](#功能详情页交互体验区设计)
3. [统一动画参数表](#统一动画参数表)
4. [颜色映射表](#颜色映射表)
5. [响应式断点规则](#响应式断点规则)

---

## 全局交互反馈系统

### 1. 页面加载动画
所有 6 个功能详情页统一使用以下入场动画：

```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }}
>
  {/* 内容区 */}
</motion.div>
```

| 元素层级 | 动画 | Duration | Delay | Easing |
|---------|------|----------|-------|--------|
| Hero 区域 | `opacity: 0→1, y: 20→0` | 0.6s | 0s | easeOut |
| 交互体验区容器 | `opacity: 0→1, y: 30→0` | 0.5s | 0.3s | easeOut |
| 交互组件（卡片/表单） | `opacity: 0→1, y: 20→0` | 0.4s | 0.1s 间隔 | easeOut |

### 2. 按钮触感反馈
所有可点击元素统一添加：

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  transition={{ duration: 0.15 }}
>
  {/* 按钮内容 */}
</motion.button>
```

| 交互类型 | 效果 | Duration | Easing |
|---------|------|----------|--------|
| Hover | `scale: 1.02` | 0.15s | easeOut |
| Tap | `scale: 0.97` | 0.1s | easeOut |
| Focus | `shadow-[0_0_0_3px_rgba(themeColor,0.15)]` | 0.2s | easeOut |

### 3. 输入框焦点效果
所有输入框统一使用：

```tsx
<motion.input
  whileFocus={{
    borderColor: 'rgba(themeColor, 0.6)',
    boxShadow: '0 0 0 3px rgba(themeColor, 0.15)',
  }}
  transition={{ duration: 0.2 }}
  className="border-white/40 focus:border-pink-400/60"
/>
```

| 状态 | 边框颜色 | 外发光 | Duration |
|------|---------|--------|----------|
| 默认 | `border-white/40` | 无 | - |
| 聚焦 | `border-[themeColor]/60` | `shadow-[0_0_0_3px_rgba(themeColor,0.15)]` | 0.2s |

### 4. 空状态设计
任何列表为空时，显示：

```tsx
<div className="flex flex-col items-center justify-center py-16">
  <div className="relative mb-6">
    {/* Lucide 图标组合插画 */}
    <Heart className="w-24 h-24 text-zinc-200 dark:text-zinc-700" />
    <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-pink-400" />
  </div>
  <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-2">
    {emptyStateTitle}
  </p>
  <p className="text-zinc-400 dark:text-zinc-500 text-sm">
    {emptyStateSubtitle}
  </p>
</div>
```

| 元素 | 样式 | 说明 |
|------|------|------|
| 插画图标 | `w-24 h-24 text-zinc-200 dark:text-zinc-700` | Lucide 图标组合 |
| 装饰图标 | `absolute -top-2 -right-2 w-8 h-8 text-[themeColor]` | Sparkles/Star |
| 标题 | `text-zinc-500 dark:text-zinc-400 text-lg` | 情感化文案 |
| 副标题 | `text-zinc-400 dark:text-zinc-500 text-sm` | 引导操作 |

### 5. Toast 通知系统
操作成功/失败时，顶部滑入通知：

```tsx
<motion.div
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: -100, opacity: 0 }}
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
  className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
>
  <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl px-6 py-4 shadow-lg">
    <div className="flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-emerald-500" />
      <span className="text-zinc-800 dark:text-zinc-200">{message}</span>
    </div>
  </div>
</motion.div>
```

| 状态 | 图标 | 颜色 | Duration |
|------|------|------|----------|
| 成功 | `CheckCircle` | `text-emerald-500` | 3s 自动消失 |
| 错误 | `XCircle` | `text-rose-500` | 5s 自动消失 |
| 警告 | `AlertCircle` | `text-amber-500` | 4s 自动消失 |

---

## 功能详情页交互体验区设计

### A. Daily Check-in（每日打卡）

#### 组件结构
```
DailyCheckInDemo
├── QuestionCard
│   ├── DayBadge (徽章: "Day 1" + 日期)
│   ├── QuestionText (大字号情感化问题)
│   ├── AnswerTextarea (多行输入框)
│   ├── SaveButton (渐变粉紫按钮)
│   └── SavedAnimation (对勾 + 粒子爆发)
└── PartnerAnswerPlaceholder (虚线边框占位区)
```

#### 样式规范
```tsx
// DayBadge
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 dark:bg-pink-900/40">
  <span className="text-pink-600 dark:text-pink-400 font-semibold text-sm">Day 1</span>
  <span className="text-pink-400 dark:text-pink-500 text-xs">May 30, 2026</span>
</div>

// QuestionText
<h3 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 leading-relaxed">
  What made you smile today?
</h3>

// AnswerTextarea
<textarea
  className="w-full h-32 px-4 py-3 rounded-2xl bg-white/40 backdrop-blur-xl border-2 border-white/40 focus:border-pink-400/60 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)] transition-all duration-200 resize-none"
  placeholder="Share your moment..."
/>

// SaveButton
<motion.button
  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(244,63,94,0.4)' }}
  whileTap={{ scale: 0.97 }}
  className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold shadow-lg shadow-purple-500/25"
>
  Save Answer
</motion.button>

// PartnerAnswerPlaceholder
<div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-2xl p-8 text-center">
  <Lock className="w-8 h-8 mx-auto mb-3 text-zinc-400" />
  <p className="text-zinc-500 dark:text-zinc-400">Invite your partner to see their answers</p>
</div>
```

#### 交互动画
| 交互 | 动画 | Duration | Easing |
|------|------|----------|--------|
| 保存成功 | 输入框收起 `height: 128px→0` | 0.3s | easeInOut |
| 保存成功 | 对勾图标 `scale: 0→1.2→1` | 0.4s | spring |
| 保存成功 | 粒子爆发 `opacity: 1→0, scale: 1→2` | 0.6s | easeOut |

---

### B. Time Capsules（时光胶囊）

#### 组件结构
```
TimeCapsulesDemo
├── CreateCapsuleForm
│   ├── TitleInput (单行 + 字符计数)
│   ├── ContentTextarea (多行 + 情感化 placeholder)
│   ├── DatePicker (自定义玻璃拟态面板)
│   ├── TypeSelector (文字/语音/照片标签)
│   └── LockButton (锁图标 + 状态切换)
└── CapsuleListPreview
    └── CapsuleCard (横向滚动)
        ├── Title (模糊处理)
        ├── Countdown (大数字倒计时)
        └── LockOverlay (未解锁遮罩)
```

#### 样式规范
```tsx
// TitleInput
<div className="relative">
  <input
    className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-xl border-2 border-white/40 focus:border-violet-400/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] transition-all duration-200"
    placeholder="Capsule title..."
  />
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
    0/50
  </span>
</div>

// ContentTextarea
<textarea
  className="w-full h-40 px-4 py-3 rounded-xl bg-white/40 backdrop-blur-xl border-2 border-white/40 focus:border-violet-400/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)] transition-all duration-200 resize-none"
  placeholder="Write to our future selves..."
/>

// DatePicker (自定义)
<div className="bg-white/40 backdrop-blur-xl border-2 border-white/60 rounded-2xl p-4">
  <div className="grid grid-cols-7 gap-2">
    {/* 日期网格 */}
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25"
    >
      15
    </motion.button>
  </div>
</div>

// TypeSelector
<div className="flex gap-2">
  {['text', 'voice', 'photo'].map((type) => (
    <motion.button
      key={type}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 py-2 rounded-xl font-medium transition-all ${
        selectedType === type
          ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
          : 'bg-white/40 border-2 border-white/60 text-zinc-600 dark:text-zinc-300'
      }`}
    >
      {type}
    </motion.button>
  ))}
</div>

// LockButton
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25"
>
  <Lock className="w-5 h-5" />
  Lock Capsule
</motion.button>

// CapsuleCard (横向滚动)
<div className="flex gap-4 overflow-x-auto pb-4 snap-x">
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="min-w-[280px] p-6 rounded-2xl bg-white/40 backdrop-blur-xl border-2 border-violet-400/30 snap-center"
  >
    <h4 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 blur-sm">
      Our First Anniversary
    </h4>
    <div className="mt-4 text-3xl font-bold text-violet-600 dark:text-violet-400">
      365
    </div>
    <p className="text-sm text-zinc-500 dark:text-zinc-400">days to unlock</p>
  </motion.div>
</div>
```

#### 交互动画
| 交互 | 动画 | Duration | Easing |
|------|------|----------|--------|
| 锁定胶囊 | 按钮 `scale: 1→0.95→1` + 抖动 `x: [0, -2, 2, -2, 0]` | 0.4s | spring |
| 日期选择 | 选中日期 `scale: 1→1.2→1` + 光晕 `shadow: 0→20px` | 0.3s | spring |
| 胶囊卡片 Hover | `scale: 1.02` + 边框发光 | 0.2s | easeOut |

---

### C. Virtual Pet（虚拟宠物）

#### 组件结构
```
VirtualPetDemo
├── PetAvatar (中央圆形头像)
│   ├── PetImage (占位图)
│   └── BreathingAnimation (呼吸动画)
├── StatusRings (状态环环绕)
│   ├── HungerRing (饥饿度 - 粉色)
│   ├── MoodRing (心情值 - 紫色)
│   └── IntimacyRing (亲密度 - 金色)
└── ActionButtons (操作按钮组)
    ├── FeedButton (奶瓶图标)
    ├── PlayButton (球图标)
    └── CuddleButton (爱心图标)
```

#### 样式规范
```tsx
// PetAvatar + BreathingAnimation
<motion.div
  animate={{
    scale: [1, 1.05, 1],
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
  className="relative w-48 h-48 mx-auto mb-8"
>
  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-2xl shadow-blue-500/30" />
  <div className="absolute inset-2 rounded-full bg-white/40 backdrop-blur-xl flex items-center justify-center">
    <PawPrint className="w-24 h-24 text-blue-600 dark:text-blue-400" />
  </div>
</motion.div>

// StatusRings (SVG 环形进度条)
<div className="relative w-64 h-64 mx-auto">
  {/* 饥饿度环 */}
  <svg className="absolute inset-0 w-full h-full -rotate-90">
    <circle
      cx="128"
      cy="128"
      r="120"
      fill="none"
      stroke="rgba(244,63,94,0.1)"
      strokeWidth="8"
    />
    <motion.circle
      cx="128"
      cy="128"
      r="120"
      fill="none"
      stroke="url(#hungerGradient)"
      strokeWidth="8"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 0.75 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    />
  </svg>
  {/* 心情值环 */}
  <svg className="absolute inset-0 w-full h-full -rotate-90">
    <motion.circle
      cx="128"
      cy="128"
      r="100"
      fill="none"
      stroke="url(#moodGradient)"
      strokeWidth="8"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 0.9 }}
      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
    />
  </svg>
  {/* 亲密度环 */}
  <svg className="absolute inset-0 w-full h-full -rotate-90">
    <motion.circle
      cx="128"
      cy="128"
      r="80"
      fill="none"
      stroke="url(#intimacyGradient)"
      strokeWidth="8"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 0.6 }}
      transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
    />
  </svg>
</div>

// ActionButtons
<div className="flex justify-center gap-4">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleFeed}
    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-500/25 flex items-center justify-center"
  >
    <BabyBottle className="w-8 h-8 text-white" />
  </motion.button>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handlePlay}
    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 shadow-lg shadow-purple-500/25 flex items-center justify-center"
  >
    <Ball className="w-8 h-8 text-white" />
  </motion.button>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleCuddle}
    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25 flex items-center justify-center"
  >
    <Heart className="w-8 h-8 text-white" />
  </motion.button>
</div>
```

#### 交互动画
| 交互 | 动画 | Duration | Easing |
|------|------|----------|--------|
| 呼吸动画 | `scale: [1, 1.05, 1]` 循环 | 3s | easeInOut |
| Feed 点击 | 宠物头像 `y: 0→-20→0` 弹跳 | 0.4s | spring |
| Feed 点击 | 饥饿度环 `pathLength: 0.75→1` | 0.5s | easeOut |
| Feed 点击 | 粒子掉落 `y: 0→100, opacity: 1→0` | 0.6s | easeIn |
| Play 点击 | 宠物头像 `rotate: [-5, 5, -5, 0]` 晃动 | 0.5s | spring |
| Play 点击 | 心情值环 `stroke: 发光` | 0.3s | easeOut |
| Cuddle 点击 | 爱心粒子 `x: 0→±50, y: 0→-80, opacity: 1→0` | 0.8s | easeOut |

---

### D. Private Community（私密社区）

#### 组件结构
```
PrivateCommunityDemo
└── PostStream (帖子流)
    └── PostCard (帖子卡片)
        ├── AnonymousAvatar (随机渐变头像 + 首字母)
        ├── PostContent (帖子内容)
        ├── TopicTags (话题标签)
        └── LikeButton (点赞按钮)
            ├── HeartIcon (心形图标)
            └── LikeCount (点赞数)
```

#### 样式规范
```tsx
// PostCard
<motion.div
  whileHover={{
    borderColor: 'rgba(245,158,11,0.4)',
    boxShadow: '0 0 20px rgba(245,158,11,0.1)',
  }}
  className="p-6 rounded-2xl bg-white/40 backdrop-blur-xl border-2 border-white/60 transition-all duration-300"
>
  {/* AnonymousAvatar */}
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
      <span className="text-white font-semibold">A</span>
    </div>
    <span className="text-sm text-zinc-500 dark:text-zinc-400">Anonymous</span>
  </div>

  {/* PostContent */}
  <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed mb-4">
    Today my partner surprised me with breakfast in bed. It's the little things that matter most 💕
  </p>

  {/* TopicTags */}
  <div className="flex gap-2 mb-4">
    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium">
      #gratitude
    </span>
    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-medium">
      #surprise
    </span>
  </div>

  {/* LikeButton */}
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={handleLike}
    className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400"
  >
    <motion.div
      animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <Heart
        className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
      />
    </motion.div>
    <span>{likeCount}</span>
  </motion.button>
</motion.div>
```

#### 交互动画
| 交互 | 动画 | Duration | Easing |
|------|------|----------|--------|
| 卡片 Hover | 边框发光 `borderColor: 主题色` + `shadow: 0→20px` | 0.3s | easeOut |
| 点赞点击 | 心形 `scale: [1, 1.4, 1]` + 颜色 `灰→粉` | 0.3s | spring |
| 点赞数字 | `y: 0→-20, opacity: 1→0` (上浮消失) | 0.4s | easeOut |

---

### E. Shared Journal（共享日记）

#### 组件结构
```
SharedJournalDemo
├── EditorSection (左侧编辑器)
│   ├── DateHeader (日期标题)
│   ├── Toolbar (富文本工具栏)
│   ├── ContentTextarea (文本域)
│   └── WriteTogetherButton (渐变绿按钮)
└── TimelineSection (右侧时间线)
    └── TimelineEntry (历史条目)
        ├── DateBadge (日期徽章)
        ├── AuthorTag (作者标签: You/Partner)
        ├── ContentSummary (内容摘要)
        └── FullContent (完整内容 - 手风琴展开)
```

#### 样式规范
```tsx
// EditorSection (桌面端左侧，移动端上方)
<div className="lg:w-1/2 lg:pr-6">
  {/* DateHeader */}
  <div className="mb-4">
    <h3 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
      {formatDate(new Date())}
    </h3>
  </div>

  {/* Toolbar */}
  <div className="flex gap-2 mb-4 p-2 rounded-xl bg-white/40 backdrop-blur-xl border-2 border-white/60">
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Bold className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
    </motion.button>
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Italic className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
    </motion.button>
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <List className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
    </motion.button>
    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Smile className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
    </motion.button>
  </div>

  {/* ContentTextarea */}
  <textarea
    className="w-full h-64 px-4 py-3 rounded-2xl bg-white/40 backdrop-blur-xl border-2 border-white/60 focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all duration-200 resize-none"
    placeholder="Write your thoughts..."
  />

  {/* WriteTogetherButton */}
  <motion.button
    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
    whileTap={{ scale: 0.97 }}
    className="mt-4 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25"
  >
    Write Together
  </motion.button>
</div>

// TimelineSection (桌面端右侧，移动端下方)
<div className="lg:w-1/2 lg:pl-6">
  <div className="relative">
    {/* 垂直时间线 */}
    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-teal-500" />

    {/* TimelineEntry */}
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="relative pl-12 pb-8"
    >
      {/* 时间线节点 */}
      <div className="absolute left-2 top-0 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25" />

      {/* DateBadge */}
      <div className="mb-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          May 29, 2026
        </span>
      </div>

      {/* AuthorTag */}
      <div className="mb-2">
        <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
          You
        </span>
      </div>

      {/* ContentSummary */}
      <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed">
        Today we went for a walk in the park...
      </p>

      {/* FullContent (手风琴展开) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Today we went for a walk in the park. The weather was perfect, and we talked about our future plans. It was such a peaceful moment together.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
</div>
```

#### 交互动画
| 交互 | 动画 | Duration | Easing |
|------|------|----------|--------|
| 手风琴展开 | `height: 0→auto, opacity: 0→1` | 0.3s | easeOut |
| 条目 Hover | `scale: 1.01` | 0.2s | easeOut |
| 工具栏按钮 | `scale: 1.1→0.9→1` | 0.15s | spring |

---

### F. Dream Wall（梦想墙）

#### 组件结构
```
DreamWallDemo
├── InputSection (顶部输入区)
│   ├── IconSelector (emoji 选择器)
│   ├── WishInput (愿望输入框)
│   └── PinButton (Pin 按钮)
└── WishGrid (下方网格)
    └── WishCard (愿望卡片)
        ├── EmojiIcon (顶部大 emoji)
        ├── WishText (愿望文字)
        └── Checkbox (勾选框)
```

#### 样式规范
```tsx
// InputSection
<div className="flex flex-col sm:flex-row gap-3 mb-8">
  {/* IconSelector */}
  <div className="flex gap-2">
    {['🏠', '✈️', '🎓', '💍', '🚗', '🌍'].map((emoji) => (
      <motion.button
        key={emoji}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setSelectedEmoji(emoji)}
        className={`w-12 h-12 rounded-xl text-2xl transition-all ${
          selectedEmoji === emoji
            ? 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/25'
            : 'bg-white/40 border-2 border-white/60'
        }`}
      >
        {emoji}
      </motion.button>
    ))}
  </div>

  {/* WishInput */}
  <input
    className="flex-1 px-4 py-3 rounded-xl bg-white/40 backdrop-blur-xl border-2 border-white/60 focus:border-yellow-400/60 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.15)] transition-all duration-200"
    placeholder="Add a new wish..."
    value={wishInput}
    onChange={(e) => setWishInput(e.target.value)}
  />

  {/* PinButton */}
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={handleAddWish}
    className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold shadow-lg shadow-yellow-500/25"
  >
    Pin
  </motion.button>
</div>

// WishGrid (响应式 2-3 列)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {wishes.map((wish) => (
    <motion.div
      key={wish.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`p-6 rounded-2xl bg-white/40 backdrop-blur-xl border-2 transition-all ${
        wish.completed
          ? 'opacity-50 border-zinc-300 dark:border-zinc-600'
          : 'border-white/60'
      }`}
    >
      {/* EmojiIcon */}
      <div className="text-5xl mb-4">{wish.emoji}</div>

      {/* WishText */}
      <p
        className={`text-lg font-medium ${
          wish.completed
            ? 'line-through text-zinc-400 dark:text-zinc-500'
            : 'text-zinc-800 dark:text-zinc-100'
        }`}
      >
        {wish.text}
      </p>

      {/* Checkbox */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleToggleComplete(wish.id)}
        className={`mt-4 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
          wish.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-zinc-300 dark:border-zinc-600'
        }`}
      >
        {wish.completed && <Check className="w-5 h-5 text-white" />}
      </motion.button>
    </motion.div>
  ))}
</div>
```

#### 交互动画
| 交互 | 动画 | Duration | Easing |
|------|------|----------|--------|
| 添加愿望 | 卡片 `opacity: 0→1, y: 20→0` (飞入) | 0.4s | easeOut |
| 勾选完成 | 勾选框 `scale: 1→1.2→1` 弹跳 | 0.3s | spring |
| 勾选完成 | 卡片 `opacity: 1→0.5` + 文字 `line-through` | 0.3s | easeOut |
| 自动排序 | `layout` 动画 (Framer Motion) | 0.4s | easeOut |

---

## 统一动画参数表

### Spring 配置
| 用途 | stiffness | damping | mass |
|------|-----------|---------|------|
| 按钮点击 | 400 | 17 | 0.8 |
| 卡片 Hover | 300 | 20 | 1 |
| 弹跳动画 | 500 | 15 | 0.5 |
| 粒子效果 | 600 | 20 | 0.3 |

### Ease 配置
| 用途 | Easing | Duration |
|------|--------|----------|
| 入场动画 | `easeOut` | 0.4-0.6s |
| Hover 效果 | `easeOut` | 0.2-0.3s |
| 手风琴展开 | `easeOut` | 0.3s |
| 淡入淡出 | `easeInOut` | 0.3-0.5s |
| 持续动画 | `easeInOut` | 2-5s |

### 通用动画参数
```tsx
// 入场动画
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

// 缩放动画
const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

// 弹跳动画
const bounce = {
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: 0.4,
    ease: 'easeOut',
  },
}
```

---

## 颜色映射表

### 功能主题色 Hex 值
| 功能 | 主题色 | 渐变起始 | 渐变结束 | 阴影色 | 光晕起始 | 光晕结束 |
|------|--------|---------|---------|--------|---------|---------|
| Daily Check-in | `#F43F5E` (rose-500) | `#F472B6` (pink-400) | `#F43F5E` (pink-500) | `rgba(236,72,153,0.25)` | `#F472B6` | `#FDA4AF` |
| Time Capsules | `#A855F7` (purple-500) | `#A78BFA` (violet-400) | `#6366F1` (indigo-500) | `rgba(168,85,247,0.25)` | `#A78BFA` | `#C4B5FD` |
| Virtual Pet | `#6366F1` (indigo-500) | `#60A5FA` (blue-400) | `#6366F1` (blue-500) | `rgba(99,102,241,0.25)` | `#60A5FA` | `#93C5FD` |
| Private Community | `#F59E0B` (amber-500) | `#FBBF24` (amber-400) | `#F59E0B` (amber-500) | `rgba(245,158,11,0.25)` | `#FBBF24` | `#FCD34D` |
| Shared Journal | `#10B981` (emerald-500) | `#34D399` (emerald-400) | `#14B8A6` (teal-500) | `rgba(20,184,166,0.25)` | `#34D399` | `#6EE7B7` |
| Dream Wall | `#EAB308` (yellow-500) | `#FACC15` (yellow-400) | `#EAB308` (yellow-500) | `rgba(234,179,8,0.25)` | `#FACC15` | `#FDE047` |

### 玻璃拟态通用色
| 元素 | 亮色模式 | 暗色模式 |
|------|---------|---------|
| 背景 | `bg-white/40` | `bg-zinc-800/40` |
| 边框 | `border-white/60` | `border-zinc-600/60` |
| 模糊 | `backdrop-blur-xl` | `backdrop-blur-xl` |
| 阴影 | `shadow-lg` | `shadow-lg` |

### 文字颜色
| 用途 | 亮色模式 | 暗色模式 |
|------|---------|---------|
| 主标题 | `text-zinc-900` | `text-zinc-100` |
| 副标题 | `text-zinc-700` | `text-zinc-200` |
| 正文 | `text-zinc-600` | `text-zinc-300` |
| 辅助文字 | `text-zinc-500` | `text-zinc-400` |
| 占位符 | `text-zinc-400` | `text-zinc-500` |

---

## 响应式断点规则

### 断点定义
| 断点名称 | 屏幕宽度 | 说明 |
|---------|---------|------|
| `sm` | ≥640px | 小屏幕 |
| `md` | ≥768px | 中等屏幕 |
| `lg` | ≥1024px | 大屏幕 |
| `xl` | ≥1280px | 超大屏幕 |

### 布局策略
| 元素 | <640px | 640-1023px | ≥1024px |
|------|--------|-------------|---------|
| Hero 标题 | 4xl/36px | 5xl/48px | 6xl/60px |
| 交互体验区 | 单列 | 单列 | 双列（部分功能） |
| 按钮组 | 垂直堆叠 | 水平排列 | 水平排列 |
| 卡片网格 | 1列 | 2列 | 3列 |
| Shared Journal | 上下堆叠 | 上下堆叠 | 左右分栏 |
| 装饰元素 | 缩小 50% | 正常大小 | 完整装饰 |

### 字体大小响应式
```tsx
// 标题
className="text-4xl sm:text-5xl lg:text-6xl font-bold"

// 副标题
className="text-lg sm:text-xl lg:text-2xl"

// 正文
className="text-base sm:text-lg"

// 辅助文字
className="text-sm sm:text-base"
```

### 间距响应式
```tsx
// 容器内边距
className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12"

// 元素间距
className="gap-4 sm:gap-6 lg:gap-8"

// 卡片内边距
className="p-4 sm:p-6 lg:p-8"
```

---

## 附录：技术栈说明

### 依赖库
- **Tailwind CSS 4**: 使用 `@import "tailwindcss"` 语法
- **Framer Motion**: 所有动画实现
- **Lucide React**: 图标库

### 玻璃拟态基础类
```tsx
className="bg-white/40 backdrop-blur-xl border-2 border-white/60"
```

### 渐变按钮基础类
```tsx
className="px-6 py-3 rounded-xl bg-gradient-to-r from-[themeFrom] to-[themeTo] text-white font-semibold shadow-lg shadow-[themeColor]/25"
```

### 输入框基础类
```tsx
className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-xl border-2 border-white/40 focus:border-[themeColor]/60 focus:shadow-[0_0_0_3px_rgba(themeColor,0.15)] transition-all duration-200"
```

---

## 验收标准

- [x] 6 个功能的交互体验区都有完整的视觉设计描述
- [x] 每个功能都有明确的动画参数（duration, delay, easing）
- [x] 输出文件 `design-specs/interaction-system.md` 结构清晰
- [x] 包含组件结构图（伪代码层级）
- [x] 包含统一动画参数表（spring, ease 配置）
- [x] 包含颜色映射表（Hex 值）
- [x] 包含响应式断点规则
- [x] 所有设计可直接在代码中实现
- [x] 保持玻璃拟态风格一致性
- [x] 使用 Tailwind CSS 4 语法
- [x] 使用 Framer Motion 实现动画
- [x] 使用 Lucide React 图标