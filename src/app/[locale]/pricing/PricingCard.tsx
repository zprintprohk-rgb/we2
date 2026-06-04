'use client'

/**
 * PricingCard - Plus tier interactive card.
 *
 * Renders three billing-period tabs (monthly / quarterly / yearly),
 * shows the localised price, the strike-through original amount for
 * the discounted period, and a checkout link that points at the
 * correct payment gateway for the user's country.
 *
 * V7.1: brand-agnostic, no age-gap specific copy. All text is passed
 * as pre-translated strings from the Server Component (RSC cannot
 * serialise the t() function across the RSC→Client boundary).
 */

import { useState } from 'react'
import type { CurrencyCode, PaymentGateway, CountryCode } from '@/lib/types'
import { getDisplayPrice } from '@/lib/pricing'

type Period = 'monthly' | 'quarterly' | 'yearly'

interface PricingCardProps {
  // Pre-translated strings (resolved in the Server Component)
  labels: {
    monthly: string
    quarterly: string
    yearly: string
    saveTemplate: string  // e.g. "Save {discount}%" — we apply .replace here
    cta: string           // e.g. "Get Started"
  }
  locale: string
  country: CountryCode
  currency: CurrencyCode
  gateway: PaymentGateway
  monthly: number
  quarterly: number
  yearly: number
  quarterlyDiscountPct: number
  yearlyDiscountPct: number
}

const GATEWAY_LABEL: Record<PaymentGateway, string> = {
  alipay_cn: 'Alipay',
  alipay_hk: 'AlipayHK',
  paypal: 'PayPal',
}

export function PricingCard(props: PricingCardProps) {
  const {
    labels,
    country,
    currency,
    gateway,
    monthly,
    quarterly,
    yearly,
    quarterlyDiscountPct,
    yearlyDiscountPct,
  } = props

  const [period, setPeriod] = useState<Period>('yearly')

  const amount =
    period === 'monthly' ? monthly : period === 'quarterly' ? quarterly : yearly

  const discountPct =
    period === 'yearly'
      ? yearlyDiscountPct
      : period === 'quarterly'
        ? quarterlyDiscountPct
        : 0

  const original =
    period === 'yearly'
      ? monthly * 12
      : period === 'quarterly'
        ? monthly * 3
        : monthly

  const checkoutHref = `/api/payments/${gateway}/create?country=${country}&period=${period}`

  return (
    <div className="mt-6 space-y-3">
      <div
        role="tablist"
        aria-label="Billing period"
        className="grid grid-cols-3 gap-1 rounded-full bg-zinc-100 p-1 text-xs font-medium dark:bg-zinc-800"
      >
        {(['monthly', 'quarterly', 'yearly'] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={period === p}
            onClick={() => setPeriod(p)}
            className={`rounded-full py-1.5 transition-colors ${
              period === p
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {labels[p]}
          </button>
        ))}
      </div>

      {discountPct > 0 && (
        <p className="text-center text-xs text-green-600 dark:text-green-400">
          {labels.saveTemplate.replace('{discount}', String(discountPct))}
          {original > amount && (
            <>
              {' · '}
              <span className="line-through text-zinc-400">
                {getDisplayPrice(original, currency)}
              </span>
            </>
          )}
        </p>
      )}

      <a
        href={checkoutHref}
        className="block rounded-full bg-purple-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-purple-700"
      >
        {labels.cta} - {GATEWAY_LABEL[gateway]}
      </a>
    </div>
  )
}

export default PricingCard
