# CloudDreamer (we2-v3)

基于 Next.js 15 的多语言全栈应用，部署在 Cloudflare Workers 上。

## 技术栈

- **框架**: Next.js 15 (App Router) + React 19
- **国际化**: next-intl (8 种语言：en, zh-cn, zh-tw, ja, ko, de, fr, es)
- **数据库**: Supabase (PostgreSQL + Auth + REST API)
- **ORM**: Drizzle ORM (Schema 定义 + Migration，生产用 supabase-js)
- **样式**: Tailwind CSS 4
- **支付**: PayPal + Alipay
- **部署**: Cloudflare Workers (via @opennextjs/cloudflare)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 环境变量

复制 `.env.example` 为 `.env.local` 并填入实际值：

```bash
cp .env.example .env.local
```

**敏感变量**（生产环境通过 `npx wrangler secret put` 设置）：
- `SUPABASE_SERVICE_ROLE_KEY` — 服务端 API 调用（绕过 RLS）
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` — PayPal 支付凭证
- `ALIPAY_APP_ID` / `ALIPAY_PRIVATE_KEY` — 支付宝支付凭证

**非敏感变量**（写在 `wrangler.toml` 的 `[vars]` 块中）：
- `NEXT_PUBLIC_SITE_URL` — 生产域名
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase 公开凭证

## 部署到 Cloudflare Workers

> ⚠️ 本项目使用 **Cloudflare Workers**（不是 Cloudflare Pages）。
> 不要在 Cloudflare Pages Dashboard 中配置构建命令或输出目录。

### 1. 设置 wrangler secrets（敏感环境变量）

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put PAYPAL_CLIENT_ID
npx wrangler secret put PAYPAL_CLIENT_SECRET
npx wrangler secret put ALIPAY_APP_ID
npx wrangler secret put ALIPAY_PRIVATE_KEY
```

### 2. 构建并部署

```bash
# 一键构建 + 部署
npm run cf-deploy

# 或者分步执行
npm run cf-build    # next build + opennextjs-cloudflare build
npx wrangler deploy  # 部署到 Workers
```

### 3. 仅构建（不部署）

```bash
npm run cf-build
```

构建产物在 `.open-next/` 目录。

### 4. 健康检查

部署后访问：
```
https://你的域名/api/health
```

## 项目结构

```
src/
├── app/
│   ├── [locale]/           # 多语言路由页面
│   │   ├── login/          # 登录
│   │   ├── register/       # 注册
│   │   ├── pricing/        # 定价
│   │   ├── faq/            # 常见问题
│   │   ├── guide/          # 使用指南
│   │   └── not-found.tsx   # 自定义 404
│   └── api/                # API 路由
│       ├── health/         # 健康检查
│       ├── auth/           # OAuth 回调
│       ├── paypal/         # PayPal 支付
│       └── alipay/         # 支付宝支付
├── components/             # 共享组件
├── db/
│   └── schema.ts           # Drizzle ORM 数据库 schema
├── i18n/
│   └── routing.ts          # next-intl 路由配置
├── lib/
│   ├── supabase.ts         # Supabase 客户端（Browser/Server/Edge）
│   ├── auth-actions.ts     # Server Actions（登录/注册/登出）
│   ├── db-edge.ts          # 生产数据库查询层
│   ├── pricing.ts          # 定价逻辑
│   └── request-utils.ts    # 请求工具函数
└── proxy.ts                # 中间件（i18n + 安全头 + 地理位置）
```

## 数据库架构

- **Schema 定义**: `src/db/schema.ts`（Drizzle ORM）
- **生产查询**: `src/lib/db-edge.ts`（通过 Supabase REST API，兼容 Workers 环境）
- **认证操作**: `src/lib/auth-actions.ts`（Server Actions，通过 Cookie 管理会话）

Cloudflare Workers 不支持 TCP 连接，因此数据库操作通过 Supabase REST API（基于 fetch）完成，Drizzle 仅用于 Schema 定义和 Migration 管理。