/**
 * /api/store/checkout — Day 2: real PayPal sandbox one-time order.
 *
 * For MVP: creates a PayPal order for a fixed amount (¥199 first-order
 * 5折 of ¥399 blind box), returns the approval URL. The user is
 * redirected to PayPal, pays, then the webhook unlocks the skin.
 *
 * Replaces the Day 1 stub. Requires:
 *   - PAYPAL_CLIENT_ID     (set via `wrangler secret put`)
 *   - PAYPAL_CLIENT_SECRET (set via `wrangler secret put`)
 *   - NEXT_PUBLIC_SITE_URL (already set in wrangler.toml)
 *
 * If env vars are missing, returns a clear 'not configured' error so
 * the UI can show a friendly message instead of crashing.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCountryFromRequest, getDisplayPrice } from '@/lib/pricing'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://togthr.life'

// ─── access-token cache (per-isolate lifetime) ───
let _token: string | null = null
let _tokenExpires = 0

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpires) return _token

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('PAYPAL_NOT_CONFIGURED')
  }

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PAYPAL_AUTH_FAILED: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  _token = data.access_token
  _tokenExpires = Date.now() + (data.expires_in || 32400) * 1000 - 60_000
  return _token!
}

interface CheckoutRequest {
  country?: string
  currency?: string
  price?: number
  sku?: string
}

export const runtime = 'nodejs' // need Node for PayPal SDK + future Supabase

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

  const { country, currency = 'CNY', price, sku = 'blindbox_6plus1' } = body
  const detectedCountry = getCountryFromRequest(req)

  // Server-side log
  console.log('[store/checkout]', {
    sku,
    country: country ?? detectedCountry,
    currency,
    price,
    ts: new Date().toISOString(),
  })

  // Validate price (sanity: must be > 0, < 10000)
  if (!price || price <= 0 || price > 10000) {
    return NextResponse.json(
      { ok: false, error: 'Invalid price' },
      { status: 400 },
    )
  }

  // If PayPal not configured, return a clear error (so UI can show
  // "coming soon" instead of crashing).
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        stage: 'awaiting_paypal_config',
        error: 'PayPal sandbox credentials not yet configured. UI is live; checkout unlocks when PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set via `wrangler secret put`.',
        redirectUrl: null,
        message: '🧪 Checkout is wired. Run `wrangler secret put PAYPAL_CLIENT_ID` and `wrangler secret put PAYPAL_CLIENT_SECRET` to unlock.',
      },
      { status: 503 },
    )
  }

  // Create PayPal order
  try {
    const accessToken = await getAccessToken()

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: price.toFixed(2),
          },
          custom_id: sku,
          description: `Togthr Companions 6+1 Blind Box (first order 5折)`,
        },
      ],
      application_context: {
        brand_name: 'Togthr',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${SITE_URL}/store/success`,
        cancel_url: `${SITE_URL}/store`,
      },
    }

    const paypalRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': crypto.randomUUID(), // idempotency
      },
      body: JSON.stringify(orderPayload),
    })

    const orderData = (await paypalRes.json()) as {
      id?: string
      status?: string
      links?: Array<{ rel: string; href: string }>
      message?: string
    }

    if (!paypalRes.ok || !orderData.id) {
      console.error('[store/checkout] PayPal error:', orderData)
      return NextResponse.json(
        {
          ok: false,
          error: orderData.message ?? 'PayPal order creation failed',
        },
        { status: 502 },
      )
    }

    // Find the approval URL
    const approveLink = orderData.links?.find(l => l.rel === 'approve')?.href
    if (!approveLink) {
      return NextResponse.json(
        { ok: false, error: 'No approval URL in PayPal response' },
        { status: 502 },
      )
    }

    return NextResponse.json(
      {
        ok: true,
        stage: 'paypal_order_created',
        orderID: orderData.id,
        redirectUrl: approveLink,
        display: getDisplayPrice(price, currency as 'USD' | 'CNY' | 'EUR' | 'GBP' | 'JPY' | 'HKD' | 'TWD' | 'KRW' | 'AUD' | 'CAD' | 'SGD'),
      },
      { status: 200 },
    )
  } catch (err) {
    const message = (err as Error).message
    console.error('[store/checkout]', err)
    if (message === 'PAYPAL_NOT_CONFIGURED' || message.startsWith('PAYPAL_AUTH_FAILED')) {
      return NextResponse.json(
        {
          ok: false,
          stage: 'paypal_error',
          error: 'PayPal not properly configured. Check Cloudflare secrets.',
        },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { ok: false, stage: 'internal_error', error: 'Internal error during checkout' },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'store/checkout',
      stage: 'paypal_one_time_order',
      method: 'POST only',
      requires: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'NEXT_PUBLIC_SITE_URL'],
    },
    { status: 200 },
  )
}
