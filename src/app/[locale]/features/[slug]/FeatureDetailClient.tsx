'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
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

import { DailyCheckInDemo } from './DailyCheckInDemo'
import { VirtualPetDemo } from './VirtualPetDemo'
import { TimeCapsulesDemo } from './TimeCapsulesDemo'
import { PrivateCommunityDemo } from './PrivateCommunityDemo'
import { SharedJournalDemo } from './SharedJournalDemo'
import { DreamWallDemo } from './DreamWallDemo'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartHandshake,
  Clock,
  PawPrint,
  Users,
  BookOpen,
  Sparkles,
}

function renderDemo(demoType: string, _theme: FeatureMeta['theme'], locale: string) {
  switch (demoType) {
    case 'check-in':
      return <DailyCheckInDemo locale={locale} />
    case 'time-capsule':
      return <TimeCapsulesDemo locale={locale} />
    case 'virtual-pet':
      return <VirtualPetDemo locale={locale} />
    case 'community':
      return <PrivateCommunityDemo locale={locale} />
    case 'shared-journal':
      return <SharedJournalDemo locale={locale} />
    case 'dream-wall':
      return <DreamWallDemo locale={locale} />
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
          {renderDemo(feature.demoType, theme, locale)}
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