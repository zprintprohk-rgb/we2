import { NextRequest, NextResponse } from "next/server"
import { getCountryFromRequest, getPricing, getDisplayPrice } from "@/lib/pricing"

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"

/* ─── access-token cache (module-level, per‑isolate lifetime) ─── */
let _token: string | null = null
let _tokenExpires = 0

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpires) return _token

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not set")
  }

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)
  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PayPal auth failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  _token = data.access_token
  // refresh 60 s before expiry (typical 32400 s / 9 h)
  _tokenExpires = Date.now() + (data.expires_in || 32400) * 1000 - 60_000
  return _token!
}

/* ─── handler ─── */

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      tier: string
      period?: "monthly" | "quarterly" | "yearly"
      userId: string
      userEmail?: string
    }
    const { tier, period = "monthly", userId, userEmail } = body

    if (!tier || !userId) {
      return NextResponse.json(
        { error: { code: "INVALID_PARAMS", message: "tier / userId required" } },
        { status: 400 },
      )
    }

    /* resolve country → pricing (uses CF-IPCountry) */
    const country = getCountryFromRequest(req)
    const pricing = getPricing(country)
    const tiers = pricing.tiers as Record<
      string,
      { monthly: number; quarterly: number; yearly: number }
    >
    const plan = tiers[tier]
    if (!plan) {
      return NextResponse.json(
        { error: { code: "INVALID_TIER", message: `Unknown tier: ${tier}` } },
        { status: 400 },
      )
    }
    const amount = plan[period]
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: { code: "PRICE_UNAVAILABLE", message: "No price for this tier/period" } },
        { status: 400 },
      )
    }

    const currency = pricing.currency

    const accessToken = await getAccessToken()

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          custom_id: userId,
          description: `CloudDreamer ${tier} (${period})`,
        },
      ],
      payer: userEmail ? { email_address: userEmail } : undefined,
      application_context: {
        brand_name: "CloudDreamer",
        shipping_preference: "NO_SHIPPING",
      },
    }

    const paypalRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(), // idempotency
      },
      body: JSON.stringify(orderPayload),
    })

    const orderData = (await paypalRes.json()) as { id?: string; message?: string; details?: unknown }

    if (!paypalRes.ok || !orderData.id) {
      console.error("[paypal create-order] PayPal error:", orderData)
      return NextResponse.json(
        {
          error: {
            code: "PAYPAL_ERROR",
            message: orderData.message ?? "PayPal order creation failed",
          },
        },
        { status: 502 },
      )
    }

    return NextResponse.json({
      orderID: orderData.id,
      display: getDisplayPrice(amount, currency),
    })
  } catch (err) {
    console.error("[paypal create-order]", err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create order" } },
      { status: 500 },
    )
  }
}