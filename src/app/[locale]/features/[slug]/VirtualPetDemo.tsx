'use client'

/* ── Virtual Pet — Petdex-style companion ───────────────────────────────────
 * 5 hand-crafted SVG pets × 6 stats × XP/level evolution × auto-decay.
 * Persists to localStorage. Hydration-safe (renders nothing pre-mount). */

import { useState, useEffect, useCallback, useMemo, type FC } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Apple, Play, Heart, Sparkles, Trophy, Utensils } from 'lucide-react'
import { storage } from '@/lib/storage'

/* ── Pet library: 5 base forms × deterministic SVG ─────────────────────── */

type PetId = 'cat' | 'dog' | 'fox' | 'dragon' | 'panda'

interface PetMeta {
  id: PetId
  nameKey: string
  primary: string
  secondary: string
  emoji: string
}

const PETS: Record<PetId, PetMeta> = {
  cat:    { id: 'cat',    nameKey: 'cat',    primary: '#fb923c', secondary: '#fed7aa', emoji: '🐱' },
  dog:    { id: 'dog',    nameKey: 'dog',    primary: '#a78bfa', secondary: '#ddd6fe', emoji: '🐶' },
  fox:    { id: 'fox',    nameKey: 'fox',    primary: '#f87171', secondary: '#fecaca', emoji: '🦊' },
  dragon: { id: 'dragon', nameKey: 'dragon', primary: '#34d399', secondary: '#a7f3d0', emoji: '🐲' },
  panda:  { id: 'panda',  nameKey: 'panda',  primary: '#94a3b8', secondary: '#e2e8f0', emoji: '🐼' },
}

const EVOLUTION_ORDER: PetId[] = ['cat', 'dog', 'fox', 'dragon', 'panda']
const XP_PER_LEVEL = 100

function petIdForLevel(level: number): PetId {
  // Level 1-3 cat, 4-6 dog, 7-9 fox, 10-14 dragon, 15+ panda
  if (level >= 15) return 'panda'
  if (level >= 10) return 'dragon'
  if (level >= 7) return 'fox'
  if (level >= 4) return 'dog'
  return 'cat'
}

/* ── State ─────────────────────────────────────────────────────────────── */

interface PetState {
  petId: PetId
  level: number
  xp: number
  hunger: number      // 0-100 (higher = fuller)
  happiness: number   // 0-100
  intimacy: number    // 0-100
  mood: 'happy' | 'neutral' | 'tired' | 'hungry' | 'sleeping'
  lastFedAt: number
  lastPlayAt: number
  lastCuddleAt: number
  lastDecayAt: number
  unlocked: PetId[]
}

const DEFAULT_STATE: PetState = {
  petId: 'cat',
  level: 1,
  xp: 0,
  hunger: 70,
  happiness: 70,
  intimacy: 0,
  mood: 'happy',
  lastFedAt: 0,
  lastPlayAt: 0,
  lastCuddleAt: 0,
  lastDecayAt: Date.now(),
  unlocked: ['cat'],
}

const STORAGE_KEY = 'pet_v2'

/* ── Helpers ───────────────────────────────────────────────────────────── */

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max)
}

function deriveMood(s: PetState): PetState['mood'] {
  if (s.hunger < 25) return 'hungry'
  if (s.happiness < 30) return 'tired'
  if (s.happiness > 80 && s.hunger > 60) return 'happy'
  if (s.intimacy > 80) return 'sleeping'
  return 'neutral'
}

function applyDecay(s: PetState, now: number): PetState {
  const hours = Math.min((now - s.lastDecayAt) / (1000 * 60 * 60), 24)
  if (hours < 0.1) return s
  return {
    ...s,
    hunger: clamp(s.hunger - hours * 3),       // -3 per hour
    happiness: clamp(s.happiness - hours * 2),  // -2 per hour
    lastDecayAt: now,
  }
}

/* ── Pet SVGs (5 hand-drawn faces with mood eyes/mouth) ────────────────── */

