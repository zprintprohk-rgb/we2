# Togthr Companions — IP 品牌指南

> **品牌名**: Togthr Companions
> **目标人群**: 全民（不区分年龄 / 性别 / 地域）
> **核心调性**: 治愈系 × 科技感 = 反差萌
> **目标**: 数字 IP → 实体潮玩 → 盲盒 → 联名

---

## 1. 核心视觉 DNA

| 元素 | 描述 |
|---|---|
| **角色原型** | 圆头小机器人（"Togthr Bot"） |
| **配色** | 马卡龙紫 + 粉 + 青色（pastel / candy colors） |
| **风格** | 16-bit pixel art, Game Boy Advance 复古感 |
| **眼神** | 圆润大眼（"萌系"核心） |
| **天线** | 头顶发光触角（"科技感"核心） |
| **身体** | 圆润无棱角（"治愈系"核心） |
| **默认情感** | 安静陪伴 + 偶尔惊喜 |

### 反差萌公式
> **萌系治愈感（外观）+ 科技感（功能/故事）= 让人想抱回家的**潮玩**

---

## 2. 角色 SKU（盲盒第一期：6+1）

| 编号 | 角色 | 关键道具 | 概率 |
|---|---|---|---|
| TC-01 | **基础款** | 无道具，紫色身体 | 20% |
| TC-02 | **程序员** | 帽衫 + 眼镜 + 笔记本 + 耳机 | 18% |
| TC-03 | **医生** | 白大褂 + 听诊器 + 巨型针筒 | 17% |
| TC-04 | **太空人** | 太空服 + 透明头盔（带反光）+ 头盔天线 | 16% |
| TC-05 | **厨师** | 厨师帽 + 围裙 + 木勺 + 小胡子 | 15% |
| TC-06 | **警察/消防**（待生成） | 制服 + 帽子 | 12% |
| **TC-G** | **金色隐藏款** | 全金配色 + 像素粒子（限定 1/72） | **2%** |

**第一期共 7 款 = 6 普通 + 1 隐藏**

---

## 3. 表情系统（4 个核心 + 扩展）

| 表情 | 用途 | 状态 |
|---|---|---|
| 😄 开心 | 默认 / 庆祝 | ✅ |
| 😠 生气 | 错误 / 警告 | ✅ |
| 😴 睡觉 | 待机 / 充电中 | ✅ |
| 🔌 充电 | 学习中 | ⬜ 待生成 |
| 🤔 思考 | 加载中 | ⬜ 待生成 |
| 💪 成功 | 任务完成 | ⬜ 待生成 |

**完整 6 表情 = Togthr 桌面宠物系统的状态机**

---

## 4. 动画帧系统（用于 DesktopPet 组件）

**目标**：8 帧 × 64×64 = 512×64 雪碧图

| 状态 | 帧范围 | 速度 | 状态 |
|---|---|---|---|
| idle | 0-1 | 1.2s | ✅ frame 1 已生成 |
| working | 2-3 | 0.4s | ⬜ 待生成 |
| thinking | 4-5 | 0.8s | ⬜ 待生成 |
| success | 6-7 | 0.6s | ⬜ 待生成 |

---

## 5. 文件结构

```
public/pets/
├── robot-base.png              # 基础款（reference）
├── character-sheet.png         # 三视图（orthographic projection）
├── doctor.png                  # 医生款
├── astronaut.png               # 太空人款
├── programmer.png              # 程序员款
├── chef.png                    # 厨师款
├── police.png                  # 警察款（待生成）
├── golden.png                  # 隐藏金款
├── expression-happy.png        # 表情
├── expression-angry.png
├── expression-sleeping.png
├── expression-charging.png     # 待生成
├── anim-idle-1.png             # 动画帧
├── anim-idle-2.png             # 待生成
├── anim-working-1.png          # 待生成
├── anim-working-2.png
├── anim-thinking-1.png
├── anim-thinking-2.png
├── anim-success-1.png
└── anim-success-2.png
```

---

## 6. Prompt 模板（IP-grade 标准化）

