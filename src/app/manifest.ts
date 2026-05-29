import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'We2 - Grow Together, Love Deeper',
    short_name: 'We2',
    description: 'The couple\'s app that turns everyday moments into lasting emotional habits.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#8b5cf6',
    orientation: 'portrait-primary',
    lang: 'en',
    dir: 'ltr',
    scope: '/',
    categories: ['lifestyle', 'social', 'health'],
    screenshots: [
      {
        src: '/screenshots/home.png',
        sizes: '1170x2532',
        type: 'image/png',
      },
    ],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  }
}