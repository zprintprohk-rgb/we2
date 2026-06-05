'use client'

import { useState } from 'react'
import type { CountryCode, CurrencyCode } from '@/lib/types'

/**
 * StoreBuyButton — MVP Day 1 of skin-store.
 *
 * For now: a single click handler that POSTs to a stub /api/store/checkout
 * endpoint. Once that endpoint exists (Day 2), it will:
 *   1. Create a Supabase order record
 *   2. Redirect to PayPal sandbox approval URL
 *   3. Webhook confirms → unlock skin in Supabase
 *
 * The ¥199 first-order price is HARDCODED for MVP. Day 2 will
 * wire the dynamic CNY→USD conversion via the pricing engine.
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

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      // MVP: post to stub endpoint. Real PayPal sandbox URL wired in Day 2.
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, currency, price, sku: 'blindbox_6plus1' }),
      })
      if (!res.ok) {
        // MVP: endpoint may not exist yet — show a friendly message
        setError('Checkout is wired in Day 2. For now, the layout/UI is live. Stay tuned!')
        return
      }
      const data = await res.json()
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setError('Unexpected response from checkout. Please try again.')
      }
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
        {loading ? '⏳ ...' : `🛒 ${label}`}
      </button>
      {error && (
        <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
          ⚠️ {error}
        </p>
      )}
    </div>
  )
}
