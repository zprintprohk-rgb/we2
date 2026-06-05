'use client'

/**
 * HomeClient — Cinematic redesign (设计师 V3).
 *
 * 5 design pillars:
 *   1. Cinematic dark background (deep night purple, NOT light pink)
 *   2. Hero = MASSIVE golden Togthr (holographic halo + light beam)
 *   3. Bento grid for features (mixed sizes, not equal columns)
 *   4. Glassmorphism everywhere (backdrop-blur + subtle borders)
 *   5. Magic entrance (3-step reveal: bg → pet → text)
 *
 * Pet is the constant companion — small floating Togthr in corner.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Calendar, MessageCircle, Camera, Sparkles, Star, ShoppingBag, Heart, Lock } from 'lucide-react'
import { FeatureCard, type Feature } from '@/components/FeatureCard'

/* ── Holiday skin auto-detect ── */
type HolidaySkin = 'default' | 'christmas' | 'valentine' | 'halloween'
function detectHolidaySkin(): HolidaySkin {
  const m = new Date().getMonth() + 1
  const d = new Date().getDate()
  if (m === 12 && d >= 20 && d <= 26) return 'christmas'
  if (m === 2 && d >= 13 && d <= 15) return 'valentine'
  if (m === 10 && d >= 28 && d <= 31) return 'halloween'
  return 'default'
}

/* ── Cinematic background palette ── */
const SCENE_BG: Record<HolidaySkin, string> = {
  default: 'from-[#1a0b2e] via-[#0f0524] to-[#0a0118]', // deep night purple
  christmas: 'from-[#1a0a1a] via-[#0f0a1a] to-[#0a0518]', // deeper wine
  valentine: 'from-[#1a0b1f] via-[#0f0820] to-[#0a0418]', // deeper rose
  halloween: 'from-[#1a0f0a] via-[#0f0a05] to-[#0a0501]', // deeper amber
}

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

/* ── Floating pixel particles (constellation) ── */
const constellation = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top: `${(i * 47) % 100}%`,
  left: `${(i * 89) % 100}%`,
  size: (i % 4) + 1,
  delay: (i % 7) * 0.3,
  duration: 3 + (i % 5),
}))

/* ── Bokeh dots (depth-of-field) ── */
const bokeh = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  top: `${15 + (i * 37) % 70}%`,
  left: `${(i * 53) % 100}%`,
  size: 40 + (i * 11) % 80,
  delay: (i * 0.7) % 4,
  duration: 6 + (i % 4),
  hue: 280 + (i * 23) % 60,
}))

/* ── Mascot: floating Togthr (always-on companion) ── */
function FloatingMascot() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 2.5, duration: 0.8, type: 'spring' }}
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
        <img
          src="/pets/robot-base.png"
          alt=""
          className="relative h-full w-full object-contain drop-shadow-[0_4px_12px_rgba(251,191,36,0.4)]"
        />
        {/* Status dot */}
        <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-[#0a0118] bg-emerald-400 animate-pulse" />
      </motion.div>
    </motion.div>
  )
}

