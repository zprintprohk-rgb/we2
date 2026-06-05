/**
 * Togthr.life — Design Tokens (Fusion v2)
 *
 * TypeScript-side 配色/动画/关系模式常量。
 * Worker 应从这里导入，不要自己写魔法数字。
 * 同步镜像在 globals.css（CSS 变量）。
 */

import type { Locale } from '@/i18n/routing'

// ── 关系模式（4 种，对应 4 种情感场景） ─────────────────────────────────
export type RelationMode = 'couple' | 'bff' | 'bros' | 'self'

export interface RelationModeConfig {
  id: RelationMode
  emoji: string
  /** 中文/英文（其他 7 语言走 i18n） */
  labelZh: string
  labelEn: string
  /** 渐变色 — 用于按钮/卡片描边 */
  gradient: string
  /** 粒子主色 — 用于背景光晕 */
  arcColor: string
  /** 该模式下推荐的宠物 sprite 路径 */
  petSprite: string
}

export const RELATION_MODES: RelationModeConfig[] = [
  {
    id: 'couple',
    emoji: '💕',
    labelZh: '情侣',
    labelEn: 'Couple',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #F472B6 100%)',
    arcColor: 'rgba(244, 114, 182, 0.32)',
    petSprite: '/pets/expression-loveyou.png',
  },
  {
    id: 'bff',
    emoji: '👭',
    labelZh: '闺蜜',
    labelEn: 'Best Friends',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #FBBF24 100%)',
    arcColor: 'rgba(251, 191, 36, 0.28)',
    petSprite: '/pets/sticker-thumbsup.png',
  },
  {
    id: 'bros',
    emoji: '👬',
    labelZh: '兄弟',
    labelEn: 'Buddies',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #34D399 100%)',
    arcColor: 'rgba(96, 165, 250, 0.28)',
    petSprite: '/pets/sticker-fighting.png',
  },
  {
    id: 'self',
    emoji: '🧘',
    labelZh: '自我',
    labelEn: 'Self',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #2DD4BF 100%)',
    arcColor: 'rgba(45, 212, 191, 0.24)',
    petSprite: '/pets/expression-charging.png',
  },
]

// ── 情绪状态（5 种情感语义） ──────────────────────────────────────────
export type Mood = 'sweet' | 'fight' | 'calm' | 'sleepy' | 'think'

export interface MoodConfig {
  id: Mood
  /** 背景大弧光（CSS radial-gradient） */
  bgArc: string
  /** 粒子主色 */
  particleColor: string
  /** 该情绪下推荐的宠物 sprite（如果有） */
  petSprite?: string
  /** 气泡文字（中文/英文） */
  bubbleZh: string
  bubbleEn: string
}

export const MOODS: Record<Mood, MoodConfig> = {
  sweet: {
    id: 'sweet',
    bgArc:
      'radial-gradient(ellipse at top, rgba(244,114,182,0.42) 0%, rgba(244,114,182,0.10) 40%, transparent 70%)',
    particleColor: '#F472B6',
    petSprite: '/pets/sticker-loveyou.png',
    bubbleZh: '甜甜的~',
    bubbleEn: 'Sweet~',
  },
  fight: {
    id: 'fight',
    bgArc:
      'radial-gradient(ellipse at top, rgba(96,165,250,0.42) 0%, rgba(96,165,250,0.10) 40%, transparent 70%)',
    particleColor: '#60A5FA',
    petSprite: '/pets/expression-angry.png',
    bubbleZh: '哼... 不想说话',
    bubbleEn: 'Hmph... not talking',
  },
  calm: {
    id: 'calm',
    bgArc:
      'radial-gradient(ellipse at top, rgba(45,212,191,0.30) 0%, rgba(45,212,191,0.08) 40%, transparent 70%)',
    particleColor: '#2DD4BF',
    bubbleZh: '嗯... 在想...',
    bubbleEn: 'Hmm... thinking...',
  },
  sleepy: {
    id: 'sleepy',
    bgArc:
      'radial-gradient(ellipse at top, rgba(76,29,149,0.45) 0%, rgba(76,29,149,0.12) 40%, transparent 70%)',
    particleColor: '#A78BFA',
    petSprite: '/pets/expression-sleeping.png',
    bubbleZh: 'Zzz...',
    bubbleEn: 'Zzz...',
  },
  think: {
    id: 'think',
    bgArc:
      'radial-gradient(ellipse at top, rgba(168,85,247,0.30) 0%, rgba(168,85,247,0.08) 40%, transparent 70%)',
    particleColor: '#A855F7',
    bubbleZh: '嗯?',
    bubbleEn: 'Hmm?',
  },
}

