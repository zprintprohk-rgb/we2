'use client'

/**
 * RelationModeSelector — 关系模式选择器（4 种关系：情侣/闺蜜/兄弟/自我）
 *
 * 战略来源：方案首页要求「关系模式选择器（底部横向滑动展示不同关系模式）」
 *
 * 用法：
 *   <RelationModeSelector
 *     value={mode}
 *     onChange={setMode}
 *   />
 *
 * 选中状态：
 * - 当前模式的卡片缩放 1.05
 * - 渐变描边显示
 * - 模式对应的宠物 sprite 预览
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { RELATION_MODES, type RelationMode, getRelationModeLabel } from '@/lib/design-tokens'
import type { Locale } from '@/i18n/routing'

interface Props {
  value: RelationMode
  onChange: (m: RelationMode) => void
  locale: Locale
  className?: string
  /** 显示文案（true=显示文字，false=只显示 emoji） */
  showLabel?: boolean
}

export function RelationModeSelector({
  value,
  onChange,
  locale,
  className,
  showLabel = true,
}: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto rounded-full glass-card p-1.5',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
        className,
      )}
      role="radiogroup"
      aria-label="Relation mode"
    >
      {RELATION_MODES.map((mode) => {
        const isActive = mode.id === value
        return (
          <motion.button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(mode.id)}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200',
            )}
            whileHover={isActive ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* 选中态背景渐变 */}
            {isActive && (
              <motion.span
                layoutId="relation-mode-active"
                className="absolute inset-0 rounded-full"
                style={{ background: mode.gradient }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span aria-hidden="true">{mode.emoji}</span>
              {showLabel && (
                <span className="relative z-10">{getRelationModeLabel(mode.id, locale)}</span>
              )}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
