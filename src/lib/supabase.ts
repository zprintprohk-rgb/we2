import { createBrowserClient as createBrowser } from "@supabase/ssr"
import { createServerClient as createServer } from "@supabase/ssr"
import { createClient as createEdge } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// ─── 浏览器客户端（Client Components） ───
export function createBrowserClient() {
  return createBrowser(supabaseUrl, supabaseAnonKey)
}

// ─── 服务器客户端（Server Components / Server Actions） ───
export async function createServerClient() {
  const cookieStore = await cookies()
  return createServer(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // 在 Server Component 中调用 setAll 可能抛出，忽略即可
        }
      },
    },
  })
}

// ─── Edge API 客户端（使用 Service Role Key，绕过 RLS） ───
export function createEdgeClient() {
  return createEdge(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
    global: { fetch },
  })
}