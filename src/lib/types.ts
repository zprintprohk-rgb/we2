export type Locale = 'en' | 'zh-cn' | 'zh-tw' | 'ja' | 'ko' | 'de' | 'fr' | 'es';
export type CountryCode = 'US' | 'CN' | 'TW' | 'HK' | 'JP' | 'KR' | 'DE' | 'FR' | 'ES' | 'GB' | 'AU' | 'CA' | 'SG';
export type CurrencyCode = 'USD' | 'CNY' | 'TWD' | 'HKD' | 'JPY' | 'KRW' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'SGD';

export const locales: Locale[] = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'fr', 'es'];
export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  'zh-cn': '🇨🇳',
  'zh-tw': '🇹🇼',
  ja: '🇯🇵',
  ko: '🇰🇷',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
};

// --- locale ↔ country ↔ currency mapping ---
export const localeToCountry: Record<Locale, CountryCode> = {
  en: 'US',
  'zh-cn': 'CN',
  'zh-tw': 'TW',
  ja: 'JP',
  ko: 'KR',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
};

export const localeToCurrency: Record<Locale, CurrencyCode> = {
  en: 'USD',
  'zh-cn': 'CNY',
  'zh-tw': 'TWD',
  ja: 'JPY',
  ko: 'KRW',
  de: 'EUR',
  fr: 'EUR',
  es: 'EUR',
};

export const countryToCurrency: Record<CountryCode, CurrencyCode> = {
  US: 'USD',
  CN: 'CNY',
  TW: 'TWD',
  HK: 'HKD',
  JP: 'JPY',
  KR: 'KRW',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  GB: 'GBP',
  AU: 'AUD',
  CA: 'CAD',
  SG: 'SGD',
};

// --- payment gateways ---
export type PaymentGateway = 'alipay_cn' | 'alipay_hk' | 'paypal';

export const countryToGateway: Record<CountryCode, PaymentGateway[]> = {
  CN: ['alipay_cn'],
  TW: ['alipay_hk'],
  HK: ['alipay_hk', 'paypal'],
  JP: ['paypal'],
  KR: ['paypal'],
  DE: ['paypal'],
  FR: ['paypal'],
  ES: ['paypal'],
  GB: ['paypal'],
  US: ['paypal'],
  AU: ['paypal'],
  CA: ['paypal'],
  SG: ['paypal'],
};

export type SubscriptionTier = 'free' | 'plus' | 'premium' | 'lifetime';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  nameKey: string;
  badgeKey?: string;
  monthlyPrice: Record<CurrencyCode, number>;
  yearlyPrice: Record<CurrencyCode, number>;
  features: string[];
  highlighted?: boolean;
}

export interface PricingConfig {
  plans: SubscriptionPlan[];
  gateways: PaymentGateway[];
  trialDays: number;
  supportedCurrencies: CurrencyCode[];
}

// --- per-country pricing ---
export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly'

export interface PriceTier {
  monthly: number
  quarterly: number
  yearly: number
  quarterlyDiscount?: number // 0.15 = 15% off
  yearlyDiscount?: number // 0.38 = 38% off
}

export interface CountryPricing {
  country: CountryCode
  currency: CurrencyCode
  locale: Locale
  gateway: PaymentGateway
  tiers: {
    free: PriceTier
    plus: PriceTier
    premium: PriceTier
    lifetime: { monthly: number; quarterly: number; yearly: number }
  }
}

export interface GeoMarker {
  locale: Locale;
  country: CountryCode;
  currency: CurrencyCode;
  gateways: PaymentGateway[];
  ogLocale: string;
  hreflang: string;
}

export const geoMarkers: Record<Locale, GeoMarker> = {
  en: { locale: 'en', country: 'US', currency: 'USD', gateways: ['paypal'], ogLocale: 'en_US', hreflang: 'en' },
  'zh-cn': { locale: 'zh-cn', country: 'CN', currency: 'CNY', gateways: ['alipay_cn'], ogLocale: 'zh_CN', hreflang: 'zh-Hans-CN' },
  'zh-tw': { locale: 'zh-tw', country: 'TW', currency: 'TWD', gateways: ['alipay_hk'], ogLocale: 'zh_TW', hreflang: 'zh-Hant-TW' },
  ja: { locale: 'ja', country: 'JP', currency: 'JPY', gateways: ['paypal'], ogLocale: 'ja_JP', hreflang: 'ja' },
  ko: { locale: 'ko', country: 'KR', currency: 'KRW', gateways: ['paypal'], ogLocale: 'ko_KR', hreflang: 'ko' },
  de: { locale: 'de', country: 'DE', currency: 'EUR', gateways: ['paypal'], ogLocale: 'de_DE', hreflang: 'de' },
  fr: { locale: 'fr', country: 'FR', currency: 'EUR', gateways: ['paypal'], ogLocale: 'fr_FR', hreflang: 'fr' },
  es: { locale: 'es', country: 'ES', currency: 'EUR', gateways: ['paypal'], ogLocale: 'es_ES', hreflang: 'es' },
};
