'use client'

/**
 * EmotionBackground — fullscreen mood-responsive nebula gradient.
 *
 * - Uses MOODS[mood].bgArc for the upper arc
 * - Cross-fades with 0.5s ease via opacity swap (avoids re-render)
 * - Adds subtle moving "stars" + secondary bottom glow
 * - Night mode darkens the whole stack automatically
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOODS, type Mood, isNightMode } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface Props {
  mood: Mood
  className?: string
}

export function EmotionBackground({ mood, className }: Props) {
  const cfg = MOODS[mood]
  const [night, setNight] = useState(false)

  // Auto night mode (re-evaluate every 5 min to handle 22:00 transition live)
  useEffect(() => {
    setNight(isNightMode())
    const i = setInterval(() => setNight(isNightMode()), 5 * 60 * 1000)
    return () => clearInterval(i)
  }, [])

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
      aria-hidden="true"
      data-testid="emotion-bg"
      data-mood={mood}
    >
      {/* ── Base cosmic layer (always) ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0B0B1A 0%, #110A20 50%, #06030F 100%)',
        }}
      />

      {/* ── Mood arc gradient (cross-fade on mood change) ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={mood}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: night ? 0.55 : 0.95 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ background: cfg.bgArc }}
        />
      </AnimatePresence>

      {/* ── Secondary bottom glow (mood color, subtle) ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background: `radial-gradient(ellipse at bottom, ${cfg.particleColor}26 0%, transparent 60%)`,
          opacity: night ? 0.3 : 0.55,
          transition: 'background 0.5s ease, opacity 0.5s ease',
        }}
      />

      {/* ── Static star field (small white dots) ── */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 71) % 100}%`,
              width: (i % 3) === 0 ? 2 : 1,
              height: (i % 3) === 0 ? 2 : 1,
              opacity: night ? 0.5 : 0.25,
              animation: `breath ${2 + (i % 4)}s ease-in-out ${(i * 0.3) % 3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Slow drifting nebula blob (mood-tinted) ── */}
      <motion.div
        className="absolute -left-32 top-1/4 h-96 w-96 rounded-full blur-3xl"
        style={{ backgroundColor: cfg.particleColor, opacity: night ? 0.10 : 0.18 }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full blur-3xl"
        style={{ backgroundColor: cfg.particleColor, opacity: night ? 0.08 : 0.14 }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 20, -25, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── Night mode overlay (subtle deep purple wash) ── */}
      {night && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,5,40,0.35) 0%, rgba(6,3,15,0.55) 100%)',
            transition: 'opacity 0.6s ease',
          }}
        />
      )}
    </div>
  )
}
