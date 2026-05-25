export const runtime = 'edge'

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { routing } from '@/i18n/routing'
import { generateAlternateLinks, siteConfig } from '@/lib/seo'
import { Link } from '@/i18n/routing'
import {
  getPricing,
  getGateway,
  getCountryFromRequest,
  getDisplayPrice,
  getOriginalPrice,
  getDiscountPercent,
  getPrice,
} from '@/lib/pricing'
import type { CountryCode } from '@/lib/types'

// ─── Static params ────────────────────────────────────────────────────────
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return {
    title: t('pricing.title'),
    description: t('pricing.subtitle'),
    alternates: {
      canonical: `${siteConfig.url}/${locale}/pricing`,
      languages: generateAlternateLinks('/pricing'),
    },
    openGraph: {
      title: t('pricing.title'),
      description: t('pricing.subtitle'),
    },
  }
}

// ─── Client component for interactive pricing card ────────────────────────
import { PricingCard } from './PricingCard'

// ─── Page ─────────────────────────────────────────────────────────────────
export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const h = await headers()
  const country: CountryCode = getCountryFromRequest(h)
  const pricing = getPricing(country)
  const gateway = getGateway(country)
  const currency = pricing.currency

  // Build tier data from the pricing engine
  const tiers = [
    {
      key: 'free' as const,
      badge: null,
      monthly: 0,
      quarterly: 0,
      yearly: 0,
      periodLabel: '',
    },
    {
      key: 'plus' as const,
      badge: t('pricing.popular'),
      monthly: getPrice(country, 'plus', 'monthly'),
      quarterly: pricing.tiers.plus.quarterly,
      yearly: pricing.tiers.plus.yearly,
      periodLabel: t('pricing.tiers.plus.period') || '/mo',
    },
    {
      key: 'premium' as const,
      badge: null,
      monthly: 0,
      quarterly: 0,
      yearly: 0,
      periodLabel: '',
    },
    {
      key: 'lifetime' as const,
      badge: t('pricing.save').replace('{discount}', '60'),
      monthly: 0,
      quarterly: 0,
      yearly: 0,
      periodLabel: '',
    },
  ]

  // Payment gateway badges
  const gatewayBadges = [
    ...(gateway === 'alipay_cn' ? [{ emoji: '💰', label: 'Alipay' }] : []),
    ...(gateway === 'alipay_hk' ? [{ emoji: '🏦', label: 'AlipayHK' }, { emoji: '💳', label: 'PayPal' }] : []),
    ...(gateway === 'paypal' ? [{ emoji: '💳', label: 'PayPal' }] : []),
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {t('pricing.title')}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
          {t('pricing.subtitle')}
        </p>

        {/* Payment badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {gatewayBadges.map(({ emoji, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            >
              {emoji} {label}
            </span>
          ))}

          {/* Show detected country for transparency (can remove in prod) */}
          {process.env.NODE_ENV === 'development' && (
            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
              {pricing.country} · {currency}
            </span>
          )}
        </div>
      </div>

      {/* Pricing cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map(({ key, badge, monthly, quarterly, yearly, periodLabel }) => {
          const name = t(`pricing.tiers.${key}.name`)
          const features = t.raw(`pricing.tiers.${key}.features`) as string[]
          const isActive = key === 'plus'

          // For plus tier, calculate discount savings
          const yearlyDiscountPct = isActive ? getDiscountPercent(country, 'yearly') : 0
          const originalYearly = isActive ? getOriginalPrice(country, 'yearly') : 0

          return (
            <div
              key={key}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900 ${
                badge
                  ? 'border-purple-300 ring-2 ring-purple-100 dark:border-purple-700 dark:ring-purple-900/30'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
                  {badge}
                </span>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold">{name}</h3>

                {isActive ? (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-bold">
                        {getDisplayPrice(monthly, currency)}
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        /mo
                      </span>
                    </div>
                    {/* Yearly save badge */}
                    {yearlyDiscountPct > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {getDisplayPrice(yearly, currency)}/yr —{' '}
                        <span className="line-through text-zinc-400">
                          {getDisplayPrice(originalYearly, currency)}
                        </span>{' '}
                        {t('pricing.save').replace('{discount}', String(yearlyDiscountPct))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">
                      {monthly === 0 ? t('pricing.free') : getDisplayPrice(monthly, currency)}
                    </span>
                  </div>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-2">
                {features.map((feat, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>

              {isActive ? (
                // Interactive pricing card with period selector
                <PricingCard
                  t={t}
                  locale={locale}
                  country={country}
                  currency={currency}
                  gateway={gateway}
                  monthly={monthly}
                  quarterly={quarterly}
                  yearly={yearly}
                  quarterlyDiscountPct={getDiscountPercent(country, 'quarterly')}
                  yearlyDiscountPct={yearlyDiscountPct}
                />
              ) : (
                <Link
                  href="/login"
                  className={`mt-6 block rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${
                    badge
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
                  }`}
                >
                  {key === 'free' ? t('pricing.ctaFree') : t('pricing.cta')}
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Promo code input (placeholder for future batch) */}
      <div className="mt-12 mx-auto max-w-sm">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-1 py-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <input
            type="text"
            placeholder={t('pricing.promoPlaceholder')}
            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            disabled
          />
          <span className="rounded-full bg-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {t('pricing.promoApply')}
          </span>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-400">
          {t('pricing.promoHint')}
        </p>
      </div>

      {/* Guarantee */}
      <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        🛡️ {t('pricing.guarantee')}
      </p>
    </div>
  )
}