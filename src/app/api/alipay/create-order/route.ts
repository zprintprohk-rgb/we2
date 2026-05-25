import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getPricing } from "@/lib/pricing"
import { getCountryFromRequest } from "@/lib/pricing"
import { getDisplayPrice } from "@/lib/pricing"

/* ─── env ─── */
const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID!
const ALIPAY_PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY!
const ALIPAY_GATEWAY = "https://openapi.alipay.com/gateway.do"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/* ─── helpers ─── */

/**
 * PEM → CryptoKey (PKCS#8, RSASSA‑PKCS1‑v1_5 / SHA‑256).
 * Accepts both "PRIVATE KEY" (PKCS#8) and "RSA PRIVATE KEY" (PKCS#1) headers.
 */
async function pemToPrivateCryptoKey(pem: string): Promise<CryptoKey> {
  const b64 = pem
    .replace(/-----(?:BEGIN|END) (?:RSA )?PRIVATE KEY-----/g, "")
    .replace(/\s/g, "")
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey(
    "pkcs8",
    raw,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  )
}

/** Build `key=value&key=value…` sorted by key (ASCII order). */
function buildQuery(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&")
}

/** RSA2‑SHA256 sign over sorted params. */
async function sign(params: Record<string, string>): Promise<string> {
  const signStr = buildQuery(params)
  const key = await pemToPrivateCryptoKey(ALIPAY_PRIVATE_KEY)
  const sig = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(signStr),
  )
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

/* ─── handler ─── */

export async function POST(req: NextRequest) {
  try {
    /* 0. env guard */
    if (!ALIPAY_APP_ID || !ALIPAY_PRIVATE_KEY) {
      return NextResponse.json(
        { error: { code: "MISSING_CONFIG", message: "Alipay not configured" } },
        { status: 503 },
      )
    }

    const body = (await req.json()) as {
      tier: string
      period?: "monthly" | "quarterly" | "yearly"
      userId: string
      userEmail?: string
    }
    const { tier, period = "monthly", userId, userEmail } = body

    if (!tier || !["monthly", "quarterly", "yearly"].includes(period) || !userId) {
      return NextResponse.json(
        { error: { code: "INVALID_PARAMS", message: "tier / period / userId required" } },
        { status: 400 },
      )
    }

    /* 1. resolve country → pricing */
    const country = getCountryFromRequest(req)
    const pricing = getPricing(country)
    const tiers = pricing.tiers as Record<string, { monthly: number; quarterly: number; yearly: number }>
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

    /* 2. params */
    const outTradeNo = `CD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.toUpperCase()
    const notifyUrl = `${req.nextUrl.origin}/api/alipay/notify`
    const returnUrl = `${req.nextUrl.origin}/payment/success`

    const bizContent = JSON.stringify({
      out_trade_no: outTradeNo,
      product_code: "FAST_INSTANT_TRADE_PAY",
      total_amount: amount,
      subject: `CloudDreamer ${tier} (${period})`,
      body: `${tier} - ${period}`,
    })

    const common: Record<string, string> = {
      app_id: ALIPAY_APP_ID,
      method: "alipay.trade.page.pay",
      format: "JSON",
      charset: "utf-8",
      sign_type: "RSA2",
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      version: "1.0",
      notify_url: notifyUrl,
      return_url: returnUrl,
      biz_content: bizContent,
    }

    const signature = await sign(common)

    /* 3. persist pending order */
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
    const { error: dbErr } = await supabase.from("orders").insert({
      id: outTradeNo,
      user_id: userId,
      user_email: userEmail ?? null,
      amount,
      currency: pricing.currency,
      status: "pending",
      payment_method: "alipay_cn",
      tier,
      period,
      gateway_raw: common,
      created_at: new Date().toISOString(),
    })

    if (dbErr) {
      console.error("[alipay create-order] db insert failed:", dbErr)
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: "Could not create order" } },
        { status: 500 },
      )
    }

    /* 4. redirect URL */
    const payUrl = `${ALIPAY_GATEWAY}?${buildQuery({ ...common, sign: signature })}`

    return NextResponse.json({
      orderId: outTradeNo,
      payUrl,
      display: getDisplayPrice(amount, pricing.currency),
    })
  } catch (err) {
    console.error("[alipay create-order]", err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create order" } },
      { status: 500 },
    )
  }
}