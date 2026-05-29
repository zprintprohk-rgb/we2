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
import { HomeClient } from './HomeClient'

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

// ---------- Page component (server) ----------
export default async function HomePage() {
  const t = await getTranslations()

  const features = [
    { key: 'sharedJournal', icon: '📖' },
    { key: 'moodTracker', icon: '💭' },
    { key: 'dreamWall', icon: '🌟' },
    { key: 'dailyGratitude', icon: '🙏' },
    { key: 'petAdoption', icon: '🐾' },
    { key: 'timeCapsule', icon: '⏳' },
  ].map(({ key, icon }) => ({
    key,
    icon,
    title: t(`home.features.${key}.title`),
    desc: t(`home.features.${key}.desc`),
  }))

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

      <HomeClient
        heroTitle={t('home.hero.title')}
        heroSubtitle={t('home.hero.subtitle')}
        heroCta={t('home.hero.cta')}
        heroSecondary={t('home.hero.secondary')}
        features={features}
        footerPrivacy={t('footer.privacy')}
        footerTerms={t('footer.terms')}
        footerCookie={t('footer.cookie')}
        footerHelp={t('footer.help')}
        footerContact={t('footer.contact')}
      />
    </>
  )
}