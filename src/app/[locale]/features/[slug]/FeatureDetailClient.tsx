'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { FEATURES, type FeatureMeta, type FeatureSlug } from '@/data/features'

import {
  HeartHandshake,
  Clock,
  PawPrint,
  Users,
  BookOpen,
  Sparkles as SparklesIcon,
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
  SparklesIcon,
}

function renderDemo(demoType: string, _theme: FeatureMeta['theme'], locale: string) {
  switch (demoType) {
    case 'check-in':       return <DailyCheckInDemo locale={locale} />
    case 'time-capsule':   return <TimeCapsulesDemo locale={locale} />
    case 'virtual-pet':    return <VirtualPetDemo locale={locale} />
    case 'community':      return <PrivateCommunityDemo locale={locale} />
    case 'shared-journal': return <SharedJournalDemo locale={locale} />
    case 'dream-wall':     return <DreamWallDemo locale={locale} />
    default:               return null
  }
}

const SCENE_BG = 'from-[#1a0b2e] via-[#0f0524] to-[#0a0118]'

const constellation = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: `${(i * 53) % 100}%`,
  left: `${(i * 79) % 100}%`,
  size: (i % 4) + 1,
  delay: (i % 6) * 0.3,
  duration: 3 + (i % 4),
}))

const bokeh = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  top: `${20 + (i * 41) % 70}%`,
  left: `${(i * 47) % 100}%`,
  size: 60 + (i * 17) % 60,
  duration: 7 + (i % 3),
  hue: 280 + (i * 23) % 60,
}))

function FloatingMascot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.8, type: 'spring' }}
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
  )
}

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
  const t = useTranslations('features')
  const tCommon = useTranslations()
  const feature = FEATURES.find((f) => f.slug === slug)
  if (!feature) return null

  const theme = feature.theme
  const Icon = ICON_MAP[feature.lucideIcon] ?? Sparkles

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${SCENE_BG} text-zinc-100`}>
      {/* Stars */}
      <div className="pointer-events-none absolute inset-0">
        {constellation.map(p => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-zinc-200"
            style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
            animate={prefersReduced ? {} : { opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      {/* Bokeh */}
      <div className="pointer-events-none absolute inset-0">
        {bokeh.map(b => (
          <motion.div
            key={b.id}
            className="absolute rounded-full blur-3xl"
            style={{
              top: b.top, left: b.left, width: b.size, height: b.size,
              background: `radial-gradient(circle, hsla(${b.hue}, 70%, 50%, 0.18) 0%, transparent 70%)`,
            }}
            animate={prefersReduced ? {} : { y: [0, -15, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      {/* Holographic radial behind hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute left-1/2 top-32 h-[400px] w-[600px] -translate-x-1/2"
        style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.18) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-10">
        {/* Back button */}
        <motion.div initial={prefersReduced ? {} : { opacity: 0, x: -20 }} animate={prefersReduced ? {} : { opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <Link
            href={`/${locale}/features`}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-amber-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToFeatures')}
          </Link>
        </motion.div>

        {/* Hero — icon with holographic halo */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mt-10 text-center"
        >
          <div className="relative mx-auto h-28 w-28">
            <motion.div
              animate={prefersReduced ? {} : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-300/40 via-rose-300/30 to-purple-400/40 blur-2xl"
            />
            <motion.div
              className={`relative flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br ${theme.iconFrom} ${theme.iconTo} shadow-2xl`}
              whileHover={prefersReduced ? undefined : { scale: 1.08, rotate: [0, -5, 5, 0] }}
              animate={prefersReduced ? {} : { y: [0, -4, 0] }}
            >
              <Icon className="h-14 w-14 text-white" />
            </motion.div>
          </div>

          <h1 className="mt-6 bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-zinc-300/90 leading-relaxed">
            {longDesc}
          </p>
        </motion.div>

        {/* How It Works — visual step cards */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="mt-12"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
              {t('howItWorks')}
            </h2>
          </div>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={prefersReduced ? {} : { opacity: 0, x: -20 }}
                whileInView={prefersReduced ? {} : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-colors hover:border-amber-300/30 hover:bg-white/10"
              >
                <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.iconFrom} ${theme.iconTo} opacity-30 blur-md`} />
                  <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${theme.iconFrom} ${theme.iconTo} text-lg font-bold text-white shadow-lg`}>
                    {i + 1}
                  </div>
                </div>
                <span className="flex-1 text-sm text-zinc-200">{step}</span>
                <span className="text-zinc-500 transition-transform group-hover:translate-x-1">→</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Try It Out */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="mt-12"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-base">🎮</span>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200/80">
              {t('tryItOut')}
            </h2>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
            {renderDemo(feature.demoType, theme, locale)}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
          className="pb-12 pt-12 text-center"
        >
          <Link
            href={`/${locale}/pricing`}
            className="group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 px-8 text-base font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-shadow hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]"
          >
            <span className="relative z-10">{tCommon('home.hero.cta')}</span>
            <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>

      <FloatingMascot />
    </div>
  )
}
