import { NextRequest, NextResponse } from 'next/server'
import { getPayPalOrder, verifyPayPalWebhook } from '@/lib/paypal'
import { createClient } from '@supabase/supabase-js'

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID ?? ''
const PAYPAL_MODE = (process.env.PAYPAL_MODE ?? 'sandbox') as 'sandbox' | 'production'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  // 先读取原始 body 用于签名验证（后克隆用于 JSON 解析）
  const rawBody = await req.text()

  // Webhook 签名验证：防伪造请求
  if (PAYPAL_WEBHOOK_ID) {
    const valid = await verifyPayPalWebhook(PAYPAL_WEBHOOK_ID, req.headers, rawBody)
    if (!valid) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }
  }

  const body = JSON.parse(rawBody) as Record<string, unknown>
  const eventType = body.event_type as string | undefined
  const resource = body.resource as { id?: string; status?: string; custom_id?: string } | undefined

  // 仅处理 capture 完成事件
  if (eventType !== 'PAYMENT.CAPTURE.COMPLETED' || !resource?.id) {
    return NextResponse.json({ received: true })
  }

  try {
    // 二次验证：从 PayPal 拉取最新订单状态，确认支付确实完成
    const order = await getPayPalOrder(
      PAYPAL_CLIENT_ID,
      PAYPAL_CLIENT_SECRET,
      PAYPAL_MODE,
      resource.id,
    )

    if (order.status !== 'COMPLETED') {
      console.warn('[paypal webhook] Order not completed:', order.id, order.status)
      return NextResponse.json({ received: true, reason: 'not completed' })
    }

    const pUnit = order.purchase_units?.[0]
    const userId = resource.custom_id ?? pUnit?.custom_id ?? 'unknown'

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    // 幂等检查
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_id', resource.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true, reason: 'already persisted' })
    }

    // 持久化订单 + 激活会员（与 capture-order route 同一逻辑）
    const amount = Number(pUnit?.amount?.value ?? 0)
    const currency = pUnit?.amount?.currency_code ?? 'USD'
    const description = (pUnit?.description ?? '') as string
    const tierMatch = description.match(/CloudDreamer\s+(\w+)/)
    const periodMatch = description.match(/\((\w+)\)/)
    const tier = tierMatch?.[1] ?? 'plus'
    const period = periodMatch?.[1] ?? 'monthly'

    const { error: insertErr } = await supabase.from('orders').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      user_email: null,
      gateway: 'paypal',
      payment_id: resource.id,
      amount,
      currency,
      tier,
      period,
      status: 'completed',
      gateway_raw: order,
      created_at: new Date().toISOString(),
      paid_at: new Date().toISOString(),
    })

    if (insertErr) {
      throw new Error(`DB insert: ${insertErr.message}`)
    }

    // 激活会员
    const days = period === 'yearly' ? 365 : period === 'quarterly' ? 90 : 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    await supabase.from('memberships').upsert(
      {
        user_id: userId,
        tier,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

    return NextResponse.json({ received: true, status: 'persisted' })
  } catch (err) {
    console.error('[paypal webhook]', err)
    // 始终返回 200 避免 PayPal 重复投递
    return NextResponse.json({ received: true, error: 'handler failed' })
  }
}