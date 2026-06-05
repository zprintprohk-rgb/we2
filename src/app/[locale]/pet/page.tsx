/**
 * /pet — Virtual Pet → 共生形态 (scene-rewritten)
 *
 * The pet's form/background changes based on relationship state:
 * - happy (甜蜜) → glow + sparkles + warm gradient
 * - sad   (吵架) → rain + grey sky + slumped pet
 * - thinking (思考) → dim purple + thought bubble
 * - sleeping (入睡) → moon + stars + Zzz
 *
 * MVP: 4 mood buttons, each toggles overlay + pet expression.
 * Day 2: tie to actual relationship signals (last check-in, capsule count).
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

type Mood = 'happy' | 'sad' | 'thinking' | 'sleeping'

interface MoodConfig {
  bg: string
  petImg: string
  petLabel: string
  bubble: string
  overlay: 'sparkles' | 'rain' | 'thought' | 'stars' | null
  icon: string
  moodColor: string
}

const MOODS: Record<Mood, MoodConfig> = {
  happy: {
    bg: 'from-amber-100 via-rose-100 to-pink-100 dark:from-amber-950/40 dark:via-rose-950/40 dark:to-pink-950/40',
    petImg: '/pets/expression-happy.png',
    petLabel: 'happy',
    bubble: '甜甜的~',
    overlay: 'sparkles',
    icon: '✨',
    moodColor: 'text-amber-500',
  },
  sad: {
    bg: 'from-slate-200 via-zinc-200 to-gray-300 dark:from-slate-800 dark:via-zinc-800 dark:to-gray-900',
    petImg: '/pets/expression-angry.png',
    petLabel: 'angry',
    bubble: '哼... 不想说话',
    overlay: 'rain',
    icon: '🌧️',
    moodColor: 'text-slate-500',
  },
  thinking: {
    bg: 'from-indigo-100 via-purple-100 to-violet-200 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-violet-900/40',
    petImg: '/pets/robot-base.png',
    petLabel: 'thinking',
    bubble: '嗯... 在想...',
    overlay: 'thought',
    icon: '💭',
    moodColor: 'text-indigo-500',
  },
  sleeping: {
    bg: 'from-indigo-900 via-blue-900 to-slate-900 dark:from-indigo-950 dark:via-blue-950 dark:to-slate-950',
    petImg: '/pets/expression-sleeping.png',
    petLabel: 'sleeping',
    bubble: 'Zzz...',
    overlay: 'stars',
    icon: '🌙',
    moodColor: 'text-blue-300',
  },
}

const MOODS_LIST: Mood[] = ['happy', 'sad', 'thinking', 'sleeping']

export default function PetSymbiosisPage() {
  const t = useTranslations('pet')
  const [mood, setMood] = useState<Mood>('happy')
  const cfg = MOODS[mood]

  return (
    <div className={`relative min-h-[80vh] overflow-hidden bg-gradient-to-b ${cfg.bg} text-zinc-100 transition-colors duration-1000`}>
      {/* ── Cinematic atmosphere (constellation + bokeh) ── */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-zinc-200"
            style={{
              top: `${(i * 47) % 100}%`,
              left: `${(i * 79) % 100}%`,
              width: (i % 4) + 1,
              height: (i % 4) + 1,
              opacity: 0.3,
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
              background: `radial-gradient(circle, hsla(${280 + (i * 27) % 60}, 70%, 50%, 0.12) 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>
      {/* Header */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-10 text-center">
        <h1 className={`text-3xl font-bold tracking-tight sm:text-4xl ${cfg.moodColor} transition-colors duration-1000`}>
          🐾 {t('title')}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Pet Stage */}
      <div className="relative mx-auto mt-8 h-80 w-full max-w-2xl">
        {/* Background overlay */}
        <AnimatePresence mode="wait">
          {cfg.overlay === 'sparkles' && (
            <motion.div
              key="sparkles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              {Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl"
                  style={{
                    top: `${(i * 37) % 100}%`,
                    left: `${(i * 53) % 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2 + (i % 3),
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: 'easeInOut',
                  }}
                >
                  ✨
                </motion.span>
              ))}
            </motion.div>
          )}

          {cfg.overlay === 'rain' && (
            <motion.div
              key="rain"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-8 w-0.5 rounded-full bg-blue-400/60 dark:bg-blue-300/40"
                  style={{ left: `${(i * 13) % 100}%`, top: '-10%' }}
                  animate={{ y: ['0vh', '110vh'] }}
                  transition={{
                    duration: 0.7 + (i % 4) * 0.15,
                    repeat: Infinity,
                    delay: (i % 7) * 0.1,
                    ease: 'linear',
                  }}
                />
              ))}
            </motion.div>
          )}

          {cfg.overlay === 'thought' && (
            <motion.div
              key="thought"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-20"
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                💭
              </motion.div>
            </motion.div>
          )}

          {cfg.overlay === 'stars' && (
            <motion.div
              key="stars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              {Array.from({ length: 25 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute text-white"
                  style={{
                    top: `${(i * 41) % 80}%`,
                    left: `${(i * 67) % 100}%`,
                    fontSize: `${6 + (i % 4) * 4}px`,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.5 + (i % 3) * 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                >
                  ✦
                </motion.span>
              ))}
              <motion.div
                className="absolute right-8 top-8 text-7xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌙
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pet character */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mood}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: mood === 'sleeping' ? [0, 2, 0] : mood === 'happy' ? [0, -10, 0] : [0, -4, 0],
            }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{
              y: { duration: mood === 'sleeping' ? 4 : 2, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className={mood === 'happy' ? 'animate-pulse-slow rounded-full ring-8 ring-amber-300/40' : ''}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cfg.petImg}
                alt={cfg.petLabel}
                className="h-56 w-56 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mood + '-bubble'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="absolute right-4 top-4 max-w-[55%] rounded-2xl border-2 border-white/40 bg-white/80 px-4 py-2 text-sm font-medium text-zinc-700 shadow-lg backdrop-blur dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:text-zinc-200"
          >
            {cfg.icon} {cfg.bubble}
          </motion.div>
        </AnimatePresence>

        {/* Sleeping Zzz floating */}
        {mood === 'sleeping' && (
          <motion.div
            className="absolute left-1/2 top-1/2 ml-16 -mt-12 text-2xl text-blue-200"
            animate={{ y: [0, -30, -60], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          >
            💤
          </motion.div>
        )}
      </div>

      {/* Mood Selector */}
      <div className="relative z-10 mx-auto mt-8 max-w-2xl px-4 pb-12">
        <p className="mb-3 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {t('pickMood')}
        </p>
        <div className="grid grid-cols-4 gap-3">
          {MOODS_LIST.map(m => {
            const mCfg = MOODS[m]
            const isActive = m === mood
            return (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition-all ${
                  isActive
                    ? 'scale-105 border-rose-400 bg-rose-50 shadow-lg dark:border-purple-500 dark:bg-purple-950/40'
                    : 'border-zinc-200 bg-white hover:scale-105 hover:border-rose-200 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-purple-700'
                }`}
              >
                <span className="text-3xl">{mCfg.icon}</span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {t(`mood.${m}`)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Pet status */}
        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t('status')}{' '}
          <span className={`font-semibold ${cfg.moodColor}`}>
            {t(`mood.${mood}`)}
          </span>
          {' '}· {t('day', { n: 42 })}
        </div>
      </div>

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
