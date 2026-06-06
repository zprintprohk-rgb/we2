# Deploy & CI guide (Togthr.life)

Owner: orchestrator (cross-cutting). Last bootstrap: 2026-06-07.

## CI workflows

| Workflow | Trigger | What it does |
|---|---|---|
| `.github/workflows/deploy.yml` | push to main / manual | Builds via `@opennextjs/cloudflare` and deploys to Cloudflare Workers |
| `.github/workflows/locale-check.yml` | PR / push | Runs the 4 i18n gates — **blocks merge** on red |

## Local build commands

| Command | What it does | When to use |
|---|---|---|
| `npm run dev` | Next.js dev server | Day-to-day UI work |
| `npm run build` | `next build --no-lint && npx next-sitemap` (with `prebuild: sync-messages`) | Pre-deploy verification of the web target |
| `npm run cf-build` | `npm run build && npx @opennextjs/cloudflare build --skipNextBuild` | Pre-deploy verification of the CF Workers target |
| `npm run lint` | `eslint` | Style gate |
| `npm run deploy` | `opennextjs-cloudflare build && opennextjs-cloudflare deploy` | **User runs this manually** — agent team does not deploy |
| `npm run upload` | build + upload (no deploy) | Pre-deploy sanity |
| `npm run cf-typegen` | regenerate `cloudflare-env.d.ts` from `wrangler.toml` | After any `wrangler.toml` change |

## Pre-deploy checklist (orchestrator-driven)

Before the user runs `npm run deploy`, the following should be true:

1. `npm run build` — green
2. `npm run cf-build` — green (if CF surface touched)
3. `npm run lint` — green (or explicitly waived by user)
4. All 4 i18n gates — green (run by `i18n-expert`)
5. Translation regression baseline — green (run by `i18n-expert`)
6. Pricing/PayPal/Alipay/R2 changes — `pricing-expert` sign-off
7. Code review — `code-reviewer` verdict APPROVE
8. User has read the deliverable summary and explicitly said "deploy"

The agent team does not run `npm run deploy` itself. Even on a green tree, the user holds the deploy trigger.

## Secret management

| Secret | Where it lives | Who sets it |
|---|---|---|
| `DATABASE_URL` | Cloudflare dashboard env, `.env.production` shape (never commit actuals) | user |
| `SUPABASE_*` | same | user |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | same | user |
| `ALIPAL_*` | same | user |
| `NEXT_PUBLIC_CDN_URL` | public env, can be in `.env.production.example` shape | user |

`.env.production` is real secrets — **never** in the diff. `.env.production.example` is the schema — safe to commit.

## Rollback

`wrangler deploy` rolls forward only. To roll back, you re-deploy a previous build. The team does not auto-revert on a failed gate; that's a user decision.
