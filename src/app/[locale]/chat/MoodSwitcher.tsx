'use client'

/**
 * MoodSwitcher — 5 horizontal mood pills.
 *
 * Lets user manually override the auto-detected mood.
 * Each pill shows the mood emoji + name; selected pill glows
 * with the mood's signature color.
 */

import { motion } from 'framer-motion'
import { MOODS, MOOD_HEX, type Mood } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface Props {
  value: Mood
  onChange: (m: Mood) => void
}

const MOOD_ORDER: Mood[] = ['sweet', 'calm', 'think', 'sleepy', 'fight']

export function MoodSwitcher({ value, onChange }: Props) {
  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto rounded-full glass-card px-2 py-1.5"
      role="tablist"
      aria-label="Chat mood"
    >
      {MOOD_ORDER.map(mood => {
        const cfg = MOODS[mood]
        const isActive = mood === value
        return (
          <motion.button
            key={mood}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(mood)}
            whileTap={{ scale: 0.92 }}
            className={cn(
              'relative flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-300',
              isActive
                ? 'text-white'
                : 'text-zinc-300/70 hover:text-zinc-100 hover:bg-white/5',
            )}
            style={
              isActive
                ? {
                    background: `${MOOD_HEX[mood]}40`,
                    boxShadow: `0 0 16px ${MOOD_HEX[mood]}80, inset 0 0 0 1px ${MOOD_HEX[mood]}80`,
                  }
                : undefined
            }
          >
            <span aria-hidden="true">{cfg.bubbleEn === 'Sweet~' ? '💕' : cfg.bubbleEn === 'Zzz...' ? '😴' : cfg.bubbleEn === 'Hmph... not talking' ? '💢' : cfg.bubbleEn === 'Hmm... thinking...' ? '🌿' : '💭'}</span>
            <span className="capitalize">{mood}</span>
            {isActive && (
              <motion.span
                layoutId="mood-active-pill"
                className="absolute inset-0 -z-10 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
