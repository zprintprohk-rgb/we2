import type { NextRequest } from 'next/server'

const locales: string[] = ['en', 'zh-cn', 'zh-tw', 'ja', 'ko', 'de', 'fr', 'es']

function isLocale(s: string | null): s is (typeof locales)[number] {
  return s != null && locales.includes(s)
}

function escapeXml(s: string): string {
  return s
    .replaceAll(`&`, `\x26amp;`)
    .replaceAll(`<`, `\x26lt;`)
    .replaceAll(`>`, `\x26gt;`)
    .replaceAll(`"`, `\x26quot;`)
    .replaceAll(`'`, `\x26apos;`)
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + word).length > maxChars) {
      lines.push(current.trim())
      current = word + ' '
    } else {
      current += word + ' '
    }
  }
  if (current.trim()) lines.push(current.trim())
  return lines
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Togthr'
  const locale = isLocale(searchParams.get('locale')) ? searchParams.get('locale')! : 'en'

  const titleLines = wrapText(escapeXml(title), 30)
  const lineHeight = 60
  const startY = 350 - ((titleLines.length - 1) * lineHeight) / 2

  const titleElements = titleLines
    .map(
      (line, i) =>
        `<text x="600" y="${startY + i * lineHeight}" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="700" fill="#e2e8f0">${line}</text>`,
    )
    .join('\n  ')

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
    '  <defs>',
    '    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
    '      <stop offset="0%" style="stop-color:#0f172a"/>',
    '      <stop offset="100%" style="stop-color:#1e293b"/>',
    '    </linearGradient>',
    '  </defs>',
    '  <rect width="1200" height="630" fill="url(#bg)"/>',
    '  <text x="600" y="140" text-anchor="middle" font-family="sans-serif" font-size="72" font-weight="900" fill="#38bdf8" letter-spacing="-2">Togthr</text>',
    `  ${titleElements}`,
    '  <text x="1120" y="590" text-anchor="end" font-family="sans-serif" font-size="28" fill="#64748b" font-weight="500">Togthr.com</text>',
    `  <text x="80" y="590" text-anchor="start" font-family="sans-serif" font-size="24" fill="#475569">${escapeXml(locale)}</text>`,
    '</svg>',
  ].join('\n')

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}