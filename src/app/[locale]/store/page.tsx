import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { routing, type Locale, Link } from '@/i18n/routing'
import { generateAlternateLinks, getCanonicalUrl } from '@/lib/seo'
import { getCountryFromRequest } from '@/lib/pricing'
import type { CountryCode, CurrencyCode } from '@/lib/types'
import { getDisplayPrice } from '@/lib/pricing'
import { StoreBuyButton } from './StoreBuyButton'

// ─── Static params ────────────────────────────────────────────────────────
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale })
  return {
    title: `${t('store.title')} — ${t('seo.siteName')}`,
    description: t('store.subtitle'),
    alternates: {
      canonical: getCanonicalUrl(locale as Locale, '/store'),
      languages: generateAlternateLinks('/store'),
    },
    openGraph: {
      title: `${t('store.title')} — ${t('seo.siteName')}`,
      description: t('store.subtitle'),
    },
  }
}

// ─── Blind box lineup (6 common + 1 hidden) ──────────────────────────────
const SKINS: Array<{ id: string; src: string; rarity: 'common' | 'hidden' }> = [
  { id: 'programmer',  src: '/pets/programmer.png',  rarity: 'common' },
  { id: 'doctor',      src: '/pets/doctor.png',      rarity: 'common' },
  { id: 'astronaut',   src: '/pets/astronaut.png',   rarity: 'common' },
  { id: 'chef',        src: '/pets/chef.png',        rarity: 'common' },
  { id: 'firefighter', src: '/pets/firefighter.png', rarity: 'common' },
  { id: 'police',      src: '/pets/police.png',      rarity: 'common' },
  { id: 'golden',      src: '/pets/golden.png',      rarity: 'hidden' },
]

// ─── Page ─────────────────────────────────────────────────────────────────
export default async function StorePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const h = await headers()
  const country: CountryCode = getCountryFromRequest(h)
  // Currency from country
  const cur: CurrencyCode =
    country === 'CN' ? 'CNY' :
    country === 'HK' ? 'HKD' :
    country === 'TW' ? 'TWD' :
    country === 'JP' ? 'JPY' :
    country === 'KR' ? 'KRW' :
    country === 'GB' ? 'GBP' :
    country === 'AU' ? 'AUD' :
    country === 'CA' ? 'CAD' :
    country === 'SG' ? 'SGD' :
    country === 'DE' || country === 'FR' || country === 'ES' ? 'EUR' :
    'USD'

  const firstOrderPrice = 199   // CNY — first order 5折 of ¥399
  const regularPrice = 399

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-20">
      {/* ── Hero ── */}
      <div className="text-center space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-rose-500 dark:text-rose-400">
          ✨ {t('store.firstOrder')} {getDisplayPrice(firstOrderPrice, cur)} · {t('store.save')}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          {t('store.blindboxTitle')}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
          {t('store.blindboxDesc')}
        </p>
      </div>

      {/* ── 6 + 1 Skin Grid ── */}
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {SKINS.map((skin) => {
          const isHidden = skin.rarity === 'hidden'
          return (
            <div
              key={skin.id}
              className={`group relative aspect-square overflow-hidden rounded-2xl border-2 transition-transform duration-300 hover:scale-105 ${
                isHidden
                  ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100 dark:border-amber-600 dark:from-amber-950/40 dark:to-yellow-950/40'
                  : 'border-rose-100 bg-white dark:border-purple-800 dark:bg-purple-950/30'
              }`}
            >
              {isHidden && (
                <div className="absolute top-2 right-2 z-10 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-950 shadow-md">
                  {t('store.odds')} {t('store.oddsGolden')}
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={skin.src}
                alt={skin.id}
                className={`h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-110 ${
                  isHidden ? 'animate-pulse-slow' : ''
                }`}
                loading="lazy"
              />
              {isHidden && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-amber-500/90 to-transparent p-3 text-center text-xs font-bold text-amber-50">
                  🌟 Golden 🌟
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Trust badges ── */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 dark:border-purple-800 dark:bg-purple-950/40">
          🤖 {t('store.ctaTrySoulmate')}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 dark:border-purple-800 dark:bg-purple-950/40">
          ♾️ {t('store.perma')}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 dark:border-purple-800 dark:bg-purple-950/40">
          📦 6+1
        </span>
      </div>

      {/* ── Price + CTA ── */}
      <div className="mt-12 mx-auto max-w-md text-center">
        <div className="rounded-3xl border-2 border-rose-200 bg-white p-8 shadow-xl dark:border-purple-700 dark:bg-zinc-900">
          <div className="space-y-2">
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-5xl font-bold text-rose-600 dark:text-rose-400">
                {getDisplayPrice(firstOrderPrice, cur)}
              </span>
              <span className="text-2xl text-zinc-400 line-through">
                {getDisplayPrice(regularPrice, cur)}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {t('store.firstOrder')} · {t('store.save')}
            </p>
          </div>

          <StoreBuyButton
            country={country}
            currency={cur}
            price={firstOrderPrice}
            label={t('store.ctaBuy')}
          />

          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            🧪 {t('store.checkoutNote')}
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {t('store.checkoutNote2')}
          </p>
        </div>

        {/* Link back to pricing */}
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href={`/${locale}/pricing`}
            className="underline underline-offset-2 hover:text-rose-500"
          >
            ← {t('pricing.title')}
          </Link>
        </p>
      </div>
    </div>
  )
}
