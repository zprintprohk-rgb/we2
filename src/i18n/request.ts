import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

type Messages = Record<string, unknown>

async function deepMerge(base: Messages, overlay: Messages): Promise<Messages> {
  const result = { ...base }
  for (const [key, value] of Object.entries(overlay)) {
    if (value != null && typeof value === 'object' && !Array.isArray(value) && key in result && typeof result[key] === 'object' && result[key] != null && !Array.isArray(result[key])) {
      result[key] = await deepMerge(result[key] as Messages, value as Messages)
    } else {
      result[key] = value
    }
  }
  return result
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested! : routing.defaultLocale

  // Load main messages
  let messages: Messages = (await import(`../../messages/${locale}.json`)).default

  // Merge FAQ messages if available (lazy load — won't fail if file doesn't exist)
  try {
    const faqMessages = (await import(`../../messages/faq.${locale}.json`)).default
    messages = await deepMerge(messages, { faq: (faqMessages as Record<string, unknown>).faq ?? faqMessages })
  } catch {
    // FAQ not available for this locale — skip
  }

  // Merge Guide messages if available
  try {
    const guideMessages = (await import(`../../messages/guide.${locale}.json`)).default
    messages = await deepMerge(messages, { guide: (guideMessages as Record<string, unknown>).guide ?? guideMessages })
  } catch {
    // Guide not available for this locale — skip
  }

  return {
    locale,
    messages,
    timeZone: 'Asia/Shanghai',
    now: new Date(),
  }
})
