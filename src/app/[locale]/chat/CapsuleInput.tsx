'use client'

/**
 * CapsuleInput — combined text input + horizontal quick-reply capsules
 * with glowing active state.
 *
 * Layout: capsules (pill row, scroll-x) → text input row with send button.
 * The voice button is a separate element passed in (so chat can render it
 * next to the input).
 */

import { useState, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { MOOD_HEX, type Mood } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

interface Props {
  mood: Mood
  onSend: (text: string) => void
  disabled?: boolean
  voiceSlot?: React.ReactNode
  quickReplies: string[]
}

export function CapsuleInput({ mood, onSend, disabled, voiceSlot, quickReplies }: Props) {
  const t = useTranslations('chat')
  const [input, setInput] = useState('')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const moodColor = MOOD_HEX[mood]

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col gap-2">
      {/* ── Quick reply capsules (horizontal scroll) ── */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        role="toolbar"
        aria-label="Quick replies"
      >
        {quickReplies.map((q, i) => {
          const isHovered = hoveredIdx === i
          return (
            <motion.button
              key={q}
              type="button"
              disabled={disabled}
              onClick={() => onSend(q)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              whileTap={{ scale: 0.94 }}
              className={cn(
                'shrink-0 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-zinc-200 transition-all duration-300',
                'hover:scale-105',
                isHovered && 'border-transparent text-white',
              )}
              style={
                isHovered
                  ? {
                      background: `${moodColor}30`,
                      boxShadow: `0 0 20px ${moodColor}60, inset 0 0 0 1px ${moodColor}80`,
                    }
                  : undefined
              }
            >
              {q}
            </motion.button>
          )
        })}
      </div>

      {/* ── Text input + send ── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
        aria-label={t('placeholder')}
      >
        {voiceSlot}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('placeholder')}
            disabled={disabled}
            aria-label={t('placeholder')}
            className={cn(
              'w-full rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100',
              'placeholder:text-zinc-500 outline-none backdrop-blur-md transition-colors duration-300',
              'focus:border-white/30 focus:bg-white/10',
              'disabled:opacity-50',
            )}
            style={{
              boxShadow: `inset 0 0 0 1px transparent`,
            }}
          />
        </div>
        <motion.button
          type="submit"
          disabled={!input.trim() || disabled}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-lg transition-all duration-300',
            'disabled:opacity-40',
          )}
          style={{
            background: `linear-gradient(135deg, ${moodColor} 0%, #7C3AED 100%)`,
            boxShadow: input.trim() && !disabled ? `0 4px 20px ${moodColor}80` : 'none',
          }}
          aria-label="Send"
        >
          <span aria-hidden="true">➤</span>
        </motion.button>
      </form>
    </div>
  )
}
