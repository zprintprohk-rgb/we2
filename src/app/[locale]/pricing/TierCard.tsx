'use client'

/**
 * TierCard — 单张定价卡（含宠物选择矩阵 + 倒计时插槽）
 *
 * Three visual identities — the "visual drop" the brief asks for:
 *   - free    : flat glass, gray ring, no glow, gray pet chips
 *   - plus    : pink-purple gradient border, neon glow on hover, "popular" badge
 *   - eternal : gold border, breath animation, golden pet chips, "exclusive" badge
 *
 * Behavior:
 *   - Hovering lifts the card (scale 1.02) and brightens the ring.
 *   - Internal pets "duck" (free) or "peek up" (plus) on hover.
 *   - Clicking the subscribe button fires a particle burst via the
 *     `onBurst(tier)` callback (parent owns the trigger counter).
 *
 * All copy is pre-translated strings passed in by the Server Component.
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sparkles, Lock, ChevronRight } from 'lucide-react'
import { PetMatrix } from './PetMatrix'
import { ParticleBurst } from './ParticleBurst'
import type { PricingTier } from './pet-data'

export interface TierCardData {
  tier: PricingTier
  /** Eyebrow above the tier name (e.g. "Seedling" / "Companion" / "Stardust") */
  eyebrow: string
  /** i18n tier name (e.g. "Free" / "Togthr Plus" / "Togthr Eternal") */
  name: string
  /** Marketing tagline */
  tagline: string
  /** Display price (e.g. "$0", "$5.49", "$39.99") — already formatted */
  price: string
  /** Sub-price text (e.g. "/mo", "/yr", "") */
  priceSub: string
  /** Original-price strikethrough (only for paid tiers w/ discount) */
  originalPrice?: string
  /** Discount percent label, e.g. "Save 38%" */
  saveLabel?: string
  /** Bullet list of features */
  features: string[]
  /** Pet matrix label & subtitle */
  petLabel: string
  petSub: string
  /** CTA button label */
  cta: string
  /** Badge text (e.g. "Most Popular", "New") — null to hide */
  badge: string | null
  /** Secondary text under the CTA */
  ctaHint?: string
  /** Checkout href (for non-free tiers) */
  checkoutHref?: string
}

interface TierCardProps extends TierCardData {
  /** Counter controlled by parent — bump to fire a burst on this card */
  burstTrigger: number
  /** Called when the user clicks the subscribe CTA */
  onBurst: (tier: PricingTier) => void
}

const TIER_BORDER = {
  free: 'border-white/10',
  plus: 'border-transparent',
  eternal: 'border-transparent',
} as const

const TIER_GLOW = {
  free: '',
  plus: 'hover:shadow-[0_0_60px_rgba(244,114,182,0.30)]',
  eternal: 'hover:shadow-[0_0_60px_rgba(251,191,36,0.40)]',
} as const

const TIER_HEADING = {
  free: 'text-zinc-100',
  plus: 'text-gradient-sweet',
  eternal: 'text-gradient-golden',
} as const

const TIER_NAME_COLOR = {
  free: 'text-zinc-400',
  plus: 'text-zinc-200',
  eternal: 'text-amber-200/90',
} as const