export function HomeClient({
  locale,
  heroTitle,
  heroSubtitle,
  heroCta,
  heroSecondary,
  heroSocialProof,
  features,
}: {
  locale: string
  heroTitle: string
  heroSubtitle: string
  heroCta: string
  heroSecondary: string
  heroSocialProof: string
  features: Feature[]
}) {
  const prefersReduced = useReducedMotion()
  const t = useTranslations('home.companions')
  const tHero = useTranslations('home.hero')
  const skin = detectHolidaySkin()
  const isHoliday = skin !== 'default'
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  // Parallax: pet follows mouse (subtle)
  useEffect(() => {
    if (prefersReduced) return
    function onMove(e: MouseEvent) {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2
      const cy = (e.clientY / window.innerHeight - 0.5) * 2
      setMouse({ x: cx, y: cy })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [prefersReduced])

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${SCENE_BG[skin]} text-zinc-100`}>
      {/* ── Layer 1: Constellation (faint stars) ── */}
      <div className="pointer-events-none absolute inset-0">
        {constellation.map(p => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-zinc-200"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
            }}
            animate={prefersReduced ? {} : { opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Layer 2: Bokeh (depth-of-field) ── */}
      <div className="pointer-events-none absolute inset-0">
        {bokeh.map(b => (
          <motion.div
            key={b.id}
            className="absolute rounded-full blur-3xl"
            style={{
              top: b.top,
              left: b.left,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle, hsla(${b.hue}, 70%, 50%, 0.18) 0%, transparent 70%)`,
            }}
            animate={prefersReduced ? {} : { y: [0, -20, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Layer 3: Holographic radial behind hero ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="pointer-events-none absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(168,85,247,0.10) 30%, transparent 70%)',
        }}
      />

      {/* ── Layer 4: Light beam (subtle vertical) ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: prefersReduced ? 0 : 0.3 }}
        transition={{ delay: 1.5, duration: 2 }}
        className="pointer-events-none absolute left-1/2 top-0 h-1/2 w-1 -translate-x-1/2"
        style={{
          background: 'linear-gradient(to bottom, rgba(251,191,36,0.4) 0%, transparent 100%)',
        }}
      />

      <main className="relative z-10 w-full">
        {/* ════════════════ Cinematic Hero ════════════════ */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pt-20 pb-12">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-6 text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/80 sm:text-sm"
          >
            ✦ {tHero('eyebrow')} ✦
          </motion.p>

          {/* Massive golden Togthr — the wow centerpiece */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.4, type: 'spring', stiffness: 80 }}
            className="relative mx-auto mb-8 h-72 w-72 sm:h-96 sm:w-96"
            style={{
              transform: `translate(${mouse.x * 6}px, ${mouse.y * 6}px)`,
            }}
          >
            {/* Triple glow ring stack */}
            <motion.div
              animate={prefersReduced ? {} : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/40 via-rose-300/30 to-purple-400/40 blur-3xl"
            />
            <motion.div
              animate={prefersReduced ? {} : { scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -inset-8 rounded-full bg-gradient-to-br from-amber-400/20 via-rose-400/20 to-purple-500/20 blur-2xl"
            />
            {/* Floating pet */}
            <motion.div
              animate={prefersReduced ? {} : { y: [0, -12, 0], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-full w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pets/hero-golden.png"
                alt="Togthr golden companion"
                className="h-full w-full object-contain drop-shadow-[0_12px_48px_rgba(251,191,36,0.5)]"
                loading="eager"
              />
            </motion.div>
            {/* Sparkle accents */}
            <motion.span
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
              transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatDelay: 1.5 }}
              className="absolute -top-4 -right-4 text-3xl"
            >✨</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
              transition={{ duration: 2, delay: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              className="absolute -bottom-2 -left-2 text-2xl"
            >✨</motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
              transition={{ duration: 2, delay: 3, repeat: Infinity, repeatDelay: 1.5 }}
              className="absolute top-1/2 -right-8 text-xl"
            >⭐</motion.span>
          </motion.div>

          {/* Title — split into 2 sizes for "lived" feel */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="max-w-4xl text-center text-4xl font-bold leading-tight sm:text-6xl lg:text-7xl"
          >
            <span className="block bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-transparent">
              {heroTitle.split(' ').slice(0, -3).join(' ') || heroTitle}
            </span>
            <span className="mt-2 block bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 bg-clip-text text-transparent text-3xl sm:text-5xl lg:text-6xl">
              {heroTitle.split(' ').slice(-3).join(' ')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mx-auto mt-6 max-w-2xl text-center text-base text-zinc-300/90 sm:text-lg"
          >
            {heroSubtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.span whileHover={prefersReduced ? undefined : { scale: 1.05 }} whileTap={prefersReduced ? undefined : { scale: 0.95 }}>
              <Link
                href={`/${locale}/onboarding`}
                className="group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 px-8 text-base font-semibold text-white shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-shadow hover:shadow-[0_0_60px_rgba(168,85,247,0.6)]"
              >
                <span className="relative z-10">{heroCta}</span>
                <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500"
                  animate={{ x: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{ opacity: 0.3 }}
                />
              </Link>
            </motion.span>
            <motion.span whileHover={prefersReduced ? undefined : { scale: 1.05 }} whileTap={prefersReduced ? undefined : { scale: 0.95 }}>
              <Link
                href={`/${locale}/features`}
                className="group inline-flex h-14 items-center gap-2 rounded-full border border-zinc-700/50 bg-white/5 px-6 text-sm font-medium text-zinc-200 backdrop-blur-xl transition-colors hover:bg-white/10 hover:border-amber-300/30"
              >
                <span>{heroSecondary}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.span>
          </motion.div>

          {/* Social proof — 5 stars + text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1, duration: 0.6 }}
            className="mt-10 flex flex-col items-center gap-2"
          >
            <span className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </span>
            <p className="text-xs text-zinc-400">{heroSocialProof}</p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 2.5, duration: 0.6 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={prefersReduced ? {} : { y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500"
            >
              <span>scroll</span>
              <span>↓</span>
            </motion.div>
          </motion.div>
        </section>

        {/* ════════════════ Bento Grid — Features ════════════════ */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
              ✦ 04 Moments ✦
            </p>
            <h2 className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Bento grid: 1 large + 1 wide + 1 medium + 1 small, asymmetric */}
          <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Daily — BIG (2x2 on lg) */}
            <BentoCard
              className="lg:col-span-2 lg:row-span-2"
              href={`/${locale}/daily`}
              hue="rose"
              delay={0}
              icon={<Heart className="h-6 w-6" />}
              title="喂食时间"
              description="给 TA 一颗心，看它满足的样子"
              visual={
                <div className="absolute inset-0 flex items-center justify-center opacity-90">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-8xl"
                  >
                    ❤️
                  </motion.div>
                </div>
              }
              big
            />
            {/* Capsule — wide (2x1 on lg) */}
            <BentoCard
              className="lg:col-span-2"
              href={`/${locale}/capsule`}
              hue="amber"
              delay={0.1}
              icon={<Camera className="h-6 w-6" />}
              title="时光胶囊 · 挖宝"
              description="埋下一个，宠物帮你挖出来"
              visual={
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-80">
                  {['🌱', '🌿', '🌳', '🌻'].map((e, i) => (
                    <motion.span
                      key={i}
                      className="text-3xl"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>
              }
            />
            {/* Pet — medium (1x1) */}
            <BentoCard
              href={`/${locale}/pet`}
              hue="purple"
              delay={0.2}
              icon={<Sparkles className="h-6 w-6" />}
              title="共生形态"
              description="会反映你们关系的小生命"
              visual={
                <div className="absolute right-3 top-3 text-5xl opacity-90">✨</div>
              }
            />
            {/* Store — small */}
            <BentoCard
              href={`/${locale}/store`}
              hue="indigo"
              delay={0.3}
              icon={<ShoppingBag className="h-5 w-5" />}
              title="6+1 盲盒"
              description="¥199 首单"
              badge="新"
              visual={
                <div className="absolute right-3 top-3 text-3xl">🛒</div>
              }
            />
            {/* Journal — wide (2x1) */}
            <BentoCard
              className="lg:col-span-2"
              href={`/${locale}/journal`}
              hue="emerald"
              delay={0.4}
              icon={<MessageCircle className="h-6 w-6" />}
              title="筑巢"
              description="每条日记，都给你们的共同小窝添砖加瓦"
              visual={
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-80">
                  {['🌱', '🪺', '🏡'].map((e, i) => (
                    <span key={i} className="text-3xl">{e}</span>
                  ))}
                </div>
              }
            />
            {/* Chat — medium */}
            <BentoCard
              href={`/${locale}/chat`}
              hue="violet"
              delay={0.5}
              icon={<MessageCircle className="h-5 w-5" />}
              title="灵魂伴侣 AI"
              description="聊聊天，听你说话"
              visual={
                <div className="absolute right-3 top-3 text-3xl">💬</div>
              }
            />
            {/* Tree Hole — small */}
            <BentoCard
              href={`/${locale}/community`}
              hue="slate"
              delay={0.6}
              icon={<Lock className="h-5 w-5" />}
              title="树洞"
              description="匿名留言，24h 自动消失"
              visual={
                <div className="absolute right-3 top-3 text-3xl">🕳️</div>
              }
            />
          </div>
        </section>

        {/* ════════════════ Sticker Pack Section ════════════════ */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
              ✦ 8 Expressions ✦
            </p>
            <h2 className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              {t('title')}
            </h2>
            <p className="mt-3 text-sm text-zinc-400">
              {t('subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-4 gap-3 sm:grid-cols-8"
          >
            {STICKERS.map((s, i) => (
              <motion.div
                key={s.src}
                whileHover={prefersReduced ? undefined : { scale: 1.15, y: -6 }}
                whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl transition-colors hover:border-amber-300/30"
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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center text-sm text-zinc-400"
          >
            ✨ {t('cta')} ✨
          </motion.p>
        </section>
      </main>

      {/* Floating mascot — always-on companion */}
      <FloatingMascot />
    </div>
  )
}

/* ── BentoCard sub-component ── */
interface BentoCardProps {
  className?: string
  href: string
  hue: 'rose' | 'amber' | 'purple' | 'indigo' | 'emerald' | 'violet' | 'slate'
  delay: number
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
  visual?: React.ReactNode
  big?: boolean
}

const HUE_STYLES: Record<BentoCardProps['hue'], string> = {
  rose:    'from-rose-500/10 via-rose-500/5 to-pink-500/10 border-rose-500/20 hover:border-rose-400/40 hover:from-rose-500/20',
  amber:   'from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/20 hover:border-amber-400/40 hover:from-amber-500/20',
  purple:  'from-purple-500/10 via-purple-500/5 to-violet-500/10 border-purple-500/20 hover:border-purple-400/40 hover:from-purple-500/20',
  indigo:  'from-indigo-500/10 via-indigo-500/5 to-blue-500/10 border-indigo-500/20 hover:border-indigo-400/40 hover:from-indigo-500/20',
  emerald: 'from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-emerald-500/20 hover:border-emerald-400/40 hover:from-emerald-500/20',
  violet:  'from-violet-500/10 via-violet-500/5 to-purple-500/10 border-violet-500/20 hover:border-violet-400/40 hover:from-violet-500/20',
  slate:   'from-slate-500/10 via-slate-500/5 to-zinc-500/10 border-slate-500/20 hover:border-slate-400/40 hover:from-slate-500/20',
}

function BentoCard({ className = '', href, hue, delay, icon, title, description, badge, visual, big }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <Link
        href={href}
        className={`group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${HUE_STYLES[hue]}`}
      >
        {/* Visual layer (right side) */}
        {visual}
        {/* Top row: icon + badge */}
        <div className="relative z-10 flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${HUE_STYLES[hue].split(' ').filter(c => c.startsWith('from-') || c.startsWith('via-') || c.startsWith('to-')).join(' ')} text-white shadow-lg`}>
            {icon}
          </div>
          {badge && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-950 shadow">
              {badge}
            </span>
          )}
        </div>
        {/* Bottom: title + desc */}
        <div className="relative z-10">
          <h3 className={`font-bold text-zinc-100 ${big ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
            {title}
          </h3>
          <p className={`mt-1 text-zinc-400 ${big ? 'text-base' : 'text-sm'}`}>
            {description}
          </p>
        </div>
        {/* Hover glow */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-300/0 via-rose-300/0 to-purple-400/0 transition-opacity group-hover:from-amber-300/10 group-hover:via-rose-300/10 group-hover:to-purple-400/10" />
      </Link>
    </motion.div>
  )
}
