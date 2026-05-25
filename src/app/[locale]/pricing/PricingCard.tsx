'use client'

import { useState } from 'react'
import {
  getDisplayPrice,
  getOriginalPrice,
} from '@/lib/pricing'
import type { CountryCode, CurrencyCode, PaymentGateway, BillingPeriod } from '@/lib/types'

type Props = {
  t: (key: string) => string
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

export function PricingCard({
  t,
  locale,
  country,
  currency,
  gateway,
  monthly,
  quarterly,
  yearly,
  quarterlyDiscountPct,
  yearlyDiscountPct,
}: Props) {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [loading, setLoading] = useState(false)

  const price =
    period === 'monthly' ? monthly : period === 'quarterly' ? quarterly : yearly
  const discountPct =
    period === 'quarterly' ? quarterlyDiscountPct : period === 'yearly' ? yearlyDiscountPct : 0
  const original = getOriginalPrice(country, period)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const endpoint =
        gateway === 'paypal'
          ? '/api/paypal/create-order'
          : gateway === 'alipay_cn'
            ? '/api/alipay/create-order'
            : '/api/alipay/create-order'

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'plus', period, locale }),
      })

      if (!res.ok) throw new Error('Payment init failed')

      const data = await res.json()

      if (gateway === 'paypal' && data.orderID) {
        // In future: redirect to PayPal or open modal
        alert(`PayPal Order: ${data.orderID}`)
      } else if (data.payUrl) {
        // Alipay: redirect to Alipay cashier
        window.location.href = data.payUrl
      } else {
        throw new Error('No payment URL returned')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const gatewayButtonText =
    gateway === 'alipay_cn'
      ? '支付宝支付'
      : gateway === 'alipay_hk'
        ? 'AlipayHK 支付'
        : 'PayPal 支付'

  return (
    <div className="mt-6 space-y-3">
      {/* Period selector */}
      <div className="flex rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-800">
        {(['monthly', 'quarterly', 'yearly'] as BillingPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 rounded-full py-2 text-xs font-medium transition-colors ${
              period === p
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {t(`pricing.period.${p}`)}
          </button>
        ))}
      </div>

      {/* Price display */}
      <div className="text-center">
        <span className="text-xl font-bold">
          {getDisplayPrice(price, currency)}
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          /{t(`pricing.per.${period}`)}
        </span>
        {discountPct > 0 && (
          <div className="text-xs text-green-600 dark:text-green-400">
            <span className="line-through text-zinc-400">
              {getDisplayPrice(original, currency)}
            </span>{' '}
            {t('pricing.save').replace('{discount}', String(discountPct))}
          </div>
        )}
      </div>

      {/* Checkout button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-full bg-purple-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ Processing...' : gatewayButtonText}
      </button>

      {gateway === 'paypal' && (
        <p className="text-center text-xs text-zinc-400">
          🔒 {t('pricing.secure')}
        </p>
      )}
    </div>
  )
}