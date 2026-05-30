'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  Calendar,
  MessageCircle,
  Camera,
  Sparkles,
  HeartHandshake,
  Clock,
  PawPrint,
  Users,
  BookOpen,
  Star,
} from 'lucide-react'

/* ── Types ── */
type Feature = {
  key: string
  icon: string
  title: string
  desc: string
}

type Props = {
  locale: string
  heroTitle: string
  heroSubtitle: string
  heroCta: string
  heroSecondary: string
  heroSocialProof: string
  features: Feature[]
  footerPrivacy: string
  footerTerms: string
  footerCookie: string
  footerHelp: string
  footerContact: string
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
const featureThemes: Record<
  string,
  {
    /** Top gradient light bar */
    barFrom: string
    barVia: string
    barTo: string
    /** Icon container gradient */
    iconFrom: string
    iconTo: string
    /** Hover shadow color */
    shadowColor: string
    /** Background glow orb gradient */
    glowFrom: string
    glowTo: string
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
  },
}

/* ── Sparkle positions (20 particles) ── */
const sparkles = [
  { top: '5%',  left: '10%', delay: 0,    duration: 2.5 },
  { top: '10%', left: '40%', delay: 0.4,  duration: 3.0 },
  { top: '8%',  left: '70%', delay: 0.8,  duration: 2.8 },
  { top: '18%', left: '25%', delay: 1.2,  duration: 2.3 },
  { top: '15%', left: '85%', delay: 1.6,  duration: 3.2 },
  { top: '25%', left: '8%',  delay: 0.2,  duration: 2.6 },
  { top: '30%', left: '55%', delay: 1.0,  duration: 2.4 },
  { top: '35%', left: '80%', delay: 0.6,  duration: 3.1 },
  { top: '45%', left: '15%', delay: 1.8,  duration: 2.7 },
  { top: '50%', left: '92%', delay: 0.3,  duration: 2.9 },
  { top: '55%', left: '5%',  delay: 1.4,  duration: 2.2 },
  { top: '60%', left: '45%', delay: 0.7,  duration: 3.0 },
  { top: '65%', left: '75%', delay: 1.1,  duration: 2.5 },
  { top: '70%', left: '20%', delay: 0.9,  duration: 3.3 },
  { top: '72%', left: '60%', delay: 1.5,  duration: 2.6 },
  { top: '80%', left: '88%', delay: 0.5,  duration: 2.8 },
  { top: '85%', left: '35%', delay: 1.3,  duration: 2.1 },
  { top: '88%', left: '12%', delay: 0.1,  duration: 3.0 },
  { top: '92%', left: '50%', delay: 1.7,  duration: 2.7 },
  { top: '95%', left: '78%', delay: 0.35, duration: 3.1 },
]

/* ── Sub-components ── */

/** Glow orb */
function GlowOrb({
  className,
  color,
  delay,
  duration,
}: {
  className: string
  color: string
  delay: number
  duration: number
}) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return (
      <div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        style={{ background: color, opacity: 0.15 }}
      />
    )
  }

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{ background: color }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.22, 0.35, 0.22],
        scale: [0.8, 1.05, 0.8],
        x: [0, 25, -18, 0],
        y: [0, -18, 14, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

/** Floating Lucide icon */
function FloatingIcon({
  className,
  delay,
  duration,
  size,
  Icon,
}: {
  className: string
  delay: number
  duration: number
  size: number
  Icon: React.ComponentType<{ className?: string }>
}) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) {
    return (
      <span className={`absolute select-none pointer-events-none ${className}`}>
        <Icon />
      </span>
    )
  }

  return (
    <motion.span
      className={`absolute select-none pointer-events-none ${className}`}
      style={{ fontSize: size }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{
        opacity: [0.22, 0.45, 0.45, 0.22],
        y: [0, -16, 0, 16],
        scale: [0.85, 1, 0.85],
      }}
      transition={{
        opacity: { duration: duration * 2, repeat: Infinity, ease: 'easeInOut', delay },
        y: { duration, repeat: Infinity, ease: 'easeInOut', delay },
        scale: { duration, repeat: Infinity, ease: 'easeInOut', delay },
      }}
    >
      <Icon />
    </motion.span>
  )
}

/** Sparkle particle */
function SparkleParticle({
  top,
  left,
  delay,
  duration,
  size = 22,
  opacity = 0.85,
}: {
  top: string
  left: string
  delay: number
  duration: number
  size?: number
  opacity?: number
}) {
  const prefersReduced = useReducedMotion()

  if (prefersReduced) return null

  return (
    <motion.span
      className="absolute select-none pointer-events-none z-[1] text-amber-300 dark:text-amber-200"
      style={{ fontSize: size, top, left, filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.6))' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [opacity * 0.3, opacity, opacity * 0.3],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      ✦
    </motion.span>
  )
}

