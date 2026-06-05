'use client'

/**
 * PetPresence — 48x48 corner pet sprite with emotion state machine.
 *
 * The pet is the user's "third presence" in the conversation.
 * It reacts to:
 *  - The detected mood (happy / concerned / sleepy / thinking / pointing)
 *  - Whether the AI is typing (pointing at input area)
 *  - Whether the user is voice-recording (listening — head tilt)
 *  - Click → opens a quick interaction menu (love / hug / comfort)
 *
 * Sprite per state:
 *  - idle       → robot-base.png (gentle breath)
 *  - happy      → expression-happy.png  (small jump)
 *  - concerned  → sticker-crying.png    (shake)
 *  - sleepy     → sticker-sleepy.png    (slow blink)
 *  - thinking   → expression-charging.png (tilt)
 *  - pointing   → robot-base.png        (rotated toward input)
 *  - listening  → sticker-shy.png       (strong tilt, ear lean)
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type PetState =
  | 'idle'
  | 'happy'
  | 'concerned'
  | 'sleepy'
  | 'thinking'
  | 'pointing'
  | 'listening'

interface Props {
  state: PetState
  nightMode?: boolean
  onInteract?: (kind: 'love' | 'hug' | 'comfort') => void
  className?: string
}

const SPRITE: Record<PetState, string> = {
  idle:      '/pets/robot-base.png',
  happy:     '/pets/expression-happy.png',
  concerned: '/pets/sticker-crying.png',
  sleepy:    '/pets/sticker-sleepy.png',
  thinking:  '/pets/expression-charging.png',
  pointing:  '/pets/robot-base.png',
  listening: '/pets/sticker-shy.png',
}

const STATE_LABEL: Record<PetState, string> = {
  idle:      '...',
  happy:     '!',
  concerned: '...',
  sleepy:    'Zzz',
  thinking:  '?',
  pointing:  '👀',
  listening: '🎤',
}

// Map state to motion animation
const ANIM: Record<PetState, any> = {
  idle:      { y: [0, -2, 0],                   transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } },
  happy:     { y: [0, -8, 0, -6, 0],            transition: { duration: 0.9, repeat: Infinity, repeatDelay: 1.5, ease: 'easeOut' } },
  concerned: { x: [0, -2, 2, -2, 0],            transition: { duration: 0.4, repeat: Infinity, repeatDelay: 0.8 } },
  sleepy:    { scale: [1, 0.96, 1],              transition: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } },
  thinking:  { rotate: [-6, 6, -6],              transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
  pointing:  { rotate: [0, -12, 0],              transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
  listening: { rotate: [-10, -14, -10],         transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } },
}

const INTERACTIONS: Array<{ kind: 'love' | 'hug' | 'comfort'; emoji: string; label: string }> = [
  { kind: 'love',    emoji: '💕', label: 'Love' },
  { kind: 'hug',     emoji: '🤗', label: 'Hug' },
  { kind: 'comfort', emoji: '🫂', label: 'Comfort' },
]

export function PetPresence({ state, nightMode, onInteract, className }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isListening = state === 'listening'

  return (
    <div className={cn('fixed bottom-4 right-4 z-30', className)} data-testid="pet-presence" data-state={state}>
      {/* ── Glow ring (mood-tinted, brighter when night mode) ── */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-md transition-opacity duration-500',
          nightMode ? 'opacity-70' : 'opacity-50',
        )}
        style={{
          background: isListening
            ? 'radial-gradient(circle, rgba(244,114,182,0.6) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(251,191,36,0.45) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ── Pet sprite button (48x48) ── */}
      <motion.button
        type="button"
        onClick={() => setMenuOpen(v => !v)}
        aria-label={`Companion (${state})`}
        aria-expanded={menuOpen}
        className={cn(
          'relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full glass-card-emph ring-1 ring-white/15',
          'transition-transform duration-200',
          'hover:scale-110 active:scale-95',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60',
        )}
        animate={ANIM[state]}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SPRITE[state]}
          alt=""
          className="h-10 w-10 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
          draggable={false}
        />
        {/* State label badge */}
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400/90 text-[8px] font-bold text-zinc-900 shadow"
          aria-hidden="true"
        >
          {STATE_LABEL[state]}
        </span>
      </motion.button>

      {/* ── Quick interaction menu (popover) ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="absolute bottom-14 right-0 flex flex-col gap-1 rounded-2xl glass-card-emph p-2 shadow-2xl ring-1 ring-white/10"
            role="menu"
            aria-label="Companion interactions"
          >
            {INTERACTIONS.map(({ kind, emoji, label }) => (
              <motion.button
                key={kind}
                type="button"
                role="menuitem"
                onClick={() => {
                  onInteract?.(kind)
                  setMenuOpen(false)
                }}
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5 text-xs text-zinc-100 transition-colors hover:bg-white/10"
              >
                <span aria-hidden="true">{emoji}</span>
                <span>{label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
