'use client'

import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  HeartHandshake,
  Clock,
  PawPrint,
  Users,
  BookOpen,
  Sparkles,
} from 'lucide-react'

/* ── Types ── */
export type Feature = {
  key: string
  icon: string
  title: string
  desc: string
}

/* ── Feature → Lucide icon mapping (by key) ── */
const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sharedJournal: HeartHandshake,   // Daily Check-in
  moodTracker: Clock,              // Time Capsules
  dreamWall: PawPrint,             // Virtual Pet
  dailyGratitude: Users,           // Private Community
  petAdoption: BookOpen,           // Shared Journal
  timeCapsule: Sparkles,           // Dream Wall
}

/* ── Feature → precise theme config (glassmorphism capsule) ── */
export const featureThemes: Record<
  string,
  {
    barFrom: string
    barVia: string
    barTo: string
    iconFrom: string
    iconTo: string
    shadowColor: string
    glowFrom: string
    glowTo: string
    /** Theme-tinted description text color */
    descColor: string
  }
> = {
  sharedJournal: {
    barFrom: 'from-pink-400',
    barVia: 'via-rose-400',
    barTo: 'to-pink-500',
    iconFrom: 'from-pink-500',
    iconTo: 'to-rose-400',
    shadowColor: 'rgba(236,72,153,0.25)',
    glowFrom: 'from-pink-400',
    glowTo: 'to-rose-300',
    descColor: 'text-pink-900/60 dark:text-pink-200/50',
  },
  moodTracker: {
    barFrom: 'from-violet-400',
    barVia: 'via-purple-400',
    barTo: 'to-indigo-500',
    iconFrom: 'from-violet-500',
    iconTo: 'to-purple-400',
    shadowColor: 'rgba(168,85,247,0.25)',
    glowFrom: 'from-violet-400',
    glowTo: 'to-purple-300',
    descColor: 'text-violet-900/60 dark:text-violet-200/50',
  },
  dreamWall: {
    barFrom: 'from-blue-400',
    barVia: 'via-indigo-400',
    barTo: 'to-blue-500',
    iconFrom: 'from-blue-500',
    iconTo: 'to-indigo-400',
    shadowColor: 'rgba(99,102,241,0.25)',
    glowFrom: 'from-blue-400',
    glowTo: 'to-indigo-300',
    descColor: 'text-blue-900/60 dark:text-blue-200/50',
  },
  dailyGratitude: {
    barFrom: 'from-amber-400',
    barVia: 'via-orange-400',
    barTo: 'to-amber-500',
    iconFrom: 'from-amber-500',
    iconTo: 'to-orange-400',
    shadowColor: 'rgba(245,158,11,0.25)',
    glowFrom: 'from-amber-400',
    glowTo: 'to-orange-300',
    descColor: 'text-amber-900/60 dark:text-amber-200/50',
  },
  petAdoption: {
    barFrom: 'from-emerald-400',
    barVia: 'via-teal-400',
    barTo: 'to-emerald-500',
    iconFrom: 'from-emerald-500',
    iconTo: 'to-teal-400',
    shadowColor: 'rgba(20,184,166,0.25)',
    glowFrom: 'from-emerald-400',
    glowTo: 'to-teal-300',
    descColor: 'text-emerald-900/60 dark:text-emerald-200/50',
  },
  timeCapsule: {
    barFrom: 'from-yellow-400',
    barVia: 'via-amber-400',
    barTo: 'to-yellow-500',
    iconFrom: 'from-yellow-500',
    iconTo: 'to-amber-400',
    shadowColor: 'rgba(234,179,8,0.25)',
    glowFrom: 'from-yellow-400',
    glowTo: 'to-amber-300',
    descColor: 'text-yellow-900/60 dark:text-yellow-200/50',
  },
}

/* ── Glassmorphism Feature Card ── */
export function FeatureCard({
  feature,
  locale,
  index,
}: {
  feature: Feature
  locale: string
  index: number
}) {
  const router = useRouter()
  const prefersReduced = useReducedMotion()
  const theme = featureThemes[feature.key]
  const LucideIcon = featureIcons[feature.key] ?? Sparkles

  /* Entry variants with stagger delay */
  const cardEntry: Variants = prefersReduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 30, scale: 0.96 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.6,
            delay: index * 0.1,
            ease: 'easeOut',
          },
        },
      }

  /* Hover state */
  const hoverProps = prefersReduced
    ? undefined
    : {
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' as const },
      }

  const tapProps = prefersReduced ? undefined : { scale: 0.97 }

  return (
    <motion.article
      variants={cardEntry}
      whileHover={hoverProps}
      whileTap={tapProps}
      onClick={() => router.push(`/${locale}/features`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(`/${locale}/features`)
        }
      }}
      tabIndex={0}
      role="article"
      aria-label={feature.title}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-lg transition-[box-shadow] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50 dark:border-purple-800/40 dark:bg-purple-950/30 hover:shadow-2xl focus-visible:shadow-2xl"
      onMouseEnter={(e) => {
        if (!prefersReduced && theme) {
          e.currentTarget.style.boxShadow = `0 25px 50px -12px ${theme.shadowColor}, 0 0 0 1px rgba(168,85,247,0.1)`
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
      onFocus={(e) => {
        if (!prefersReduced && theme) {
          e.currentTarget.style.boxShadow = `0 25px 50px -12px ${theme.shadowColor}, 0 0 0 1px rgba(168,85,247,0.1)`
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {/* ── Top gradient light bar ── */}
      {theme && (
        <div
          className={`h-[2px] w-full bg-gradient-to-r ${theme.barFrom} ${theme.barVia} ${theme.barTo} opacity-40 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100`}
        />
      )}

      {/* ── Background glow orb (hover reveal) ── */}
      {theme && (
        <div
          className={`pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br ${theme.glowFrom} ${theme.glowTo} blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-20 group-focus-visible:opacity-20`}
        />
      )}

      {/* ── Bottom gradient reflection (glass thickness) ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] rounded-b-2xl bg-gradient-to-t from-white/20 to-transparent dark:from-purple-400/5" />

      {/* ── Card content ── */}
      <div className="relative p-7 text-left">
        {/* Icon container with gradient — w-14 h-14 */}
        <motion.div
          className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-sm ${theme ? `bg-gradient-to-br ${theme.iconFrom} ${theme.iconTo}` : 'bg-gradient-to-br from-pink-500 to-rose-400'}`}
          whileHover={
            prefersReduced
              ? undefined
              : {
                  scale: 1.15,
                  rotate: [0, -5, 5, 0],
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }
          }
        >
          <LucideIcon className="h-7 w-7 text-white" aria-hidden="true" />
        </motion.div>

        {/* Title — gradient on hover */}
        <h3 className="mt-4 font-semibold text-base text-zinc-900 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text group-hover:text-transparent dark:text-zinc-100 dark:group-hover:from-zinc-100 dark:group-hover:to-zinc-400">
          {feature.title}
        </h3>

        {/* Description — theme-tinted color */}
        <p className={`mt-1.5 text-sm leading-relaxed ${theme ? theme.descColor : 'text-zinc-500 dark:text-zinc-400'}`}>
          {feature.desc}
        </p>

        {/* Learn more link */}
        <span
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-purple-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
          aria-label={`Learn more about ${feature.title}`}
        >
          Learn more
          <motion.span
            whileHover={prefersReduced ? undefined : { x: 4 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          >
            →
          </motion.span>
        </span>
      </div>
    </motion.article>
  )
}