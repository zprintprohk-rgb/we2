import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { getCanonicalUrl } from '@/lib/seo'
import { routing, type Locale } from '@/i18n/routing'
import LegalPage from '@/components/legal/LegalPage'

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
  const tLegal = await getTranslations({ locale, namespace: 'legal.privacy' })
  return {
    title: `${tLegal('title')} — ${t('siteName')}`,
    description: tLegal('subtitle'),
    alternates: { canonical: getCanonicalUrl(locale as Locale, '/privacy') },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <LegalPage page="privacy" />
}
