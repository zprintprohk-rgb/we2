import { redirect } from '@/i18n/routing'
import { headers } from 'next/headers'

const GEO_LOCALE_MAP: Record<string, string> = {
  HK: 'zh-tw',
  TW: 'zh-tw',
  CN: 'zh-cn',
  JP: 'ja',
  KR: 'ko',
  DE: 'de',
  FR: 'fr',
  ES: 'es',
}

const ACCEPT_LANG_MAP: Record<string, string> = {
  'zh-cn': 'zh-cn',
  'zh-hans': 'zh-cn',
  'zh-tw': 'zh-tw',
  'zh-hk': 'zh-tw',
  'zh-hant': 'zh-tw',
  ja: 'ja',
  ko: 'ko',
  de: 'de',
  fr: 'fr',
  es: 'es',
  en: 'en',
}

export default async function RootPage() {
  const heads = await headers()
  const country = heads.get('cf-ipcountry')?.toUpperCase() ?? ''
  const acceptLang = heads.get('accept-language') ?? ''

  // 1. Cloudflare GEO header has highest priority
  const geolocale = GEO_LOCALE_MAP[country]

  // 2. Fallback: parse Accept-Language header
  let dlocale = geolocale
  if (!dlocale) {
    const langTags = acceptLang
      .split(',')
      .map((s: string) => s.trim().split(';')[0]?.toLowerCase())
    for (const tag of langTags) {
      dlocale = ACCEPT_LANG_MAP[tag]
      if (dlocale) break
    }
  }

  // 3. Default to 'en'
  const final = dlocale ?? 'en'

  redirect({ href: '/', locale: final })
}