function PetAvatar({ petId, mood, size = 120 }: { petId: PetId; mood: PetState['mood']; size?: number }) {
  const meta = PETS[petId]
  const isHappy = mood === 'happy'
  const isHungry = mood === 'hungry'
  const isTired = mood === 'tired' || mood === 'sleeping'
  const eyeShape = isTired ? '−' : '•'
  const mouthShape = isHungry ? '○' : isHappy ? '‿' : '−'

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-lg">
      <defs>
        <radialGradient id={`bg-${petId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={meta.secondary} />
          <stop offset="100%" stopColor={meta.primary} />
        </radialGradient>
      </defs>

      {/* Body circle */}
      <circle cx="50" cy="55" r="35" fill={`url(#bg-${petId})`} />

      {/* Ears / horns (per pet) */}
      {petId === 'cat' && (
        <>
          <polygon points="25,30 35,10 40,30" fill={meta.primary} />
          <polygon points="75,30 65,10 60,30" fill={meta.primary} />
        </>
      )}
      {petId === 'dog' && (
        <>
          <ellipse cx="25" cy="30" rx="10" ry="18" fill={meta.primary} transform="rotate(-20 25 30)" />
          <ellipse cx="75" cy="30" rx="10" ry="18" fill={meta.primary} transform="rotate(20 75 30)" />
        </>
      )}
      {petId === 'fox' && (
        <>
          <polygon points="25,30 32,8 40,28" fill={meta.primary} />
          <polygon points="75,30 68,8 60,28" fill={meta.primary} />
        </>
      )}
      {petId === 'dragon' && (
        <>
          <polygon points="30,18 38,2 42,22" fill={meta.primary} />
          <polygon points="70,18 62,2 58,22" fill={meta.primary} />
          <circle cx="32" cy="20" r="2" fill="#fde047" />
          <circle cx="68" cy="20" r="2" fill="#fde047" />
        </>
      )}
      {petId === 'panda' && (
        <>
          <circle cx="25" cy="25" r="10" fill="#1f2937" />
          <circle cx="75" cy="25" r="10" fill="#1f2937" />
        </>
      )}

      {/* Cheeks */}
      <circle cx="32" cy="62" r="4" fill="#fda4af" opacity="0.6" />
      <circle cx="68" cy="62" r="4" fill="#fda4af" opacity="0.6" />

      {/* Eyes */}
      {isTired ? (
        <>
          <path d="M 36 50 Q 40 54 44 50" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 56 50 Q 60 54 64 50" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="40" cy="52" r="4" fill="#1f2937" />
          <circle cx="60" cy="52" r="4" fill="#1f2937" />
          <circle cx="41" cy="51" r="1.2" fill="#fff" />
          <circle cx="61" cy="51" r="1.2" fill="#fff" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="50" cy="62" rx="2.5" ry="2" fill="#1f2937" />

      {/* Mouth */}
      {isHappy ? (
        <path d="M 42 68 Q 50 76 58 68" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : isHungry ? (
        <ellipse cx="50" cy="72" rx="4" ry="3" fill="#1f2937" />
      ) : (
        <path d="M 44 70 L 56 70" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
      )}

      {/* Mood badge */}
      {mood === 'sleeping' && (
        <text x="78" y="28" fontSize="14" fill="#1f2937">💤</text>
      )}
      {mood === 'happy' && (
        <text x="78" y="28" fontSize="14" fill="#1f2937">✨</text>
      )}

      {/* Unused vars to keep TS happy */}
      <desc>{eyeShape}{mouthShape}</desc>
    </svg>
  )
}

/* ── Confetti for level-up celebration ─────────────────────────────────── */

function LevelUpBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 8,
        y: 50,
        rot: Math.random() * 360,
        color: ['#fb923c', '#a78bfa', '#f87171', '#34d399', '#fcd34d', '#f472b6'][i % 6],
        delay: i * 0.02,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: `${p.x}%`, y: '50%', rotate: 0, opacity: 1, scale: 1 }}
          animate={{
            x: `${p.x + (Math.random() - 0.5) * 60}%`,
            y: '-20%',
            rotate: p.rot,
            opacity: 0,
            scale: 0.6,
          }}
          transition={{ duration: 1.4, delay: p.delay, ease: 'easeOut' }}
          className="absolute h-2 w-2 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}

/* ── Stat bar ──────────────────────────────────────────────────────────── */

function StatBar({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  const prefersReduced = useReducedMotion()
  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-300 mb-1">
        <span className="inline-flex items-center gap-1">
          <span className="opacity-70">{icon}</span>
          {label}
        </span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={prefersReduced ? { width: `${value}%` } : { width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

/* ── Pet picker (shown if user has unlocked multiple pets) ────────────── */

function PetPicker({ unlocked, current, onSelect }: { unlocked: PetId[]; current: PetId; onSelect: (id: PetId) => void }) {
  if (unlocked.length <= 1) return null
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {unlocked.map((id) => {
        const meta = PETS[id]
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
              id === current
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white/60 text-zinc-700 hover:bg-white dark:bg-zinc-800/60 dark:text-zinc-200'
            }`}
          >
            <span>{meta.emoji}</span>
            <span className="capitalize">{id}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────────────── */

export const VirtualPetDemo: FC<{ locale: string }> = () => {
  const t = useTranslations('demo.virtualPet')
  const prefersReduced = useReducedMotion()

  const [state, setState] = useState<PetState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)
  const [justLeveledUp, setJustLeveledUp] = useState(false)
  const [xpPulse, setXpPulse] = useState(false)

  // Hydration + initial load
  useEffect(() => {
    setMounted(true)
    const stored = storage.get(STORAGE_KEY) as PetState | null
    if (stored && stored.petId) {
      setState(applyDecay(stored, Date.now()))
    }
  }, [])

  // Auto-decay ticker (every 5 min while tab is open)
  useEffect(() => {
    if (!mounted) return
    const id = setInterval(() => {
      setState((s) => {
        const next = applyDecay(s, Date.now())
        storage.set(STORAGE_KEY, next)
        return next
      })
    }, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [mounted])

  const persist = useCallback((updated: PetState) => {
    setState(updated)
    storage.set(STORAGE_KEY, updated)
  }, [])

  const triggerXpPulse = useCallback(() => {
    setXpPulse(true)
    setTimeout(() => setXpPulse(false), 800)
  }, [])

  const handleAction = useCallback(
    (action: 'feed' | 'play' | 'cuddle') => {
      const now = Date.now()
      const xpGain = action === 'feed' ? 8 : action === 'play' ? 12 : 6
      const newXp = state.xp + xpGain
      const levelUps = Math.floor(newXp / XP_PER_LEVEL)
      const newLevel = state.level + levelUps
      const rolledXp = newXp % XP_PER_LEVEL

      const unlockedSet = new Set(state.unlocked)
      // Unlock pet form at levels 4, 7, 10, 15
      if (newLevel >= 4) unlockedSet.add('dog')
      if (newLevel >= 7) unlockedSet.add('fox')
      if (newLevel >= 10) unlockedSet.add('dragon')
      if (newLevel >= 15) unlockedSet.add('panda')

      const newPetId = petIdForLevel(newLevel)
      const updated: PetState = {
        ...state,
        level: newLevel,
        xp: rolledXp,
        petId: newPetId,
        unlocked: Array.from(unlockedSet),
        hunger: action === 'feed' ? clamp(state.hunger + 20) : state.hunger,
        happiness: action === 'play' ? clamp(state.happiness + 18) : state.happiness,
        intimacy: action === 'cuddle' ? clamp(state.intimacy + 12) : state.intimacy,
        lastFedAt: action === 'feed' ? now : state.lastFedAt,
        lastPlayAt: action === 'play' ? now : state.lastPlayAt,
        lastCuddleAt: action === 'cuddle' ? now : state.lastCuddleAt,
        lastDecayAt: now,
      }
      updated.mood = deriveMood(updated)
      persist(updated)
      triggerXpPulse()

      if (levelUps > 0) {
        setJustLeveledUp(true)
        setTimeout(() => setJustLeveledUp(false), 1600)
      }
    },
    [state, persist, triggerXpPulse],
  )

  const handleSelectPet = useCallback(
    (id: PetId) => {
      const updated = { ...state, petId: id }
      persist(updated)
    },
    [state, persist],
  )

  if (!mounted) return null

  const meta = PETS[state.petId]
  const xpProgress = (state.xp / XP_PER_LEVEL) * 100

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {t('title')}
      </h3>

      <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-white/70 via-purple-50/40 to-pink-50/40 p-6 backdrop-blur dark:border-purple-800/30 dark:from-purple-950/40 dark:via-zinc-900/30 dark:to-rose-950/30 shadow-lg">
        {/* Mood background tint */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20 transition-colors"
          style={{ background: `radial-gradient(circle at 50% 30%, ${meta.primary}55, transparent 60%)` }}
        />

        {/* Level-up confetti burst */}
        <AnimatePresence>{justLeveledUp && <LevelUpBurst key="burst" />}</AnimatePresence>

        <div className="relative text-center">
          {/* Pet avatar */}
          <motion.div
            animate={
              prefersReduced || state.mood === 'sleeping'
                ? {}
                : { y: [0, -4, 0], scale: [1, 1.04, 1] }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="mx-auto inline-block"
          >
            <PetAvatar petId={state.petId} mood={state.mood} size={120} />
          </motion.div>

          {/* Name + level */}
          <p className="mt-3 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            {t(`species.${meta.nameKey}`)} · {t('petName')}
          </p>
          <div className="mt-1 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Trophy className="h-3 w-3" />
            <span>{t('level', { level: state.level })}</span>
            <span>·</span>
            <span className="capitalize">{t(`mood.${state.mood}`)}</span>
          </div>

          {/* XP bar */}
          <div className="mx-auto mt-3 max-w-xs">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">
              <span>XP</span>
              <motion.span
                key={xpPulse ? 'pulse' : 'rest'}
                animate={xpPulse ? { scale: [1, 1.4, 1], color: '#a855f7' } : { scale: 1 }}
                transition={{ duration: 0.5 }}
                className="tabular-nums"
              >
                {state.xp} / {XP_PER_LEVEL}
              </motion.span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500"
                initial={false}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-400">
              {t('nextLevel', { level: state.level + 1, form: t(`species.${PETS[petIdForLevel(state.level + 1)].nameKey}`) })}
            </p>
          </div>

          {/* Pet picker */}
          <div className="mt-4">
            <PetPicker
              unlocked={state.unlocked}
              current={state.petId}
              onSelect={handleSelectPet}
            />
          </div>

          {/* Stat bars */}
          <div className="mt-5 space-y-2.5 px-2 text-left">
            <StatBar
              label={t('hunger')}
              value={state.hunger}
              color="from-pink-400 to-rose-500"
              icon={<Utensils className="h-3 w-3" />}
            />
            <StatBar
              label={t('happiness')}
              value={state.happiness}
              color="from-purple-400 to-violet-500"
              icon={<Play className="h-3 w-3" />}
            />
            <StatBar
              label={t('intimacy')}
              value={state.intimacy}
              color="from-amber-400 to-orange-500"
              icon={<Heart className="h-3 w-3" />}
            />
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex justify-center gap-3">
            <ActionButton
              onClick={() => handleAction('feed')}
              color="from-pink-400 to-rose-500"
              shadow="shadow-pink-500/25"
              label={t('feed')}
              icon={<Apple className="h-6 w-6 text-white" />}
              prefersReduced={prefersReduced ?? false}
            />
            <ActionButton
              onClick={() => handleAction('play')}
              color="from-purple-400 to-violet-500"
              shadow="shadow-purple-500/25"
              label={t('play')}
              icon={<Play className="h-6 w-6 text-white" />}
              prefersReduced={prefersReduced ?? false}
            />
            <ActionButton
              onClick={() => handleAction('cuddle')}
              color="from-amber-400 to-orange-500"
              shadow="shadow-amber-500/25"
              label={t('cuddle')}
              icon={<Heart className="h-6 w-6 text-white" />}
              prefersReduced={prefersReduced ?? false}
            />
          </div>

          {/* Evolution hint */}
          {state.unlocked.length < EVOLUTION_ORDER.length && (
            <p className="mt-4 text-[11px] text-zinc-500 dark:text-zinc-400">
              <Sparkles className="inline h-3 w-3 mr-1 text-amber-500" />
              {t('evolutionHint', {
                count: state.unlocked.length,
                total: EVOLUTION_ORDER.length,
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Action button sub-component ───────────────────────────────────────── */

function ActionButton({
  onClick,
  color,
  shadow,
  label,
  icon,
  prefersReduced,
}: {
  onClick: () => void
  color: string
  shadow: string
  label: string
  icon: React.ReactNode
  prefersReduced: boolean
}) {
  return (
    <motion.button
      whileHover={prefersReduced ? undefined : { scale: 1.08, y: -2 }}
      whileTap={prefersReduced ? undefined : { scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      aria-label={label}
      className={`group relative w-14 h-14 rounded-2xl bg-gradient-to-br ${color} shadow-lg ${shadow} flex items-center justify-center hover:shadow-xl transition-shadow`}
    >
      {icon}
      <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-zinc-900/90 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
    </motion.button>
  )
}
