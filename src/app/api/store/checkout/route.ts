/**
 * /api/store/checkout — Day 1 stub.
 *
 * Accepts POST from StoreBuyButton with { country, currency, price, sku }.
 *
 * MVP Day 1: returns a friendly "Day 2 PayPal wiring" message so the UI
 * button doesn't 404. Order is logged server-side for analytics.
 *
 * Day 2 will: create Supabase order row → redirect to PayPal sandbox
 * approval URL → webhook confirms → unlock skin in Supabase.
 *
 * SECURITY: rate-limited to 5 req / min / IP (handled by Cloudflare
 * WAF in production). No PII stored at this stage.
 */

import { NextRequest, NextResponse } from 'next/server'

interface CheckoutRequest {
  country?: string
  currency?: string
  price?: number
  sku?: string
}

export const runtime = 'nodejs' // need Node for Supabase SDK

export async function POST(req: NextRequest) {
  let body: CheckoutRequest = {}
  try {
    body = (await req.json()) as CheckoutRequest
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { country, currency, price, sku } = body

  // Server-side log (no PII — no email, no user id at this stage)
  console.log('[store/checkout]', {
    sku: sku ?? 'unknown',
    country: country ?? 'unknown',
    currency: currency ?? 'unknown',
    price: price ?? 0,
    ts: new Date().toISOString(),
  })

  // Day 1 stub: tell the client PayPal wiring is in progress.
  // The UI already shows this message in StoreBuyButton when the
  // response is non-2xx, but we return 200 with a structured payload
  // so the client can render a clean "coming soon" card.
  return NextResponse.json(
    {
      ok: true,
      stage: 'mvp_day_1',
      message:
        'PayPal sandbox wiring is scheduled for Day 2. The blind box UI is live; checkout flow will be enabled in the next release.',
      eta: 'Day 2 of 3-day skin store MVP',
      redirectUrl: null,
    },
    { status: 200 },
  )
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'store/checkout',
      stage: 'mvp_day_1',
      method: 'POST only',
    },
    { status: 200 },
  )
}
