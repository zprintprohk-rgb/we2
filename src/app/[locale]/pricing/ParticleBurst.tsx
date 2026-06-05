'use client'

/**
 * ParticleBurst — 单次点击触发的粒子爆发层
 *
 * Renders an absolutely-positioned <EmotionParticles> in interactive
 * mode. When the user clicks "Subscribe", we mount a fresh burst layer
 * (key resets → new canvas instance) that auto-dismisses after ~1.6s.
 *
 * Three palette presets map to the three tiers:
 *   - free    : dust only (subtle, friendly)
 *   - plus    : bubble + star (pink/purple)
 *   - eternal : star + dust (gold)
 */

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EmotionParticles } from '@/components/shared/EmotionParticles'
import type { ParticleKind } from '@/lib/design-tokens'
import type { PricingTier } from './pet-data'

interface ParticleBurstProps {
  /** Tier whose color preset to use */
  tier: PricingTier
  /** when this increments, fire a new burst (parent owns the counter) */
  trigger: number
  /** auto-dismiss after this many ms (default 1600) */
  durationMs?: number
}

const TIER_KINDS: Record<PricingTier, ParticleKind[]> = {
  free:    ['dust'],
  plus:    ['bubble', 'star'],
  eternal: ['star', 'dust', 'bubble'],
}

const TIER_INTENSITY: Record<PricingTier, number> = {
  free:    0.7,
  plus:    1.1,
  eternal: 1.4,
}

export function ParticleBurst({ tier, trigger, durationMs = 1600 }: ParticleBurstProps) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (trigger <= 0) return
    setActive(true)
    const id = setTimeout(() => setActive(false), durationMs)
    return () => clearTimeout(id)
  }, [trigger, durationMs])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={trigger}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 z-30 overflow-visible"
          aria-hidden="true"
        >
          <EmotionParticles
            kinds={TIER_KINDS[tier]}
            intensity={TIER_INTENSITY[tier]}
            interactive
            className="absolute inset-0"
          />
          {/* Center flash: a quick scale + fade ring */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className={
              tier === 'eternal'
                ? 'absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/30 blur-2xl'
                : tier === 'plus'
                  ? 'absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-300/30 blur-2xl'
                  : 'absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-2xl'
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
