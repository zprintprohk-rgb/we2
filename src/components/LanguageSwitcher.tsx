'use client'

import { useRouter, usePathname } from '@/i18n/routing'
import { routing, type Locale } from '@/i18n/routing'

const LABELS: Record<string, string> = {
  en: 'English',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  ja: '日本語',
  ko: '한국어',
}

type Props = {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.replace(pathname, { locale: e.target.value })
  }

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      className="h-9 rounded-full border border-zinc-200 bg-transparent px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {routing.locales.map((locale) => (
        <option key={locale} value={locale}>
          {LABELS[locale] || locale}
        </option>
      ))}
    </select>
  )
}