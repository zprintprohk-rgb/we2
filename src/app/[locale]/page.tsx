import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
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
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale })

  const features = [
    { key: 'sharedJournal', icon: '💌' },
    { key: 'moodTracker', icon: '🌡️' },
    { key: 'dreamWall', icon: '🌠' },
    { key: 'dailyGratitude', icon: '🪴' },
    { key: 'petAdoption', icon: '🐥' },
    { key: 'timeCapsule', icon: '⏰' },
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
            'https://twitter.com/Togthrapp',
            'https://github.com/Togthrapp',
          ],
        }}
      />

      <HomeClient
        locale={locale}
        heroTitle={t('home.hero.title')}
        heroSubtitle={t('home.hero.subtitle')}
        heroWelcomeFirst={t('home.hero.welcomeFirst')}
        heroWelcomeBack={t('home.hero.welcomeBack')}
        heroSleepyGreeting={t('home.hero.sleepyGreeting')}
        heroCta={t('home.hero.cta')}
        heroSecondary={t('home.hero.secondary')}
        heroSocialProof={t('home.hero.socialProof')}
        heroEyebrow={t('home.hero.eyebrow')}
        heroStatusHello={t('home.hero.statusHello')}
        heroStatusMiss={t('home.hero.statusMiss')}
        heroStatusSleepy={t('home.hero.statusSleepy')}
        heroRelationsEyebrow={t('home.hero.relationsEyebrow')}
        heroRelationsHint={t('home.hero.relationsHint')}
        features={features}
      />
    </>
  )
}
