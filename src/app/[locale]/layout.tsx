import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { routing, type Locale } from '@/i18n/routing'
import { generateAlternateLinks, getCanonicalUrl, websiteSchema, marketMeta } from '@/lib/seo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { Metadata } from 'next'
import Link from 'next/link'

// Cloudflare Web Analytics token
// 留空表示暂不启用 Analytics；后续在 Cloudflare Dashboard 拿到真实 token 后填入
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN || ''

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// -------- dynamic metadata ------------------------------------------------
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = params.locale as Locale
  setRequestLocale(locale)
  try {
    const t = await getTranslations({ locale, namespace: 'seo' })
    const meta = marketMeta[locale]

    return {
      metadataBase: new URL('https://we2.com'),
      title: {
        template: `%s | ${t('siteName') || 'We2'}`,
        default: `${t('siteName') || 'We2'} — ${t('tagline')}`,
      },
      description: t('description'),
      keywords: t('keywords'),
      alternates: {
        canonical: getCanonicalUrl(locale),
        languages: generateAlternateLinks(''),
      },
      openGraph: {
        siteName: 'We2',
        locale: meta.ogLocale,
        type: 'website',
        images: ['/og-image.png'],
      },
      twitter: {
        card: 'summary_large_image',
        site: '@we2app',
      },
    }
  } catch (error) {
    console.error('[layout] generateMetadata failed:', error)
    return {
      metadataBase: new URL('https://we2.com'),
      title: 'We2',
      description: 'We2 - Grow Together, Love Deeper',
    }
  }
}

// -------- layout ----------------------------------------------------------
// NOTE: This is a *nested* layout. The root <html>/<body> tags are owned by
// `src/app/layout.tsx`. Returning <html>/<body> from a child layout would
// produce nested html tags and break Next.js' head/stylesheet injection,
// which is exactly what caused the "no CSS" symptom on /[locale] routes.
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)
  try {
    const messages = await getMessages()
    const t = await getTranslations({ locale })
    const nav = {
      home: t('nav.home'),
      features: t('nav.features'),
      pricing: t('nav.pricing'),
      community: t('nav.community'),
      login: t('nav.login'),
    }
    const footer = {
      privacy: t('footer.privacy'),
      terms: t('footer.terms'),
      cookie: t('footer.cookie'),
      help: t('footer.help'),
      contact: t('footer.contact'),
    }

    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {/* Cloudflare Web Analytics beacon (only when token configured) */}
        {CF_BEACON_TOKEN && (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN })}
          />
        )}

        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />

        {/* ---------- Navigation ---------- */}
        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            {/* Left: Logo + Links */}
            <div className="flex items-center gap-6">
              <Link
                href={`/${locale}`}
                className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
              >
                We2
              </Link>
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href={`/${locale}`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {nav.home}
                </Link>
                <Link
                  href={`/${locale}/features`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {nav.features}
                </Link>
                <Link
                  href={`/${locale}/pricing`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {nav.pricing}
                </Link>
                <Link
                  href={`/${locale}/faq`}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  FAQ
                </Link>
              </div>
            </div>

            {/* Right: Language Switcher + Login */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={locale as Locale} />
              <Link
                href={`/${locale}/login`}
                className="inline-flex h-9 items-center rounded-full bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {nav.login}
              </Link>
            </div>
          </nav>
        </header>

        {/* ---------- Main Content ---------- */}
        <main>{children}</main>

        {/* ---------- Footer ---------- */}
        <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                © {new Date().getFullYear()} We2. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <Link
                  href={`/${locale}/privacy`}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {footer.privacy}
                </Link>
                <Link
                  href={`/${locale}/terms`}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {footer.terms}
                </Link>
                <Link
                  href={`/${locale}/cookies`}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {footer.cookie}
                </Link>
                <Link
                  href={`/${locale}/help`}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {footer.help}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {footer.contact}
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </NextIntlClientProvider>
    )
  } catch (error) {
    console.error('[layout] render failed:', error)
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Layout Error</h1>
        <div className="bg-gray-100 rounded-lg p-4 overflow-auto">
          <pre className="text-sm text-red-800 whitespace-pre-wrap">
            {JSON.stringify(
              {
                message: (error as Error).message,
                stack: (error as Error).stack,
                name: (error as Error).name,
              },
              null,
              2
            )}
          </pre>
        </div>
        <p className="mt-4 text-sm text-gray-500">Digest: 521802265 — real error from layout try/catch</p>
      </div>
    )
  }
}
