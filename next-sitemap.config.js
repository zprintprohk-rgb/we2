/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://we2.com',
  generateRobotsTxt: false, // 手动管理 robots.txt
  exclude: ['/api/*', '/server-sitemap.xml'],
  alternateRefs: [
    { href: 'https://we2.com/en', hreflang: 'en' },
    { href: 'https://we2.com/zh-cn', hreflang: 'zh-cn' },
    { href: 'https://we2.com/zh-tw', hreflang: 'zh-tw' },
    { href: 'https://we2.com/ja', hreflang: 'ja' },
    { href: 'https://we2.com/ko', hreflang: 'ko' },
    { href: 'https://we2.com/de', hreflang: 'de' },
    { href: 'https://we2.com/fr', hreflang: 'fr' },
    { href: 'https://we2.com/es', hreflang: 'es' },
    { href: 'https://we2.com/en', hreflang: 'x-default' },
  ],
  // 多语言子路径
  additionalPaths: async (config) => {
    const paths = []
    const locales = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'fr', 'es']
    const routes = ['', '/faq', '/guide', '/pricing', '/login', '/register']

    for (const locale of locales) {
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