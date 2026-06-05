/**
 * /journal — Shared Journal → 筑巢 (scene-rewritten)
 *
 * Each journal entry adds to the shared "nest" (background scene).
 * The nest evolves through 5 stages based on entry count, with different
 * decorations per stage. This is the visual representation of your
 * shared life growing together.
 *
 * Stages:  empty → seed → sprout → tree → full nest
 * Decorations switch by mood tag: warm / cool / festive
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

type Mood = 'warm' | 'cool' | 'festive'

interface Entry {
  id: string
  text: string
  mood: Mood
  ts: number
}

const STAGES = [
  { at: 0,  emoji: '🕳️', name: 'empty'    },
  { at: 1,  emoji: '🌱', name: 'seed'     },
  { at: 3,  emoji: '🌿', name: 'sprout'   },
  { at: 6,  emoji: '🌳', name: 'tree'     },
  { at: 10, emoji: '🏡', name: 'full-nest'},
] as const

const MOOD_DECOR: Record<Mood, string[]> = {
  warm:    ['🌻', '🕯️', '🧸', '🍵', '☕', '🧣'],
  cool:    ['❄️', '🌙', '🌊', '🍃', '🪨', '🌲'],
  festive: ['🎄', '🎃', '💝', '🎁', '🎉', '🎀'],
}

const SEED_ENTRIES: Entry[] = [
  { id: 'e1', text: '今天天气很好，出去走了走。', mood: 'warm',    ts: Date.now() - 86400e3 * 5 },
  { id: 'e2', text: '下雪了！南方人激动坏了。',   mood: 'cool',    ts: Date.now() - 86400e3 * 3 },
  { id: 'e3', text: '第一次一起过圣诞 🎄',         mood: 'festive', ts: Date.now() - 86400e3 * 1 },
]

function getStage(count: number): typeof STAGES[number] {
  let s: typeof STAGES[number] = STAGES[0]
  for (const stage of STAGES) if (count >= stage.at) s = stage
  return s
}

export default function JournalNestPage() {
  const t = useTranslations('journal')
  const [entries, setEntries] = useState<Entry[]>(SEED_ENTRIES)
  const [draft, setDraft] = useState('')
  const [mood, setMood] = useState<Mood>('warm')

  const stage = getStage(entries.length)
  const nextStage = STAGES.find(s => s.at > entries.length)
  const progress = nextStage
    ? Math.round(((entries.length - stage.at) / (nextStage.at - stage.at)) * 100)
    : 100

  function addEntry() {
    if (!draft.trim()) return
    setEntries(prev => [{
      id: 'e' + Date.now(),
      text: draft,
      mood,
      ts: Date.now(),
    }, ...prev])
    setDraft('')
  }

  // Build decoration list based on stage + dominant mood
  const decorCount = Math.min(8, Math.floor(entries.length * 0.6))
  const dominantMood: Mood = (() => {
    const counts: Record<Mood, number> = { warm: 0, cool: 0, festive: 0 }
    entries.forEach(e => counts[e.mood]++)
    const top = (Object.entries(counts) as [Mood, number][]).sort((a, b) => b[1] - a[1])[0]
    return top[1] > 0 ? top[0] : 'warm'
  })()
  const decorations = MOOD_DECOR[dominantMood].slice(0, decorCount)

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden bg-gradient-to-b from-[#1a0b2e] via-[#0f0524] to-[#0a0118] px-4 py-10 text-zinc-100">
      {/* ── Cinematic atmosphere ── */}
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
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              top: `${20 + (i * 41) % 65}%`,
              left: `${(i * 47) % 100}%`,
              width: 80 + (i * 17) % 70,
              height: 80 + (i * 17) % 70,
              background: `radial-gradient(circle, hsla(${140 + (i * 27) % 60}, 60%, 45%, 0.13) 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent sm:text-4xl">
          🪺 {t('title')}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Nest Visual */}
      <div className="relative mx-auto mb-8 h-64 w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 dark:border-emerald-800 dark:from-sky-950/40 dark:via-emerald-950/40 dark:to-amber-950/40">
        {/* Sky → ground gradient is the base */}

        {/* Decorations on the ground */}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-center gap-2 p-4">
          <AnimatePresence>
            {decorations.map((emoji, i) => (
              <motion.span
                key={`${stage.name}-${i}-${emoji}`}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: i * 0.05 }}
                className="text-3xl drop-shadow"
                style={{ marginBottom: `${(i % 3) * 4}px` }}
              >
                {emoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* Central feature: stage emoji */}
        <motion.div
          key={stage.name}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 18 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl"
        >
          {stage.emoji}
        </motion.div>

        {/* Pet sitting in nest */}
        <motion.div
          className="absolute bottom-4 right-8 text-5xl drop-shadow-lg"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pets/robot-base.png" alt="pet" className="h-20 w-20 object-contain" />
        </motion.div>
      </div>

      {/* Stage + Progress */}
      <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-emerald-700 dark:text-emerald-300">
            {t('stage')}: <span className="font-bold">{t(`stageName.${stage.name}`)}</span>
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            {nextStage
              ? t('nextStage', { next: t(`stageName.${nextStage.name}`) })
              : t('complete')}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {t('entriesCount', { n: entries.length })}
        </p>
      </div>

      {/* New entry form */}
      <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
        <textarea
          placeholder={t('writePlaceholder')}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            {(['warm', 'cool', 'festive'] as Mood[]).map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${
                  mood === m
                    ? 'scale-105 border-rose-400 bg-rose-50 font-semibold dark:border-purple-500 dark:bg-purple-950/40'
                    : 'border-zinc-200 hover:scale-105 dark:border-zinc-700'
                }`}
              >
                {t(`mood.${m}`)}
              </button>
            ))}
          </div>
          <button
            onClick={addEntry}
            disabled={!draft.trim()}
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow hover:shadow-emerald-500/50 disabled:opacity-50"
          >
            🌱 {t('save')}
          </button>
        </div>
      </div>

      {/* Entries list */}
      <div className="space-y-3">
        {entries.map(entry => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                entry.mood === 'warm'    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                entry.mood === 'cool'    ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' :
                                           'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
              }`}>
                {entry.mood === 'warm'    ? '☀️' : entry.mood === 'cool' ? '❄️' : '🎉'} {t(`mood.${entry.mood}`)}
              </span>
              <span>{new Date(entry.ts).toLocaleDateString()}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{entry.text}</p>
          </motion.div>
        ))}
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
