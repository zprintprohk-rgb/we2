import type { CountryCode } from './types'

/**
 * Extract the customer country from a Request or Headers object.
 * Reads CF-IPCountry (Cloudflare Workers / Pages), falls back to 'US'.
 */
export function getCustomerCountry(reqOrHeaders: Request | Headers): CountryCode {
  const VALID: Set<string> = new Set([
    'CN', 'HK', 'TW', 'US', 'GB', 'AU', 'CA', 'SG',
    'DE', 'FR', 'ES', 'JP', 'KR',
  ])

  let raw: string | null = null
  // Duck‑type check instead of `instanceof` because Cloudflare Workers
  // may not expose the Headers constructor in the global scope.
  if (reqOrHeaders && typeof (reqOrHeaders as Headers).get === 'function') {
    raw = (reqOrHeaders as Headers).get('CF-IPCountry')
  } else if (reqOrHeaders && 'headers' in (reqOrHeaders as Request)) {
    raw = (reqOrHeaders as Request).headers.get('CF-IPCountry')
  }

  const code = raw?.trim().toUpperCase()
  return code && VALID.has(code) ? (code as CountryCode) : 'US'
}

/**
 * Get locale from request (CF-IPCountry + Accept-Language fallback).
 * Mirrors the middleware logic for API routes.
 */
export function getLocaleFromRequest(request: Request): string {
  const countryToLocale: Record<string, string> = {
    CN: 'zh-cn',
    HK: 'zh-tw',
    TW: 'zh-tw',
    JP: 'ja',
    KR: 'ko',
    DE: 'de',
    FR: 'fr',
    ES: 'es',
  }
  const country = getCustomerCountry(request)
  return countryToLocale[country] ?? 'en'
}

/**
 * Decode a JWT payload without verification (Edge-compatible).
 * Used to extract user ID from Supabase access token.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}