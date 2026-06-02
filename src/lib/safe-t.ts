/* ── Safe i18n helpers ──────────────────────────────────────────────────────
 * Defensive wrappers around next-intl's t() / t.raw() to prevent page
 * crashes when translation keys are missing, empty, or have wrong types
 * (e.g. the `features` array rendered as `.map()`).
 *
 * next-intl in production returns the key path as a string when a key is
 * missing, so the page usually still renders. The crash happens when
 * `t.raw(key)` returns a *string* (the key path itself) and the code
 * immediately calls `.map()` on it. `ta()` defends against this.
 */

type Translator = {
  (key: string, values?: Record<string, string | number | Date>): string
  raw: (key: string) => unknown
}

/** Safe string translation.
 *  Returns `fallback` if the key is missing, empty, or returns the key path. */
export function ts(
  t: Translator,
  key: string,
  fallback: string,
  values?: Record<string, string | number | Date>,
): string {
  try {
    const v = values ? t(key, values) : t(key)
    if (typeof v === 'string' && v.length > 0 && v !== key) return v
    return fallback
  } catch {
    return fallback
  }
}

/** Safe array translation (e.g. a `features` list).
 *  Returns `fallback` (default `[]`) if the key is missing or not an array.
 *  This is the most common crash site in server-rendered pricing pages. */
export function ta(
  t: Translator,
  key: string,
  fallback: string[] = [],
): string[] {
  try {
    const v = t.raw(key)
    return Array.isArray(v) ? (v as string[]) : fallback
  } catch {
    return fallback
  }
}
