/**
 * Pricing module — public re-export shim
 *
 * 历史：项目早期只有 src/lib/pricing_old.ts（13 国完整实价）。
 * 多个 consumer（包括 src/app/[locale]/pricing/page.tsx）按 V7 约定
 * 从 '@/lib/pricing' 导入，导致 /pricing 整页 500 (Server Component
 * digest 错误，提示 "Pricing is taking a quick breather")。
 *
 * 本 shim 作为兼容层：
 *   1. 让现存 @/lib/pricing 导入立即生效（修复 P0）
 *   2. 同时提供 V7 规范的子目录 src/lib/pricing/index.ts
 *   3. 不破坏已确认的 13 国实价（CN/HK/TW 有真实 CNY/HKD/TWD 价格，
 *      不是 V7 提示词的纯 USD 转换方案）
 *
 * ⚠️ 不要把这里改成纯 USD-base 转换。13 国实价是产品已确认的数据。
 */

export * from './pricing-impl'

// 显式 re-export 主要 API（提高 IDE 跳转体验）
export {
  getPricing,
  getGateway,
  getPrice,
  getDiscountedPrice,
  getDisplayPrice,
  getCountryFromRequest,
  getOriginalPrice,
  getDiscountPercent,
} from './pricing-impl'
