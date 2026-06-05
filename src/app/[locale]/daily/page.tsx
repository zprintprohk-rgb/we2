/**
 * /daily — 喂食时间 (Daily Check-in, scene-rewritten)
 *
 * Replaces the old 5-question check-in form with a single, pet-centered
 * moment: "Is the other one with you today?" → high-five + heart feed.
 *
 * Flow:
 * 1. Pet sits in center, idle animation
 * 2. Single binary question (universal: works for any relationship)
 * 3. User taps "在一起" / "不在" → pet does 击掌 + drops heart feed
 * 4. Drag the heart to the pet's mouth → pet eats → happiness meter +1
 * 5. Pet says a personalized bubble, mood shifts to success state
 *
 * State: client-only for MVP Day 1. Day 2 wires to Supabase daily_checkins table.
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

type Mood = 'idle' | 'asking' | 'highfive' | 'feeding' | 'happy' | 'thinking'
type Answer = 'with' | 'apart' | null

const HEART_FEED = '❤️'
const HIGHFIVE = '🖐️'
const POKEMON_OK = '✋'

export default function DailyFeedingPage() {
  const t = useTranslations('daily')
  const [mood, setMood] = useState<Mood>('idle')
  const [answer, setAnswer] = useState<Answer>(null)
  const [hunger, setHunger] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bubble, setBubble] = useState<string>(t('bubbleIdle'))

  function startFeeding(ans: 'with' | 'apart') {
    setAnswer(ans)
    setMood('asking')
    setBubble(ans === 'with' ? t('bubbleWith') : t('bubbleApart'))
    setTimeout(() => {
      setMood('highfive')
      setBubble(ans === 'with' ? HIGHFIVE + ' ' + t('withBtn') : POKEMON_OK + ' ' + t('bubbleApart'))
    }, 1200)
    setTimeout(() => {
      setMood('feeding')
      setBubble(HEART_FEED + ' ' + t('bubbleFeed'))
    }, 2400)
  }

  function feedPet() {
    if (mood !== 'feeding') return
    setMood('happy')
    const newHunger = Math.min(100, hunger + 20)
    const newStreak = streak + 1
    setHunger(newHunger)
    setStreak(newStreak)
    setBubble(newHunger >= 100 ? t('bubbleFull') : t('bubbleMore'))
  }

  function reset() {
    setMood('idle')
    setAnswer(null)
    setBubble(t('bubbleIdle'))
  }

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#0f0524] to-[#0a0118] px-4 py-8 text-zinc-100">
      {/* ── Atmospheric layers ── */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 35 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-zinc-200"
            style={{
              top: `${(i * 47) % 100}%`,
              left: `${(i * 79) % 100}%`,
              width: (i % 4) + 1,
              height: (i % 4) + 1,
              opacity: 0.35,
            }}
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              top: `${20 + (i * 41) % 65}%`,
              left: `${(i * 47) % 100}%`,
              width: 80 + (i * 17) % 70,
              height: 80 + (i * 17) % 70,
              background: `radial-gradient(circle, hsla(${280 + (i * 27) % 60}, 70%, 50%, 0.13) 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>
      {/* ── Pet Stage ── */}
      <div className="relative mb-8 h-64 w-full">
        {/* Pet character — uses existing base for now */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={
            mood === 'happy'
              ? { y: [0, -20, 0, -10, 0], rotate: [0, -5, 5, -3, 0] }
              : mood === 'highfive'
                ? { y: [0, -10, 0, -8, 0], scale: [1, 1.05, 1, 1.03, 1] }
                : mood === 'feeding'
                  ? { y: [0, -5, 0] }
                  : { y: [0, -4, 0] }
          }
          transition={{ duration: mood === 'happy' ? 1.2 : 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pets/robot-base.png"
            alt="Togthr pet"
            className="h-48 w-48 object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Pet bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={bubble}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="absolute right-4 top-4 max-w-[60%] rounded-2xl border-2 border-rose-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-lg dark:border-purple-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {bubble}
            <span className="absolute -bottom-2 left-6 h-3 w-3 rotate-45 border-b-2 border-r-2 border-rose-300 bg-white dark:border-purple-700 dark:bg-zinc-800" />
          </motion.div>
        </AnimatePresence>

        {/* Heart feed (draggable) */}
        {mood === 'feeding' && (
          <motion.div
            drag
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            dragElastic={0.5}
            onDragEnd={(_, info) => {
              // If dropped near center (pet), feed
              if (Math.abs(info.point.x - 0) < 80 && Math.abs(info.point.y - 0) < 80) {
                feedPet()
              }
            }}
            whileDrag={{ scale: 1.3, cursor: 'grabbing' }}
            className="absolute bottom-8 left-8 cursor-grab text-5xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {HEART_FEED}
            <p className="mt-1 text-center text-xs text-zinc-500">{t('dragHint')}</p>
          </motion.div>
        )}

        {/* Confetti on happy */}
        {mood === 'happy' && (
          <div className="pointer-events-none absolute inset-0">
            {['🎉', '✨', '⭐', '💖', '🌟'].map((e, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl"
                style={{ left: `${20 + i * 15}%`, top: `${10 + (i % 2) * 30}%` }}
                initial={{ y: 0, opacity: 1, scale: 0.5 }}
                animate={{ y: 200, opacity: 0, scale: 1.2, rotate: 360 }}
                transition={{ duration: 1.5, delay: i * 0.1, ease: 'easeOut' }}
              >
                {e}
              </motion.span>
            ))}
          </div>
        )}
      </div>

      {/* ── Happiness Meter ── */}
      <div className="mb-6 w-full max-w-md">
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
          <span>{t('hunger')}</span>
          <span>{hunger}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${hunger}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        {streak > 0 && (
          <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400">
            {t('streak', { n: streak })}
          </p>
        )}
      </div>

      {/* ── Action buttons ── */}
      <AnimatePresence mode="wait">
        {mood === 'idle' && (
          <motion.div
            key="q1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex w-full max-w-md flex-col gap-3"
          >
            <p className="text-center text-lg font-medium text-zinc-700 dark:text-zinc-300">
              {t('q')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => startFeeding('with')}
                className="rounded-2xl border-2 border-rose-200 bg-white px-4 py-4 text-sm font-semibold text-rose-600 transition-all hover:scale-105 hover:border-rose-400 hover:bg-rose-50 hover:shadow-lg dark:border-purple-800 dark:bg-zinc-800 dark:text-purple-300 dark:hover:bg-purple-900/50"
              >
                {t('withBtn')}
              </button>
              <button
                onClick={() => startFeeding('apart')}
                className="rounded-2xl border-2 border-zinc-200 bg-white px-4 py-4 text-sm font-semibold text-zinc-600 transition-all hover:scale-105 hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {t('apartBtn')}
              </button>
            </div>
          </motion.div>
        )}

        {mood === 'happy' && (
          <motion.button
            key="again"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={reset}
            className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-purple-500/50"
          >
            {t('again')}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating mascot (always-on companion) */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.6 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8, type: 'spring' }}
        className="fixed bottom-6 right-6 z-40 hidden md:block pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative h-20 w-20"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/30 via-rose-300/30 to-purple-400/30 blur-xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pets/robot-base.png" alt="" className="relative h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(251,191,36,0.4)]" />
          <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-[#0a0118] bg-emerald-400 animate-pulse" />
        </motion.div>
      </motion.div>
    </div>
  )
}
