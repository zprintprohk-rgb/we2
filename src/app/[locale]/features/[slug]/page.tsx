import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing, type Locale } from '@/i18n/routing'
import { getCanonicalUrl } from '@/lib/seo'
import { FEATURES, VALID_SLUGS, SLUG_TO_KEY, type FeatureSlug } from '@/data/features'
import { FeatureDetailClient } from './FeatureDetailClient'

export function generateStaticParams() {
  const params: { locale: string; slug: FeatureSlug }[] = []
  for (const locale of routing.locales) {
    for (const slug of VALID_SLUGS) {
      params.push({ locale, slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const feature = FEATURES.find((f) => f.slug === slug)
  if (!feature) return {}

  const t = await getTranslations({ locale })
  const titleKey = SLUG_TO_KEY[slug as FeatureSlug]
  const title = t(`home.features.${titleKey}.title`)
  const descKey = feature.longDescKey

  let longDesc: string
  try {
    longDesc = t(descKey as Parameters<typeof t>[0])
  } catch {
    longDesc = t(`home.features.${titleKey}.desc`)
  }

  return {
    title: `${title} — ${t('siteName')}`,
    description: longDesc,
    alternates: { canonical: getCanonicalUrl(locale as Locale, `/features/${slug}`) },
  }
}

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug: rawSlug } = await params

  if (!VALID_SLUGS.includes(rawSlug as FeatureSlug)) {
    notFound()
  }

  const slug = rawSlug as FeatureSlug
  const feature = FEATURES.find((f) => f.slug === slug)!
  const t = await getTranslations({ locale })

  const titleKey = SLUG_TO_KEY[slug]
  const title = t(`home.features.${titleKey}.title`)

  let longDesc: string
  try {
    longDesc = t(feature.longDescKey as Parameters<typeof t>[0])
  } catch {
    longDesc = t(`home.features.${titleKey}.desc`)
  }

  const steps = feature.steps.map((key) => {
    try {
      return t(key as Parameters<typeof t>[0])
    } catch {
      return key
    }
  })

  return (
    <FeatureDetailClient
      slug={slug}
      locale={locale}
      title={title}
      longDesc={longDesc}
      steps={steps}
    />
  )
}