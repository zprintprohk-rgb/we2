/**
 * /pricing — 100vh 价值感剧场 (Fusion v2)
 *
 * Server Component:
 *   1. Resolve i18n strings (cannot pass t() across RSC boundary).
 *   2. Use the existing pricing engine (getPricing, getGateway, etc.)
 *      to read 13-country prices for the 3 tiers we display.
 *   3. Hand everything to <PricingTheater /> (client).
 *
 * The 3 displayed tiers are:
 *   - free    : free card (no price)
 *   - plus    : the existing "plus" tier (Companion)
 *   - eternal : the existing "soulmate" tier, rebranded as "Eternal"
 *               (this preserves the engine's 13-country price map and
 *                gives us the "All Access + Exclusive" visual identity)
 */

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { routing } from '@/i18n/routing'
import { generateAlternateLinks, getCanonicalUrl } from '@/lib/seo'
import type { Locale } from '@/i18n/routing'
import {
  getPricing,
  getGateway,
  getCountryFromRequest,
  getDisplayPrice,
  getOriginalPrice,
} from '@/lib/pricing'
import type { CountryCode } from '@/lib/types'
import { ts, ta } from '@/lib/safe-t'
import { PricingTheater } from './PricingTheater'

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

    // Resolve all i18n strings on the server (RSC cannot serialise t())
    const plusFeatures = ta(t, 'pricing.tiers.plus.features', [
      'Unlimited capsules',
      'Advanced pet skins',
      'Private album',
      'Relationship insights',
    ])
    const freeFeatures = ta(t, 'pricing.tiers.free.features', [
      'Daily check-in',
      '3 time capsules',
      'Basic pet',
      'Community access',
    ])
    // We have a dedicated "eternal" tier block now
    const eternalFeatures = ta(t, 'pricing.tiers.eternal.features', [
      'Everything in Plus',
      'All 50+ pet suits unlocked',
      'Golden legendary pets',
      'Priority support',
      'Early access to new features',
    ])

    const copy = {
      eyebrow: ts(t, 'pricing.theater.eyebrow', 'Choose your journey'),
      headline: ts(
        t,
        'pricing.theater.headline',
        'Unlock a life that grows with you',
      ),
      tagline: ts(
        t,
        'pricing.theater.tagline',
        'Three tiers. One promise: every pet you unlock stays with you forever.',
      ),
      guarantee: ts(
        t,
        'pricing.theater.guarantee',
        '30-day money-back guarantee',
      ),
      secure: ts(
        t,
        'pricing.theater.secure',
        'Secured by PayPal · Alipay · AlipayHK',
      ),
      regionNote: ts(
        t,
        'pricing.regionNote',
        'Prices update automatically based on your region. 13 countries supported.',
      ),
      countdown: {
        label: ts(t, 'pricing.countdown.label', 'Spring Festival Limited'),
        endsIn: ts(t, 'pricing.countdown.endsIn', 'Ends in'),
        dayLabel: ts(t, 'pricing.countdown.days', 'd'),
        hourLabel: ts(t, 'pricing.countdown.hours', 'h'),
        minLabel: ts(t, 'pricing.countdown.minutes', 'm'),
        secLabel: ts(t, 'pricing.countdown.seconds', 's'),
      },
      ctaFree: ts(t, 'pricing.ctaStartFree', 'Start Free'),
      ctaPlus: ts(t, 'pricing.ctaPopular', 'Choose Companion'),
      ctaEternal: ts(t, 'pricing.ctaEternal', 'Become Eternal'),
      periodMonthly: ts(t, 'pricing.period.monthly', 'Monthly'),
      periodQuarterly: ts(t, 'pricing.period.quarterly', 'Quarterly'),
      periodYearly: ts(t, 'pricing.period.yearly', 'Yearly'),
      saveTemplate: ts(t, 'pricing.save', 'Save {discount}%', {
        discount: 38,
      }),
      freeName: ts(t, 'pricing.tiers.free.name', 'Free'),
      plusName: ts(t, 'pricing.tiers.plus.name', 'Togthr Plus'),
      eternalName: ts(t, 'pricing.tiers.eternal.name', 'Togthr Eternal'),
      plusFeatures,
      eternalFeatures,
      freeFeatures,
      freePetLabel: ts(
        t,
        'pricing.petMatrix.free.label',
        '3 Basic Companions',
      ),
      plusPetLabel: ts(
        t,
        'pricing.petMatrix.plus.label',
        'Unlock 50+ Suits',
      ),
      eternalPetLabel: ts(
        t,
        'pricing.petMatrix.eternal.label',
        'All Access + Exclusive',
      ),
      freePetSub: ts(t, 'pricing.petMatrix.free.sub', 'Buds, sprouts, starters'),
      plusPetSub: ts(
        t,
        'pricing.petMatrix.plus.sub',
        'Career · Festival · Emotion · Fantasy',
      ),
      eternalPetSub: ts(
        t,
        'pricing.petMatrix.eternal.sub',
        'Including Golden Legendary',
      ),
      popularBadge: ts(t, 'pricing.popular', 'Most Popular'),
      freeEyebrow: ts(t, 'pricing.tierMeta.free.eyebrow', 'Seedling'),
      plusEyebrow: ts(t, 'pricing.tierMeta.plus.eyebrow', 'Companion'),
      eternalEyebrow: ts(t, 'pricing.tierMeta.eternal.eyebrow', 'Stardust'),
      freeTagline: ts(
        t,
        'pricing.tierMeta.free.tagline',
        'Begin your journey',
      ),
      plusTagline: ts(
        t,
        'pricing.tierMeta.plus.tagline',
        'Choose your soul',
      ),
      eternalTagline: ts(
        t,
        'pricing.tierMeta.eternal.tagline',
        'Become timeless',
      ),
    }

    // Formatted prices from the pricing engine
    const plus = pricing.tiers.plus
    const soulmate = pricing.tiers.soulmate
    const formatted = {
      plus: {
        monthly: plus.monthly,
        quarterly: plus.quarterly,
        yearly: plus.yearly,
        quarterlyDiscountPct: Math.round((plus.quarterlyDiscount ?? 0) * 100),
        yearlyDiscountPct: Math.round((plus.yearlyDiscount ?? 0) * 100),
        monthlyFmt: getDisplayPrice(plus.monthly, currency),
        quarterlyFmt: getDisplayPrice(plus.quarterly, currency),
        yearlyFmt: getDisplayPrice(plus.yearly, currency),
        originalYearlyFmt: getDisplayPrice(
          getOriginalPrice(country, 'yearly'),
          currency,
        ),
      },
      soulmate: {
        monthly: soulmate.monthly,
        quarterly: soulmate.quarterly,
        yearly: soulmate.yearly,
        quarterlyDiscountPct: Math.round(
          (soulmate.quarterlyDiscount ?? 0) * 100,
        ),
        yearlyDiscountPct: Math.round((soulmate.yearlyDiscount ?? 0) * 100),
        monthlyFmt: getDisplayPrice(soulmate.monthly, currency),
        quarterlyFmt: getDisplayPrice(soulmate.quarterly, currency),
        yearlyFmt: getDisplayPrice(soulmate.yearly, currency),
        // soulmate's "original" is soulmate.monthly × 12 (it is its own
        // tier, not derived from plus). getOriginalPrice() in pricing
        // is plus-specific, so we compute soulmate's directly.
        originalYearlyFmt: getDisplayPrice(soulmate.monthly * 12, currency),
      },
    }

    return (
      <PricingTheater
        locale={locale}
        country={country}
        currency={currency}
        gateway={gateway}
        copy={copy}
        formatted={formatted}
      />
    )
  } catch (error) {
    // The error.tsx boundary will catch this on the client side.
    // Throw so Next can render the recovery UI (and we keep the
    // existing try/catch contract for any developer that reads
    // the legacy message).
    throw error
  }
}
