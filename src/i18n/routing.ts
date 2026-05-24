import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'fr', 'es'],
  defaultLocale: 'en',
  localeDetection: true,
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  'zh-cn': '简体中文',
  'zh-tw': '繁體中文',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  'zh-cn': '🇨🇳',
  'zh-tw': '🇹🇼',
  ja: '🇯🇵',
  ko: '🇰🇷',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
};