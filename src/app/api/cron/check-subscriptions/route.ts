import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const CRON_SECRET = process.env.CRON_SECRET ?? ''

export async function GET(request: Request) {
  // 简单鉴权：Cron 请求必须携带匹配的 secret
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const now = new Date().toISOString()

    // 查找已到期但仍标记为 'active' 的会员
    const { data: expired, error: selectErr } = await supabase
      .from('memberships')
      .select('id, user_id, tier, expires_at')
      .eq('status', 'active')
      .lt('expires_at', now)

    if (selectErr) {
      return NextResponse.json(
        { error: 'query failed', detail: selectErr.message },
        { status: 500 },
      )
    }

    if (!expired || expired.length === 0) {
      return NextResponse.json({ checked: true, expired: 0 })
    }

    // 批量标记为已过期
    const ids = expired.map((m) => m.id)
    const { error: updateErr } = await supabase
      .from('memberships')
      .update({ status: 'expired', updated_at: now })
      .in('id', ids)

    if (updateErr) {
      return NextResponse.json(
        { error: 'update failed', detail: updateErr.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      checked: true,
      expired: expired.length,
      details: expired.map((m) => ({
        user_id: m.user_id,
        tier: m.tier,
        expired_at: m.expires_at,
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'cron failed', detail: message }, { status: 500 })
  }
}