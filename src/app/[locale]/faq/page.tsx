import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { generateAlternateLinks, getCanonicalUrl, faqSchema, breadcrumbSchema } from '@/lib/seo'
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
  const t = await getTranslations({ locale })
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

      <div className="relative mx-auto max-w-3xl overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#0f0524] to-[#0a0118] px-4 py-16 text-zinc-100 sm:py-24">
        {/* ── Cinematic atmosphere ── */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-zinc-200"
              style={{
                top: `${(i * 47) % 100}%`,
                left: `${(i * 79) % 100}%`,
                width: (i % 4) + 1,
                height: (i % 4) + 1,
                opacity: 0.3,
              }}
            />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                top: `${20 + (i * 41) % 65}%`,
                left: `${(i * 47) % 100}%`,
                width: 80 + (i * 17) % 70,
                height: 80 + (i * 17) % 70,
                background: `radial-gradient(circle, hsla(${280 + (i * 27) % 60}, 70%, 50%, 0.12) 0%, transparent 70%)`,
              }}
            />
          ))}
        </div>

        {/* Hero */}
        <div className="relative z-10 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/80 sm:text-sm">
            ✦ {t('nav.faq')} ✦
          </p>
          <h1 className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {t('faq.title')}
          </h1>
          <p className="text-lg text-zinc-300/90">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Accordion */}
        <div className="mt-12 space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              id={slugify(item.question)}
              className="group relative z-10 rounded-2xl border border-white/10 bg-white/5 shadow-sm backdrop-blur-xl transition-all hover:border-amber-300/30 hover:bg-white/10"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-left text-sm font-semibold text-zinc-100 [&::-webkit-details-marker]:hidden">
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
              <div className="px-6 pb-4 text-sm leading-relaxed text-zinc-300">
                {item.answer}
              </div>
            </details>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="relative z-10 mt-12 text-center">
          <p className="text-sm text-zinc-400">
            Still have questions?{' '}
            <Link
              href="/contact"
              className="font-medium text-amber-300 hover:text-amber-200"
            >
              Contact us
            </Link>
          </p>
        </div>

        {/* Floating mascot (CSS-only on server component) */}
        <div className="pointer-events-none fixed bottom-6 right-6 z-40 hidden md:block">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/30 via-rose-300/30 to-purple-400/30 blur-xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pets/robot-base.png" alt="" className="relative h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(251,191,36,0.4)]" />
            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-[#0a0118] bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </>
  )
}