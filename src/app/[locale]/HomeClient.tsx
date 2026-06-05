'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  Calendar,
  MessageCircle,
  Camera,
  Sparkles,
  Star,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FeatureCard, type Feature } from '@/components/FeatureCard'

/* ── Holiday skin auto-detect (date-based, client-side) ── */
type HolidaySkin = 'default' | 'christmas' | 'valentine' | 'halloween'
function detectHolidaySkin(): HolidaySkin {
  // Render-time only — server renders default, client hydrates with date
  const m = new Date().getMonth() + 1
  const d = new Date().getDate()
  // Christmas: Dec 20-26
  if (m === 12 && d >= 20 && d <= 26) return 'christmas'
  // Valentine: Feb 13-15
  if (m === 2 && d >= 13 && d <= 15) return 'valentine'
  // Halloween: Oct 28-31
  if (m === 10 && d >= 28 && d <= 31) return 'halloween'
  return 'default'
}
const HOLIDAY_BG: Record<HolidaySkin, string> = {
  default:
    'bg-gradient-to-b from-rose-50 via-pink-50 to-white dark:from-rose-950/40 dark:via-purple-950/30 dark:to-zinc-950',
  christmas:
    'bg-gradient-to-b from-red-50 via-emerald-50 to-white dark:from-red-950/40 dark:via-emerald-950/30 dark:to-zinc-950',
  valentine:
    'bg-gradient-to-b from-pink-50 via-rose-50 to-white dark:from-pink-950/40 dark:via-rose-950/30 dark:to-zinc-950',
  halloween:
    'bg-gradient-to-b from-orange-50 via-purple-50 to-white dark:from-orange-950/40 dark:via-purple-950/30 dark:to-zinc-950',
}
const HOLIDAY_ICON: Record<HolidaySkin, string> = {
  default: '🎁', // placeholder
  christmas: '🎄',
  valentine: '💝',
  halloween: '🎃',
}

/* ── Sticker pack (8 WeChat-style Togthr Companions) ── */
const STICKERS: Array<{ src: string; label: string }> = [
  { src: '/pets/sticker-surprised.png', label: '😲' },
  { src: '/pets/sticker-loveyou.png',   label: '😍' },
  { src: '/pets/sticker-crying.png',    label: '😭' },
  { src: '/pets/sticker-sleepy.png',    label: '😴' },
  { src: '/pets/sticker-wink.png',      label: '😉' },
  { src: '/pets/sticker-fighting.png',  label: '💪' },
  { src: '/pets/sticker-shy.png',       label: '😊' },
  { src: '/pets/sticker-thumbsup.png',  label: '👍' },
]

/* ── Types ── */
type Props = {
  locale: string
  heroTitle: string
  heroSubtitle: string
  heroCta: string
  heroSecondary: string
  heroSocialProof: string
  features: Feature[]
  // Note: footer links live in src/app/[locale]/layout.tsx so they
  // appear on every page (not just the home page). The home page no
  // longer passes footer props — see Bug 4 fix.
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

/* ── Main component ── */
export function HomeClient({
  locale,
  heroTitle,
  heroSubtitle,
  heroCta,
  heroSecondary,
  heroSocialProof,
  features,
  // footer* props removed: footer is rendered by [locale]/layout.tsx (Bug 4)
}: Props) {
  const prefersReduced = useReducedMotion()
  const t = useTranslations('home.companions')
  const skin = detectHolidaySkin()
  const isHoliday = skin !== 'default'

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
    <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 ${HOLIDAY_BG[skin]}`}>
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
          {/* Golden Togthr hero illustration — the wow centerpiece (PRD §3) */}
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.7, y: 20 }}
            animate={prefersReduced ? {} : { opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 1, ease: 'easeOut' }}
            className="relative mx-auto h-44 w-44 sm:h-56 sm:w-56"
            aria-hidden="true"
          >
            {/* Soft golden glow ring */}
            <motion.div
              animate={
                prefersReduced
                  ? {}
                  : { scale: [1, 1.12, 1], opacity: [0.4, 0.6, 0.4] }
              }
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/40 via-rose-300/30 to-purple-400/40 blur-2xl"
            />
            {/* Floating motion */}
            <motion.div
              animate={prefersReduced ? {} : { y: [0, -8, 0], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pets/hero-golden.png"
                alt=""
                className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(251,191,36,0.35)]"
                loading="eager"
              />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={prefersReduced ? {} : { scale: 0.95 }}
            animate={prefersReduced ? {} : { scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent"
          >
            {heroTitle}
          </motion.h1>

          {/* Holiday skin badge — auto-detect */}
          {isHoliday && (
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0, y: -8 }}
              animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-3 py-1 text-xs font-medium text-rose-700 backdrop-blur dark:border-purple-700 dark:bg-purple-950/50 dark:text-purple-200"
            >
              <span className="text-base" aria-hidden="true">{HOLIDAY_ICON[skin]}</span>
              <span>
                {skin === 'christmas' && 'Holiday skin active'}
                {skin === 'valentine' && "Valentine's skin active"}
                {skin === 'halloween' && 'Halloween skin active'}
              </span>
            </motion.div>
          )}

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

        {/* ════════ Togthr Companions — Sticker Pack (8 WeChat-style) ════════ */}
        <section className="w-full pb-16">
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
            whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              {t('title')}
            </h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
            whileInView={prefersReduced ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="mt-10 grid grid-cols-4 gap-4 sm:grid-cols-8"
          >
            {STICKERS.map((s, i) => (
              <motion.div
                key={s.src}
                whileHover={prefersReduced ? undefined : { scale: 1.08, y: -4 }}
                whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-rose-100 bg-white/60 shadow-sm backdrop-blur dark:border-purple-800 dark:bg-purple-950/30"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={s.label}
                  className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute bottom-1 right-1 text-xs opacity-60">
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={prefersReduced ? {} : { opacity: 0 }}
            whileInView={prefersReduced ? {} : { opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-500"
          >
            ✨ {t('cta')} ✨
          </motion.p>
        </section>

        {/* ════════ Footer (intentionally omitted here; the global footer lives in [locale]/layout.tsx — Bug 4) ════════ */}
      </main>
    </div>
  )
}