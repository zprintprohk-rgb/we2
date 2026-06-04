/**
 * V7-style pricing subdirectory entry.
 *
 * Re-exports the same 13-country pricing engine that the legacy
 * src/lib/pricing_old.ts (and the compat shim src/lib/pricing.ts)
 * expose. This file exists so that future V7 callers can do:
 *
 *     import { getPricing, getDisplayPrice } from '@/lib/pricing'
 *
 * ...and still resolve to a subdirectory layout if the project later
 * adds more files under src/lib/pricing/.
 *
 * Do NOT introduce a new USD-base conversion model here.
 * 13-country real prices (CNY, HKD, TWD, JPY, KRW, etc.) are confirmed
 * product data and must not be replaced by a synthetic FX-derived
 * price table.
 */

export * from '../pricing_old'
