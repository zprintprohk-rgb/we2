import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/i18n/routing'
import { StructuredData } from '@/components/StructuredData'
import {
  siteConfig,
  getCanonicalUrl,
  generateAlternateLinks,
} from '@/lib/seo'
import { routing, type Locale } from '@/i18n/routing'

// ---------- Static params ----------
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// ---------- Metadata (head) ----------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return {
    title: `${t('seo.siteName')} — ${t('seo.tagline')}`,
    description: t('seo.description'),
    keywords: t('seo.keywords'),
    alternates: {
      canonical: getCanonicalUrl(locale as Locale),
      languages: generateAlternateLinks(),
    },
    openGraph: {
      title: `${t('seo.siteName')} — ${t('seo.tagline')}`,
      description: t('seo.description'),
      url: getCanonicalUrl(locale as Locale),
      siteName: t('seo.siteName'),
      locale: locale.replace('-', '_'),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('seo.siteName')} — ${t('seo.tagline')}`,
      description: t('seo.description'),
    },
  }
}

// ---------- Page component ----------
export default async function HomePage() {
  const t = await getTranslations()

  return (
    <>
      <StructuredData
        website={{
          name: t('seo.siteName'),
          url: siteConfig.url,
          description: t('seo.description'),
          inLanguage: routing.locales.map((l) => l.replace('-', '_')),
        }}
        organization={{
          name: t('seo.siteName'),
          url: siteConfig.url,
          logo: `${siteConfig.url}/logo.png`,
          sameAs: [
            'https://twitter.com/we2app',
            'https://github.com/we2app',
          ],
        }}
      />

      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-4 py-16 dark:from-zinc-950 dark:to-zinc-900">
        <main className="w-full max-w-3xl text-center space-y-8">
          {/* Hero */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              {t('home.hero.title')}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t('home.hero.cta')}
              </Link>
              <Link
                href="/features"
                className="inline-flex h-11 items-center rounded-full border border-zinc-200 px-6 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                {t('home.hero.secondary')}
              </Link>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: 'sharedJournal', icon: '📖' },
              { key: 'moodTracker', icon: '💭' },
              { key: 'dreamWall', icon: '🌟' },
              { key: 'dailyGratitude', icon: '🙏' },
              { key: 'petAdoption', icon: '🐾' },
              { key: 'timeCapsule', icon: '⏳' },
            ].map(({ key, icon }) => (
              <div
                key={key}
                className="rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 font-semibold text-zinc-900 dark:text-zinc-100">
                  {t(`home.features.${key}.title`)}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {t(`home.features.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <footer className="pt-16 text-sm text-zinc-400 dark:text-zinc-500">
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/privacy">{t('footer.privacy')}</Link>
              <Link href="/terms">{t('footer.terms')}</Link>
              <Link href="/cookies">{t('footer.cookie')}</Link>
              <Link href="/help">{t('footer.help')}</Link>
              <Link href="/contact">{t('footer.contact')}</Link>
            </div>
            <p className="mt-4">© {new Date().getFullYear()} {t('siteName')}</p>
          </footer>
        </main>
      </div>
    </>
  )
}
