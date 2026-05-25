import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/* ─── access-token cache ─── */
let _token: string | null = null
let _tokenExpires = 0

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpires) return _token
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
  _tokenExpires = Date.now() + (data.expires_in || 32400) * 1000 - 60_000
  return _token!
}

/* ─── handler ─── */

export async function POST(req: NextRequest) {
  try {
    const { orderID: orderIDFromClient } = (await req.json()) as { orderID?: string }
    if (!orderIDFromClient) {
      return NextResponse.json(
        { error: { code: "INVALID_PARAMS", message: "orderID required" } },
        { status: 400 },
      )
    }

    const accessToken = await getAccessToken()

    /* 1. capture the order */
    const captureRes = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderIDFromClient)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    const captureData = (await captureRes.json()) as {
      id?: string
      status?: string
      payer?: { email_address?: string }
      purchase_units?: Array<{
        amount?: { currency_code?: string; value?: string }
        custom_id?: string
        description?: string
      }>
    }

    if (!captureRes.ok || captureData.status !== "COMPLETED") {
      console.error("[paypal capture] Capture failed:", captureData)
      return NextResponse.json(
        {
          error: {
            code: "CAPTURE_FAILED",
            message: `Capture status: ${captureData.status ?? "unknown"}`,
          },
        },
        { status: 502 },
      )
    }

    const pUnit = captureData.purchase_units?.[0]
    const paypalOrderId = captureData.id!
    const amount = Number(pUnit?.amount?.value ?? 0)
    const currency = pUnit?.amount?.currency_code ?? "USD"
    const userId = pUnit?.custom_id ?? "unknown"
    const payerEmail = captureData.payer?.email_address ?? null

    /* 2. idempotency: check if this PayPal order was already persisted */
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
    const { data: existing } = await supabase
      .from("orders")
      .select("id, status")
      .eq("payment_id", paypalOrderId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        orderId: existing.id,
        status: existing.status,
        message: "already processed",
      })
    }

    /* 3. extract tier + period from description (e.g. "CloudDreamer plus (quarterly)") */
    const desc = pUnit?.description ?? ""
    const tierMatch = desc.match(/CloudDreamer\s+(\w+)/)
    const periodMatch = desc.match(/\((\w+)\)/)
    const tier = tierMatch?.[1] ?? "plus"
    const period = periodMatch?.[1] ?? "monthly"

    /* 4. persist order */
    const { data: newOrder, error: insertErr } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        user_email: payerEmail,
        amount,
        currency,
        status: "completed",
        payment_method: "paypal",
        payment_id: paypalOrderId,
        tier,
        period,
        gateway_raw: captureData,
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (insertErr) {
      console.error("[paypal capture] db insert failed:", insertErr)
      return NextResponse.json(
        { error: { code: "DB_ERROR", message: "Could not persist order" } },
        { status: 500 },
      )
    }

    /* 5. activate membership */
    const days =
      period === "yearly" ? 365 : period === "quarterly" ? 90 : 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    await supabase.from("memberships").upsert(
      {
        user_id: userId,
        tier,
        status: "active",
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )

    return NextResponse.json({
      orderId: newOrder!.id,
      status: "completed",
    })
  } catch (err) {
    console.error("[paypal capture]", err)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to capture order" } },
      { status: 500 },
    )
  }
}