### 基础描述（**所有角色通用**）
```
A cute round robot character, pixel art style, pastel purple and pink
color scheme, soft lighting, cel shading, 16-bit pixel art, sharp edges
no anti-aliasing, limited color palette, sprite sheet style, soft pastel
colors, candy colors, lavender and pink and cyan accents, kawaii design
```

### 视角描述
```
Front view standing pose / Side view / Back view, orthographic projection,
white background, isolated, consistent proportions
```

### 变体描述（举例：医生款）
```
Wearing a doctor's white coat and a stethoscope around the neck,
holding a giant syringe in one hand
```

### Negative Prompt（**永远带上**）
```
3d render, realistic, blurry, extra limbs, asymmetrical eyes, complex
background, perspective distortion, dynamic pose
```

### 完整范例
```
[核心] A cute round robot character, pixel art style, pastel purple and
       pink color scheme, soft lighting, cel shading, 16-bit pixel art,
       sharp edges no anti-aliasing, limited color palette, sprite sheet
       style
[视角] Front view standing pose, orthographic projection, white
       background, isolated, consistent proportions
[变体] Wearing a doctor's white coat and a stethoscope around the neck,
       holding a giant syringe in one hand
[风格] Game Boy Advance inspired, kawaii design, candy colors,
       lavender and pink and cyan accents
[负向] 3d render, realistic, blurry, extra limbs, asymmetrical eyes,
       complex background, perspective distortion, dynamic pose
```

---

## 7. 一致性保命规则

1. **永远用 `robot-base.png` 作为 `input_urls` 参考图**——文字 prompt 不能保证比例一致
2. **同一批次** = 同一参数 + 同一 base 描述，**只改 `[视角]` `[变体]` `[表情]`**
3. **1024×1024 是黄金分辨率**（不要用 1K/2K）
4. **orthographic projection** 是角色一致性的灵魂关键词
5. **每次 ≤ 4 张**（API 限制 + 防止超时）

---

## 8. 商业落地 3 阶段

### 阶段 1：数字限定版（**立即可做**）
- [x] 桌面宠物 DesktopPet 组件
- [ ] 首页 hero 区使用角色立绘
- [ ] 周年庆 / 恋爱纪念日 限定场景气泡
- [ ] 6 + 1 角色解锁为 Premium tier 奖励

### 阶段 2：实体潮玩 / 盲盒（**3-6 个月**）
- 选 4-6 款最受欢迎角色 3D 化
- 推荐材料：半透明磨砂 + 短毛绒
- 隐藏金款：金属色 + 像素粒子 UV 印刷
- 首发：HK / TW 漫展 + 微信小程序

### 阶段 3：AR 互动（**6-12 个月**）
- 微信小程序 + 二维码
- 用户扫码 → 角色"活"在桌面上 → 投喂 / 互动
- AR 限定款：用户手机屏幕上看到角色在现实世界
- 数据回流：角色行为数据 → 推荐产品

---

## 9. 周边生态

- [ ] Figma 贴纸包（开放下载）
- [ ] 微信表情包（240×240 优化）
- [ ] Telegram 贴纸包
- [ ] UGC 创作赛事（"我的 Togthr 故事"）
- [ ] 角色同人画本（粉丝共创）

---

## 10. 下一步优先级

| 优先级 | 任务 | 状态 |
|---|---|---|
| ⭐⭐⭐ | DesktopPet 用真角色替换占位 | 🟡 进行中（idle 帧已生成） |
| ⭐⭐⭐ | IP 文档定稿 | ✅ 此文件 |
| ⭐⭐ | Police / 消防款 | ⬜ 待生成 |
| ⭐⭐ | 完整动画 8 帧 | ⬜ 4 帧待生成 |
| ⭐ | 充电 / 思考 / 成功 表情 | ⬜ 3 张待生成 |
| ⭐ | 角色解锁为付费奖励 | ⬜ 设计 |

---

> **最重要的认知**: 用户喜欢的"第一张图"是 IP 的灵魂。**所有后续生成 = 它的子孙**。  
> **永远不要让模型自由发挥**——每张图都基于 base + reference，**保持绝对一致**。
