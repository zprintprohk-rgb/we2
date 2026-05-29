import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const handleI18n = createMiddleware(routing)
  const res = handleI18n(request)

  // ─── 安全头 ───
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-XSS-Protection', '1; mode=block')

  // attach CF-IPCountry based geo header for server components
  const country = request.headers.get('cf-ipcountry') ?? ''
  const geoLocaleMap: Record<string, string> = {
    HK: 'zh-tw',
    TW: 'zh-tw',
    CN: 'zh-cn',
    JP: 'ja',
    KR: 'ko',
    DE: 'de',
    FR: 'fr',
    ES: 'es',
  }
  const inferredLocale = geoLocaleMap[country] ?? routing.defaultLocale
  res.headers.set('x-geo-locale', inferredLocale)
  res.headers.set('x-geo-country', country)

  return res
}

export const config = {
  matcher: [
    // match all paths except static files and APIs
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}