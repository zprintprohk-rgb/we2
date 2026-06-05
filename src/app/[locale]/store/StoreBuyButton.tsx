'use client'

import { useState } from 'react'
import type { CountryCode, CurrencyCode } from '@/lib/types'

/**
 * StoreBuyButton — MVP Day 2 of skin-store.
 *
 * POSTs to /api/store/checkout which:
 *   1. Returns 200 + redirectUrl → redirect to PayPal sandbox approval
 *   2. Returns 503 (awaiting_paypal_config) → show "configure PayPal" hint
 *   3. Returns 5xx → show generic error
 *
 * The ¥199 first-order price is passed from the parent (matches V2.5.1
 * pricing — first order 5折 of ¥399 regular).
 */
interface Props {
  country: CountryCode
  currency: CurrencyCode
  price: number
  label: string
}

export function StoreBuyButton({ country, currency, price, label }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    setHint(null)
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, currency, price, sku: 'blindbox_6plus1' }),
      })
      const data = await res.json().catch(() => ({} as Record<string, unknown>))

      // 200 + redirectUrl → PayPal approval page
      if (res.ok && data?.redirectUrl) {
        window.location.href = data.redirectUrl as string
        return
      }

      // 503 / awaiting_paypal_config → friendly "configure PayPal" hint
      if (res.status === 503 && data?.stage === 'awaiting_paypal_config') {
        setHint(
          (data.message as string) ??
            'Checkout is wired. PayPal sandbox credentials are needed to go live.',
        )
        return
      }

      // 5xx / other error
      setError(
        (data?.error as string) ??
          `Checkout error (${res.status}). Please try again in a moment.`,
      )
    } catch (err) {
      setError('Network error. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:from-rose-600 hover:to-purple-700 hover:shadow-purple-500/50 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? '⏳ Connecting to PayPal...' : `🛒 ${label}`}
      </button>
      {hint && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          💡 {hint}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}
