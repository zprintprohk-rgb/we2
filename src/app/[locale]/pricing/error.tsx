'use client'

/* ── Pricing Page ErrorBoundary ─────────────────────────────────────────────
 * Catches runtime errors thrown by the server component (e.g. a missing
 * i18n key, a CF-IPCountry header issue, or a malformed t.raw() return).
 * Shows a friendly recovery UI instead of the generic "Application error". */

export default function PricingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Pricing is taking a quick breather
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        We hit a hiccup rendering the plans. Everything else is still up.
      </p>

      {error.message ? (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-xs text-zinc-500 dark:text-zinc-400 hover:underline">
            Technical details
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
            {error.message}
            {error.digest ? `\nDigest: ${error.digest}` : ''}
          </pre>
        </details>
      ) : null}

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-700"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          Back to home
        </a>
      </div>
    </div>
  )
}
