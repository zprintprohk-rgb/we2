export const runtime = 'edge'

import { getTranslations } from "next-intl/server"
import { RegisterForm } from "./RegisterForm"
import type { Metadata } from "next"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth" })
  return {
    title: t("registerTitle"),
    description: t("registerSubtitle"),
  }
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth" })

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("registerTitle")}</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t("registerSubtitle")}
        </p>
      </div>
      <RegisterForm locale={locale} />
    </div>
  )
}