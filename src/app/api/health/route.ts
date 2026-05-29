import { createEdgeClient } from '@/lib/supabase'

export const runtime = 'edge'

export async function GET() {
  const checks: Record<string, { ok: boolean; latency_ms: number }> = {}

  // Supabase 连通性检查
  const supabaseStart = Date.now()
  try {
    const supabase = createEdgeClient()
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
    checks.supabase = { ok: !error, latency_ms: Date.now() - supabaseStart }
  } catch {
    checks.supabase = { ok: false, latency_ms: Date.now() - supabaseStart }
  }

  const allOk = Object.values(checks).every((c) => c.ok)

  return Response.json(
    {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      env: (process.env.NEXTJS_ENV ?? process.env.NODE_ENV ?? 'unknown') as string,
      checks,
    },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}