// ── 宠物稀有度（4 级） ─────────────────────────────────────────────────
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export const RARITY_STYLES: Record<Rarity, {
  label: string
  border: string
  glow: string
  badge: string
}> = {
  common: {
    label: 'Common',
    border: '1px solid rgba(255,255,255,0.18)',
    glow: '0 0 0 transparent',
    badge: 'bg-zinc-500/20 text-zinc-200',
  },
  rare: {
    label: 'Rare',
    border: '1px solid #60A5FA',
    glow: '0 0 16px rgba(96,165,250,0.32)',
    badge: 'bg-blue-500/20 text-blue-200',
  },
  epic: {
    label: 'Epic',
    border: '1px solid #A855F7',
    glow: '0 0 20px rgba(168,85,247,0.42)',
    badge: 'bg-purple-500/20 text-purple-200',
  },
  legendary: {
    label: 'Legendary',
    border: '1px solid #FBBF24',
    glow: '0 0 24px rgba(251,191,36,0.55)',
    badge: 'bg-amber-500/30 text-amber-100',
  },
}

// ── 6 大宠物系列（完整分类 — 来自融合方案） ─────────────────────────
export type PetSeries =
  | 'basic'         // 基础免费 2-3 款
  | 'career'        // 职业系列 6 款
  | 'festival'      // 节日系列 8 款
  | 'emotion'       // 表情系列 10 款
  | 'fantasy'       // 奇幻系列 8 款
  | 'legendary'     // 限定盲盒 1 款 (1/72)

export const PET_SERIES: Record<PetSeries, {
  labelZh: string
  labelEn: string
  emoji: string
  /** 解锁层级：free=免费, plus=伴侣, eternal=永恒 */
  tier: 'free' | 'plus' | 'eternal'
}> = {
  basic:    { labelZh: '基础',   labelEn: 'Basic',     emoji: '🌱', tier: 'free' },
  career:   { labelZh: '职业',   labelEn: 'Career',    emoji: '👨‍💻', tier: 'plus' },
  festival: { labelZh: '节日',   labelEn: 'Festival',  emoji: '🎄', tier: 'plus' },
  emotion:  { labelZh: '表情',   labelEn: 'Emotion',   emoji: '😊', tier: 'plus' },
  fantasy:  { labelZh: '奇幻',   labelEn: 'Fantasy',   emoji: '🐉', tier: 'plus' },
  legendary:{ labelZh: '限定',   labelEn: 'Legendary', emoji: '✨', tier: 'eternal' },
}

// ── 情感粒子（5 种语义粒子 — Canvas 2D 用） ───────────────────────────
export type ParticleKind =
  | 'bubble'   // 上升气泡：用户交互触发
  | 'star'     // 闪烁星星：宠物心情愉悦
  | 'dust'     // 微光尘埃：深夜/安静时刻
  | 'ripple'   // 脉冲波纹：对方正在输入
  | 'shard'    // 破碎晶片：争吵/冷战

export interface ParticleConfig {
  kind: ParticleKind
  /** 颜色 */
  color: string
  /** 持续时间 (ms) */
  lifetime: number
  /** 初始速度 (px/s) */
  speed: number
  /** 大小 (px) */
  size: number
  /** 是否带拖尾 */
  trail: boolean
}

export const PARTICLES: Record<ParticleKind, ParticleConfig> = {
  bubble: { kind: 'bubble', color: '#F472B6', lifetime: 4500, speed: -36, size: 6,  trail: false },
  star:   { kind: 'star',   color: '#FBBF24', lifetime: 1800, speed: 0,   size: 4,  trail: true  },
  dust:   { kind: 'dust',   color: '#A78BFA', lifetime: 9000, speed: 14,  size: 2,  trail: true  },
  ripple: { kind: 'ripple', color: '#60A5FA', lifetime: 1600, speed: 0,   size: 8,  trail: false },
  shard:  { kind: 'shard',  color: '#94A3B8', lifetime: 3200, speed: 28,  size: 5,  trail: false },
}

// ── 时间感知（深夜模式判断） ─────────────────────────────────────────
export function isNightMode(date: Date = new Date()): boolean {
  const h = date.getHours()
  return h >= 22 || h < 6
}

// ── 关系模式（按 locale 拿 label） ───────────────────────────────────
export function getRelationModeLabel(mode: RelationMode, locale: Locale): string {
  const isChinese = locale === 'zh-cn' || locale === 'zh-tw'
  return isChinese
    ? RELATION_MODES.find((m) => m.id === mode)!.labelZh
    : RELATION_MODES.find((m) => m.id === mode)!.labelEn
}

// ── 配色（5 种情绪色） ──────────────────────────────────────────────
export const MOOD_HEX: Record<Mood, string> = {
  sweet:  '#F472B6',
  fight:  '#60A5FA',
  calm:   '#2DD4BF',
  sleepy: '#A78BFA',
  think:  '#A855F7',
}
