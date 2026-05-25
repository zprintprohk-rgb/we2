export const runtime = 'edge'

import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { generateAlternateLinks, siteConfig, breadcrumbSchema } from '@/lib/seo'
import { Link } from '@/i18n/routing'

// ---------- Guide section type ----------
type GuideSection = {
  heading: string
  body: string
  tip: string
}

// ---------- Guide content type (for raw) ----------
type GuideContent = {
  title: string
  subtitle: string
  breadcrumb: string
  sections: GuideSection[]
  cta: string
}

// ---------- Static params ----------
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// ---------- slugify helper ----------
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\uac00-\ud7af\u3040-\u309f\u30a0-\u30ff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

// ---------- Metadata ----------
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })

  return {
    title: t('guide.title'),
    description: t('guide.subtitle'),
    alternates: {
      canonical: `${siteConfig.url}/${locale}/guide`,
      languages: generateAlternateLinks('/guide'),
    },
    openGraph: {
      title: t('guide.title'),
      description: t('guide.subtitle'),
      type: 'article',
    },
  }
}

// ---------- Section icon colors (rotate through 8) ----------
const sectionAccent = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-red-500',
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-blue-500',
  'from-lime-500 to-green-500',
]

// ---------- Page ----------
export default async function GuidePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations()
  const guide = t.raw('guide') as GuideContent

  const guideTitle = guide.title
  const guideUrl = `${siteConfig.url}/${locale}/guide`

  return (
    <>
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: t('nav.home'), url: `${siteConfig.url}/${locale}` },
              { name: guideTitle, url: guideUrl },
            ])
          ),
        }}
      />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {guide.title}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            {guide.subtitle}
          </p>
        </div>

        {/* Sections */}
        <div className="mt-16 space-y-8">
          {guide.sections.map((section, i) => (
            <div
              key={i}
              id={slugify(section.heading)}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
            >
              {/* Section number badge */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${sectionAccent[i % sectionAccent.length]} text-white text-sm font-bold shadow`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {section.heading}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {section.body}
                  </p>
                  <div className="mt-4 rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 text-sm text-purple-800 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300">
                    {section.tip}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all hover:shadow-xl"
          >
            {guide.cta}
          </Link>
        </div>
      </div>
    </>
  )
}