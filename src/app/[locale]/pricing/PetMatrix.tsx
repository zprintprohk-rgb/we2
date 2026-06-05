'use client'

/**
 * PetMatrix — 宠物选择矩阵子组件
 *
 * Three visual modes keyed by tier (visual落差):
 *   - free    : 3 grayscale circles, plain, no glow
 *   - plus    : 10+ colorful glowing circles, marquee/scroll, slight up-peek on hover
 *   - eternal : all icons lit gold + legend ring + 1/72 badge
 *
 * The matrix is a 100% pure visual prop — no logic, no analytics, no
 * checkout. Tier-gating is communicated only by what we render.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  PRICING_PETS,
  pickPetsForTier,
  SERIES_ORDER,
  type PricingTier,
  type PricingPet,
} from './pet-data'
import { PET_SERIES } from '@/lib/design-tokens'

interface PetMatrixProps {
  tier: PricingTier
  /** Free-label & sub-label strings, pre-translated */
  label: string
  sub: string
  /** when true, the card is being hovered (controls pet "peek" direction) */
  isHovered?: boolean
}

interface TierTheme {
  ring: string
  chipBg: string
  chipRing: string
  chipFilter: string
  labelColor: string
  subColor: string
}

const TIER_THEMES: Record<PricingTier, TierTheme> = {
  free: {
    ring: 'ring-white/10',
    chipBg: 'bg-white/5',
    chipRing: 'ring-white/10',
    chipFilter: 'grayscale brightness-[0.6]',
    labelColor: 'text-zinc-300',
    subColor: 'text-zinc-500',
  },
  plus: {
    ring: 'ring-purple-300/30',
    chipBg: 'bg-white/[0.06]',
    chipRing: 'ring-purple-200/20',
    chipFilter: '',
    labelColor: 'text-purple-100',
    subColor: 'text-zinc-400',
  },
  eternal: {
    ring: 'ring-amber-300/40',
    chipBg: 'bg-amber-300/[0.04]',
    chipRing: 'ring-amber-300/30',
    chipFilter: '',
    labelColor: 'text-amber-200',
    subColor: 'text-amber-200/60',
  },
}

export function PetMatrix({ tier, label, sub, isHovered = false }: PetMatrixProps) {
  const pets = pickPetsForTier(tier)
  const theme = TIER_THEMES[tier]

  return (
    <div className="mt-auto w-full">
      {/* Label & sub */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.18em]',
              theme.labelColor,
            )}
          >
            {label}
          </span>
          <span className={cn('text-[10px] mt-0.5', theme.subColor)}>{sub}</span>
        </div>

        {tier === 'eternal' && (
          <span
            className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200 ring-1 ring-amber-300/30"
            aria-label="1 in 72 odds"
          >
            1/72
          </span>
        )}
      </div>

      {/* Pet chip grid */}
      {tier === 'free' && (
        <FreeRow pets={pets} isHovered={isHovered} theme={theme} />
      )}

      {tier === 'plus' && (
        <PlusGrid pets={pets} isHovered={isHovered} theme={theme} />
      )}

      {tier === 'eternal' && (
        <EternalGrid pets={pets} theme={theme} />
      )}

      {/* Footer series chips (only on plus/eternal) */}
      {tier !== 'free' && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SERIES_ORDER.filter((s) => s !== 'basic').map((s) => (
            <span
              key={s}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1',
                tier === 'eternal'
                  ? 'bg-amber-300/10 text-amber-100 ring-amber-300/20'
                  : 'bg-white/5 text-zinc-300 ring-white/10',
              )}
            >
              <span aria-hidden="true">{PET_SERIES[s].emoji}</span>
              {PET_SERIES[s].labelEn}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Sub-views ──────────────────────────────────────────────────────── */

function FreeRow({
  pets,
  isHovered,
  theme,
}: {
  pets: PricingPet[]
  isHovered: boolean
  theme: TierTheme
}) {
  return (
    <div className="flex items-center gap-3">
      {pets.map((p, i) => (
        <motion.div
          key={p.id}
          className={cn(
            'relative h-12 w-12 overflow-hidden rounded-full ring-1',
            theme.chipRing,
            theme.chipBg,
            theme.chipFilter,
          )}
          animate={{
            y: isHovered ? 3 : 0, // free pets "duck" (positive y = down)
            opacity: isHovered ? 0.7 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: i * 0.05 }}
          aria-label={p.emoji}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt={p.emoji}
            className="h-full w-full object-cover opacity-80"
            loading="lazy"
          />
        </motion.div>
      ))}
      <div className="ml-1 text-[10px] uppercase tracking-wider text-zinc-500">
        ...
      </div>
    </div>
  )
}

function PlusGrid({
  pets,
  isHovered,
  theme,
}: {
  pets: PricingPet[]
  isHovered: boolean
  theme: TierTheme
}) {
  // 6+ visible at once on a 3-col mini grid, total count badge
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-1.5">
        {pets.slice(0, 12).map((p, i) => (
          <motion.div
            key={p.id}
            className={cn(
              'relative h-9 w-9 overflow-hidden rounded-xl ring-1',
              theme.chipRing,
              theme.chipBg,
            )}
            style={{
              boxShadow: `0 0 12px ${p.glow}`,
            }}
            animate={{
              y: isHovered ? -4 : 0, // plus pets "peek up"
              scale: isHovered ? 1.08 : 1,
            }}
            transition={{ type: 'spring', stiffness: 240, damping: 14, delay: i * 0.02 }}
            aria-label={p.emoji}
            title={p.emoji}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt={p.emoji}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* shimmer overlay */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-zinc-400">
        <span>+ {Math.max(0, PRICING_PETS.length - 12)} more</span>
        <span className="inline-flex items-center gap-1 text-purple-200">
          <span className="h-1 w-1 rounded-full bg-purple-300 animate-pulse" />
          4 series
        </span>
      </div>
    </div>
  )
}

function EternalGrid({
  pets,
  theme,
}: {
  pets: PricingPet[]
  theme: TierTheme
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-6 gap-1.5">
        {pets.slice(0, 12).map((p, i) => (
          <motion.div
            key={p.id}
            className={cn(
              'relative h-9 w-9 overflow-hidden rounded-xl ring-2',
              theme.chipRing,
              theme.chipBg,
            )}
            style={{
              boxShadow: `0 0 14px ${p.glow}`,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16, delay: i * 0.025 }}
            aria-label={p.emoji}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt={p.emoji}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* golden shimmer overlay */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-200/40 via-amber-100/10 to-transparent"
            />
            {/* breath halo on hover/active */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-amber-200/30 animate-breath"
            />
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-amber-200/80">+ Legendary drop</span>
        <span className="inline-flex items-center gap-1 text-amber-200">
          <span className="h-1 w-1 rounded-full bg-amber-300 animate-pulse" />
          {PRICING_PETS.length} total
        </span>
      </div>
    </div>
  )
}
