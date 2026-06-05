'use client'

/**
 * PricingTheater — 100vh 价值感剧场 (Fusion v2)
 *
 * Layout:
 *   - Full-bleed cosmic background (--bg-cosmic, never pure black)
 *   - Top-down cone spotlight (radial gradient)
 *   - Eyebrow + headline + countdown chip
 *   - 3-card grid (Free / Companion / Eternal) with visual drop
 *   - Footer: gateway badges + 13-country reassurance line
 *
 * The client owns:
 *   - Period selector state (monthly | quarterly | yearly) — affects
 *     only the Companion & Eternal card prices.
 *   - Burst trigger counters (one per card) — fired by TierCard click.
 *
 * Pricing data is passed in from the Server Component.
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TierCard, type TierCardData } from './TierCard'
import { CountdownTimer } from './CountdownTimer'
import { EmotionParticles } from '@/components/shared/EmotionParticles'
import { Lock, ShieldCheck, Globe2 } from 'lucide-react'
import type { CurrencyCode, PaymentGateway, CountryCode } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { PricingTier } from './pet-data'

interface TierPriceData {
  monthly: number
  quarterly: number
  yearly: number
  quarterlyDiscountPct: number
  yearlyDiscountPct: number
}

export interface PricingTheaterProps {
  locale: string
  country: CountryCode
  currency: CurrencyCode
  gateway: PaymentGateway
  /** Pre-translated copy */
  copy: {
    eyebrow: string
    headline: string
    tagline: string
    guarantee: string
    secure: string
    regionNote: string
    countdown: {
      label: string
      endsIn: string
      dayLabel: string
      hourLabel: string
      minLabel: string
      secLabel: string
    }
    ctaFree: string
    ctaPlus: string
    ctaEternal: string
    periodMonthly: string
    periodQuarterly: string
    periodYearly: string
    saveTemplate: string
    freeName: string
    plusName: string
    eternalName: string
    plusFeatures: string[]
    eternalFeatures: string[]
    freeFeatures: string[]
    freePetLabel: string
    plusPetLabel: string
    eternalPetLabel: string
    freePetSub: string
    plusPetSub: string
    eternalPetSub: string
    popularBadge: string
    freeEyebrow: string
    plusEyebrow: string
    eternalEyebrow: string
    freeTagline: string
    plusTagline: string
    eternalTagline: string
  }
  /** All monetary values come from the pricing engine, pre-formatted */
  formatted: {
    plus: TierPriceData & {
      monthlyFmt: string
      quarterlyFmt: string
      yearlyFmt: string
      originalYearlyFmt: string
    }
    soulmate: TierPriceData & {
      monthlyFmt: string
      quarterlyFmt: string
      yearlyFmt: string
      originalYearlyFmt: string
    }
  }
}

const GATEWAY_LABEL: Record<PaymentGateway, string> = {
  alipay_cn: 'Alipay',
  alipay_hk: 'AlipayHK',
  paypal: 'PayPal',
}

