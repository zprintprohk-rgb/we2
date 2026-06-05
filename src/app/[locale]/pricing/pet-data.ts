/**
 * Pricing — Pet Data (Fusion v2)
 *
 * Maps the 6 pet series from `design-tokens.PET_SERIES` to the actual
 * IP assets shipped under `public/pets/`. Worker-pricing is the sole
 * owner of this file — it is intentionally scoped to the pricing
 * directory and is not part of the shared design system.
 *
 * Each entry has:
 *   - id:        stable identifier (used as React key)
 *   - src:       public asset path
 *   - emoji:     fallback glyph for the legend (and alt text on load failure)
 *   - series:    one of PET_SERIES (basic | career | festival | emotion | fantasy | legendary)
 *   - tier:      gating tier (free | plus | eternal)
 *   - glow:      color used for the neon ring (Plus / Eternal)
 *   - nameKey:   i18n key under `pricing.petNames.*`
 *   - descKey:   i18n key under `pricing.petDesc.*`
 */

import type { PetSeries } from '@/lib/design-tokens'

export type PricingTier = 'free' | 'plus' | 'eternal'

export interface PricingPet {
  id: string
  src: string
  emoji: string
  series: PetSeries
  tier: PricingTier
  /** neon glow color (for Plus/Eternal cards) */
  glow: string
  /** i18n key for the pet's display name */
  nameKey: string
  /** i18n key for the pet's short description */
  descKey: string
}

/**
 * 3 basic pets (free tier) — plain, gray by default, no glow.
 */
const BASIC_PETS: PricingPet[] = [
  {
    id: 'robot-base',
    src: '/pets/robot-base.png',
    emoji: '🤖',
    series: 'basic',
    tier: 'free',
    glow: 'rgba(255,255,255,0.0)',
    nameKey: 'petNames.robot',
    descKey: 'petDesc.defaultCompanion',
  },
  {
    id: 'character-sheet',
    src: '/pets/character-sheet.png',
    emoji: '🟣',
    series: 'basic',
    tier: 'free',
    glow: 'rgba(255,255,255,0.0)',
    nameKey: 'petNames.dumpling',
    descKey: 'petDesc.softMochi',
  },
  {
    id: 'golden-base',
    src: '/pets/golden.png',
    emoji: '✨',
    series: 'basic',
    tier: 'free',
    glow: 'rgba(255,255,255,0.0)',
    nameKey: 'petNames.starSprite',
    descKey: 'petDesc.stardust',
  },
]

/**
 * 6 career pets (Plus tier) — neon cyan glow.
 */
const CAREER_PETS: PricingPet[] = [
  { id: 'programmer', src: '/pets/programmer.png', emoji: '👨‍💻', series: 'career',   tier: 'plus', glow: 'rgba(96, 165, 250, 0.6)',  nameKey: 'petNames.programmer', descKey: 'petDesc.coder' },
  { id: 'doctor',     src: '/pets/doctor.png',     emoji: '👩‍⚕️', series: 'career',   tier: 'plus', glow: 'rgba(244, 114, 182, 0.6)', nameKey: 'petNames.doctor',     descKey: 'petDesc.healer' },
  { id: 'astronaut',  src: '/pets/astronaut.png',  emoji: '👨‍🚀', series: 'career',   tier: 'plus', glow: 'rgba(168, 139, 250, 0.6)', nameKey: 'petNames.astronaut',  descKey: 'petDesc.stargazer' },
  { id: 'chef',       src: '/pets/chef.png',       emoji: '👩‍🍳', series: 'career',   tier: 'plus', glow: 'rgba(251, 191, 36, 0.6)',  nameKey: 'petNames.chef',       descKey: 'petDesc.culinary' },
  { id: 'firefighter',src: '/pets/firefighter.png',emoji: '👨‍🚒', series: 'career',   tier: 'plus', glow: 'rgba(248, 113, 113, 0.6)', nameKey: 'petNames.firefighter',descKey: 'petDesc.braveheart' },
  { id: 'police',     src: '/pets/police.png',     emoji: '👮',   series: 'career',   tier: 'plus', glow: 'rgba(59, 130, 246, 0.6)',  nameKey: 'petNames.police',     descKey: 'petDesc.guardian' },
]

/**
 * Festival pets (Plus tier) — pink/red seasonal glow.
 * 27 entries = 3 legacy (christmas/valentine/halloween) + 24 new (v3 fusion).
 * Festival glow color rotates by sub-family to make the matrix visually layered.
 */
