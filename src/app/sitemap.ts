import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'

const pages = [
  { path: '', changefreq: 'weekly' as const, priority: 1.0 },
  { path: '/pricing', changefreq: 'weekly' as const, priority: 0.9 },
  { path: '/faq', changefreq: 'monthly' as const, priority: 0.8 },
  { path: '/features', changefreq: 'monthly' as const, priority: 0.8 },
  { path: '/blog', changefreq: 'daily' as const, priority: 0.7 },
  { path: '/contact', changefreq: 'monthly' as const, priority: 0.6 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const page of pages) {
      entries.push({
        url: `https://Togthr.com/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changefreq,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `https://Togthr.com/${l}${page.path}`]),
          ),
        },
      })
    }
  }

  return entries
}