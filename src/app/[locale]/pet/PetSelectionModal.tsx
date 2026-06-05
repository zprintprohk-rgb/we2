'use client'

/**
 * PetSelectionModal — 全屏召唤阵
 *
 * 战略：选择宠物是「召唤灵魂伴侣」的仪式，不是换皮肤。
 *
 * 布局：
 * - 黑色半透明遮罩（不透明 80%）
 * - 顶部 6 Tab 分类（basic/career/festival/emotion/fantasy/legendary）
 * - 中央 4 列 Grid（移动端 2 列）
 * - 召唤仪式：点击已解锁 → 宠物"跃出"（缩放+光效）+ 全屏预览 3 秒
 * - 点击未解锁 → 显示"解锁条件"
 *
 * 文件边界：src/app/[locale]/pet/**
 */

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Sparkles, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { PET_SERIES, RARITY_STYLES, type PetSeries } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { PetCard } from './PetCard'
import type { Pet } from './pet-data'
import { PETS } from './pet-data'

interface Props {
  open: boolean
  onClose: () => void
  currentPetId: string
  onConfirm: (pet: Pet) => void
}

const SERIES_ORDER: PetSeries[] = [
  'basic',
  'career',
  'festival',
  'emotion',
  'fantasy',
  'legendary',
]

export function PetSelectionModal({ open, onClose, currentPetId, onConfirm }: Props) {
  const t = useTranslations('pet.altar')
  const tSeries = useTranslations('pet.series')
  const tRarity = useTranslations('pet.rarity')
  const tSeriesTier = useTranslations('pet.tier')
  const locale = useLocale()

  const [activeTab, setActiveTab] = useState<PetSeries>('basic')
  /** 当前选中的宠物（在 modal 中"预览"） */
  const [previewId, setPreviewId] = useState<string | null>(null)
  /** 召唤仪式进行中（用于触发"跃出"动画） */
  const [summoning, setSummoning] = useState<Pet | null>(null)

  /** 当前 Tab 下过滤的宠物 */
  const filtered = useMemo(
    () => PETS.filter((p) => p.series === activeTab),
    [activeTab],
  )

  const previewPet = useMemo(
    () => PETS.find((p) => p.id === previewId) ?? null,
    [previewId],
  )

  /** ESC 关闭 */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  /** 打开时锁定 body 滚动 */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  /** 召唤仪式：点击已解锁宠物 → 跃出动画 3 秒 → onConfirm */
  const handleSummon = (pet: Pet) => {
    if (!pet.unlocked) return
    setSummoning(pet)
    setTimeout(() => {
      onConfirm(pet)
      setSummoning(null)
      onClose()
    }, 1800)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="altar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t('title')}
        >
          {/* ── 召唤阵光效背景 ── */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-amber-500/10 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-500/8 to-pink-500/8 blur-3xl animate-arc-drift" />
          </div>

          {/* ── 召唤仪式跃出动画 ── */}
          <AnimatePresence>
            {summoning && (
              <motion.div
                key="summon-burst"
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* 金色光柱 */}
                <motion.div
                  className="absolute h-[110vh] w-[110vh] rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(244,114,182,0.18) 35%, transparent 65%)',
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <motion.div
                  className="relative h-64 w-64"
                  initial={{ scale: 0, y: 200, opacity: 0 }}
                  animate={{ scale: 1.4, y: 0, opacity: 1 }}
                  exit={{ scale: 2, y: -100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 16 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={summoning.animation.idle}
                    alt={summoning.name}
                    className="h-full w-full object-contain drop-shadow-[0_0_40px_rgba(251,191,36,0.7)]"
                  />
                </motion.div>
                <motion.p
                  className="absolute bottom-[20%] text-2xl font-semibold text-amber-100 drop-shadow-[0_0_18px_rgba(251,191,36,0.8)]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {summoning.name} {t('summoned')}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── 顶部栏：返回 + 标题 + 关闭 ── */}
          <div
            className="relative z-20 flex items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-4 py-4 sm:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 rounded-full glass-card-emph px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-white/10"
              aria-label={t('back')}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('back')}</span>
            </button>
            <h2 className="text-center text-lg font-semibold text-zinc-100 sm:text-2xl">
              <Sparkles className="mr-2 inline h-5 w-5 text-amber-300" aria-hidden="true" />
              {t('title')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full glass-card-emph text-zinc-200 transition-colors hover:bg-white/10"
              aria-label={t('close')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* ── 6 Tab 分类（横向滚动） ── */}
          <div
            className="relative z-20 border-b border-white/10 bg-black/20 px-4 sm:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {SERIES_ORDER.map((s) => {
                const cfg = PET_SERIES[s]
                const isActive = activeTab === s
                const count = PETS.filter((p) => p.series === s).length
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveTab(s)}
                    className={cn(
                      'relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-amber-400/30 via-rose-400/25 to-purple-400/30 text-zinc-50 shadow-lg ring-1 ring-amber-300/40'
                        : 'glass-card-emph text-zinc-300 hover:bg-white/10',
                    )}
                  >
                    <span aria-hidden="true">{cfg.emoji}</span>
                    <span>{tSeries(s)}</span>
                    <span className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                      isActive ? 'bg-amber-400/40 text-amber-50' : 'bg-white/10 text-zinc-400',
                    )}>
                      {count}
                    </span>
                    {isActive && (
                      <motion.span
                        layoutId="altar-tab-underline"
                        className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-amber-300"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── 主内容：4 列 Grid（移动 2 列） ── */}
          <div
            className="relative z-10 flex-1 overflow-y-auto px-4 py-6 sm:px-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-6xl">
              <p className="mb-4 text-center text-xs text-zinc-400 sm:text-sm">
                {t('hint')}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
                {filtered.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    isSelected={pet.id === previewId}
                    onClick={() => {
                      if (pet.unlocked) setPreviewId(pet.id)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── 底部：当前选中宠物预览 + 确认按钮 ── */}
          <AnimatePresence>
            {previewPet && (
              <motion.div
                key="preview-bar"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className="relative z-20 border-t border-white/10 bg-black/55 px-4 py-4 backdrop-blur-md sm:px-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mx-auto flex max-w-6xl items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl glass-card-emph">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewPet.animation.idle}
                      alt={previewPet.name}
                      className="h-14 w-14 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-zinc-100 sm:text-lg">
                        {previewPet.name}
                      </h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', RARITY_STYLES[previewPet.rarity].badge)}>
                        {tRarity(previewPet.rarity)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 sm:text-sm">
                      {PET_SERIES[previewPet.series].emoji}{' '}
                      {tSeries(previewPet.series)} ·{' '}
                      {tSeriesTier(PET_SERIES[previewPet.series].tier)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSummon(previewPet)}
                    disabled={!previewPet.unlocked || previewPet.id === currentPetId}
                    className={cn(
                      'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all sm:px-6 sm:text-base',
                      previewPet.unlocked && previewPet.id !== currentPetId
                        ? 'bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 text-zinc-950 shadow-lg hover:scale-105'
                        : 'cursor-not-allowed bg-white/10 text-zinc-500',
                    )}
                  >
                    {previewPet.id === currentPetId ? t('current') : t('summon')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