const FESTIVAL_PETS: PricingPet[] = [
  // Legacy 3 (christmas / valentine / halloween)
  { id: 'holiday-christmas', src: '/pets/holiday-christmas.png', emoji: '🎄', series: 'festival', tier: 'plus', glow: 'rgba(239, 68, 68, 0.6)',  nameKey: 'petNames.christmas', descKey: 'petDesc.winter' },
  { id: 'holiday-valentine', src: '/pets/holiday-valentine.png', emoji: '💝', series: 'festival', tier: 'plus', glow: 'rgba(244, 114, 182, 0.6)', nameKey: 'petNames.valentine', descKey: 'petDesc.romance' },
  { id: 'holiday-halloween', src: '/pets/holiday-halloween.png', emoji: '🎃', series: 'festival', tier: 'plus', glow: 'rgba(251, 146, 60, 0.6)',  nameKey: 'petNames.halloween', descKey: 'petDesc.spooky' },
  // v3 24 new — common (8) — soft warm glow
  { id: 'holiday-newyear',    src: '/pets/holiday-newyear.png',    emoji: '🎊', series: 'festival', tier: 'plus', glow: 'rgba(251, 191, 36, 0.6)',  nameKey: 'petNames.newyear',    descKey: 'petDesc.springFestival' },
  { id: 'holiday-easter',     src: '/pets/holiday-easter.png',     emoji: '🐣', series: 'festival', tier: 'plus', glow: 'rgba(244, 114, 182, 0.55)', nameKey: 'petNames.easter',     descKey: 'petDesc.springBloom' },
  { id: 'holiday-mothersday', src: '/pets/holiday-mothersday.png', emoji: '💐', series: 'festival', tier: 'plus', glow: 'rgba(236, 72, 153, 0.6)',  nameKey: 'petNames.mothersday', descKey: 'petDesc.motherLove' },
  { id: 'holiday-fathersday', src: '/pets/holiday-fathersday.png', emoji: '👔', series: 'festival', tier: 'plus', glow: 'rgba(59, 130, 246, 0.6)',  nameKey: 'petNames.fathersday', descKey: 'petDesc.fatherLove' },
  { id: 'holiday-birthday',   src: '/pets/holiday-birthday.png',   emoji: '🎂', series: 'festival', tier: 'plus', glow: 'rgba(251, 146, 60, 0.6)',  nameKey: 'petNames.birthday',   descKey: 'petDesc.celebrate' },
  { id: 'holiday-anniversary',src: '/pets/holiday-anniversary.png',emoji: '💍', series: 'festival', tier: 'plus', glow: 'rgba(244, 114, 182, 0.6)',  nameKey: 'petNames.anniversary',descKey: 'petDesc.forever' },
  { id: 'holiday-qixi',       src: '/pets/holiday-qixi.png',       emoji: '🌌', series: 'festival', tier: 'plus', glow: 'rgba(167, 139, 250, 0.6)', nameKey: 'petNames.qixi',       descKey: 'petDesc.starCrossed' },
  { id: 'holiday-arborday',   src: '/pets/holiday-arborday.png',   emoji: '🌳', series: 'festival', tier: 'plus', glow: 'rgba(34, 197, 94, 0.6)',   nameKey: 'petNames.arborday',   descKey: 'petDesc.greenEarth' },
  // v3 24 new — rare (8) — cooler deeper glow
  { id: 'holiday-thanksgiving',src: '/pets/holiday-thanksgiving.png',emoji: '🦃', series: 'festival', tier: 'plus', glow: 'rgba(217, 119, 6, 0.6)',   nameKey: 'petNames.thanksgiving',descKey: 'petDesc.gratitude' },
  { id: 'holiday-chongyang',   src: '/pets/holiday-chongyang.png',   emoji: '🍂', series: 'festival', tier: 'plus', glow: 'rgba(234, 88, 12, 0.6)',   nameKey: 'petNames.chongyang',   descKey: 'petDesc.elderRespect' },
  { id: 'holiday-graduation',  src: '/pets/holiday-graduation.png',  emoji: '🎓', series: 'festival', tier: 'plus', glow: 'rgba(99, 102, 241, 0.6)',  nameKey: 'petNames.graduation',  descKey: 'petDesc.newChapter' },
  { id: 'holiday-wedding',     src: '/pets/holiday-wedding.png',     emoji: '👰', series: 'festival', tier: 'plus', glow: 'rgba(244, 114, 182, 0.65)',nameKey: 'petNames.wedding',     descKey: 'petDesc.soulMate' },
  { id: 'holiday-babyshower',  src: '/pets/holiday-babyshower.png',  emoji: '🍼', series: 'festival', tier: 'plus', glow: 'rgba(251, 191, 36, 0.55)', nameKey: 'petNames.babyshower',  descKey: 'petDesc.newLife' },
  { id: 'holiday-earthday',    src: '/pets/holiday-earthday.png',    emoji: '🌍', series: 'festival', tier: 'plus', glow: 'rgba(34, 197, 94, 0.6)',   nameKey: 'petNames.earthday',    descKey: 'petDesc.planet' },
  { id: 'holiday-environment', src: '/pets/holiday-environment.png', emoji: '♻️', series: 'festival', tier: 'plus', glow: 'rgba(16, 185, 129, 0.6)',  nameKey: 'petNames.environment', descKey: 'petDesc.sustainability' },
  { id: 'holiday-diwali',      src: '/pets/holiday-diwali.png',      emoji: '🪔', series: 'festival', tier: 'plus', glow: 'rgba(251, 146, 60, 0.6)',  nameKey: 'petNames.diwali',      descKey: 'petDesc.lights' },
  // v3 24 new — epic (8) — bright neon glow
  { id: 'holiday-blackfriday', src: '/pets/holiday-blackfriday.png', emoji: '🛍️', series: 'festival', tier: 'plus', glow: 'rgba(0, 0, 0, 0.55)',       nameKey: 'petNames.blackfriday', descKey: 'petDesc.deals' },
  { id: 'holiday-cybermonday', src: '/pets/holiday-cybermonday.png', emoji: '💻', series: 'festival', tier: 'plus', glow: 'rgba(96, 165, 250, 0.6)',  nameKey: 'petNames.cybermonday', descKey: 'petDesc.digitalDeals' },
  { id: 'holiday-dragonboat',  src: '/pets/holiday-dragonboat.png',  emoji: '🐲', series: 'festival', tier: 'plus', glow: 'rgba(239, 68, 68, 0.6)',   nameKey: 'petNames.dragonboat',  descKey: 'petDesc.dragonRush' },
  { id: 'holiday-lantern',     src: '/pets/holiday-lantern.png',     emoji: '🏮', series: 'festival', tier: 'plus', glow: 'rgba(251, 191, 36, 0.6)',  nameKey: 'petNames.lantern',     descKey: 'petDesc.lanternGlow' },
  { id: 'holiday-qingming',    src: '/pets/holiday-qingming.png',    emoji: '🌿', series: 'festival', tier: 'plus', glow: 'rgba(34, 197, 94, 0.55)',  nameKey: 'petNames.qingming',    descKey: 'petDesc.springBreeze' },
  { id: 'holiday-aprilfool',   src: '/pets/holiday-aprilfool.png',   emoji: '🤡', series: 'festival', tier: 'plus', glow: 'rgba(168, 85, 247, 0.6)',  nameKey: 'petNames.aprilfool',   descKey: 'petDesc.prank' },
  { id: 'holiday-pride',       src: '/pets/holiday-pride.png',       emoji: '🏳️‍🌈', series: 'festival', tier: 'plus', glow: 'rgba(244, 114, 182, 0.7)',  nameKey: 'petNames.pride',       descKey: 'petDesc.prideRainbow' },
  { id: 'holiday-carnival',    src: '/pets/holiday-carnival.png',    emoji: '🎭', series: 'festival', tier: 'plus', glow: 'rgba(251, 191, 36, 0.65)', nameKey: 'petNames.carnival',    descKey: 'petDesc.celebration' },
]