/** ── Glassmorphism Feature Card ── */
function FeatureCard({
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
      style={{
        /* Hover shadow is applied via inline style for theme color */
        ['--hover-shadow' as string]: theme
          ? `0 25px 50px -12px ${theme.shadowColor}, 0 0 0 1px rgba(168,85,247,0.1)`
          : undefined,
      }}
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

      {/* ── Card content ── */}
      <div className="relative p-6">
        {/* Icon container with gradient */}
        <motion.div
          className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${theme ? `bg-gradient-to-br ${theme.iconFrom} ${theme.iconTo}` : 'bg-gradient-to-br from-pink-500 to-rose-400'}`}
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
          <LucideIcon className="h-6 w-6 text-white" aria-hidden="true" />
        </motion.div>

        {/* Title — gradient on hover */}
        <h3 className="mt-4 font-semibold text-base text-zinc-900 transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 group-hover:bg-clip-text group-hover:text-transparent dark:text-zinc-100 dark:group-hover:from-zinc-100 dark:group-hover:to-zinc-400">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
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

/* ── Main component ── */
export function HomeClient({
  locale,
  heroTitle,
  heroSubtitle,
  heroCta,
  heroSecondary,
  heroSocialProof,
  features,
  footerPrivacy,
  footerTerms,
  footerCookie,
  footerHelp,
  footerContact,
}: Props) {
  const prefersReduced = useReducedMotion()

  /* Animation variants for card grid */
  const container: Variants = {
    hidden: prefersReduced ? {} : { opacity: 0 },
    show: prefersReduced
      ? {}
      : {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-white px-4 py-16 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-zinc-950">
      {/* ── Background glow orbs ── */}
      <GlowOrb className="w-[450px] h-[450px] -top-24 -left-24" color="#EC4899" delay={0} duration={10} />
      <GlowOrb className="w-[380px] h-[380px] top-1/2 -right-20" color="#A855F7" delay={2} duration={12} />
      <GlowOrb className="w-[320px] h-[320px] top-1/4 right-1/3" color="#6366F1" delay={4} duration={9} />

      {/* ── Floating Lucide icons ── */}
      <FloatingIcon
        className="left-[5%] top-[40%] text-rose-400 dark:text-rose-300"
        delay={0} duration={4} size={24} Icon={Calendar}
      />
      <FloatingIcon
        className="right-[8%] top-[28%] text-purple-400 dark:text-purple-300"
        delay={1.5} duration={3.5} size={18} Icon={MessageCircle}
      />
      <FloatingIcon
        className="left-[12%] bottom-[22%] text-indigo-400 dark:text-indigo-300"
        delay={3} duration={5} size={20} Icon={Camera}
      />
      <FloatingIcon
        className="right-[15%] bottom-[30%] text-pink-400 dark:text-pink-300"
        delay={2} duration={4.5} size={16} Icon={Sparkles}
      />

      {/* ── Sparkle particles (20) ── */}
      {sparkles.map((sp, i) => (
        <SparkleParticle
          key={i}
          top={sp.top}
          left={sp.left}
          delay={sp.delay}
          duration={sp.duration}
        />
      ))}

      <main className="relative z-10 w-full max-w-4xl text-center">
        {/* ════════ Hero ════════ */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 40 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6 pb-12"
        >
          <motion.h1
            initial={prefersReduced ? {} : { scale: 0.95 }}
            animate={prefersReduced ? {} : { scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            initial={prefersReduced ? {} : { opacity: 0 }}
            animate={prefersReduced ? {} : { opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>

          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
            animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <motion.span
              whileHover={prefersReduced ? undefined : { scale: 1.03 }}
              whileTap={prefersReduced ? undefined : { scale: 0.97 }}
            >
              <Link
                href={`/${locale}/register`}
                className="inline-flex h-11 items-center rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:from-rose-600 hover:to-purple-700 hover:shadow-purple-500/40 transition-all duration-300"
              >
                {heroCta}
              </Link>
            </motion.span>

            <motion.span
              whileHover={prefersReduced ? undefined : { scale: 1.03 }}
              whileTap={prefersReduced ? undefined : { scale: 0.97 }}
            >
              <Link
                href={`/${locale}/features`}
                className="inline-flex h-11 items-center rounded-full border border-rose-200 bg-white/60 backdrop-blur px-6 text-sm font-medium text-rose-700 hover:bg-rose-50 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200 dark:hover:bg-purple-900/50 transition-all duration-300"
              >
                {heroSecondary}
              </Link>
            </motion.span>
          </motion.div>

          {/* Social proof — 5 stars + text */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
            animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </span>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">{heroSocialProof}</p>
          </motion.div>
        </motion.div>

        {/* ════════ Feature Cards — Glassmorphism Capsules ════════ */}
        <section className="pb-16">
          <motion.h2
            initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
            whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
          >
            Built for Real Couples
          </motion.h2>

          <motion.p
            initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            className="mt-3 mb-10 text-base text-zinc-500 dark:text-zinc-400"
          >
            Every feature designed to bring you closer, no matter the distance.
          </motion.p>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, i) => (
              <FeatureCard key={feature.key} feature={feature} locale={locale} index={i} />
            ))}
          </motion.div>
        </section>

        {/* ════════ Footer ════════ */}
        <footer className="border-t border-rose-100/50 pt-10 dark:border-purple-800/30">
          <div className="flex flex-wrap justify-center gap-4 text-sm text-zinc-400 dark:text-zinc-500">
            <Link href={`/${locale}/privacy`} className="hover:text-rose-600 dark:hover:text-purple-300 transition-colors">
              {footerPrivacy}
            </Link>
            <Link href={`/${locale}/terms`} className="hover:text-rose-600 dark:hover:text-purple-300 transition-colors">
              {footerTerms}
            </Link>
            <Link href={`/${locale}/cookies`} className="hover:text-rose-600 dark:hover:text-purple-300 transition-colors">
              {footerCookie}
            </Link>
            <Link href={`/${locale}/help`} className="hover:text-rose-600 dark:hover:text-purple-300 transition-colors">
              {footerHelp}
            </Link>
            <Link href={`/${locale}/contact`} className="hover:text-rose-600 dark:hover:text-purple-300 transition-colors">
              {footerContact}
            </Link>
          </div>
          <p className="mt-4 text-sm text-zinc-400 dark:text-zinc-600">
            © {new Date().getFullYear()} We2
          </p>
        </footer>
      </main>
    </div>
  )
}