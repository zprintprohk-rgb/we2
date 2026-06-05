'use client'

/**
 * AnniversaryFireworks — fullscreen ripple particle burst.
 *
 * Triggers when a meaningful message threshold is crossed (e.g. 100th message).
 * Uses EmotionParticles internally by spawning many "ripple" particles
 * from random screen positions; auto-clears after a few seconds.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmotionParticles } from '@/components/shared/EmotionParticles'

interface Props {
  /** Fire when this becomes true (parent controls) */
  fire: boolean
  /** Duration of the burst in ms */
  durationMs?: number
  onComplete?: () => void
}

export function AnniversaryFireworks({ fire, durationMs = 4000, onComplete }: Props) {
  const [active, setActive] = useState(false)
  const [intensity, setIntensity] = useState(0.5)
  const completedRef = useRef(false)

  useEffect(() => {
    if (!fire || completedRef.current) return
    completedRef.current = true
    setActive(true)
    setIntensity(1)
    const t = setTimeout(() => {
      setActive(false)
      setIntensity(0.5)
      onComplete?.()
      completedRef.current = false
    }, durationMs)
    return () => clearTimeout(t)
  }, [fire, durationMs, onComplete])

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none fixed inset-0 z-50"
          data-testid="anniversary-fw"
          aria-hidden="true"
        >
          <EmotionParticles
            kinds={['ripple', 'star', 'shard']}
            intensity={intensity}
            interactive={false}
            decorative
            className="pointer-events-none absolute inset-0"
          />
          {/* Anniversary message overlay */}
          <div className="absolute inset-x-0 top-1/3 flex justify-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
              className="rounded-full glass-card-emph px-6 py-2.5 text-base font-semibold text-white shadow-2xl ring-1 ring-amber-300/40"
            >
              <span className="mr-2" aria-hidden="true">✨</span>
              100 messages — a chapter complete
              <span className="ml-2" aria-hidden="true">✨</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
