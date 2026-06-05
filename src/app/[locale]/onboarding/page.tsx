/**
 * /onboarding — first-time user flow.
 *
 * 3 steps:
 *  1. Welcome — meet the Togthr companion
 *  2. Name it — give your pet a name (universal, personalizes everything)
 *  3. Mode — solo / with someone (universal, no niche)
 *
 * MVP Day 1: stores choices in localStorage. Day 2: write to Supabase
 * user_profiles (pet_name, mode) on completion.
 *
 * Universal: never assumes a specific relationship type.
 */

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/i18n/routing'

type Mode = 'solo' | 'together' | null
type Step = 0 | 1 | 2 | 3 // 0 = welcome, 1 = name, 2 = mode, 3 = done

const STORAGE_KEY = 'togthr.onboarding.v1'

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [step, setStep] = useState<Step>(0)
  const [petName, setPetName] = useState('')
  const [mode, setMode] = useState<Mode>(null)
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage (Day 1: client-only persistence)
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        if (data.petName) setPetName(data.petName)
        if (data.mode) setMode(data.mode)
        // If already onboarded, jump to done
        if (data.completed) setStep(3)
      }
    } catch {
      // ignore
    }
  }, [])

  function next() {
    if (step < 3) setStep((step + 1) as Step)
  }
  function back() {
    if (step > 0) setStep((step - 1) as Step)
  }

  function finish() {
    if (!petName.trim() || !mode) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ petName: petName.trim(), mode, completed: true, ts: Date.now() }),
      )
    } catch {
      // localStorage unavailable
    }
    setStep(3)
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setPetName('')
    setMode(null)
    setStep(0)
  }

  const canProceed =
    (step === 1 && petName.trim().length > 0) ||
    (step === 2 && mode !== null)

  if (!mounted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-zinc-400">🐾</div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto flex min-h-[90vh] max-w-2xl flex-col items-center justify-center px-4 py-10">
      {/* Progress dots */}
      {step < 3 && (
        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className={`h-2 w-8 rounded-full transition-all ${
                i === step
                  ? 'w-12 bg-gradient-to-r from-rose-500 to-purple-600'
                  : i < step
                    ? 'bg-rose-300 dark:bg-purple-700'
                    : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-6 h-44 w-44 sm:h-56 sm:w-56"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pets/hero-golden.png"
                alt=""
                className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(251,191,36,0.35)]"
              />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
              {t('welcome.title')}
            </h1>
            <p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
              {t('welcome.subtitle')}
            </p>
            <button
              onClick={next}
              className="mt-8 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:shadow-purple-500/50"
            >
              {t('welcome.cta')} →
            </button>
          </motion.div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center"
          >
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-bold sm:text-3xl text-zinc-900 dark:text-zinc-100">
              {t('name.title')}
            </h2>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {t('name.subtitle')}
            </p>
            <input
              type="text"
              value={petName}
              onChange={e => setPetName(e.target.value)}
              maxLength={20}
              autoFocus
              placeholder={t('name.placeholder')}
              className="mt-6 w-full max-w-sm rounded-2xl border-2 border-zinc-200 bg-white px-5 py-3.5 text-center text-lg font-medium outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-rose-500 dark:focus:ring-rose-900/30"
            />
            <p className="mt-2 text-xs text-zinc-400">{petName.length}/20</p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={back}
                className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                ← {t('back')}
              </button>
              <button
                onClick={next}
                disabled={!petName.trim()}
                className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
              >
                {t('next')} →
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Mode */}
        {step === 2 && (
          <motion.div
            key="mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full text-center"
          >
            <div className="text-6xl mb-4">🤝</div>
            <h2 className="text-2xl font-bold sm:text-3xl text-zinc-900 dark:text-zinc-100">
              {t('mode.title')}
            </h2>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {t('mode.subtitle')}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => setMode('solo')}
                className={`rounded-2xl border-2 p-6 text-left transition-all ${
                  mode === 'solo'
                    ? 'scale-105 border-rose-400 bg-rose-50 shadow-lg dark:border-purple-500 dark:bg-purple-950/40'
                    : 'border-zinc-200 bg-white hover:scale-105 hover:border-rose-300 dark:border-zinc-700 dark:bg-zinc-800'
                }`}
              >
                <div className="text-3xl mb-2">🐾</div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {t('mode.solo.title')}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {t('mode.solo.desc')}
                </p>
              </button>

              <button
                onClick={() => setMode('together')}
                className={`rounded-2xl border-2 p-6 text-left transition-all ${
                  mode === 'together'
                    ? 'scale-105 border-rose-400 bg-rose-50 shadow-lg dark:border-purple-500 dark:bg-purple-950/40'
                    : 'border-zinc-200 bg-white hover:scale-105 hover:border-rose-300 dark:border-zinc-700 dark:bg-zinc-800'
                }`}
              >
                <div className="text-3xl mb-2">💞</div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {t('mode.together.title')}
                </h3>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {t('mode.together.desc')}
                </p>
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={back}
                className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                ← {t('back')}
              </button>
              <button
                onClick={finish}
                disabled={!mode}
                className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/50 disabled:opacity-50"
              >
                {t('finish')} 🎉
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center"
          >
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold sm:text-4xl bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {t('done.title', { name: petName || 'Togthr' })}
            </h2>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {mode === 'solo' ? t('done.soloNote') : t('done.togetherNote')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/daily"
                className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/50"
              >
                🐾 {t('done.feedPet')}
              </Link>
              <Link
                href="/chat"
                className="rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                💬 {t('done.sayHi')}
              </Link>
            </div>

            <button
              onClick={reset}
              className="mt-8 text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
            >
              {t('done.startOver')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