/**
 * Expression / emotion pets (Plus tier) — purple/pink mood glow.
 */
const EMOTION_PETS: PricingPet[] = [
  { id: 'expression-happy',   src: '/pets/expression-happy.png',   emoji: '😊', series: 'emotion', tier: 'plus', glow: 'rgba(251, 191, 36, 0.55)', nameKey: 'petNames.happy',     descKey: 'petDesc.joyful' },
  { id: 'expression-angry',   src: '/pets/expression-angry.png',   emoji: '😠', series: 'emotion', tier: 'plus', glow: 'rgba(239, 68, 68, 0.55)',  nameKey: 'petNames.angry',     descKey: 'petDesc.fire' },
  { id: 'expression-sleeping',src: '/pets/expression-sleeping.png',emoji: '😴', series: 'emotion', tier: 'plus', glow: 'rgba(167, 139, 250, 0.6)', nameKey: 'petNames.sleepy',    descKey: 'petDesc.dreamer' },
  { id: 'expression-charging',src: '/pets/expression-charging.png',emoji: '🔋', series: 'emotion', tier: 'plus', glow: 'rgba(45, 212, 191, 0.6)',  nameKey: 'petNames.charging',  descKey: 'petDesc.energized' },
  { id: 'sticker-loveyou',    src: '/pets/sticker-loveyou.png',    emoji: '😍', series: 'emotion', tier: 'plus', glow: 'rgba(244, 114, 182, 0.65)',nameKey: 'petNames.loveyou',   descKey: 'petDesc.tender' },
  { id: 'sticker-crying',     src: '/pets/sticker-crying.png',     emoji: '😭', series: 'emotion', tier: 'plus', glow: 'rgba(96, 165, 250, 0.55)', nameKey: 'petNames.crying',    descKey: 'petDesc.sensitive' },
  { id: 'sticker-fighting',   src: '/pets/sticker-fighting.png',   emoji: '💪', series: 'emotion', tier: 'plus', glow: 'rgba(251, 146, 60, 0.6)',  nameKey: 'petNames.fighting',  descKey: 'petDesc.brave' },
]

