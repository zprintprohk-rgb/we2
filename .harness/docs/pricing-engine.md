# Pricing engine guide (Togthr.life — 13 countries)

Owner: `pricing-expert` rein. Last bootstrap: 2026-06-07.

## Files

| File | Role | Mutable? |
|---|---|---|
| `src/lib/pricing.ts` | Shim (public surface) | **Never delete** — downstream imports it |
| `src/lib/pricing-impl.ts` | 13-country actuals | Editable, but never convert to USD-math |
| `src/lib/pricing/index.ts` | V7 subdir entry | Editable |
| `src/app/api/paypal/**` | PayPal create-order, capture, webhook | Editable; verify webhook sig path |
| `src/app/api/alipay/**` | Alipay create-order, notify (form-encoded POST) | Editable; never JSON-ify notify |
| `src/lib/paypal.ts` | PayPal SDK wrapper | Editable |
| `src/lib/r2.ts` | R2 helper, my-we2-images bucket | Editable; never change binding name |
| `wrangler.toml` | `[[r2_buckets]]` binding `R2` → `my-we2-images` | Editable; never introduce `_old` |

## 13 countries, monthly / quarterly / annual actuals

Source of truth: `src/lib/pricing-impl.ts`. Below is the canonical table (do **not** USD-convert; these are per-country list prices).

| Country | Code | Currency | Monthly | Quarterly | Annual | Payment rail |
|---|---|---|---|---|---|---|
| Mainland China | CN | CNY | ¥35 | ¥89 | ¥259 | Alipay |
| Hong Kong | HK | HKD | $45 | — | — | PayPal (USD) |
| Taiwan | TW | TWD | NT$175 | — | — | PayPal (USD) |
| United States | US | USD | $5.49 | — | $37.99 | PayPal |
| United Kingdom | GB | GBP | £3.99 | — | — | PayPal (USD) |
| Australia | AU | AUD | A$7.49 | — | — | PayPal (USD) |
| Canada | CA | CAD | C$6.49 | — | — | PayPal (USD) |
| Singapore | SG | SGD | S$7.49 | — | — | PayPal (USD) |
| Germany | DE | EUR | €4.69 | — | — | PayPal (USD) |
| France | FR | EUR | €4.69 | — | — | PayPal (USD) |
| Spain | ES | EUR | €4.69 | — | — | PayPal (USD) |
| Japan | JP | JPY | ¥834 | — | — | PayPal (USD) |
| South Korea | KR | KRW | ₩6,500 | — | — | PayPal (USD) |

Empty cells: extend on request, but only with explicit user sign-off (the table is curated, not derived).

## Routing rules (server-side)

- If `country === 'CN'` (and only CN) → Alipay + CNY
- All other countries → PayPal + USD
- zh-cn users in HK/TW/US/...: country is detected server-side from `accept-language` + `cf-ipcountry` (Cloudflare) + manual override — not from the locale prefix. Locale ≠ country.

## R2 binding

- Binding name: `R2` (verbatim)
- Bucket: `my-we2-images`
- Public URL helper: `NEXT_PUBLIC_CDN_URL` (env, optional)
- The `.gitignore` blocks any `*_old` R2 bucket name from being committed. If you see one in a diff, block.

## Things to verify on any change

1. The shim (`pricing.ts`) still re-exports the same surface — don't break downstream imports
2. The 13 actuals are still per-country, not USD-converted
3. PayPal webhook signature path is intact
4. Alipay notify handler still accepts form-encoded POST (Alipay does not send JSON)
5. R2 binding name is still `R2` and bucket is still `my-we2-images`
6. No new dependency added without explanation (PayPal/Alipay SDKs are already in `package.json`)

## What to escalate

- New country added to the 13 → user (this is a product decision, not engineering)
- New payment rail (Stripe, WeChat Pay, ...) → user
- USD-conversion refactor → user (this is a deliberate stance: actuals over conversion)
- R2 bucket rename or migration → user (deploy-breaking, manual migration needed)