export function PricingTheater({
  locale,
  country,
  currency,
  gateway,
  copy,
  formatted,
}: PricingTheaterProps) {
  const prefersReduced = useReducedMotion()

  // Period selector (drives both paid-tier cards).
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('yearly')

  // Burst trigger counters (per tier)
  const [burstTriggers, setBurstTriggers] = useState({
    plus: 0,
    eternal: 0,
  })

  const fireBurst = (tier: PricingTier) => {
    if (tier === 'free') return
    setBurstTriggers((prev) => ({ ...prev, [tier]: prev[tier] + 1 }))
  }

  // Build display values for each tier based on period
  const plusPrice = (() => {
    if (period === 'monthly') return formatted.plus.monthlyFmt
    if (period === 'quarterly') return formatted.plus.quarterlyFmt
    return formatted.plus.yearlyFmt
  })()

  const plusSub = (() => {
    if (period === 'monthly') return `/${copy.periodMonthly}`
    if (period === 'quarterly') return `/${copy.periodQuarterly}`
    return `/${copy.periodYearly}`
  })()

  const plusSave = (() => {
    if (period === 'monthly') return null
    const pct =
      period === 'yearly'
        ? formatted.plus.yearlyDiscountPct
        : formatted.plus.quarterlyDiscountPct
    return copy.saveTemplate.replace('{discount}', String(pct))
  })()

  const plusOriginal = period === 'monthly' ? null : formatted.plus.originalYearlyFmt

  const soulmatePrice = (() => {
    if (period === 'monthly') return formatted.soulmate.monthlyFmt
    if (period === 'quarterly') return formatted.soulmate.quarterlyFmt
    return formatted.soulmate.yearlyFmt
  })()

  const soulmateSub = (() => {
    if (period === 'monthly') return `/${copy.periodMonthly}`
    if (period === 'quarterly') return `/${copy.periodQuarterly}`
    return `/${copy.periodYearly}`
  })()

  const eternalSave = (() => {
    if (period === 'monthly') return null
    const pct =
      period === 'yearly'
        ? formatted.soulmate.yearlyDiscountPct
        : formatted.soulmate.quarterlyDiscountPct
    return copy.saveTemplate.replace('{discount}', String(pct))
  })()

  const eternalOriginal =
    period === 'monthly' ? null : formatted.soulmate.originalYearlyFmt

  const buildCheckoutHref = (tier: 'plus' | 'soulmate') =>
    `/api/payments/${gateway}/create?country=${country}&tier=${tier}&period=${period}`

  // Build the three TierCard payloads
  const freeCard: TierCardData = {
    tier: 'free',
    eyebrow: copy.freeEyebrow,
    name: copy.freeName,
    tagline: copy.freeTagline,
    price: '0',
    priceSub: '',
    features: copy.freeFeatures,
    petLabel: copy.freePetLabel,
    petSub: copy.freePetSub,
    cta: copy.ctaFree,
    badge: null,
  }

  const plusCard: TierCardData = {
    tier: 'plus',
    eyebrow: copy.plusEyebrow,
    name: copy.plusName,
    tagline: copy.plusTagline,
    price: plusPrice,
    priceSub: plusSub,
    originalPrice: plusOriginal ?? undefined,
    saveLabel: plusSave ?? undefined,
    features: copy.plusFeatures,
    petLabel: copy.plusPetLabel,
    petSub: copy.plusPetSub,
    cta: copy.ctaPlus,
    badge: copy.popularBadge,
    checkoutHref: buildCheckoutHref('plus'),
  }

  const eternalCard: TierCardData = {
    tier: 'eternal',
    eyebrow: copy.eternalEyebrow,
    name: copy.eternalName,
    tagline: copy.eternalTagline,
    price: soulmatePrice,
    priceSub: soulmateSub,
    originalPrice: eternalOriginal ?? undefined,
    saveLabel: eternalSave ?? undefined,
    features: copy.eternalFeatures,
    petLabel: copy.eternalPetLabel,
    petSub: copy.eternalPetSub,
    cta: copy.ctaEternal,
    badge: 'Exclusive',
    checkoutHref: buildCheckoutHref('soulmate'),
  }

  return (
    <section
      className="relative isolate min-h-screen overflow-hidden bg-cosmic"
      aria-label="Pricing"
    >
      {/* Atmospheric layers — Spotlight + faint stars */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-down cone spotlight */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-[640px] w-[1100px] -translate-x-1/2 -translate-y-1/4"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(168,85,247,0.22) 0%, rgba(244,114,182,0.10) 35%, transparent 70%)',
          }}
        />
        {/* Petal/pink secondary glow under the Eternal column */}
        <div
          aria-hidden="true"
          className="absolute right-[8%] top-[20%] h-[300px] w-[300px] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)',
          }}
        />
        {/* Constellation */}
        {Array.from({ length: 50 }, (_, i) => (
          <span
            key={`star-${i}`}
            aria-hidden="true"
            className="absolute rounded-full bg-zinc-200"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 71) % 100}%`,
              width: (i % 4) + 1,
              height: (i % 4) + 1,
              opacity: 0.35,
            }}
          />
        ))}
      </div>

      {/* Subtle ambient particles */}
      <EmotionParticles
        kinds={['dust', 'star']}
        intensity={0.4}
        interactive={false}
        className="pointer-events-none absolute inset-0 z-0"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-12 sm:py-16">
        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-semibold uppercase tracking-[0.4em] text-amber-200/80 sm:text-xs"
          >
            ✦ {copy.eyebrow} ✦
          </motion.p>

          <motion.h1
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-transparent">
              {copy.headline}
            </span>
          </motion.h1>

          <motion.p
            initial={prefersReduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-3 max-w-2xl text-base text-zinc-300/90 sm:text-lg"
          >
            {copy.tagline}
          </motion.p>

          {/* Countdown chip */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <CountdownTimer
              label={copy.countdown.label}
              endsIn={copy.countdown.endsIn}
              dayLabel={copy.countdown.dayLabel}
              hourLabel={copy.countdown.hourLabel}
              minLabel={copy.countdown.minLabel}
              secLabel={copy.countdown.secLabel}
            />

            {/* Region badge */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-zinc-200 backdrop-blur"
              aria-label="Region detected"
            >
              <Globe2 className="h-3.5 w-3.5" />
              {country} · {currency} · {GATEWAY_LABEL[gateway]}
            </span>
          </div>

          {/* Period selector */}
          <div
            className="mt-7 inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] p-1 backdrop-blur"
            role="tablist"
            aria-label="Billing period"
          >
            {(['monthly', 'quarterly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm',
                  period === p
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-100',
                )}
              >
                {p === 'monthly'
                  ? copy.periodMonthly
                  : p === 'quarterly'
                    ? copy.periodQuarterly
                    : copy.periodYearly}
              </button>
            ))}
          </div>
        </header>

        {/* Tier grid */}
        <div className="mt-10 grid gap-5 sm:gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
          <TierCard
            {...freeCard}
            burstTrigger={0}
            onBurst={fireBurst}
          />
          <TierCard
            {...plusCard}
            burstTrigger={burstTriggers.plus}
            onBurst={fireBurst}
          />
          <TierCard
            {...eternalCard}
            burstTrigger={burstTriggers.eternal}
            onBurst={fireBurst}
          />
        </div>

        {/* Footer reassurance */}
        <footer className="mt-10 flex flex-col items-center gap-3 text-center text-xs text-zinc-400 sm:text-sm">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              {copy.guarantee}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-amber-200/80" />
              {copy.secure}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">{copy.regionNote}</p>
        </footer>
      </div>
    </section>
  )
}
