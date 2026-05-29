import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'
import { routing, type Locale } from '@/i18n/routing'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: `${t('nav.features')} — ${t('siteName')}`,
    description: t('home.features.subtitle'),
    alternates: { canonical: getCanonicalUrl(locale as Locale, '/features') },
  }
}

export default async function FeaturesPage() {
  const t = await getTranslations()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 via-pink-50 to-white px-4 py-16 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-zinc-950">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
        {t('nav.features')}
      </h1>
      <p className="mt-4 max-w-xl text-center text-zinc-600 dark:text-zinc-300">
        {t('home.features.subtitle')}
      </p>
    </div>
  )
}
