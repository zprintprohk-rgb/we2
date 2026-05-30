'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Star, Heart, CheckCircle2 } from 'lucide-react'
import { FEATURES, type FeatureMeta, type FeatureSlug } from '@/data/features'

/* ── Icons for each feature type ── */
import {
  HeartHandshake,
  Clock,
  PawPrint,
  Users,
  BookOpen,
  Sparkles,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartHandshake,
  Clock,
  PawPrint,
  Users,
  BookOpen,
  Sparkles,
}

/* ── Demo components for each demoType ── */

function DailyCheckInDemo() {
  const questions = [
    "What's one thing your partner did today that made you smile?",
    "Share a memory from this week that you'd like to relive.",
    "What's one quality you admire most in your partner right now?",
    "If you could gift your partner one superpower, what would it be?",
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{"Today's Question"}</h3>
      <div className={`rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-6 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm`}>
        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-100 leading-relaxed">{questions[0]}</p>
        <div className="mt-4 h-24 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-950/30 dark:to-rose-950/20 border border-pink-200/50 dark:border-pink-800/30" />
      </div>
      <div className="flex gap-2">
        {questions.slice(1, 4).map((q, i) => (
          <div key={i} className="flex-1 rounded-xl border border-white/30 bg-white/30 backdrop-blur p-3 dark:bg-purple-950/20 dark:border-purple-800/20">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{q}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimeCapsuleDemo({ theme }: { theme: FeatureMeta['theme'] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Create a Capsule</h3>
      <div className={`rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-6 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Title</label>
            <div className="h-10 rounded-lg bg-white/60 dark:bg-purple-950/40 border border-white/30 dark:border-purple-800/20 px-3 flex items-center">
              <span className="text-sm text-zinc-400 dark:text-zinc-500">Our First Anniversary</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Unlock Date</label>
            <div className="h-10 rounded-lg bg-white/60 dark:bg-purple-950/40 border border-white/30 dark:border-purple-800/20 px-3 flex items-center">
              <span className="text-sm text-zinc-400 dark:text-zinc-500">2027-06-15</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Your Message</label>
            <div className="h-20 rounded-lg bg-white/60 dark:bg-purple-950/40 border border-white/30 dark:border-purple-800/20 px-3 py-2">
              <span className="text-sm text-zinc-400 dark:text-zinc-500">Dear future us...</span>
            </div>
          </div>
          <button className={`h-10 rounded-full bg-gradient-to-r ${theme.barFrom.replace('from-', 'from-')} ${theme.barVia.replace('via-', 'via-')} ${theme.barTo.replace('to-', 'to-')} text-white text-sm font-medium px-6 shadow-lg opacity-60`}>
            Seal & Lock
          </button>
        </div>
      </div>
    </div>
  )
}

function VirtualPetDemo() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Your Pet</h3>
      <div className={`rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-6 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm text-center`}>
        {/* Pet avatar placeholder */}
        <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-blue-200 to-indigo-300 dark:from-blue-800 dark:to-indigo-900 flex items-center justify-center shadow-lg">
          <PawPrint className="h-10 w-10 text-white" />
        </div>
        <p className="mt-3 font-semibold text-lg text-zinc-800 dark:text-zinc-100">Luna</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Level 12 · Baby Dragon</p>

        {/* Stats */}
        <div className="mt-4 space-y-2">
          <div>
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Happiness</span><span>78%</span>
            </div>
            <div className="h-2 rounded-full bg-white/40 dark:bg-purple-950/40 overflow-hidden">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Love Points</span><span>245</span>
            </div>
            <div className="h-2 rounded-full bg-white/40 dark:bg-purple-950/40 overflow-hidden">
              <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-pink-400 to-rose-500" />
            </div>
          </div>
        </div>

        <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium px-5 py-2 shadow-lg opacity-60">
          <Heart className="h-4 w-4" /> Feed (+5 Love)
        </button>
      </div>
    </div>
  )
}

function CommunityDemo() {
  const posts = [
    { title: 'How we survived 3 years long distance', replies: 42, likes: 128 },
    { title: 'Date night ideas on a budget?', replies: 67, likes: 203 },
    { title: 'We just got engaged! 💍', replies: 94, likes: 456 },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Community Stories</h3>
      <div className={`rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-4 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm space-y-3`}>
        {posts.map((post, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/40 dark:bg-purple-950/20 border border-white/20 dark:border-purple-800/20">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{post.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                <span>💬 {post.replies}</span>
                <span>❤️ {post.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SharedJournalDemo() {
  const entries = [
    { date: 'Today', excerpt: 'We had the most amazing dinner at that little Italian place...' },
    { date: 'Yesterday', excerpt: 'Spent the whole afternoon in the park. Fed the ducks!' },
    { date: '2 days ago', excerpt: 'Movie night! Watched our favorite rom-com for the 100th time.' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Recent Entries</h3>
      <div className={`rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-4 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm`}>
        <div className="relative pl-6 before:absolute before:left-[11px] before:top-0 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-emerald-400 before:to-teal-500 before:opacity-30 space-y-4">
          {entries.map((entry, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white dark:border-purple-950" />
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{entry.date}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-0.5 leading-relaxed">{entry.excerpt}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 h-16 rounded-xl bg-white/40 dark:bg-purple-950/20 border border-white/30 dark:border-purple-800/20 px-3 py-2">
          <span className="text-sm text-zinc-400 dark:text-zinc-500">{"Write today's entry..."}</span>
        </div>
      </div>
    </div>
  )
}

function DreamWallDemo() {
  const dreams = [
    { text: 'Travel to Japan', done: false },
    { text: 'Learn to dance salsa', done: true },
    { text: 'Run a marathon together', done: false },
    { text: 'Adopt a puppy', done: false },
    { text: 'Buy our dream house', done: false },
    { text: 'Watch the Northern Lights', done: true },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Our Dreams</h3>
      <div className={`rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-4 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm`}>
        <div className="grid grid-cols-2 gap-3">
          {dreams.map((dream, i) => (
            <div
              key={i}
              className={`rounded-xl p-3 border text-sm flex items-center gap-2 transition-all ${
                dream.done
                  ? 'bg-emerald-50/50 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30 line-through text-zinc-400 dark:text-zinc-500'
                  : 'bg-white/40 border-white/30 dark:bg-purple-950/20 dark:border-purple-800/20 text-zinc-700 dark:text-zinc-200'
              }`}
            >
              {dream.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              )}
              <span className="truncate">{dream.text}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <div className="flex-1 h-10 rounded-lg bg-white/40 dark:bg-purple-950/20 border border-white/30 dark:border-purple-800/20 px-3 flex items-center">
            <span className="text-sm text-zinc-400 dark:text-zinc-500">Add a new dream...</span>
          </div>
          <button className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 text-white flex items-center justify-center shadow opacity-60">
            +
          </button>
        </div>
      </div>
    </div>
  )
}

function renderDemo(demoType: string, theme: FeatureMeta['theme']) {
  switch (demoType) {
    case 'check-in':
      return <DailyCheckInDemo />
    case 'time-capsule':
      return <TimeCapsuleDemo theme={theme} />
    case 'virtual-pet':
      return <VirtualPetDemo />
    case 'community':
      return <CommunityDemo />
    case 'shared-journal':
      return <SharedJournalDemo />
    case 'dream-wall':
      return <DreamWallDemo />
    default:
      return null
  }
}

/* ── Main component ── */
export function FeatureDetailClient({
  slug,
  locale,
  title,
  longDesc,
  steps,
}: {
  slug: FeatureSlug
  locale: string
  title: string
  longDesc: string
  steps: string[]
}) {
  const prefersReduced = useReducedMotion()
  const feature = FEATURES.find((f) => f.slug === slug)
  if (!feature) return null

  const theme = feature.theme
  const Icon = ICON_MAP[feature.lucideIcon] ?? Sparkles

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-white px-4 py-10 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-zinc-950">
      {/* Background glow */}
      <div
        className={`pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full bg-gradient-to-br ${theme.glowFrom} ${theme.glowTo} blur-[100px] opacity-20`}
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Back button */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, x: -20 }}
          animate={prefersReduced ? {} : { opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href={`/${locale}/features`}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Features
          </Link>
        </motion.div>

        {/* Hero area */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mt-8 text-center"
        >
          {/* Feature icon */}
          <motion.div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg bg-gradient-to-br ${theme.iconFrom} ${theme.iconTo}`}
            whileHover={
              prefersReduced
                ? undefined
                : { scale: 1.1, rotate: [0, -5, 5, 0], transition: { type: 'spring', stiffness: 300, damping: 15 } }
            }
          >
            <Icon className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {longDesc}
          </p>
        </motion.div>

        {/* Feature steps */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="mt-10 space-y-3"
        >
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">How It Works</h2>
          <div className={`rounded-2xl border border-white/40 bg-white/50 backdrop-blur p-5 dark:border-purple-800/30 dark:bg-purple-950/30 shadow-sm space-y-3`}>
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold bg-gradient-to-br ${theme.iconFrom} ${theme.iconTo} text-white shadow`}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-zinc-600 dark:text-zinc-300 pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interactive demo area */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="mt-10"
        >
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">Try It Out</h2>
          {renderDemo(feature.demoType, theme)}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
          className="mt-12 text-center pb-12"
        >
          <Link
            href={`/${locale}/pricing`}
            className="inline-flex h-12 items-center rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-8 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-rose-600 hover:to-purple-700 hover:shadow-purple-500/40 transition-all duration-300"
          >
            Start Free — No Credit Card
          </Link>
        </motion.div>
      </div>
    </div>
  )
}