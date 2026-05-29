import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { generateAlternateLinks, getCanonicalUrl, siteConfig, faqSchema, breadcrumbSchema } from '@/lib/seo'
import type { Locale } from '@/i18n/routing'
import { Link } from '@/i18n/routing'

// ---------- slugify helper ----------
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\uac00-\ud7af\u3040-\u309f\u30a0-\u30ff]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

// ---------- Static params ----------
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
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
    title: t('faq.title'),
    description: t('faq.subtitle'),
    alternates: {
      canonical: getCanonicalUrl(locale as Locale, '/faq'),
      languages: generateAlternateLinks('/faq'),
    },
    openGraph: {
      title: t('faq.title'),
      description: t('faq.subtitle'),
    },
  }
}

// ---------- FAQ Item type ----------
type FaqItem = {
  question: string
  answer: string
}

// ---------- Page ----------
export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations()
  const items = t.raw('faq.items') as FaqItem[]

  const faqTitle = t('faq.title')
  const faqUrl = getCanonicalUrl(locale as Locale, '/faq')

  return (
    <>
      {/* FAQPage JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(items)) }}
      />

      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(
          breadcrumbSchema([
            { name: t('nav.home'), url: getCanonicalUrl(locale as Locale) },
            { name: faqTitle, url: faqUrl },
          ])
        ) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('faq.title')}
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-12 space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              id={slugify(item.question)}
              className="group rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <svg
                  className="ml-2 h-5 w-5 flex-shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Still have questions?{' '}
            <Link
              href="/contact"
              className="font-medium text-purple-600 hover:text-purple-500"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}