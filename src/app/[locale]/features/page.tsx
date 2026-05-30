import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'
import { routing, type Locale } from '@/i18n/routing'
import { FeaturesClient } from './FeaturesClient'

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

export default async function FeaturesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale })

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
    <FeaturesClient
      locale={locale}
      title={t('nav.features')}
      subtitle={t('home.features.subtitle')}
      features={features}
    />
  )
}