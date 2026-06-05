import type {
  CountryCode,
  CurrencyCode,
  CountryPricing,
  PaymentGateway,
  BillingPeriod,
} from './types'

// ─── Pricing Table V2.5.1 ─────────────────────────────────────────────────
// 12 country/region tiers with localised prices
// 2 paid tiers: plus (customization) + soulmate (AI features)
// Gateway priority: alipay_cn > alipay_hk > paypal
// Quarterly discount = 1 - quarterly/(monthly*3), yearly discount = 1 - yearly/(monthly*12)
// NOTE 2026-06-05: V2.5.1 = V2.5 - 10% (current purchasing power adjustment)
//   - can run promotions (活动调价) later if still too high

const pricingTable: Record<CountryCode, CountryPricing> = {
  CN: {
    country: 'CN',
    currency: 'CNY',
    locale: 'zh-cn',
    gateway: 'alipay_cn',
    tiers: {
      free: { monthly: 0, quarterly: 0, yearly: 0 },
      plus: {
        monthly: 45,
        quarterly: 112,
        yearly: 326,
        quarterlyDiscount: 0.15,  // (132-112)/132
        yearlyDiscount: 0.38,     // (528-326)/528
      },
      soulmate: {
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
        monthly: 55,
        quarterly: 135,
        yearly: 392,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 44,
        quarterly: 112,
        yearly: 326,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
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
        monthly: 209,
        quarterly: 525,
        yearly: 1530,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 170,
        quarterly: 434,
        yearly: 1265,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
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
        monthly: 7.19,
        quarterly: 17.99,
        yearly: 53.39,
        quarterlyDiscount: 0.17,  // (21.57-17.99)/21.57
        yearlyDiscount: 0.38,     // (86.28-53.39)/86.28
      },
      soulmate: {
        monthly: 5.39,
        quarterly: 13.49,
        yearly: 39.99,
        quarterlyDiscount: 0.17,
        yearlyDiscount: 0.38,
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
        monthly: 5.39,
        quarterly: 13.49,
        yearly: 39.99,
        quarterlyDiscount: 0.17,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 4.04,
        quarterly: 10.49,
        yearly: 29.99,
        quarterlyDiscount: 0.13,
        yearlyDiscount: 0.38,
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
        monthly: 10.79,
        quarterly: 26.99,
        yearly: 80.39,
        quarterlyDiscount: 0.17,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 8.09,
        quarterly: 20.49,
        yearly: 59.99,
        quarterlyDiscount: 0.16,
        yearlyDiscount: 0.38,
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
        monthly: 8.99,
        quarterly: 22.49,
        yearly: 65.99,
        quarterlyDiscount: 0.17,
        yearlyDiscount: 0.39,
      },
      soulmate: {
        monthly: 6.47,
        quarterly: 16.49,
        yearly: 47.99,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
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
        monthly: 10.79,
        quarterly: 26.99,
        yearly: 80.39,
        quarterlyDiscount: 0.17,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 8.09,
        quarterly: 20.49,
        yearly: 59.99,
        quarterlyDiscount: 0.16,
        yearlyDiscount: 0.38,
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
        monthly: 6.29,
        quarterly: 15.99,
        yearly: 46.79,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 4.94,
        quarterly: 12.49,
        yearly: 36.49,
        quarterlyDiscount: 0.16,
        yearlyDiscount: 0.38,
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
        monthly: 6.29,
        quarterly: 15.99,
        yearly: 46.79,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 4.94,
        quarterly: 12.49,
        yearly: 36.49,
        quarterlyDiscount: 0.16,
        yearlyDiscount: 0.38,
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
        monthly: 6.29,
        quarterly: 15.99,
        yearly: 46.79,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 4.94,
        quarterly: 12.49,
        yearly: 36.49,
        quarterlyDiscount: 0.16,
        yearlyDiscount: 0.38,
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
        monthly: 889,
        quarterly: 2249,
        yearly: 6560,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 702,
        quarterly: 1790,
        yearly: 5220,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
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
        monthly: 8999,
        quarterly: 22720,
        yearly: 66290,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
      },
      soulmate: {
        monthly: 7110,
        quarterly: 18130,
        yearly: 52890,
        quarterlyDiscount: 0.15,
        yearlyDiscount: 0.38,
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
  tier: 'free' | 'plus' | 'soulmate' | 'premium' | 'lifetime',
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
