'use client'

/**
 * Global error boundary — wraps every [locale] route.
 * Catches any uncaught error in child server/client components and
 * renders a friendly fallback instead of a blank white page.
 *
 * IMPORTANT: This is a Client Component (must be for error boundaries).
 * Keep it dependency-free so the bundle stays tiny.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Server-side errors are logged with a digest for tracing.
    // Client-side errors get the full message.
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[Togthr error boundary]', error)
    }
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      {/* Pixel art mascot for visual continuity */}
      <div className="text-7xl mb-4 animate-pulse-slow">🐾</div>

      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Something went sideways
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        The page hit a snag. Your pet is on it.
      </p>

      {error.digest && (
        <p className="mt-4 rounded-md bg-zinc-100 px-3 py-1 font-mono text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/50"
        >
          🔄 Try again
        </button>
        <button
          onClick={() => router.push('/')}
          className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          🏠 Home
        </button>
      </div>
    </div>
  )
}
