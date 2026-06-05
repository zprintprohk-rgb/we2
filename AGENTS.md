# Togthr 项目（CloudDreamer / we2-v3）— AI 协作指南

> **项目定位**: 带养成像素宠物的情侣关系记录 + 社区平台
> **核心人群**: 通用人群（不限于"年龄差"），主打"虚拟陪伴 + 关系记录"
> **IP 名**: Togthr Companions
> **角色**: Togthr Bot（圆头小机器人，pastel 紫粉配色，16-bit 像素风）
> **域名**: togthr.life
> **GitHub**: github.com/zprintprohk-rgb/togthr

## 1. 核心定位（一句话）
> 你的桌面上有一只会在你写代码时给你加油的小机器人。

## 2. 5 个不可妥协
1. **不限人群**（年龄 / 种族 / 国籍 / 性别 / 关系状态都 OK）
2. **像素风 + 玻璃拟态**混合（精致 UI + 粗糙像素的反差萌）
3. **深色模式**优先（私密、避风港感）
4. **像素宠物是核心**（不是装饰，是养成 / 见证关系）
5. **永远温柔**（不评判、不说教、不催更）

## 3. 角色：Togthr Bot
- 详细人设: `docs/togthr-bot-personality.md`
- 4 状态：idle / working / thinking / success
- 6 表情：happy / angry / sleeping / charging / thinking / success
- 8 帧动画：512×64 sprite（idle 1-2 / working 1-2 / thinking 1-2 / success 1-2）
- 6 隐藏属性 → 6 职业皮肤（程序员 / 医生 / 太空人 / 厨师 / 警察 / 消防 / 潜水员 / 司机 / 军人 / 司机）
- 5 阶段成长（婴儿 → 学步 → 少年 → 成年 → 传说）
- 1 隐藏金款（限定 1/72）

## 4. 技术栈（不可改）
- **Next.js 15** App Router + **React 19**
- **next-intl** 8 locales: en / zh-cn / zh-tw / ja / ko / de / fr / es
- **Tailwind CSS 4**（CSS-first，无 tailwind.config.js）
- **Supabase** PostgreSQL + Auth + SSR
- **Drizzle ORM**
- **Cloudflare Workers** (via @opennextjs/cloudflare, **Node.js runtime**)
- **Cloudflare R2** (binding: R2, bucket: my-we2-images)
- **PayPal + Alipay**（13 国定价，CN: alipay, others: paypal）
- **GitHub Actions** CI deploy

## 5. 定价（13 国，源真值在 src/lib/pricing/）
- **月付**: CN ¥35, HK$45, NT$175, $5.49, £3.99, A$7.49, C$6.49, S$7.49, €4.69, ¥834, ₩6,500
- **季付**: CN ¥89, etc.
- **年付**: CN ¥259, $37.99, etc.
- **结算货币**: CN 用 CNY (alipay), 其他用 USD (paypal)
- **zh-tw 硬编码 → HK**（不映射到 TW）

## 6. 项目结构（关键路径）
```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # 含 <DesktopPet />
│   │   ├── page.tsx            # 首屏
│   │   ├── pricing/page.tsx    # 13 国定价
│   │   ├── privacy/page.tsx
│   │   └── features/[slug]/
│   ├── api/
│   │   ├── paypal/             # create-order / capture / webhook
│   │   ├── alipay/             # create-order / notify
│   │   └── files/              # R2 上传 / 拉取
│   └── layout.tsx
├── components/
│   ├── DesktopPet/             # ⭐ 核心 IP 组件
│   │   ├── index.tsx
│   │   └── styles.module.css   # 512x64 sprite
│   ├── pet/PetAvatar.tsx
│   └── FeatureCard.tsx
├── lib/
│   ├── pricing.ts              # shim → pricing-impl (13 国实价)
│   ├── pricing-impl.ts         # 13 国真实数据 (不要 USD-convert)
│   ├── pricing/index.ts        # V7 子目录入口
│   ├── supabase.ts             # 3 client (browser/server/edge)
│   ├── paypal.ts               # 完整 SDK
│   ├── r2.ts                   # R2 helper
│   ├── safe-t.ts                # safe t() wrapper
│   └── seo.ts                  # 站点名 Togthr, url togthr.life
├── db/schema.ts                # 14 张表
└── i18n/
    ├── routing.ts              # 8 locales
    └── request.ts              # 消息合并

public/
├── pet-sprite.png              # 512x64 主 sprite (DesktopPet 用)
├── og-image.png                # OG 分享图
├── pets/                       # 22 张 IP 资产
└── file.svg, globe.svg, etc.

messages/                         # 8 locales, ~222 keys each
scripts/                          # 6 i18n 闸门 + sprite 生成工具
docs/
├── togthr-companions.md         # IP 品牌指南
├── togthr-bot-personality.md     # 角色人设
└── skills/ai-image-generation.md # AI 生图技巧

wrangler.toml
├── name = "togthr-life"
├── account_id = "32c174efaa22353f357c0fdff9d61b86"
├── compatibility_flags = ["nodejs_compat"]
└── [[r2_buckets]] binding="R2" bucket_name="my-we2-images"

.github/workflows/
├── deploy.yml
└── locale-check.yml             # 4 闸门
```

## 7. 环境变量（必须）
- `DATABASE_URL` (Supabase transaction mode, port 6543)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
- `ALIPAY_APP_ID` / `ALIPAY_PRIVATE_KEY` / `ALIPAY_PUBLIC_KEY`
- `NEXT_PUBLIC_CDN_URL` (R2 public URL, 可选)

## 8. 3 阶段商业化路径
1. **数字限定** (立即): 桌面宠物 + 角色解锁为付费奖励 + 节日皮肤
2. **实体潮玩** (3-6 月): 6 + 1 盲盒 + 微信小程序 + 周边
3. **AR 互动** (6-12 月): 微信小程序 + 二维码 + 投喂互动 + 数据回流

## 9. 7 大"绝对不要做"清单
1. ❌ 不要限人群（不限年龄/性别/种族/国籍/关系）
2. ❌ 不要用纯白 SaaS 风（要深色 + 玻璃拟态 + 像素点缀）
3. ❌ 不要用纯 USD-convert 改 13 国定价（要保留各国家实价）
4. ❌ 不要把宠物当装饰（是养成 / 见证 / 朋友）
5. ❌ 不要用自动化 AI 不经筛选直接上
6. ❌ 不要"功能"导向（要"场景"导向：喂食 / 挖宝 / 共生 / 筑巢）
7. ❌ 不要让 R2 桶名出现 `_old`（gitignore 规则）

## 10. i18n 防御体系
- **4 闸门**: syntax / pollution / completeness / placeholders
- **1 回归**: translation-baseline.json 防退化
- **跑法**: `node scripts/check-*.js` 4 条
- **CI**: `.github/workflows/locale-check.yml` PR 触发

## 11. 重要 commit 历史
- `f021508` IP 7 角色 + 3 表情 + 品牌指南
- `f158071` +4 occupations + sprite sheet + skill doc
- `5e6bb54` rebrand: We2 → Togthr (worker + package.json)
- `b626705` V7 任务 8: i18n 5 闸门 + 定价 shim + 支付集成

## 12. 关键文件别删
- `src/lib/pricing.ts` (shim)
- `src/lib/pricing-impl.ts` (13 国实价)
- `src/lib/pricing/index.ts` (V7 子目录入口)
- `public/pet-sprite.png` (512x64 DesktopPet 用)
- `wrangler.toml` 中 `[[r2_buckets]]` 配置
- `src/components/DesktopPet/` (IP 核心组件)
