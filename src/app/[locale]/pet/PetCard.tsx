'use client'

/**
 * PetCard — 召唤阵单卡
 *
 * 4 稀有度光效（来自 design-tokens RARITY_STYLES）：
 * - common:   白光边框
 * - rare:     蓝光 + 微光
 * - epic:     紫光 + 拖尾
 * - legendary: 金光 + 呼吸动画 + 星星环绕
 *
 * 状态：
 * - 当前使用：金色心跳 box-shadow
 * - 已解锁：彩色 + 弹性 hover
 * - 未解锁：灰度 + 🔒 + hover 显示获取方式
 *
 * 文件边界：src/app/[locale]/pet/**
 */

import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RARITY_STYLES, type Rarity } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import type { Pet } from './pet-data'

interface Props {
  pet: Pet
  isSelected: boolean
  onClick: () => void
}

export function PetCard({ pet, isSelected, onClick }: Props) {
  const t = useTranslations('pet.card')
  const r = RARITY_STYLES[pet.rarity]

  /** 4 稀有度 → Tailwind className 映射（保持简单，inline style 处理颜色） */
  const ringClass = getRarityRingClass(pet.rarity)
  const glowClass = getRarityGlowClass(pet.rarity)
  const animate = getRarityAnimation(pet.rarity)

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={pet.unlocked ? { scale: 1.05, y: -4 } : { scale: 1.02 }}
      whileTap={pet.unlocked ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-2xl border-2 text-left',
        'glass-card-emph p-2 transition-colors',
        // 当前使用：金色心跳光效
        isSelected && pet.unlocked && 'animate-pulse-glow',
        // 灰度
        !pet.unlocked && 'grayscale',
      )}
      style={{
        borderColor: pet.unlocked
          ? isSelected
            ? '#FBBF24' // 当前使用：金色边框
            : getRarityBorderColor(pet.rarity)
          : 'rgba(255,255,255,0.10)',
        boxShadow: pet.unlocked ? r.glow : 'none',
      }}
      aria-label={`${pet.name} (${pet.rarity})`}
    >
      {/* ── 稀有度光效层（按稀有度叠加） ── */}
      {pet.unlocked && (
        <>
          {/* rare: 蓝光微光 */}
          {pet.rarity === 'rare' && (
            <span className="pointer-events-none absolute inset-0 rounded-2xl bg-blue-400/8 mix-blend-screen" />
          )}
          {/* epic: 紫光拖尾（多层渐变 + blur） */}
          {pet.rarity === 'epic' && (
            <>
              <span className="pointer-events-none absolute -inset-2 rounded-3xl bg-purple-500/20 blur-xl" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/15 via-fuchsia-400/10 to-purple-500/15" />
            </>
          )}
          {/* legendary: 金光 + 呼吸 + 星星环绕 */}
          {pet.rarity === 'legendary' && (
            <>
              <span className="pointer-events-none absolute -inset-3 rounded-3xl bg-amber-400/25 blur-2xl animate-breath" />
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-300/20 via-rose-300/15 to-amber-200/20 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              <LegendaryStars />
            </>
          )}
        </>
      )}

      {/* ── 锁定遮罩 ── */}
      {!pet.unlocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/55 backdrop-blur-[2px]">
          <Lock className="h-6 w-6 text-zinc-300" aria-hidden="true" />
          <span className="px-2 text-center text-[10px] leading-tight text-zinc-200 line-clamp-2">
            {pet.unlockHint}
          </span>
        </div>
      )}

      {/* ── 宠物 sprite ── */}
      <div className="relative z-0 flex h-full w-full items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pet.animation.idle}
          alt={pet.name}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>

      {/* ── 名称 + 稀有度徽章 ── */}
      <div className="absolute bottom-1 left-1 right-1 z-20 flex items-center justify-between gap-1 rounded-lg bg-black/55 px-1.5 py-1 backdrop-blur-sm">
        <span className="truncate text-[11px] font-medium text-zinc-100">{pet.name}</span>
        <span
          className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase', r.badge)}
          style={animate}
        >
          {pet.rarity}
        </span>
      </div>

      {/* ── 当前使用角标 ── */}
      {isSelected && pet.unlocked && (
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute right-1 top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-lg"
          aria-label={t('current')}
        >
          <Sparkles className="h-3 w-3" aria-hidden="true" />
        </motion.div>
      )}
    </motion.button>
  )
}

/** 4 稀有度边框颜色（普通 / 蓝光 / 紫光 / 金光） */
function getRarityBorderColor(rarity: Rarity): string {
  switch (rarity) {
    case 'common':
      return 'rgba(255,255,255,0.40)' // 白光边框
    case 'rare':
      return '#60A5FA' // 蓝光
    case 'epic':
      return '#A855F7' // 紫光
    case 'legendary':
      return '#FBBF24' // 金光
  }
}

function getRarityRingClass(rarity: Rarity): string {
  return '' // 实际颜色用 inline style
}

function getRarityGlowClass(rarity: Rarity): string {
  return ''
}

function getRarityAnimation(_rarity: Rarity): React.CSSProperties {
  return {}
}

/** legendary 卡片四周的星星环绕 */
function LegendaryStars() {
  const stars = [
    { top: '8%', left: '15%', delay: 0 },
    { top: '12%', right: '10%', delay: 0.4 },
    { top: '50%', left: '4%', delay: 0.8 },
    { top: '50%', right: '4%', delay: 1.2 },
    { bottom: '20%', left: '20%', delay: 1.6 },
    { bottom: '12%', right: '18%', delay: 2.0 },
  ]
  return (
    <>
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-amber-200"
          style={{ ...s, position: 'absolute' }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.4, 1, 0.4],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
          aria-hidden="true"
        >
          ✦
        </motion.span>
      ))}
    </>
  )
}
