import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { routing } from '@/i18n/routing'
import { generateAlternateLinks, getCanonicalUrl } from '@/lib/seo'
import type { Locale } from '@/i18n/routing'
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
import { ts, ta } from '@/lib/safe-t'

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
  try {
    const { locale } = await params
    const t = await getTranslations({ locale })

    return {
      title: t('pricing.title'),
      description: t('pricing.subtitle'),
      alternates: {
        canonical: getCanonicalUrl(locale as Locale, '/pricing'),
        languages: generateAlternateLinks('/pricing'),
      },
      openGraph: {
        title: t('pricing.title'),
        description: t('pricing.subtitle'),
      },
    }
  } catch (error) {
    console.error('[pricing] generateMetadata failed:', error)
    return {
      title: 'Pricing',
      description: 'Pricing page error',
    }
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
  try {
    const { locale } = await params
    const t = await getTranslations({ locale })
    const h = await headers()
    const country: CountryCode = getCountryFromRequest(h)
    const pricing = getPricing(country)
    const gateway = getGateway(country)
    const currency = pricing.currency

    // Build tier data from the pricing engine
    // Pre-resolve all i18n strings on the server (RSC cannot serialise
    // the t() function across the RSC→Client boundary).
    const saveTemplate = ts(t, 'pricing.save', 'Save {discount}%', { discount: 60 })
    const labels = {
      monthly: ts(t, 'pricing.period.monthly', 'Monthly'),
      quarterly: ts(t, 'pricing.period.quarterly', 'Quarterly'),
      yearly: ts(t, 'pricing.period.yearly', 'Yearly'),
      saveTemplate,
      cta: ts(t, 'pricing.cta', 'Get Started'),
    }

    const tiers = [
      {
        key: 'free' as const,
        badge: null,
        monthly: 0,
        quarterly: 0,
        yearly: 0,
      },
      {
        key: 'plus' as const,
        badge: ts(t, 'pricing.popular', 'Most Popular'),
        monthly: getPrice(country, 'plus', 'monthly'),
        quarterly: pricing.tiers.plus.quarterly,
        yearly: pricing.tiers.plus.yearly,
      },
      {
        key: 'soulmate' as const,
        badge: ts(t, 'pricing.new', 'New'),
        monthly: getPrice(country, 'soulmate', 'monthly'),
        quarterly: pricing.tiers.soulmate.quarterly,
        yearly: pricing.tiers.soulmate.yearly,
      },
    ]

    // Payment gateway badges
    const gatewayBadges = [
      ...(gateway === 'alipay_cn' ? [{ emoji: '💰', label: 'Alipay' }] : []),
      ...(gateway === 'alipay_hk' ? [{ emoji: '🏦', label: 'AlipayHK' }, { emoji: '💳', label: 'PayPal' }] : []),
      ...(gateway === 'paypal' ? [{ emoji: '💳', label: 'PayPal' }] : []),
    ]

    return (
      <div className="relative mx-auto max-w-6xl overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#0f0524] to-[#0a0118] px-4 py-16 sm:py-24 text-zinc-100">
        {/* ── Atmospheric layers (CSS-only, SSR-safe) ── */}
        <div className="pointer-events-none absolute inset-0">
          {/* Constellation (40 faint stars) */}
          {Array.from({ length: 40 }, (_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-zinc-200"
              style={{
                top: `${(i * 47) % 100}%`,
                left: `${(i * 79) % 100}%`,
                width: (i % 4) + 1,
                height: (i % 4) + 1,
                opacity: 0.4,
              }}
            />
          ))}
          {/* Bokeh */}
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                top: `${20 + (i * 41) % 65}%`,
                left: `${(i * 47) % 100}%`,
                width: 80 + (i * 17) % 80,
                height: 80 + (i * 17) % 80,
                background: `radial-gradient(circle, hsla(${280 + (i * 27) % 60}, 70%, 50%, 0.15) 0%, transparent 70%)`,
              }}
            />
          ))}
          {/* Holographic radial */}
          <div
            className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/3"
            style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.15) 0%, transparent 70%)' }}
          />
        </div>

        {/* Hero */}
        <div className="relative z-10 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/80 sm:text-sm">
            ✦ Choose your journey ✦
          </p>
          <h1 className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
            {t('pricing.title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-300/90">
            {t('pricing.subtitle')}
          </p>

          {/* Payment badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {gatewayBadges.map(({ emoji, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200 backdrop-blur"
              >
                {emoji} {label}
              </span>
            ))}

            {/* Show detected country for transparency (disabled in Workers — no process.env) */}
            {false && (
              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                {pricing.country} · {currency}
              </span>
            )}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="relative z-10 mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map(({ key, badge, monthly, quarterly, yearly }) => {
            const name = t(`pricing.tiers.${key}.name`)
            const features = ta(t, `pricing.tiers.${key}.features`, [])
            const isActive = key === 'plus'

            // For plus tier, calculate discount savings
            const yearlyDiscountPct = isActive ? getDiscountPercent(country, 'yearly') : 0
            const originalYearly = isActive ? getOriginalPrice(country, 'yearly') : 0

            return (
              <div
                key={key}
                className={`group relative flex flex-col rounded-3xl border bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                  badge
                    ? 'border-amber-300/40 ring-2 ring-amber-300/20'
                    : 'border-white/10 hover:border-amber-300/30 hover:bg-white/10'
                }`}
              >
                {badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
                    {badge}
                  </span>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-zinc-100">{name}</h3>

                  {isActive ? (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="bg-gradient-to-r from-amber-200 to-rose-200 bg-clip-text text-3xl font-bold text-transparent">
                          {getDisplayPrice(monthly, currency)}
                        </span>
                        <span className="text-sm text-zinc-400">
                          /mo
                        </span>
                      </div>
                      {/* Yearly save badge */}
                      {yearlyDiscountPct > 0 && (
                        <div className="text-xs text-emerald-400">
                          {getDisplayPrice(yearly, currency)}/yr —{' '}
                          <span className="line-through text-zinc-500">
                            {getDisplayPrice(originalYearly, currency)}
                          </span>{' '}
                          {saveTemplate.replace('{discount}', String(yearlyDiscountPct))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 flex items-baseline justify-center gap-1">
                      <span className="bg-gradient-to-r from-amber-200 to-rose-200 bg-clip-text text-3xl font-bold text-transparent">
                        {monthly === 0 ? t('pricing.free') : getDisplayPrice(monthly, currency)}
                      </span>
                    </div>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-2">
                  {features.map((feat, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-zinc-300"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400"
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
                  <PricingCard
                    labels={labels}
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
                    className={`mt-6 block rounded-full py-2.5 text-center text-sm font-semibold transition-all ${
                      badge
                        ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white shadow-lg shadow-rose-500/30 hover:from-amber-500 hover:to-rose-600'
                        : 'border border-white/15 bg-white/5 text-zinc-100 backdrop-blur hover:bg-white/10 hover:border-amber-300/30'
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
        <div className="relative z-10 mt-12 mx-auto max-w-sm">
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-1 py-1 shadow-sm backdrop-blur">
            <input
              type="text"
              placeholder={t('pricing.promoPlaceholder')}
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
              disabled
            />
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-zinc-300">
              {t('pricing.promoApply')}
            </span>
          </div>
          <p className="mt-2 text-center text-xs text-zinc-500">
            {t('pricing.promoHint')}
          </p>
        </div>

        {/* Guarantee */}
        <p className="relative z-10 mt-6 text-center text-sm text-zinc-400">
          🛡️ {t('pricing.guarantee')}
        </p>
      </div>
    )
  } catch (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Pricing Page Error</h1>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
          <pre className="text-sm text-red-800 dark:text-red-400 whitespace-pre-wrap">
            {JSON.stringify(
              {
                message: (error as Error).message,
                stack: (error as Error).stack,
                name: (error as Error).name,
              },
              null,
              2
            )}
          </pre>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          Digest: 521802265 (before fix) → now showing real error
        </p>
      </div>
    )
  }
}
