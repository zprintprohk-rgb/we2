'use client'

/**
 * MessageBubble — single chat message bubble.
 *
 * - User bubble: gradient (mood-tinted), right-aligned, scale-spring entry
 * - AI bubble: glass card with mood accent dot, left-aligned
 * - Read indicator: "✓✓" glows after a small delay
 * - Trail: motion.div wraps the bubble in a relative container so the
 *   parent can spawn a star particle at the tail.
 */

import { motion } from 'framer-motion'
import { MOOD_HEX, type Mood } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

export interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  ts: number
}

interface Props {
  message: Message
  mood: Mood
  index: number
}

const SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 }

export function MessageBubble({ message, mood, index }: Props) {
  const isMe = message.sender === 'me'
  const moodColor = MOOD_HEX[mood]

  return (
    <motion.div
      data-testid="msg-bubble"
      data-sender={message.sender}
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...SPRING, delay: Math.min(index * 0.04, 0.2) }}
      className={cn('flex w-full', isMe ? 'justify-end' : 'justify-start')}
    >
      <div className="flex max-w-[78%] flex-col gap-1">
        <div
          className={cn(
            'relative px-4 py-2.5 text-sm leading-relaxed shadow-lg',
            isMe
              ? 'rounded-2xl rounded-br-md text-white'
              : 'rounded-2xl rounded-bl-md glass-card-emph text-zinc-100',
          )}
          style={
            isMe
              ? {
                  background: `linear-gradient(135deg, ${moodColor}cc 0%, #7C3AEDcc 100%)`,
                  boxShadow: `0 4px 16px ${moodColor}40`,
                }
              : {
                  borderColor: `${moodColor}50`,
                  boxShadow: `inset 0 0 0 1px ${moodColor}30`,
                }
          }
        >
          {message.text}
          {/* Mood accent dot (left side for AI) */}
          {!isMe && (
            <span
              className="absolute -left-1.5 top-3 h-2 w-2 rounded-full"
              style={{ backgroundColor: moodColor, boxShadow: `0 0 8px ${moodColor}` }}
              aria-hidden="true"
            />
          )}
        </div>
        {/* Read indicator (✓✓) — only on user messages after a short delay */}
        {isMe && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="self-end text-[10px] text-zinc-400"
            aria-label="Read"
          >
            ✓✓
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
