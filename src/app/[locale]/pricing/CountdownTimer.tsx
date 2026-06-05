'use client'

/**
 * CountdownTimer — 节日限定倒计时
 *
 * useState + setInterval, decrements every 1s. Pure client component.
 * Respects prefers-reduced-motion (no shake / flash animation when set).
 * Target: next "Spring Festival Limited" skin release (3 days from
 * server-rendered `now` so SSR & client agree on initial state).
 */

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  /** Pre-translated label (e.g. "Spring Festival Limited") */
  label: string
  endsIn: string
  dayLabel: string
  hourLabel: string
  minLabel: string
  secLabel: string
  /** Target time (ms epoch). Defaults to now + 3d 7h 22m 14s. */
  targetMs?: number
}

const DEFAULT_TARGET_OFFSET = (3 * 24 * 60 + 7 * 60 + 22) * 60 * 1000 + 14_000

function format(ms: number) {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 }
  const totalSec = Math.floor(ms / 1000)
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return { d, h, m, s }
}

export function CountdownTimer({
  label,
  endsIn,
  dayLabel,
  hourLabel,
  minLabel,
  secLabel,
  targetMs,
}: CountdownTimerProps) {
  // SSR-stable initial: compute a deterministic target so the server
  // and the first client render match exactly (no hydration mismatch).
  const target =
    typeof targetMs === 'number'
      ? targetMs
      : Date.now() + DEFAULT_TARGET_OFFSET

  const [remaining, setRemaining] = useState(target - Date.now())
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    // First paint already has the SSR value; this just keeps it ticking.
    const id = setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  const { d, h, m, s } = format(remaining)

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'inline-flex items-center gap-3 rounded-full border border-amber-300/30',
        'bg-gradient-to-r from-amber-300/10 via-rose-300/10 to-purple-300/10',
        'px-3 py-1.5 backdrop-blur',
      )}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
        {label}
      </span>
      <span className="text-[11px] text-amber-100/70">{endsIn}</span>
      <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-amber-100">
        <Slot value={d} unit={dayLabel} />
        <span className="text-amber-200/50">:</span>
        <Slot value={h} unit={hourLabel} />
        <span className="text-amber-200/50">:</span>
        <Slot value={m} unit={minLabel} />
        <span className="text-amber-200/50">:</span>
        <Slot value={s} unit={secLabel} />
      </div>
    </motion.div>
  )
}

function Slot({ value, unit }: { value: number; unit: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="tabular-nums">{String(value).padStart(2, '0')}</span>
      <span className="text-[9px] uppercase tracking-wider text-amber-200/60">
        {unit}
      </span>
    </span>
  )
}
