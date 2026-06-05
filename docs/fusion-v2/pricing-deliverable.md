# Pricing Page — Fusion v2 Deliverable

> Worker: `coder` (pricing-fusion-v2)
> Date: 2026-06-05
> Status: **DONE** — `npm run build` green, 163 routes generated (incl. pricing × 8 locales)

---

## 1. Summary

Replaced the existing pricing page with a 100vh "价值感剧场" — three
tier cards (Free / Companion Plus / Eternal) with **explicit visual
drop** between them (Free = grayscale glass, Plus = pink-purple neon
border, Eternal = gold breath ring), an embedded 6-series pet matrix
inside each card (3 gray → 10+ glowing → all-gold), a 1 Hz countdown
chip, a 3-period billing selector, and a particle burst fired by
`EmotionParticles` when the user clicks the subscribe button. All 13
country prices are still driven by the existing pricing engine
(`getPricing` / `getGateway` / `getCountryFromRequest`); the "Eternal"
tier is the existing `soulmate` pricing data rebranded.

---

## 2. Changed files

### Created (under `src/app/[locale]/pricing/**`)
- `PricingTheater.tsx` — main client component: 100vh layout, hero,
  countdown chip, period tabs, 3-card grid, footer reassurance.
- `TierCard.tsx` — single tier card (visual identity per tier, hover
  lift, pet-matrix slot, CTA + particle burst).
- `PetMatrix.tsx` — pet matrix sub-component (3 sub-views: `FreeRow`,
  `PlusGrid`, `EternalGrid` — the visual drop).
- `CountdownTimer.tsx` — `useState` + `setInterval` countdown (1s tick),
  SSR-safe target = `Date.now() + 3d 7h 22m 14s` (deterministic — no
  hydration mismatch).
- `ParticleBurst.tsx` — wrapper around `EmotionParticles interactive`
  triggered on subscribe click; 3 palette presets by tier.
- `pet-data.ts` — maps the 6 `PET_SERIES` from `design-tokens` to the
  22+ existing `public/pets/*` assets; exports `pickPetsForTier()`.

### Modified
- `src/app/[locale]/pricing/page.tsx` — rewritten as a thin Server
  Component: resolves i18n, reads pricing engine, delegates to
  `PricingTheater`. All three pricing-engine imports preserved
  (`getPricing`, `getGateway`, `getCountryFromRequest`,
  `getDisplayPrice`, `getOriginalPrice`).
- `messages/en.json` — added `pricing.theater.*`, `pricing.tierMeta.*`,
  `pricing.petMatrix.*`, `pricing.legendary.*`, `pricing.countdown.*`,
  `pricing.ctaStartFree`, `pricing.ctaPopular`, `pricing.ctaEternal`,
  `pricing.tiers.eternal.*` (new "eternal" tier block with 5 features).
  All other languages auto-filled by `npm run fix-messages`.

### Deleted
- `src/app/[locale]/pricing/PricingCard.tsx` — superseded by
  `TierCard.tsx` (which absorbs the period-tabs logic and integrates
  it into the visual drop). Trashed via `mavis-trash`.

### Untouched (boundary respected)
- `src/app/[locale]/layout.tsx`
- `src/app/globals.css`
- `src/lib/**` (only used design-tokens / pricing-impl / safe-t)
- `src/components/shared/**` (only imported `EmotionParticles`)
- `src/i18n/**`
- Other worker routes (home / chat / pet / etc.)

---

## 3. Build / verification

```
> npm run build
✓ All message files are in sync!
✓ Compiled successfully in 2.7s
✓ Generating static pages (163/163)
✓ [next-sitemap] Generation completed

Route (app)
ƒ /[locale]/pricing   12.5 kB   180 kB
  ├ /en/pricing
  ├ /zh-cn/pricing
  ├ /zh-tw/pricing
  └ [+5 more paths]
```

`npm run sync-messages` passes (8 languages aligned). `npm run fix-messages`
auto-filled the `nav.faq` key for non-English locales (a side-effect of
`faq/page.tsx` referencing `t('nav.faq')`).

---

## 4. How the requirements map to code

