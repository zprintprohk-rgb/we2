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

  // Content Security Policy（现代 XSS 防御）
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.paypal.com https://www.sandbox.paypal.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://*.supabase.co https://www.paypal.com",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co https://api.paypal.com https://api.sandbox.paypal.com https://openapi.alipay.com https://openapi-sandbox.dl.alipaydev.com",
    "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  res.headers.set('Content-Security-Policy', csp)

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