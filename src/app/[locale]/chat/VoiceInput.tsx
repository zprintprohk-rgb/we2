'use client'

/**
 * VoiceInput — long-press mic button.
 *
 * On pointer down: starts "recording" (state changes to listening).
 * On pointer up: cancels or sends (if held > 800ms, simulated "transcribed" text).
 *
 * Communicates with parent via onRecordingChange + onTranscript.
 * While listening, the parent shows PetPresence in 'listening' state (head tilt).
 */

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'framer-motion'

interface Props {
  onRecordingChange: (recording: boolean) => void
  /** Called with simulated transcribed text if user held > 800ms */
  onTranscript?: (text: string) => void
  disabled?: boolean
  accentColor?: string
}

const SAMPLE_PHRASES = [
  "I am thinking of you.",
  "Just wanted to hear a voice.",
  "Long day... miss you.",
  "Hey, are you there?",
]

export function VoiceInput({ onRecordingChange, onTranscript, disabled, accentColor = '#F472B6' }: Props) {
  const [recording, setRecording] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const firedRef = useRef(false)

  const begin = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled) return
    e.preventDefault()
    ;(e.currentTarget as HTMLButtonElement).setPointerCapture?.(e.pointerId)
    firedRef.current = false
    setRecording(true)
    onRecordingChange(true)
    timerRef.current = setTimeout(() => {
      firedRef.current = true
      const phrase = SAMPLE_PHRASES[Math.floor(Math.random() * SAMPLE_PHRASES.length)]
      onTranscript?.(phrase)
    }, 800)
  }

  const end = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setRecording(false)
    onRecordingChange(false)
  }

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onPointerDown={begin}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={end}
      whileTap={{ scale: 0.88 }}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-40"
      style={
        recording
          ? {
              background: `${accentColor}40`,
              borderColor: `${accentColor}80`,
              boxShadow: `0 0 18px ${accentColor}80`,
            }
          : undefined
      }
      aria-label={recording ? 'Recording... release to send' : 'Hold to record voice'}
      aria-pressed={recording}
    >
      {/* Pulse ring when recording */}
      {recording && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ border: `2px solid ${accentColor}` }}
          animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden="true"
        />
      )}
      <span aria-hidden="true" className="text-base">
        {recording ? '🔴' : '🎙️'}
      </span>
    </motion.button>
  )
}
