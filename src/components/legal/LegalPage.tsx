import { getTranslations } from 'next-intl/server'

export type LegalPageKey = 'privacy' | 'terms' | 'cookies' | 'help' | 'contact'

interface Section {
  heading: string
  body: string
}

/**
 * 共享法律/帮助页面组件
 * 数据源: messages/<locale>.json → legal.<page> 节点
 *   legal.<page> = { title, subtitle, lastUpdated?, sections: [{heading, body}, ...] }
 */
export default async function LegalPage({ page }: { page: LegalPageKey }) {
  const t = await getTranslations(`legal.${page}`)
  const sections = t.raw('sections') as Section[]
  // lastUpdated is optional — only present in privacy/terms/cookies
  let lastUpdated: string | undefined
  try {
    lastUpdated = t.has('lastUpdated') ? t('lastUpdated') : undefined
  } catch {
    lastUpdated = undefined
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-rose-50 via-pink-50 to-white px-4 py-16 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-zinc-950">
      <article className="w-full max-w-3xl">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
            {t('subtitle')}
          </p>
          {lastUpdated && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {lastUpdated}
            </p>
          )}
        </header>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
                {s.heading}
              </h2>
              <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-300">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      </article>
    </div>
  )
}