export function TierCard({
  tier,
  eyebrow,
  name,
  tagline,
  price,
  priceSub,
  originalPrice,
  saveLabel,
  features,
  petLabel,
  petSub,
  cta,
  badge,
  ctaHint,
  checkoutHref,
  burstTrigger,
  onBurst,
}: TierCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const prefersReduced = useReducedMotion()

  const handleCta = (e: React.MouseEvent) => {
    if (tier === 'free') return // free just navigates, no burst
    e.preventDefault()
    onBurst(tier)
    // Allow the burst to start, then navigate
    setTimeout(() => {
      if (checkoutHref) window.location.href = checkoutHref
    }, 350)
  }

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl',
        'glass-card-emph p-6 sm:p-7',
        'transition-all duration-300',
        TIER_BORDER[tier],
        TIER_GLOW[tier],
      )}
      style={
        tier === 'plus'
          ? {
              backgroundImage:
                'linear-gradient(#0E0820, #0E0820), linear-gradient(135deg, #7C3AED, #F472B6)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              border: '1.5px solid transparent',
            }
          : tier === 'eternal'
            ? {
                backgroundImage:
                  'linear-gradient(#100A18, #100A18), linear-gradient(135deg, #FBBF24, #F472B6, #7C3AED)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                border: '1.5px solid transparent',
              }
            : undefined
      }
    >
      {/* Eternal: extra breath ring */}
      {tier === 'eternal' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[2px] rounded-3xl"
          style={{
            background:
              'linear-gradient(135deg, rgba(251,191,36,0.6), rgba(244,114,182,0.4), rgba(124,58,237,0.4))',
            filter: 'blur(14px)',
            opacity: 0.55,
            animation: 'breath 3.5s ease-in-out infinite',
            zIndex: -1,
          }}
        />
      )}

      {/* Badge */}
      {badge && (
        <span
          className={cn(
            'absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md',
            tier === 'plus'
              ? 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500'
              : 'bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500',
          )}
        >
          {badge}
        </span>
      )}

      {/* Eyebrow + name */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.18em]',
            tier === 'free'
              ? 'bg-white/5 text-zinc-400'
              : tier === 'plus'
                ? 'bg-purple-300/15 text-purple-100'
                : 'bg-amber-300/15 text-amber-100',
          )}
        >
          {eyebrow}
        </span>
      </div>

      <h3
        className={cn(
          'mt-3 text-2xl font-bold tracking-tight sm:text-3xl',
          TIER_HEADING[tier],
        )}
      >
        {name}
      </h3>

      <p className={cn('mt-1 text-sm', TIER_NAME_COLOR[tier])}>{tagline}</p>

      {/* Price block */}
      <div className="mt-5 flex items-end gap-1.5">
        <span
          className={cn(
            'text-4xl font-extrabold tracking-tight sm:text-5xl',
            tier === 'free' ? 'text-zinc-100' : TIER_HEADING[tier],
          )}
        >
          {price}
        </span>
        {priceSub && (
          <span className="mb-1.5 text-sm text-zinc-400">{priceSub}</span>
        )}
      </div>

      {originalPrice && saveLabel && (
        <p className="mt-1 text-xs text-emerald-300/90">
          <span className="line-through text-zinc-500">{originalPrice}</span>{' '}
          <span className="font-semibold">{saveLabel}</span>
        </p>
      )}

      {/* Feature list */}
      <ul className="mt-5 space-y-2">
        {features.slice(0, 4).map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-zinc-300"
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px]',
                tier === 'eternal'
                  ? 'bg-amber-300/20 text-amber-200'
                  : tier === 'plus'
                    ? 'bg-purple-300/20 text-purple-100'
                    : 'bg-white/10 text-zinc-300',
              )}
            >
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* Pet matrix (fills remaining space) */}
      <div className="mt-6">
        <PetMatrix
          tier={tier}
          label={petLabel}
          sub={petSub}
          isHovered={isHovered}
        />
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={handleCta}
        className={cn(
          'mt-6 group/cta inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold transition-all',
          tier === 'free'
            ? 'border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10'
            : tier === 'plus'
              ? 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50'
              : 'bg-gradient-to-r from-amber-300 via-rose-400 to-purple-500 text-zinc-900 shadow-lg shadow-amber-400/40 hover:shadow-amber-400/60',
        )}
      >
        {tier === 'free' ? (
          <>
            <Lock className="h-4 w-4" />
            {cta}
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            {cta}
            <ChevronRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
          </>
        )}
      </button>

      {ctaHint && (
        <p className="mt-2 text-center text-[10px] uppercase tracking-wider text-zinc-500">
          {ctaHint}
        </p>
      )}

      {/* Particle burst on subscribe */}
      <ParticleBurst tier={tier} trigger={burstTrigger} />
    </motion.div>
  )
}
