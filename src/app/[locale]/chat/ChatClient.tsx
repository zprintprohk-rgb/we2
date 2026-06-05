'use client'

/**
 * ChatClient — main interactive chat page (Fusion v2).
 *
 * Composes:
 *  - EmotionBackground  (mood-responsive nebula gradient + night mode)
 *  - MoodSwitcher       (5 manual mood pills)
 *  - MessageBubble      (sprung scale entry, mood-tinted user bubble)
 *  - TypingIndicator    (3-dot pulse wave)
 *  - CapsuleInput       (glowing quick reply pills + text input)
 *  - VoiceInput         (long-press mic, feeds PetPresence listening state)
 *  - PetPresence        (48x48 corner sprite with full emotion state machine)
 *  - AnniversaryFireworks (ripple particle burst at >100 messages)
 *
 * Mock behavior PRESERVED:
 *  - MOCK_RESPONSES / QUICK_REPLIES from original page.tsx
 *  - 1.2s simulated AI response
 *  - Initial greeting "Hey! I am here. Whenever you are ready. 🐾"
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { EmotionParticles } from '@/components/shared/EmotionParticles'
import { MOODS, MOOD_HEX, isNightMode, type Mood } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

import { EmotionBackground } from './EmotionBackground'
import { MoodSwitcher } from './MoodSwitcher'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { CapsuleInput } from './CapsuleInput'
import { VoiceInput } from './VoiceInput'
import { PetPresence, type PetState } from './PetPresence'
import { AnniversaryFireworks } from './AnniversaryFireworks'
import { detectMood } from './moodDetector'

// ── Mock data (PRESERVED from original page.tsx) ────────────────────────
const MOCK_RESPONSES: string[] = [
  'I hear you. Take a breath. ☁️',
  'You are doing better than you think. ✨',
  'Whenever you need me, I am right here.',
  'Some days are heavy. That is okay. 🍵',
  'You are not alone in this.',
  'Have you eaten? Drink some water. 💧',
  'Want to talk about it, or just sit together quietly?',
  'I am proud of you, in the small things too.',
  'One step at a time. No rush.',
  'If today is hard, tomorrow is a fresh page.',
]

const QUICK_REPLIES: string[] = [
  '☕ How are you?',
  '🤗 I miss them',
  '😴 I am tired',
  '🎉 Good news!',
  '💭 Thinking of you',
]

const ANNIVERSARY_THRESHOLD = 100

// ── Mood → Pet state mapping ────────────────────────────────────────────
function moodToPetState(mood: Mood, isTyping: boolean, isListening: boolean): PetState {
  if (isListening) return 'listening'
  if (isTyping) return 'pointing'
  switch (mood) {
    case 'sweet':  return 'happy'
    case 'fight':  return 'concerned'
    case 'sleepy': return 'sleepy'
    case 'think':  return 'thinking'
    case 'calm':   return 'idle'
  }
}

export default function ChatClient() {
  const t = useTranslations('chat')
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: 'me' | 'them'; ts: number }>>([
    {
      id: '0',
      text: 'Hey! I am here. Whenever you are ready. 🐾',
      sender: 'them',
      ts: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [mood, setMood] = useState<Mood>('calm')
  const [recording, setRecording] = useState(false)
  const [night, setNight] = useState(false)
  const [anniversaryFire, setAnniversaryFire] = useState(false)
  const anniversaryFiredRef = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── Night mode polling (matches isNightMode() in design-tokens) ──
  useEffect(() => {
    setNight(isNightMode())
    const i = setInterval(() => setNight(isNightMode()), 5 * 60 * 1000)
    return () => clearInterval(i)
  }, [])

  // ── Auto-scroll to bottom on new messages / typing change ──
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  // ── Send a message (mock 1.2s response — PRESERVED) ──
  const send = useCallback((text: string) => {
    if (!text.trim()) return
    const me = { id: 'm' + Date.now() + Math.random().toString(36).slice(2, 6), text, sender: 'me' as const, ts: Date.now() }
    setMessages(prev => [...prev, me])
    setInput('')
    // Update mood from detected keyword
    const detected = detectMood(text)
    setMood(detected)

    setTyping(true)
    setTimeout(() => {
      const reply = {
        id: 'r' + Date.now() + Math.random().toString(36).slice(2, 6),
        text: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
        sender: 'them' as const,
        ts: Date.now(),
      }
      setMessages(prev => {
        const next = [...prev, reply]
        // Anniversary check (on the 100th message, fire once)
        if (next.length >= ANNIVERSARY_THRESHOLD && !anniversaryFiredRef.current) {
          anniversaryFiredRef.current = true
          setAnniversaryFire(true)
        }
        return next
      })
      // AI's reply nudges mood back toward calm (steady hand)
      setMood('calm')
      setTyping(false)
    }, 1200)
  }, [])

  // ── Pet emotion derived from mood + typing + listening ──
  const petState = useMemo<PetState>(
    () => moodToPetState(mood, typing, recording),
    [mood, typing, recording],
  )

  // ── Pet interaction handler — surfaces a small "system" note ──
  const handlePetInteract = useCallback((kind: 'love' | 'hug' | 'comfort') => {
    const lines: Record<typeof kind, string> = {
      love:    '💕 A little wave of warmth, from me to you.',
      hug:     '🤗 A gentle hug. I am right here.',
      comfort: '🫂 It is okay. Take your time.',
    }
    const note = { id: 'p' + Date.now(), text: lines[kind], sender: 'them' as const, ts: Date.now() }
    setMessages(prev => [...prev, note])
  }, [])

  // ── Voice transcript → drop into input ──
  const handleVoiceTranscript = useCallback((text: string) => {
    setInput(text)
  }, [])

  const moodColor = MOOD_HEX[mood]
  const particleKinds: Array<'bubble' | 'star' | 'dust' | 'ripple' | 'shard'> = useMemo(() => {
    switch (mood) {
      case 'sweet':  return ['star', 'dust']
      case 'fight':  return ['shard', 'dust']
      case 'calm':   return ['dust']
      case 'sleepy': return ['dust']
      case 'think':  return ['dust', 'ripple']
    }
  }, [mood])

  return (
    <div
      className="relative mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col overflow-hidden px-3 text-zinc-100 sm:px-4"
      data-testid="chat-fusion-v2"
    >
      {/* ── Background layer (mood + night mode) ── */}
      <EmotionBackground mood={mood} />

      {/* ── Interactive particles (mood-driven kind set) ── */}
      <EmotionParticles
        kinds={particleKinds}
        intensity={night ? 0.35 : 0.55}
        interactive
        decorative
        className="pointer-events-none absolute inset-0 z-0"
      />

      {/* ── Content layer (above background) ── */}
      <div className="relative z-10 flex h-full flex-col">
        {/* ── Header ── */}
        <header className="flex items-center gap-3 border-b border-white/10 bg-black/20 px-3 py-3 backdrop-blur-md sm:px-4">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-rose-300/40 to-purple-400/40 p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pets/robot-base.png" alt="Soulmate" className="h-full w-full rounded-full object-contain" />
            <span
              className={cn(
                'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0B1A]',
                typing ? 'bg-amber-300 animate-pulse' : 'bg-emerald-400',
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-zinc-100">{t('title')}</h1>
            <p className="truncate text-[11px] text-emerald-400/90">
              {typing ? t('typing') : t('online')}
              {night && <span className="ml-1.5 text-zinc-400">· 🌙 {t('nightMode')}</span>}
            </p>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-md"
            style={{
              background: `linear-gradient(135deg, ${moodColor}, #7C3AED)`,
            }}
          >
            {MOODS[mood].bubbleEn}
          </span>
        </header>

        {/* ── Mood switcher (scrollable on mobile) ── */}
        <div className="px-2 pt-2 sm:px-4">
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <MoodSwitcher value={mood} onChange={setMood} />
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-2 py-4 sm:px-4"
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
        >
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <MessageBubble key={m.id} message={m} mood={mood} index={i} />
              ))}
              {typing && <TypingIndicator key="typing" />}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Input area (with voice slot) ── */}
        <div className="border-t border-white/10 bg-black/30 px-2 py-3 backdrop-blur-md sm:px-4">
          <CapsuleInput
            mood={mood}
            onSend={send}
            disabled={typing}
            quickReplies={QUICK_REPLIES}
            voiceSlot={
              <VoiceInput
                onRecordingChange={setRecording}
                onTranscript={handleVoiceTranscript}
                disabled={typing}
                accentColor={moodColor}
              />
            }
          />
          <p className="mt-2 text-center text-[10px] text-zinc-500">
            🧪 {t('mockNotice')}
          </p>
        </div>
      </div>

      {/* ── Pet presence (corner) ── */}
      <PetPresence
        state={petState}
        nightMode={night}
        onInteract={handlePetInteract}
      />

      {/* ── Anniversary fireworks (one-shot, message > 100) ── */}
      <AnniversaryFireworks
        fire={anniversaryFire}
        onComplete={() => setAnniversaryFire(false)}
      />
    </div>
  )
}
