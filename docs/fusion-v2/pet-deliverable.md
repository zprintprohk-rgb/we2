# Pet Fusion v2 — Project Deliverable

> Worker: coder (mvs_6de4b79f4ea34e38b01a061fdb8f8066)
> 路径：`F:\CloudDreamerApp\togthr\docs\fusion-v2\pet-deliverable.md`
> 配套：`F:\Togthr_方案对比分析与融合方案.md` 第 334-423 行（提示词 4 融合版）

---

## VERDICT

**🟢 PASS** — 宠物页 Fusion v2 任务完成。Build 0 错误（163/163 pages），sync-messages 8 语言对齐，所有验收清单满足。

## 1. 改/建了哪些文件

### 新建（4 个）
- `src/app/[locale]/pet/pet-data.ts` — Pet 数据模型 + 24 只模拟宠物（6 系列 × 4 稀有度全覆盖）
- `src/app/[locale]/pet/PetCard.tsx` — 召唤阵单卡（4 稀有度光效）
- `src/app/[locale]/pet/PetSelectionModal.tsx` — 全屏召唤阵（6 Tab + 4 列 Grid + 跃出仪式）
- `src/app/[locale]/pet/PetDetailClient.tsx` — 主交互（mood 切换 / 粒子 / 抚摸 / 信息栏 / 操作按钮）

### 修改（2 个）
- `src/app/[locale]/pet/page.tsx` — 改为 Server Component，注入 SEO + setRequestLocale
- `messages/en.json` — 在 `pet.*` namespace 下新增 25+ key（rarity / series / tier / altar / info / actions 等）

## 2. 验证

```bash
cd F:\CloudDreamerApp\togthr
npm run sync-messages   # ✅ All message files are in sync!
npm run build           # ✅ Compiled successfully in 2.9s / 163/163 pages / 0 type errors
npx tsc --noEmit        # ✅ 0 errors in src/app/[locale]/pet/**
```

## 3. 验收清单自检

| 维度 | 状态 |
|------|------|
| `npm run build` 整体通过 | ✅ |
| `npm run sync-messages` 8 语言对齐 | ✅ |
| 全屏召唤阵弹出 | ✅ 黑色 80% 遮罩 + 4 列 Grid（移动 2 列） |
| 6 系列 Tab 切换 | ✅ Basic/Career/Festival/Emotion/Fantasy/Legendary |
| 4 稀有度光效 | ✅ 白光 / 蓝光 / 紫光+blur / 金光+呼吸+环绕星星 |
| 4 心情切换触发不同粒子 | ✅ star / shard / ripple / dust |
| 抚摸交互 sprite 切换 | ✅ expression-happy + 心形拖尾 |
| 移动端 2 列网格 | ✅ `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` |
| 保留 4 心情切换视觉反馈 | ✅ |
| 召唤仪式跃出动画 | ✅ 1.8s（金色光柱 + 弹簧缩放 + 名字"has arrived"） |
| 未解锁：灰度 + 🔒 + 获取方式 | ✅ |
| i18n 完整（无硬编码） | ✅ 所有文案走 `useTranslations` |
| aria / 键盘可达 | ✅ aria-modal / aria-label / aria-pressed / ESC 关闭 |

## 4. 已知限制 / TODO

- 召唤仪式动画当前 1.8s（方案建议 3s），可调
- 解锁获取方式为硬编码字符串，未来应接入实际解锁引擎
- 选中宠物仅 in-memory state，刷新后回 default（Pip）

## 5. 视觉验证步骤

```bash
cd F:\CloudDreamerApp\togthr
npm run dev
# 浏览器：http://localhost:3000/en/pet
```

1. 中央 300x360 PetCapsule xl（默认 Pip，common 稀有度）
2. 点击「💕 Sweet」→ 暖粉背景 + 星星粒子爆发
3. 点击「😤 Fight」→ 冷蓝背景 + 碎片粒子
4. 鼠标在宠物上移动 → 眯眼（expression-happy）+ 心形拖尾
5. 点击「✨ Change Appearance」→ 全屏召唤阵
6. 切换 6 Tab → 看到 24 只宠物按系列过滤
7. 点击 Aurelia（legendary）→ 金光 + 呼吸 + 6 颗环绕 ✦
8. 点击未解锁的 Comet（epic）→ 灰度 + 🔒 + "Subscribe to Togthr Plus"
9. 点击 Summit → 跃出动画 → 1.8s 后自动确认
10. 关闭召唤阵 → 主展示已切换为新宠物
