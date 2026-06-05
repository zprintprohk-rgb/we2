/**
 * /community — Tree Hole (PRD §6 — 树洞)
 *
 * Anonymous community. Universal positioning.
 *
 * Key rules:
 *  - No real names, no real avatars (random generated per post)
 *  - "抱抱" replaces like/upvote/downvote (soft, no judgment)
 *  - Auto-purge: posts older than 24h disappear
 *  - No comments (avoids pile-on, debate, drama)
 *  - Pure reading + sharing + 抱抱
 *
 * Day 1: client-only mock. Day 2: server-purged via cron.
 */

'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

type Mood = 'calm' | 'warm' | 'reflect' | 'light'

interface HolePost {
  id: string
  text: string
  mood: Mood
  hugs: number
  hugged: boolean
  ts: number
  // Random generated identity (no real name)
  alias: string
  avatarHue: number
}

const ALIASES = [
  'Quiet Fox', 'Sleepy Owl', 'Brave Bear', 'Soft Cloud', 'Tiny Star',
  'Drifting Leaf', 'Hidden River', 'Warm Bread', 'Lost Penguin', 'Lucky Cat',
  'Wandering Bee', 'Mountain Echo', 'Paper Boat', 'Mint Tea', 'Silver Fish',
]

const MOOD_EMOJI: Record<Mood, string> = {
  calm: '🌊', warm: '☕', reflect: '🌙', light: '✨',
}

const SEED_POSTS: HolePost[] = [
  {
    id: 'h1', text: '今天终于把拖延了三周的事做完了。松了口气。', mood: 'light',
    hugs: 42, hugged: false, ts: Date.now() - 3600e3,
    alias: 'Mint Tea', avatarHue: 145,
  },
  {
    id: 'h2', text: '有些话说不出口，写在这里。', mood: 'reflect',
    hugs: 89, hugged: false, ts: Date.now() - 7200e3,
    alias: 'Quiet Fox', avatarHue: 30,
  },
  {
    id: 'h3', text: '今天的小确幸：便利店新出的饭团。', mood: 'warm',
    hugs: 27, hugged: true, ts: Date.now() - 1800e3,
    alias: 'Sleepy Owl', avatarHue: 220,
  },
  {
    id: 'h4', text: '有人也喜欢深夜一个人走路吗？只有风的声音。', mood: 'calm',
    hugs: 56, hugged: false, ts: Date.now() - 14400e3,
    alias: 'Paper Boat', avatarHue: 280,
  },
]

const PURGE_MS = 24 * 3600 * 1000

export default function CommunityPage() {
  const t = useTranslations('community')
  const [posts, setPosts] = useState<HolePost[]>([])
  const [draft, setDraft] = useState('')
  const [mood, setMood] = useState<Mood>('calm')
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('togthr.community.v1')
      if (stored) {
        setPosts(JSON.parse(stored))
      } else {
        setPosts(SEED_POSTS)
      }
    } catch {
      setPosts(SEED_POSTS)
    }
  }, [])

  // Persist + auto-purge
  useEffect(() => {
    if (!mounted) return
    const now = Date.now()
    const live = posts.filter(p => now - p.ts < PURGE_MS)
    if (live.length !== posts.length) setPosts(live)
    try {
      localStorage.setItem('togthr.community.v1', JSON.stringify(live))
    } catch {}
  }, [posts, mounted])

  function publish() {
    if (!draft.trim()) return
    const newPost: HolePost = {
      id: 'h' + Date.now(),
      text: draft.trim().slice(0, 280),
      mood,
      hugs: 0,
      hugged: false,
      ts: Date.now(),
      alias: ALIASES[Math.floor(Math.random() * ALIASES.length)],
      avatarHue: Math.floor(Math.random() * 360),
    }
    setPosts(prev => [newPost, ...prev])
    setDraft('')
  }

  function hug(id: string) {
    setPosts(prev => prev.map(p =>
      p.id === id
        ? { ...p, hugged: !p.hugged, hugs: p.hugged ? p.hugs - 1 : p.hugs + 1 }
        : p
    ))
  }

  function timeAgo(ts: number): string {
    const m = Math.floor((Date.now() - ts) / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return '1d+'
  }

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
              background: `radial-gradient(circle, hsla(${220 + (i * 27) % 60}, 60%, 50%, 0.12) 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          🕳️ {t('title')}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t('subtitle')}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-400">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            🔒 {t('rule1')}
          </span>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            🤗 {t('rule2')}
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            ⏳ {t('rule3')}
          </span>
        </div>
      </div>

      {/* Composer */}
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <textarea
          placeholder={t('composer.placeholder')}
          value={draft}
          onChange={e => setDraft(e.target.value.slice(0, 280))}
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-rose-500 dark:focus:ring-rose-900/30"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {(['calm', 'warm', 'reflect', 'light'] as Mood[]).map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-all ${
                  mood === m
                    ? 'scale-105 border-rose-400 bg-rose-50 font-semibold dark:border-purple-500 dark:bg-purple-950/40'
                    : 'border-zinc-200 hover:scale-105 dark:border-zinc-700'
                }`}
              >
                {MOOD_EMOJI[m]} {t(`mood.${m}`)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">{draft.length}/280</span>
            <button
              onClick={publish}
              disabled={!draft.trim()}
              className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-1.5 text-xs font-semibold text-white shadow hover:shadow-purple-500/50 disabled:opacity-50"
            >
              🌱 {t('composer.send')}
            </button>
          </div>
        </div>
      </div>

      {/* Posts list */}
      <div className="space-y-3">
        <AnimatePresence>
          {posts.map(post => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-center gap-3">
                {/* Random-color avatar (no real photo) */}
                <div
                  className="h-9 w-9 flex-shrink-0 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, hsl(${post.avatarHue} 60% 60%), hsl(${(post.avatarHue + 60) % 360} 60% 50%))`,
                  }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {post.alias}
                    </span>
                    <span className="text-xs text-zinc-400">·</span>
                    <span className="text-xs text-zinc-400">
                      {MOOD_EMOJI[post.mood]} {t(`mood.${post.mood}`)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">{timeAgo(post.ts)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">
                {post.text}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => hug(post.id)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-all ${
                    post.hugged
                      ? 'scale-105 bg-rose-100 font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      : 'bg-zinc-100 text-zinc-600 hover:scale-105 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-rose-900/30'
                  }`}
                >
                  🤗 {t('hug')} · {post.hugs}
                </button>
                <span className="text-xs text-zinc-400">
                  ⏳ {t('autoPurgeHint', { hours: 24 })}
                </span>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
            🕳️ {t('empty')}
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-[10px] text-zinc-400">
        🧪 {t('mockNotice')}
      </p>

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
