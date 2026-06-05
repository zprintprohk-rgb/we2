'use client'

/**
 * FeaturesClient — Cinematic V3.
 * Same dark cinematic treatment as HomeClient, with bento feature grid.
 */

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Calendar, MessageCircle, Camera, Sparkles, Heart, ShoppingBag, Lock, Mic } from 'lucide-react'

type Feature = {
  key: string
  icon: string
  title: string
  desc: string
}

type Props = {
  locale: string
  title: string
  subtitle: string
  features: Feature[]
}

const SCENE_BG = 'from-[#1a0b2e] via-[#0f0524] to-[#0a0118]'

const constellation = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  top: `${(i * 37) % 100}%`,
  left: `${(i * 71) % 100}%`,
  size: (i % 4) + 1,
  delay: (i % 6) * 0.3,
  duration: 3 + (i % 4),
}))

const bokeh = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  top: `${20 + (i * 41) % 65}%`,
  left: `${(i * 47) % 100}%`,
  size: 50 + (i * 13) % 60,
  delay: (i * 0.6) % 4,
  duration: 7 + (i % 3),
  hue: 280 + (i * 27) % 60,
}))

/* Map i18n keys to the actual feature flow (scenes). */
const FEATURE_META: Record<string, { hue: string; icon: React.ReactNode; size: 'big' | 'medium' | 'small'; visual: React.ReactNode }> = {
  sharedJournal:  { hue: 'rose',    size: 'big',    icon: <Heart className="h-6 w-6" />,         visual: <span className="text-8xl">❤️</span> },
  moodTracker:   { hue: 'amber',   size: 'medium', icon: <Camera className="h-6 w-6" />,        visual: <span className="text-7xl">📷</span> },
  dreamWall:     { hue: 'purple',  size: 'medium', icon: <Sparkles className="h-6 w-6" />,     visual: <span className="text-7xl">✨</span> },
  dailyGratitude:{ hue: 'slate',   size: 'small',  icon: <Lock className="h-5 w-5" />,         visual: <span className="text-5xl">🕳️</span> },
  petAdoption:   { hue: 'emerald', size: 'small',  icon: <Calendar className="h-5 w-5" />,      visual: <span className="text-5xl">🌱</span> },
  timeCapsule:   { hue: 'indigo',  size: 'small',  icon: <Mic className="h-5 w-5" />,           visual: <span className="text-5xl">🎤</span> },
}

const HUE_STYLES: Record<string, string> = {
  rose:    'from-rose-500/15 via-rose-500/8 to-pink-500/15 border-rose-500/25 hover:border-rose-400/50 hover:from-rose-500/25',
  amber:   'from-amber-500/15 via-amber-500/8 to-orange-500/15 border-amber-500/25 hover:border-amber-400/50 hover:from-amber-500/25',
  purple:  'from-purple-500/15 via-purple-500/8 to-violet-500/15 border-purple-500/25 hover:border-purple-400/50 hover:from-purple-500/25',
  indigo:  'from-indigo-500/15 via-indigo-500/8 to-blue-500/15 border-indigo-500/25 hover:border-indigo-400/50 hover:from-indigo-500/25',
  emerald: 'from-emerald-500/15 via-emerald-500/8 to-teal-500/15 border-emerald-500/25 hover:border-emerald-400/50 hover:from-emerald-500/25',
  slate:   'from-slate-500/15 via-slate-500/8 to-zinc-500/15 border-slate-500/25 hover:border-slate-400/50 hover:from-slate-500/25',
}

const ICON_BG: Record<string, string> = {
  rose:    'from-rose-500 to-pink-600',
  amber:   'from-amber-500 to-orange-600',
  purple:  'from-purple-500 to-violet-600',
  indigo:  'from-indigo-500 to-blue-600',
  emerald: 'from-emerald-500 to-teal-600',
  slate:   'from-slate-500 to-zinc-600',
}

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

export function FeaturesClient({ locale, title, subtitle, features }: Props) {
  const prefersReduced = useReducedMotion()
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (prefersReduced) return
    function onMove(e: MouseEvent) {
      setMouse({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [prefersReduced])

  const t = useTranslations('home.companions')

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${SCENE_BG} text-zinc-100`}>
      {/* ── Layer 1: Stars ── */}
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

      {/* ── Layer 2: Bokeh ── */}
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
            transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Layer 3: Holographic radial ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/4"
        style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)' }}
      />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-20">
        {/* Eyebrow + Title */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          animate={prefersReduced ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-amber-200/80 sm:text-sm"
          >
            ✦ 6 Functions ✦
          </motion.p>
          <h1
            className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
            style={{ transform: `translate(${mouse.x * -3}px, ${mouse.y * -3}px)` }}
          >
            {title}
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-base text-zinc-300/90 sm:text-lg"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const meta = FEATURE_META[feature.key] || {
              hue: 'purple', size: 'small' as const,
              icon: <Sparkles className="h-5 w-5" />,
              visual: <span className="text-5xl">{feature.icon}</span>,
            }
            const spanClass =
              meta.size === 'big'    ? 'sm:col-span-2 sm:row-span-2' :
              meta.size === 'medium' ? 'sm:col-span-2' :
                                       'sm:col-span-1'
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={spanClass}
              >
                <a
                  href={`/${locale}/${feature.key === 'sharedJournal' ? 'daily' :
                                       feature.key === 'moodTracker' ? 'capsule' :
                                       feature.key === 'dreamWall' ? 'pet' :
                                       feature.key === 'petAdoption' ? 'journal' :
                                       feature.key === 'dailyGratitude' ? 'community' :
                                       'store'}`}
                  className={`group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${HUE_STYLES[meta.hue]}`}
                >
                  {/* Visual layer (right side or center if big) */}
                  <div className={`absolute ${meta.size === 'big' ? 'inset-0 flex items-center justify-center opacity-90' : 'right-4 top-4 opacity-90'}`}>
                    {meta.visual}
                  </div>
                  {/* Icon top-left */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${ICON_BG[meta.hue]} text-white shadow-lg`}>
                      {meta.icon}
                    </div>
                  </div>
                  {/* Text bottom */}
                  <div className="relative z-10">
                    <h3 className={`font-bold text-zinc-100 ${meta.size === 'big' ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
                      {feature.title}
                    </h3>
                    <p className={`mt-1 text-zinc-400 ${meta.size === 'big' ? 'text-base' : 'text-sm'}`}>
                      {feature.desc}
                    </p>
                  </div>
                  {/* Hover glow */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-300/0 via-rose-300/0 to-purple-400/0 transition-opacity group-hover:from-amber-300/10 group-hover:via-rose-300/10 group-hover:to-purple-400/10" />
                </a>
              </motion.div>
            )
          })}
        </div>
      </main>

      <FloatingMascot />
    </div>
  )
}
