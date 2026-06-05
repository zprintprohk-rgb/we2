# AI Image Generation Skill — Togthr Companions

> **沉淀**: 2026-06-05 Togthr Companions IP 开发
> **目的**: 让任何人（或 AI）能用这套 prompt 模板稳定生成高质量、风格一致的 Togthr 角色 / 表情 / 动画帧

---

## 1. 核心原则

### 1.1 用第一张成功的图做 "参考 DNA"
- **永远把第一张高质量的图作为 `input_urls` 传给后续生成**
- 文字 prompt 不能保证比例一致，**图像参考能**
- 后续每张新图 = 1 段固定 base prompt + 1 张 reference + 1 段变体描述

### 1.2 单一描述、单一姿态、单一分辨率
- **不要塞多视角/多动作到同一张图**（AI 会糊）
- **每张图只 1 个 pose / 1 个表情**
- **永远 1024×1024 1:1**（这是经验证的最稳分辨率）

### 1.3 IP 商业落地 3 个必备关键词
- `orthographic projection`（正交投影）— 锁比例，方便建模/纸模
- `16-bit pixel art, sharp edges no anti-aliasing, limited color palette` — 锁风格
- `cel shading, soft lighting` — 锁光影，方便实体化分件

---

## 2. Prompt 模板（5 段式）

### 2.1 完整模板

```
[1-核心]    A cute round [角色原型] character, pixel art style, pastel [主色]
            color scheme, soft lighting, cel shading, 16-bit pixel art,
            sharp edges no anti-aliasing, limited color palette, sprite
            sheet style, kawaii design, candy colors, lavender and pink
            and cyan accents

[2-视角]   Front view [具体姿态] pose, orthographic projection, white
            background, isolated, consistent proportions

[3-变体]   Wearing a [服饰] in/on [位置], holding a [道具] in [哪只手]

[4-风格]   Game Boy Advance inspired, kawaii design, candy colors

[5-负向]   3d render, realistic, blurry, extra limbs, asymmetrical eyes,
            complex background, perspective distortion, dynamic pose
```

### 2.2 视角变体
- 单姿态图：`Front view standing pose`
- 三视图（单图）：`Character sheet showing three views: front view, side view, back view`
- 3/4 角度：`three-quarter side view angle standing pose`
- 表情：`front view standing pose, [EXPRESSION_VARIANT]`

### 2.3 完整范例（医生款）

```
[核心] A cute round robot character, pixel art style, pastel purple
      and pink color scheme, soft lighting, cel shading, 16-bit pixel
      art, sharp edges no anti-aliasing, limited color palette, sprite
      sheet style

[视角] Front view standing pose, orthographic projection, white
       background, isolated, consistent proportions

[变体] Wearing a doctor's white coat and a stethoscope around the
       neck, holding a giant syringe in one hand

[风格] Game Boy Advance inspired, kawaii design, candy colors,
       lavender and pink and cyan accents

[负向] 3d render, realistic, blurry, extra limbs, asymmetrical eyes,
       complex background, perspective distortion, dynamic pose
```

---

## 3. 调用方式

### 3.1 MCP 工具调用
工具：`matrix_generate_image`

### 3.2 输入格式（每张图）
```json
{
  "input_urls": ["<第一张参考图 CDN URL>"],
  "prompt": "<完整 5 段式 prompt>",
  "aspect_ratio": "1:1",
  "resolution": "1024x1024"
}
```

### 3.3 批量调用（多个角色/表情）
```json
{
  "requests": [
    { "input_urls": ["..."], "prompt": "...", "aspect_ratio": "1:1", "resolution": "1024x1024" },
    { "input_urls": ["..."], "prompt": "...", "aspect_ratio": "1:1", "resolution": "1024x1024" }
  ]
}
```

**API 限制**: 每次最多 **10 张**，建议 **3-4 张/批**（避免超时）。

---

## 4. 一致性保命规则（**违反任何一条 = 角色会跑偏**）

| # | 规则 | 原因 |
|---|---|---|
| 1 | **永远用第一张做 reference** | 文字不能保证比例 |
| 2 | **每批同 base 描述** | 关键词微调会触发 AI 重新理解 |
| 3 | **每张图只 1 个 pose/1 个表情** | 多概念 = 灾难 |
| 4 | **永远 1:1 + 1024×1024** | 其他比例/分辨率 = 降质 |
| 5 | **永远加 `orthographic projection`** | 防止透视变形 |
| 6 | **永远带完整 negative prompt** | 防止 3d 渲染、模糊、额外肢体 |
| 7 | **每批 ≤ 4 张** | API 超时风险 |
| 8 | **超时重试同一 prompt** | AI 不稳定，有时跑两遍出奇迹 |

---

## 5. 角色变体设计

### 5.1 服饰定位法
**不要**只说 `wearing doctor's clothes`（AI 经常加奇怪的配件破坏原比例）

**要**精确指定：
- **位置**：`Wearing a white coat and a stethoscope AROUND THE NECK`（不是穿在身上）
- **道具**：`Holding a giant syringe IN ONE HAND`（不是 `with`）
- **配件**：`Small antenna on top of HELMET`（指定位置）

### 5.2 6 + 1 盲盒 SKU 设计原则
| 概率 | 数量 | 角色类型 |
|---|---|---|
| 60-70% | 3-4 | 基础款 + 1 变体 |
| 25-30% | 2 | 稀有职业款 |
| 5-10% | 1 | 隐藏 / 限定款 |
| 1-2% | 1 | **金色隐藏款**（限定 1/72） |

