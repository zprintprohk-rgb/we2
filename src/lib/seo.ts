import { routing, type Locale } from '@/i18n/routing'

// --- Site-wide config -------------------------------------------------------
export const siteConfig = {
  name: 'We2',
  taglineKey: 'seo.tagline',
  url: 'https://we2.com',
  ogImage: '/og-image.png',
  twitterHandle: '@we2app',
} as const

// --- Canonical & alternate links --------------------------------------------
export function generateAlternateLinks(path: string = ''): Record<string, string> {
  const links: Record<string, string> = {}
  for (const locale of routing.locales) {
    links[locale] = `${siteConfig.url}/${locale}${path}`
  }
  links['x-default'] = `${siteConfig.url}/${routing.defaultLocale}${path}`
  return links
}

export function getCanonicalUrl(locale: Locale, path: string = ''): string {
  return `${siteConfig.url}/${locale}${path}`
}

// --- Structured data (JSON-LD) ----------------------------------------------
// WebSite schema
export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'A private space for couples — shared journal, mood tracking, dream wall, and more.',
    inLanguage: routing.locales.map((l) => l.replace('-', '_')),
  }
}

// FAQ schema
export function faqSchema(items: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

// SoftwareApplication schema (per locale descriptions)
const softwareDescriptions: Partial<Record<Locale, string>> = {
  en: 'A private space for couples — shared journal, mood tracking, dream wall, and digital pet companion.',
  'zh-cn': '情侣专属私密空间——共享日记、心情追踪、梦想墙和数字宠物伴侣。',
  'zh-tw': '情侶專屬私密空間——共享日記、心情追蹤、夢想牆和數位寵物伴侶。',
  ja: 'カップルのためのプライベートスペース——共有日記、気分トラッキング、夢の壁、デジタルペット。',
  ko: '커플을 위한 프라이빗 공간 — 공유 일기, 기분 추적, 꿈의 벽, 디지털 펫.',
  de: 'Ein privater Raum für Paare — gemeinsames Tagebuch, Stimmungstracking, Traumwand und digitales Haustier.',
  fr: 'Un espace privé pour les couples — journal partagé, suivi d\'humeur, mur de rêves et animal numérique.',
  es: 'Un espacio privado para parejas — diario compartido, seguimiento de estado de ánimo, muro de sueños y mascota digital.',
}

export function generateSoftwareSchema(locale: Locale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'We2',
    url: `${siteConfig.url}/${locale}`,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any',
    description: softwareDescriptions[locale] ?? softwareDescriptions.en,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '10000',
    },
    inLanguage: locale.replace('-', '_'),
  }
}

// Organization schema
export function organizationSchema(locale: Locale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'We2',
    url: `${siteConfig.url}/${locale}`,
    logo: `${siteConfig.url}/logo.png`,
    sameAs: [
      'https://twitter.com/we2app',
      'https://github.com/we2app',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@we2.com',
      availableLanguage: routing.locales,
    },
  }
}

// BreadcrumbList schema
export function breadcrumbSchema(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// --- GEO helpers for hreflang + alternate -----------------------------------
export const geoMarketMap: Record<string, Locale> = {
  HK: 'zh-tw',
  TW: 'zh-tw',
  CN: 'zh-cn',
  JP: 'ja',
  KR: 'ko',
  DE: 'de',
  FR: 'fr',
  ES: 'es',
}

export function geoCountryToLocale(country: string): Locale {
  return geoMarketMap[country] ?? routing.defaultLocale
}

// --- Per-locale market metadata ---------------------------------------------
export const marketMeta: Record<Locale, { region: string; currency: string; ogLocale: string }> = {
  en: { region: 'US', currency: 'USD', ogLocale: 'en_US' },
  'zh-cn': { region: 'CN', currency: 'CNY', ogLocale: 'zh_CN' },
  'zh-tw': { region: 'TW', currency: 'TWD', ogLocale: 'zh_TW' },
  ja: { region: 'JP', currency: 'JPY', ogLocale: 'ja_JP' },
  ko: { region: 'KR', currency: 'KRW', ogLocale: 'ko_KR' },
  de: { region: 'DE', currency: 'EUR', ogLocale: 'de_DE' },
  fr: { region: 'FR', currency: 'EUR', ogLocale: 'fr_FR' },
  es: { region: 'ES', currency: 'EUR', ogLocale: 'es_ES' },
}