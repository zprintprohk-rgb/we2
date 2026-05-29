/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://we2.com',
  generateRobotsTxt: false,
  exclude: ['/api/*', '/server-sitemap.xml'],
  alternateRefs: [
    { href: 'https://we2.com/', hreflang: 'en' },
    { href: 'https://we2.com/zh-cn', hreflang: 'zh-cn' },
    { href: 'https://we2.com/zh-tw', hreflang: 'zh-tw' },
    { href: 'https://we2.com/ja', hreflang: 'ja' },
    { href: 'https://we2.com/ko', hreflang: 'ko' },
    { href: 'https://we2.com/de', hreflang: 'de' },
    { href: 'https://we2.com/fr', hreflang: 'fr' },
    { href: 'https://we2.com/es', hreflang: 'es' },
    { href: 'https://we2.com/', hreflang: 'x-default' },
  ],
  additionalPaths: async (config) => {
    const paths = []
    const nonDefaultLocales = ['zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'fr', 'es']
    const routes = ['', '/faq', '/guide', '/pricing', '/login', '/register']

    // default locale (en) uses root path — no locale prefix
    for (const route of routes) {
      paths.push({
        loc: `${route}`,
        changefreq: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.7,
        lastmod: new Date().toISOString(),
      })
    }

    // non-default locales use prefixed paths
    for (const locale of nonDefaultLocales) {
      for (const route of routes) {
        paths.push({
          loc: `/${locale}${route}`,
          changefreq: route === '' ? 'weekly' : 'monthly',
          priority: route === '' ? 1.0 : 0.7,
          lastmod: new Date().toISOString(),
        })
      }
    }
    return paths
  },
}