import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (!code) {
    const error = searchParams.get("error_description") ?? "missing_code"
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    )
  }

  // 保护：仅允许相对路径重定向
  const redirectTo = next.startsWith("/") ? next : "/"
  return NextResponse.redirect(`${origin}${redirectTo}`)
}

export const runtime = "edge"