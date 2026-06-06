# Togthr.life — Project Memory (shared team)

Last bootstrap: 2026-06-07. Owner: orchestrator.

## What this is

Cross-session project memory that **complements** (does not replace) the per-agent
agent memory in `~/.mavis/agents/<name>/memory/MEMORY.md`. This file is for
facts that are true project-wide and any rein in the team should be able to read.

## Standing facts

### Project identity

- Project root: `F:\CloudDreamerApp\togthr`
- Domain: `togthr.life`
- GitHub: `github.com/zprintprohk-rgb/togthr`
- IP name: **Togthr Companions** (rebranded from We2 in 2025-12 commit `5e6bb54`)
- Mascot: **Togthr Bot** — round-head pastel-purple/pink pixel sprite, 16-bit style
- Mascot lives in: `src/components/DesktopPet/` and `public/pet-sprite.png` (512×64)

### Tech stack (locked)

- Next.js 15 App Router + React 19
- `next-intl` 4.x — 8 locales (en / zh-cn / zh-tw / ja / ko / de / fr / es)
- Tailwind CSS 4 (CSS-first, no `tailwind.config.js`)
- Supabase (PostgreSQL + Auth + SSR)
- Drizzle ORM
- Cloudflare Workers via `@opennextjs/cloudflare`, **Node.js runtime** (`nodejs_compat` flag)
- Cloudflare R2 bucket `my-we2-images` (binding name: `R2`)
- PayPal + Alipay (CN: alipay, others: paypal)
- GitHub Actions for CI/CD

### The 5 unbreakables (from `AGENTS.md` §2)

1. **Universal audience** — no age / race / gender / nationality / relationship-status gating
2. **Pixel + glass-morphism** mixed aesthetic
3. **Dark mode first** (privacy / sanctuary feel)
4. **Pixel pet is the core**, not decoration
5. **Always gentle** — no judgment, no scolding, no "ship faster"

### The 7 "绝对不要做" (from `AGENTS.md` §9)

1. ❌ Don't limit audience by demographics
2. ❌ Don't use pure-white SaaS aesthetic
3. ❌ Don't use USD-convert to "fake" the 13-country pricing
4. ❌ Don't treat the pet as decoration
5. ❌ Don't ship unfiltered automated AI output
6. ❌ Don't lead with features — lead with scenes (feeding, treasure-hunting, symbiosis, nesting)
7. ❌ Don't introduce R2 bucket name with `_old` suffix (`.gitignore` enforces)

### The 4 i18n gates (live in `scripts/`)

`syntax → pollution → completeness → placeholders`, plus `regression` against `.translation-baseline.json`. Run by `i18n-expert` after any string/`messages/` change. All 4 must be green.

### zh-tw is HONG KONG, not Taiwan

This is a recurring trip-wire for LLM translators. zh-tw strings must use HK conventions, not Taiwan (zh-TW) ones. See `.harness/docs/i18n-8-locales.md` for the gotcha list.

## Per-rein pointers

- `developer` — owns `src/`, `scripts/` (non-i18n), config files. See `.harness/reins/developer/agent.md`
- `tester` — owns the gate runs, build verification, smoke checks. See `.harness/reins/tester/agent.md`
- `code-reviewer` — owns the pre-merge audit. See `.harness/reins/code-reviewer/agent.md`
- `i18n-expert` — owns locale integrity, 4 gates, regression baseline. See `.harness/reins/i18n-expert/agent.md`
- `pricing-expert` — owns the 13-country engine, PayPal/Alipay, R2. See `.harness/reins/pricing-expert/agent.md`

## Open decisions (need user input)

- 9th locale? — No request yet, default = no
- Stripe or WeChat Pay? — No request yet, default = no
- Refactor `pricing-impl.ts` into a JSON-driven config? — No request yet, default = no (per-country comments are deliberate)
- Auto-deploy on green CI? — **No**. User holds the deploy trigger.

## Things not to put here

- Daily task state → `.harness/changelogs/YYYY-MM-DD.md`
- Per-agent private lessons → `~/.mavis/agents/<name>/memory/MEMORY.md`
- Cross-project user facts → user-level memory
- Code structure recoverable from the repo → don't duplicate
