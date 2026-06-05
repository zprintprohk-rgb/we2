/**
 * /store/success — PayPal return URL.
 *
 * User is redirected here after PayPal approval. The actual skin
 * unlock happens via /api/paypal/webhook (separate flow). This
 * page just shows a friendly "thanks" message + a link back to
 * the dashboard.
 *
 * MVP Day 2: just visual. Day 3 will poll /api/store/order-status
 * to confirm the unlock propagated.
 */

import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { Metadata } from 'next'
import { routing, type Locale } from '@/i18n/routing'
import { generateAlternateLinks, getCanonicalUrl } from '@/lib/seo'

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: t('store.successTitle'),
    robots: { index: false }, // don't index thank-you pages
    alternates: {
      canonical: getCanonicalUrl(locale as Locale, '/store/success'),
      languages: generateAlternateLinks('/store/success'),
    },
  }
}

export default async function StoreSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      {/* Confetti animation */}
      <div className="text-8xl mb-6 animate-bounce">🎉</div>

      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent sm:text-4xl">
        {t('store.successTitle')}
      </h1>

      <p className="mt-3 text-base text-zinc-600 dark:text-zinc-300">
        {t('store.successSubtitle')}
      </p>

      <div className="mt-8 rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5 text-left dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
          📦 {t('store.successNote')}
        </p>
        <p className="mt-2 text-xs text-amber-800/80 dark:text-amber-300/80">
          {t('store.successHint')}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${locale}/store`}
          className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          ← {t('store.title')}
        </Link>
        <Link
          href={`/${locale}`}
          className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/50"
        >
          🏠 {t('nav.home')}
        </Link>
      </div>

      <p className="mt-12 text-[10px] text-zinc-400">
        🔒 {t('store.secureNotice')}
      </p>
    </div>
  )
}
