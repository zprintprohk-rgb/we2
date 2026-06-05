/**
 * /chat — Soulmate AI chat (PRD §5 Soulmate tier)
 *
 * Chat with an AI companion that learns the speech style of the
 * one you care about. For MVP Day 1: mock responses with 5
 * personality presets. Day 2 wires to DeepSeek/Minimax with
 * per-user speech style corpus.
 *
 * Universal: never says 'TA' as a fixed term; uses 'they/them' or
 * the name the user provides.
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'

type Sender = 'me' | 'them'
interface Message {
  id: string
  text: string
  sender: Sender
  ts: number
}

// Mock response pool — warm, supportive, universal
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

const QUICK_REPLIES = ['☕ How are you?', '🤗 I miss them', '😴 I am tired', '🎉 Good news!']

export default function SoulmateChatPage() {
  const t = useTranslations('chat')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: 'Hey! I am here. Whenever you are ready. 🐾',
      sender: 'them',
      ts: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  function send(text: string) {
    if (!text.trim()) return
    const me: Message = { id: 'm' + Date.now(), text, sender: 'me', ts: Date.now() }
    setMessages(prev => [...prev, me])
    setInput('')
    setTyping(true)
    // Simulate AI response after 1.2s
    setTimeout(() => {
      const reply: Message = {
        id: 'r' + Date.now(),
        text: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
        sender: 'them',
        ts: Date.now(),
      }
      setMessages(prev => [...prev, reply])
      setTyping(false)
    }, 1200)
  }

  return (
    <div className="relative mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white/80 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-rose-200 to-purple-200 p-1 dark:from-rose-900 dark:to-purple-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/pets/robot-base.png" alt="Soulmate" className="h-full w-full object-contain" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-zinc-950" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t('title')}
            </h1>
            <p className="text-xs text-emerald-500">● {t('online')}</p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow">
            Soulmate
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map(m => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.sender === 'me'
                  ? 'rounded-br-sm bg-gradient-to-br from-rose-500 to-purple-600 text-white'
                  : 'rounded-bl-sm border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-zinc-400"
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick replies */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {QUICK_REPLIES.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-600 hover:scale-105 hover:border-rose-300 hover:text-rose-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={e => { e.preventDefault(); send(input) }}
        className="flex gap-2 border-t border-zinc-200 bg-white/80 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={t('placeholder')}
          disabled={typing}
          className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:focus:border-rose-500 dark:focus:ring-rose-900/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="rounded-full bg-gradient-to-r from-rose-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-purple-500/50 disabled:opacity-50"
        >
          {typing ? '⏳' : '➤'}
        </button>
      </form>

      <p className="py-2 text-center text-[10px] text-zinc-400">
        🧪 {t('mockNotice')}
      </p>
    </div>
  )
}