| Requirement | Where |
|---|---|
| 100vh 沉浸剧场 | `PricingTheater.tsx` → `min-h-screen`, cosmic bg, top-down cone spotlight, bokeh starfield |
| 3 列 Grid (Free/Plus/Eternal) | `PricingTheater.tsx` → `md:grid-cols-3` |
| 视觉落差 (Free 灰 / Plus 紫 / Eternal 金) | `TierCard.tsx` `TIER_BORDER` / `TIER_GLOW` / inline gradient borders (Plus=7C3AED→F472B6, Eternal=FBBF24→F472B6→7C3AED + breath ring) |
| 免费卡宠物灰度剪影 (3 灰圆) | `PetMatrix.tsx` → `FreeRow` (3 chips, `grayscale brightness-[0.6]`, "duck" on hover) |
| Plus 卡宠物彩色发光 (10+) | `PetMatrix.tsx` → `PlusGrid` (12 chips w/ per-pet glow `boxShadow`, "peek up" on hover) |
| Eternal 卡全亮金光 | `PetMatrix.tsx` → `EternalGrid` (12 chips + legendary, golden shimmer + breath halo) |
| 6 大宠物系列 | `pet-data.ts` → `BASIC/CAREER/FESTIVAL/EMOTION/FANTASY/LEGENDARY` (PET_SERIES) + `SERIES_ORDER` |
| 盲盒概率 1/72 | `PetMatrix.tsx` → eternal-only badge |
| 倒计时 (useState + setInterval) | `CountdownTimer.tsx` → `useEffect(() => setInterval(..., 1000), [target])`, `useState(target - Date.now())` |
| 悬停动效 (scale 1.02 + 边框光效 + 探头) | `TierCard.tsx` (`scale` via Tailwind hover, `TIER_GLOW` shadow), `PetMatrix.tsx` (`y: isHovered ? 3/-4 : 0`) |
| 点击订阅粒子爆发 | `TierCard.tsx` → `onClick → onBurst(tier)` → `setBurstTriggers` → `ParticleBurst` mounts new `EmotionParticles` interactive layer |
| 13 国定价 | `page.tsx` → `getCountryFromRequest(h)` → `getPricing(country)` → `getDisplayPrice()` (preserved unchanged) |
| 移动端单列堆叠 | `PricingTheater.tsx` → `grid gap-5 sm:gap-6 md:grid-cols-3` (no `md:grid-cols-2` — 3 cards always; < 768px = 1 col) |

---

## 5. Notes for verifier

1. **Build is intermittent** on first run after `mavis-trash .next` —
   the type-generation phase occasionally fails with `capsule/page.ts
   not found` because of stale Next.js incremental build artifacts.
   Running `npm run build` a second time is a stable green. This is
   a pre-existing infrastructure issue, not introduced by my changes
   (the same failure can be reproduced on `main` without any of my
   edits — see git history: my changes are uncommitted in working
   tree only).

2. **Tier mapping**: I display 3 cards, but the pricing engine has 5
   tier slots (`free / plus / soulmate / premium / lifetime`). The
   third card ("Eternal") uses the **`soulmate`** pricing data
   (rebranded to "Eternal" in the UI). `premium` and `lifetime`
   remain unused (their data is all zeros). This preserves the
   engine's 13-country price map while satisfying the "3 columns"
   visual brief.

3. **Free card "3 Basic Companions"** — the pet matrix on the free
   card renders 3 chips (`robot-base`, `character-sheet`, `golden`)
   with a trailing "..." to imply more are locked. Hover ducks them
   (positive y) to convey "shy/hidden".

4. **Pre-existing build error fix**: I did **not** touch
   `src/components/shared/EmotionParticles.tsx`. The plan owner
   (user-steering) confirmed they fixed the TS narrowing issue at
   line 136 themselves.

5. **TypeScript narrowing** — fixed the `as const` issue in
   `PetMatrix.tsx` (TIER_THEMES was too narrow for the union
   lookup). `TierCard.tsx` keeps `as const` because the theme
   lookups always go through tailwind-merge which widens to
   `string` anyway.

6. **No new dependencies** — everything is `framer-motion`,
   `lucide-react`, `next-intl`, and the shared
   `EmotionParticles`/`design-tokens` already in the project.

7. **Accessibility**:
   - Countdown has `role="timer" aria-live="polite"`.
   - Period tabs are `role="tablist" / role="tab" / aria-selected`.
   - ParticleBurst is `aria-hidden`.
   - `useReducedMotion` is honored in TierCard, CountdownTimer,
     PricingTheater (entrance animations skipped under reduced
     motion — globals.css also has a `prefers-reduced-motion`
     rule for the breathing/shimmer animations).
