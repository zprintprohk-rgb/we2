import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const ALIPAY_PUBLIC_KEY = process.env.ALIPAY_PUBLIC_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/* ─── helpers ─── */

async function pemToPublicCryptoKey(pem: string): Promise<CryptoKey> {
  const b64 = pem
    .replace(/-----(?:BEGIN|END) PUBLIC KEY-----/g, "")
    .replace(/\s/g, "")
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return crypto.subtle.importKey(
    "spki",
    raw,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  )
}

/** Re-build sorted query string without sign & sign_type */
function buildVerifyString(params: Record<string, string>): string {
  const { sign, sign_type, ...rest } = params
  return Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&")
}

async function verifySign(params: Record<string, string>, sign: string): Promise<boolean> {
  try {
    const signStr = buildVerifyString(params)
    const key = await pemToPublicCryptoKey(ALIPAY_PUBLIC_KEY)
    const sigBin = Uint8Array.from(atob(sign), (c) => c.charCodeAt(0))
    return crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      key,
      sigBin,
      new TextEncoder().encode(signStr),
    )
  } catch {
    return false
  }
}

/* ─── handler ─── */

export async function POST(req: NextRequest) {
  let bodyRaw = ""

  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((v, k) => {
      params[k] = v.toString()
    })
    bodyRaw = JSON.stringify(params)

    const { trade_status, out_trade_no, sign } = params

    if (!sign || !out_trade_no) {
      console.warn("[alipay notify] missing sign/out_trade_no")
      return new NextResponse("fail", { status: 400 })
    }

    /* 1. verify signature */
    if (!ALIPAY_PUBLIC_KEY) {
      console.error("[alipay notify] ALIPAY_PUBLIC_KEY not set")
      return new NextResponse("fail", { status: 500 })
    }
    const ok = await verifySign(params, sign)
    if (!ok) {
      console.error("[alipay notify] sign invalid", out_trade_no)
      return new NextResponse("fail", { status: 401 })
    }

    /* 2. idempotency check */
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
    const { data: existing } = await supabase
      .from("orders")
      .select("status")
      .eq("id", out_trade_no)
      .maybeSingle()

    if (existing && existing.status !== "pending") {
      // already processed
      return new NextResponse("success")
    }

    /* 3. handle success / finished */
    if (trade_status === "TRADE_SUCCESS" || trade_status === "TRADE_FINISHED") {
      const { data: order } = await supabase
        .from("orders")
        .select("user_id, tier, period")
        .eq("id", out_trade_no)
        .maybeSingle()

      // mark order completed
      const { error: updErr } = await supabase
        .from("orders")
        .update({
          status: "completed",
          paid_at: new Date().toISOString(),
          gateway_raw: bodyRaw,
        })
        .eq("id", out_trade_no)

      if (updErr) {
        console.error("[alipay notify] order update failed:", updErr)
        return new NextResponse("fail", { status: 500 })
      }

      // activate membership
      if (order) {
        const days =
          order.period === "yearly" ? 365 : order.period === "quarterly" ? 90 : 30
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + days)

        await supabase.from("memberships").upsert(
          {
            user_id: order.user_id,
            tier: order.tier,
            status: "active",
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        )
      }
    }

    return new NextResponse("success")
  } catch (err) {
    console.error("[alipay notify]", err)
    return new NextResponse("fail", { status: 500 })
  }
}