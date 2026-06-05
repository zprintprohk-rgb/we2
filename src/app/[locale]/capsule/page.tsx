/**
 * /capsule — Time Capsule → 挖宝 (scene-rewritten)
 *
 * Replaces the old list-style "letter → schedule delivery" with a treasure
 * hunt: capsules are buried on a 3x3 grid, the pet walks over and digs
 * them up, then opens a chest that reveals the memory.
 *
 * State: client-only mock for MVP Day 1. Day 2 wires to Supabase
 * time_capsules table + R2 storage for media.
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

type Capsule = {
  id: string
  cell: number        // 0-8
  buried: boolean     // true = still in ground, false = already opened
  title: string
  content: string
  emoji: string
  openDate: string
}

const SEED_CAPSULES: Capsule[] = [
  { id: 'c1', cell: 0, buried: true,  title: '我们的第一次',   content: '记得那天阳光很好...', emoji: '📷', openDate: '2026-12-25' },
  { id: 'c2', cell: 4, buried: true,  title: '想对未来的你说',  content: '希望我们还在一起',   emoji: '💌', openDate: '2027-01-01' },
  { id: 'c3', cell: 8, buried: true,  title: '一段语音',        content: '🎤 00:23',           emoji: '🎤', openDate: '2026-11-11' },
  { id: 'c4', cell: 2, buried: false, title: '已经挖出来的',    content: '去年今日',           emoji: '🌸', openDate: '2025-06-05' },
]

type DigState = 'idle' | 'walking' | 'digging' | 'opening' | 'opened'

export default function CapsulePage() {
  const t = useTranslations('capsule')
  const [capsules, setCapsules] = useState<Capsule[]>(SEED_CAPSULES)
  const [petCell, setPetCell] = useState(4) // starts in center
  const [digState, setDigState] = useState<DigState>('idle')
  const [activeCell, setActiveCell] = useState<number | null>(null)
  const [showWrite, setShowWrite] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const buried = capsules.filter(c => c.buried)
  const opened = capsules.filter(c => !c.buried)

  function digAt(cell: number) {
    if (digState !== 'idle') return
    const target = capsules.find(c => c.cell === cell && c.buried)
    if (!target) return

    setActiveCell(cell)
    setDigState('walking')

    // Walk to cell
    setTimeout(() => setPetCell(cell), 50)
    setTimeout(() => {
      setDigState('digging')
    }, 700)
    setTimeout(() => {
      setDigState('opening')
    }, 1900)
    setTimeout(() => {
      setDigState('opened')
      setCapsules(prev => prev.map(c => c.id === target.id ? { ...c, buried: false } : c))
    }, 2900)
  }

  function closeChest() {
    setDigState('idle')
    setActiveCell(null)
  }

  function buryNew() {
    if (!newTitle.trim()) return
    const emptyCells = [0,1,2,3,5,6,7,8].filter(c => !capsules.some(cp => cp.cell === c))
    const cell = emptyCells[0] ?? 0
    setCapsules(prev => [...prev, {
      id: 'c' + Date.now(),
      cell,
      buried: true,
      title: newTitle,
      content: newContent || '...',
      emoji: '📦',
      openDate: new Date(Date.now() + 90 * 86400e3).toISOString().slice(0, 10),
    }])
    setNewTitle('')
    setNewContent('')
    setShowWrite(false)
  }

  // Pet position in grid (0-8)
  const row = Math.floor(petCell / 3)
  const col = petCell % 3

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
              background: `radial-gradient(circle, hsla(${30 + (i * 27) % 60}, 70%, 50%, 0.12) 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent sm:text-4xl">
          ⛏️ {t('title')}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t('subtitle')}
        </p>
        <div className="mt-3 flex items-center justify-center gap-3 text-xs">
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            📦 {buried.length} {t('buried')}
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            ✨ {opened.length} {t('opened')}
          </span>
        </div>
      </div>

      {/* 3x3 Grid Map */}
      <div className="relative mx-auto aspect-square w-full max-w-md rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-inner dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="grid h-full grid-cols-3 grid-rows-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => {
            const cap = capsules.find(c => c.cell === i)
            const isPetHere = petCell === i && digState === 'walking'
            const isDigging = activeCell === i && digState === 'digging'
            const isOpening = activeCell === i && digState === 'opening'
            return (
              <button
                key={i}
                onClick={() => digAt(i)}
                disabled={!cap || !cap.buried || digState !== 'idle'}
                className={`relative flex items-center justify-center rounded-2xl border-2 transition-all ${
                  cap
                    ? cap.buried
                      ? 'border-amber-300 bg-amber-100 hover:scale-105 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-900/40 dark:hover:bg-amber-900/60'
                      : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/30'
                } ${isDigging || isOpening ? 'animate-pulse' : ''}`}
              >
                {cap && cap.buried && (
                  <div className="text-3xl">
                    {isDigging ? '⛏️' : isOpening ? '📦' : '🌱'}
                  </div>
                )}
                {cap && !cap.buried && <div className="text-2xl opacity-60">✨</div>}
                {isPetHere && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-6 text-3xl"
                  >
                    🐾
                  </motion.div>
                )}
              </button>
            )
          })}
        </div>

        {/* Pet character overlay */}
        <motion.div
          className="pointer-events-none absolute z-10"
          animate={{
            top: `calc(${row * 33.33}% + ${row === 1 ? '50%' : '0%'})`,
            left: `calc(${col * 33.33}% + ${col === 1 ? '50%' : '0%'})`,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            animate={
              digState === 'walking' ? { x: [0, -3, 3, -3, 0] } :
              digState === 'digging' ? { rotate: [0, -10, 10, -10, 0] } :
              { y: [0, -3, 0] }
            }
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-4xl drop-shadow-lg"
          >
            🤖
          </motion.div>
        </motion.div>
      </div>

      {/* Opened capsule modal */}
      <AnimatePresence>
        {digState === 'opened' && activeCell !== null && (() => {
          const cap = capsules.find(c => c.cell === activeCell && !c.buried)
          if (!cap) return null
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={closeChest}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="relative w-full max-w-sm rounded-3xl border-4 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 p-8 text-center shadow-2xl dark:from-amber-950/60 dark:to-yellow-950/60"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-6xl mb-3">{cap.emoji}</div>
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200">{cap.title}</h3>
                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{cap.content}</p>
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  {t('openedOn')} {cap.openDate}
                </p>
                <button
                  onClick={closeChest}
                  className="mt-6 rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
                >
                  {t('close')} ✨
                </button>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>

      {/* New capsule form */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setShowWrite(!showWrite)}
          className="rounded-full border-2 border-amber-300 bg-white px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-zinc-800 dark:text-amber-300 dark:hover:bg-amber-900/30"
        >
          {showWrite ? t('cancel') : `✏️ ${t('write')}`}
        </button>

        {showWrite && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-4 max-w-md rounded-2xl border-2 border-amber-200 bg-white p-4 text-left dark:border-amber-800 dark:bg-zinc-800"
          >
            <input
              type="text"
              placeholder={t('writeTitle')}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <textarea
              placeholder={t('writePlaceholder')}
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              onClick={buryNew}
              className="mt-3 w-full rounded-full bg-amber-500 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              🌱 {t('save')}
            </button>
          </motion.div>
        )}
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
