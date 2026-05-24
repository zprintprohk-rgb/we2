"use client"

import { useTranslations } from "next-intl"
import { resetPassword } from "@/lib/auth-actions"

export function ResetPasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("auth")

  return (
    <form action={resetPassword} className="space-y-4">
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
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {t("resetPasswordButton")}
      </button>
    </form>
  )
}