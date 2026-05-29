import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function NotFoundPage() {
  const t = useTranslations()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-6xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="mb-4 text-xl font-semibold text-zinc-700 dark:text-zinc-300">
        {t('notFound.title')}
      </h2>
      <p className="mb-8 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        {t('notFound.description')}
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {t('notFound.backHome')}
      </Link>
    </div>
  )
}