/**
 * Fantasy / misc pets (Plus tier) — magical cyan/violet glow.
 */
const FANTASY_PETS: PricingPet[] = [
  { id: 'sticker-shy',       src: '/pets/sticker-shy.png',       emoji: '🥺', series: 'fantasy', tier: 'plus', glow: 'rgba(244, 114, 182, 0.5)', nameKey: 'petNames.shy',     descKey: 'petDesc.timid' },
  { id: 'sticker-surprised', src: '/pets/sticker-surprised.png', emoji: '😲', series: 'fantasy', tier: 'plus', glow: 'rgba(167, 139, 250, 0.6)', nameKey: 'petNames.surprised',descKey: 'petDesc.amazed' },
  { id: 'sticker-sleepy',    src: '/pets/sticker-sleepy.png',    emoji: '😪', series: 'fantasy', tier: 'plus', glow: 'rgba(76, 29, 149, 0.6)',   nameKey: 'petNames.drowsy',  descKey: 'petDesc.calm' },
  { id: 'sticker-wink',      src: '/pets/sticker-wink.png',      emoji: '😉', series: 'fantasy', tier: 'plus', glow: 'rgba(251, 191, 36, 0.55)', nameKey: 'petNames.wink',    descKey: 'petDesc.mischief' },
  { id: 'sticker-thumbsup',  src: '/pets/sticker-thumbsup.png',  emoji: '👍', series: 'fantasy', tier: 'plus', glow: 'rgba(45, 212, 191, 0.6)',  nameKey: 'petNames.thumbsup',descKey: 'petDesc.support' },
]

/**
 * Legendary pets (Eternal only) — golden glow.
 */
const LEGENDARY_PETS: PricingPet[] = [
  { id: 'hero-golden', src: '/pets/hero-golden.png', emoji: '🌟', series: 'legendary', tier: 'eternal', glow: 'rgba(251, 191, 36, 0.85)', nameKey: 'petNames.heroGolden', descKey: 'petDesc.legendary' },
]

/** All pets in series order. */
export const PRICING_PETS: PricingPet[] = [
  ...BASIC_PETS,
  ...CAREER_PETS,
  ...FESTIVAL_PETS,
  ...EMOTION_PETS,
  ...FANTASY_PETS,
  ...LEGENDARY_PETS,
]

/** Pick pets whose tier is at or below the requested gate. */
export function pickPetsForTier(tier: PricingTier): PricingPet[] {
  if (tier === 'free') return BASIC_PETS
  if (tier === 'plus') {
    return [
      ...BASIC_PETS,
      ...CAREER_PETS,
      ...FESTIVAL_PETS,
      ...EMOTION_PETS,
      ...FANTASY_PETS,
    ]
  }
  return PRICING_PETS // eternal = everything
}

/** Human-readable series label (English). Localized in component via i18n. */
export const SERIES_ORDER: PetSeries[] = [
  'basic',
  'career',
  'festival',
  'emotion',
  'fantasy',
  'legendary',
]
