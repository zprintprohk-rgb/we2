import type {
  CountryCode,
  CurrencyCode,
  CountryPricing,
  PaymentGateway,
  BillingPeriod,
} from './types'

// ─── Pricing Table ────────────────────────────────────────────────────────
// 12 country/region tiers with localised prices
// Gateway priority: alipay_cn > alipay_hk > paypal
// Quarterly discount = 1 - quarterly/(monthly*3), yearly discount = 1 - yearly/(monthly*12)

const pricingTable: Record<CountryCode, CountryPricing> = {
  CN: {
    country: 'CN',
    currency: 'CNY',
    locale: 'zh-cn',
    gateway: 'alipay_cn',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 35,
        quarterly: 89,
        yearly: 259,
        quarterlyDiscount: 0.15,  // (105-89)/105
        yearlyDiscount: 0.38,     // (420-259)/420
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  HK: {
    country: 'HK',
    currency: 'HKD',
    locale: 'zh-tw',
    gateway: 'alipay_hk',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 45,
        quarterly: 115,
        yearly: 329,
        quarterlyDiscount: 0.15,  // (135-115)/135
        yearlyDiscount: 0.39,     // (540-329)/540
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  TW: {
    country: 'TW',
    currency: 'TWD',
    locale: 'zh-tw',
    gateway: 'alipay_hk',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 175,
        quarterly: 449,
        yearly: 1299,
        quarterlyDiscount: 0.14,  // (525-449)/525
        yearlyDiscount: 0.38,     // (2100-1299)/2100
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  US: {
    country: 'US',
    currency: 'USD',
    locale: 'en',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 5.49,
        quarterly: 12.99,
        yearly: 37.99,
        quarterlyDiscount: 0.21,  // (16.47-12.99)/16.47
        yearlyDiscount: 0.42,     // (65.88-37.99)/65.88
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  GB: {
    country: 'GB',
    currency: 'GBP',
    locale: 'en',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 3.99,
        quarterly: 10.49,
        yearly: 29.99,
        quarterlyDiscount: 0.12,  // (11.97-10.49)/11.97
        yearlyDiscount: 0.37,     // (47.88-29.99)/47.88
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  AU: {
    country: 'AU',
    currency: 'AUD',
    locale: 'en',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 7.49,
        quarterly: 18.99,
        yearly: 54.99,
        quarterlyDiscount: 0.15,  // (22.47-18.99)/22.47
        yearlyDiscount: 0.39,     // (89.88-54.99)/89.88
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  CA: {
    country: 'CA',
    currency: 'CAD',
    locale: 'en',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 6.49,
        quarterly: 16.49,
        yearly: 47.99,
        quarterlyDiscount: 0.15,  // (19.47-16.49)/19.47
        yearlyDiscount: 0.38,     // (77.88-47.99)/77.88
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  SG: {
    country: 'SG',
    currency: 'SGD',
    locale: 'en',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 7.49,
        quarterly: 18.99,
        yearly: 54.99,
        quarterlyDiscount: 0.15,  // (22.47-18.99)/22.47
        yearlyDiscount: 0.39,     // (89.88-54.99)/89.88
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  DE: {
    country: 'DE',
    currency: 'EUR',
    locale: 'de',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 4.69,
        quarterly: 11.99,
        yearly: 34.99,
        quarterlyDiscount: 0.15,  // (14.07-11.99)/14.07
        yearlyDiscount: 0.38,     // (56.28-34.99)/56.28
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  FR: {
    country: 'FR',
    currency: 'EUR',
    locale: 'fr',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 4.69,
        quarterly: 11.99,
        yearly: 34.99,
        quarterlyDiscount: 0.15,  // (14.07-11.99)/14.07
        yearlyDiscount: 0.38,     // (56.28-34.99)/56.28
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  ES: {
    country: 'ES',
    currency: 'EUR',
    locale: 'es',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 4.69,
        quarterly: 11.99,
        yearly: 34.99,
        quarterlyDiscount: 0.15,  // (14.07-11.99)/14.07
        yearlyDiscount: 0.38,     // (56.28-34.99)/56.28
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  JP: {
    country: 'JP',
    currency: 'JPY',
    locale: 'ja',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 580,
        quarterly: 1480,
        yearly: 4280,
        quarterlyDiscount: 0.15,  // (1740-1480)/1740
        yearlyDiscount: 0.39,     // (6960-4280)/6960
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
  KR: {
    country: 'KR',
    currency: 'KRW',
    locale: 'ko',
    gateway: 'paypal',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 6500,
        quarterly: 16500,
        yearly: 47500,
        quarterlyDiscount: 0.15,  // (19500-16500)/19500
        yearlyDiscount: 0.39,     // (78000-47500)/78000
      },
      premium: { monthly: 0, quarterly: 0, yearly: 0 },
      lifetime: { monthly: 0, quarterly: 0, yearly: 0 },
    },
  },
}

// ─── Public API ───────────────────────────────────────────────────────────

/** Get the full pricing config for a country. Falls back to 'US'. */
export function getPricing(country: CountryCode): CountryPricing {
  return pricingTable[country] ?? pricingTable.US
}

/** Get the primary payment gateway for a country. */
export function getGateway(country: CountryCode): PaymentGateway {
  return getPricing(country).gateway
}

/** Get the price for a specific tier & billing period for a given country. */
export function getPrice(
  country: CountryCode,
  tier: 'free' | 'plus' | 'premium' | 'lifetime',
  period: BillingPeriod,
): number {
  const p = getPricing(country)
  const t = p.tiers[tier]
  return t[period] ?? 0
}

/** Calculate the discounted price. */
export function getDiscountedPrice(base: number, discount: number): number {
  if (discount <= 0) return base
  const raw = base * (1 - discount)
  return Math.round(raw * 100) / 100
}

/** Format a monetary amount for a given currency. */
export function getDisplayPrice(amount: number, currency: CurrencyCode): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '—'
  if (!currency) currency = 'USD'

  const localeMap: Record<CurrencyCode, string> = {
    CNY: 'zh-CN', HKD: 'zh-HK', TWD: 'zh-TW', JPY: 'ja-JP', KRW: 'ko-KR',
    USD: 'en-US', GBP: 'en-GB', AUD: 'en-AU', CAD: 'en-CA', SGD: 'en-SG', EUR: 'de-DE',
  }

  const locale = localeMap[currency] ?? 'en-US'

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: ['JPY', 'KRW'].includes(currency) ? 0 : 2,
      maximumFractionDigits: ['JPY', 'KRW'].includes(currency) ? 0 : 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

/** Resolve a CountryCode from a request. Reads CF-IPCountry header, falls back to 'US'. */
export function getCountryFromRequest(requestOrHeaders: Request | Headers): CountryCode {
  const COUNTRY_SET = new Set([
    'CN', 'HK', 'TW', 'US', 'GB', 'AU', 'CA', 'SG',
    'DE', 'FR', 'ES', 'JP', 'KR',
  ])

  let headerValue: string | null = null

  if ('get' in requestOrHeaders && typeof (requestOrHeaders as any).get === 'function') {
    // Headers-like object (Next.js headers(), Web Headers, Workers Headers)
    headerValue = (requestOrHeaders as Headers).get('CF-IPCountry')
  } else if ('headers' in requestOrHeaders && requestOrHeaders.headers) {
    // Standard Request object
    headerValue = requestOrHeaders.headers.get('CF-IPCountry')
  }

  const code = headerValue?.trim().toUpperCase()
  return code && COUNTRY_SET.has(code) ? (code as CountryCode) : 'US'
}

/** Calculate original price (monthly × count) for strikethrough display. */
export function getOriginalPrice(country: CountryCode, period: BillingPeriod): number {
  const monthly = getPrice(country, 'plus', 'monthly')
  switch (period) {
    case 'quarterly':
      return monthly * 3
    case 'yearly':
      return monthly * 12
    default:
      return monthly
  }
}

/** Get the discount percentage as a human-readable integer (e.g. 21). */
export function getDiscountPercent(country: CountryCode, period: BillingPeriod): number {
  const p = getPricing(country)
  const discount =
    period === 'quarterly'
      ? p.tiers.plus.quarterlyDiscount ?? 0
      : period === 'yearly'
        ? p.tiers.plus.yearlyDiscount ?? 0
        : 0
  return Math.round(discount * 100)
}