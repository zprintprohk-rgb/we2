"use client"

import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn, signInWithOAuth } from "@/lib/auth-actions"
import { AlertCircle } from "lucide-react"

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth")
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const message = searchParams.get("message")

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message === "check-email" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {t("checkEmail")}
        </div>
      )}

      {/* Email / Password Form */}
      <form action={signIn} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t("emailLabel")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={t("emailPlaceholder")}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            {t("passwordLabel")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder={t("passwordPlaceholder")}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={`/${locale}/reset-password`}
            className="text-xs text-pink-600 hover:text-pink-500 dark:text-pink-400"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {t("loginButton")}
        </button>
      </form>

      {/* OAuth Providers */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-50 px-2 text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <form
          action={signInWithOAuth.bind(null, "google", locale)}
          className="flex-1"
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {t("google")}
          </button>
        </form>
        <form
          action={signInWithOAuth.bind(null, "github", locale)}
          className="flex-1"
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {t("github")}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/register`}
          className="font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400"
        >
          {t("registerLink")}
        </Link>
      </p>
    </div>
  )
}