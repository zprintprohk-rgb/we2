"use server"

import { createServerClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ─── Sign Up ───
export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const displayName = (formData.get("displayName") as string) || undefined
  const locale = (formData.get("locale") as string) || "en"

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, locale },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/${locale}/register?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(`/${locale}/register`)
  redirect(`/${locale}/register?success=check-email`)
}

// ─── Sign In ───
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const locale = (formData.get("locale") as string) || "en"

  const supabase = await createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(`/${locale}/login`)
  redirect(`/${locale}/dashboard`)
}

// ─── Sign In with OAuth (Google / GitHub) ───
export async function signInWithOAuth(provider: "google" | "github", locale: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?next=/${locale}/dashboard`,
    },
  })

  if (error) {
    redirect(`/${locale}/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
}

// ─── Sign Out ───
export async function signOut(locale: string) {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  revalidatePath(`/${locale}`)
  redirect(`/${locale}`)
}

// ─── Reset Password ───
export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string
  const locale = (formData.get("locale") as string) || "en"

  // 使用 anon key 的客户端即可发送重置邮件
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/update-password`,
  })

  if (error) {
    redirect(
      `/${locale}/login?error=${encodeURIComponent(error.message)}`,
    )
  }

  redirect(`/${locale}/login?message=check-email`)
}