**第一期示例**: 6 普通 + 1 金 = 20/18/17/16/15/12/2 = 100%

---

## 6. 动画帧设计

### 6.1 雪碧图规格
- **每帧**: 64×64
- **每状态**: 2 帧
- **总宽**: 8 × 64 = **512 px**（不是 500）
- **总高**: 64 px
- **格式**: PNG, 透明背景

### 6.2 4 个状态 × 2 帧
| 状态 | 帧范围 | CSS 速度 | 用途 |
|---|---|---|---|
| idle | 0-1 | 1.2s | 默认待机 |
| working | 2-3 | 0.4s | 工作中 / 加载 |
| thinking | 4-5 | 0.8s | 思考中 / 等待 |
| success | 6-7 | 0.6s | 完成 / 庆祝 |

### 6.3 CSS keyframes
```css
.idle    { background-position: 0 → -128px; }      /* 帧 0-1 */
.working { background-position: -128 → -256px; }   /* 帧 2-3 */
.thinking{ background-position: -256 → -384px; }   /* 帧 4-5 */
.success { background-position: -384 → -512px; }   /* 帧 6-7 */
```

---

## 7. 文件组织

```
public/pets/
├── robot-base.png          # 基础款（IP 第一张，永不改）
├── character-sheet.png     # 三视图（orthographic）
├── doctor.png              # 职业变体
├── astronaut.png
├── programmer.png
├── chef.png
├── police.png
├── firefighter.png
├── diver.png
├── driver.png
├── golden.png              # 隐藏金款
├── expression-happy.png    # 表情
├── expression-angry.png
├── expression-sleeping.png
├── expression-charging.png
├── anim-idle-1.png          # 动画帧
├── anim-idle-2.png
├── anim-working-1.png
├── anim-working-2.png
├── anim-thinking-1.png
├── anim-thinking-2.png
├── anim-success-1.png
└── anim-success-2.png
```

**命名规范**:
- 角色: `{occupation}.png`（如 `doctor.png`）
- 表情: `expression-{emotion}.png`
- 动画: `anim-{state}-{1|2}.png`

---

## 8. 表情变体设计

### 8.1 核心 6 表情（推荐全覆盖）
| 表情 | 用途 | 关键词 |
|---|---|---|
| 开心 | 默认 / 庆祝 | `HUGE joyful smile, eyes squinting happily` |
| 生气 | 错误 / 警告 | `furrowed brow, crossed arms, puffed cheeks` |
| 睡觉 | 待机 / 充电 | `closed eyes, soft smile, Zzz floating` |
| 充电 | 学习中 | `eyes closed peacefully, green battery icon glowing` |
| 思考 | 加载中 | `head tilted, hand on chin, eyes looking up` |
| 成功 | 任务完成 | `both arms raised, sparkly eyes` |

### 8.2 表情强度控制
- 默认 `gentle smile`（温和）
- 强度 +1：`big smile`
- 强度 +2：`HUGE joyful smile`（**只用一次，再夸张就丢失治愈感**）
- 强度 -1：`subtle smile`（更含蓄）

---

## 9. 商业落地适配

### 9.1 实体潮玩
- **光影 + 边缘清晰** → 适合分件注塑
- **`cel shading`** 关键词 → 让 AI 给出硬边阴影块，注塑时直接对应分件
- **`soft lighting`** → 让 AI 给出统一光源，3D 化时不需要重打光

### 9.2 数字贴纸
- **`sharp edges no anti-aliasing`** → 微信表情包要求 240×240 锐利边缘
- **`sprite sheet style`** → 直接转 PNG 序列帧

### 9.3 AR 互动
- **`orthographic projection`** → AR 3D 化时不需要重新校正
- **`consistent proportions`** → 多角色能在 AR 场景里无缝共处

---

## 10. 故障排查

| 症状 | 原因 | 解决 |
|---|---|---|
| 角色比例变了 | 没传 `input_urls` | 每次都加 reference |
| 角色变成 3D 渲染 | 缺 negative prompt | 加 `3d render, realistic` |
| 颜色变淡/变鲜艳 | 改了 color scheme 关键词 | **完全复制 base 描述** |
| 出现额外手脚 | 缺 negative prompt | 加 `extra limbs, asymmetrical eyes` |
| 边缘模糊/抗锯齿 | 缺 style 关键词 | 加 `sharp edges no anti-aliasing` |
| 透视变形 | 缺投影关键词 | 加 `orthographic projection` |
| API 超时 | batch 太大 | 拆成 3-4 张/批 |

---

## 11. 迭代记录

| 日期 | 改动 | 原因 |
|---|---|---|
| 2026-06-05 | 创建 skill 文档 | 第一次完整跑通 6+1 盲盒 |
| 2026-06-05 | 加入 `orthographic projection` | 用户反馈：前后比例不一致 |
| 2026-06-05 | 加入完整 negative prompt | 用户反馈：角色偶尔 3D 化 / 模糊 |
| 2026-06-05 | 锁定 1024×1024 + 1:1 | 用户反馈：其他分辨率降质 |

---

## 12. 一句话总结

> **第一张成功的图 = IP 的 DNA**  
> 后续所有生成 = 它的子孙  
> **永远用 reference + 永远只改一处变量 = 永远一致**
