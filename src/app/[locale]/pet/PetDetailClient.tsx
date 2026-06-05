'use client'

/**
 * /pet — Virtual Pet → 灵魂伴侣情感中枢 (Fusion v2)
 *
 * 战略：选择宠物是"召唤灵魂伴侣"的仪式。宠物不是皮肤，是"另一个TA"。
 *
 * 核心交互：
 * - 中央 300x300 PetCapsule xl 主展示（保留 4 心情切换：甜蜜/吵架/思考/睡觉）
 * - 心情切换触发 EmotionParticles 爆发：sweet→star / fight→shard / think→ripple / sleep→dust
 * - "更换外观" → 全屏召唤阵 PetSelectionModal
 * - 4 稀有度光效（来自 design-tokens RARITY_STYLES）
 * - 未解锁：灰度 + 🔒
 * - 召唤仪式：跃出动画 + 全屏预览 3 秒
 * - 抚摸交互：鼠标在主展示宠物上移动 → 眯眼 + 蹭手（sprite 切换为 expression-happy）
 *
 * 文件边界：src/app/[locale]/pet/**
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Heart, Lock, MessageCircle, Share2, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { EmotionParticles } from '@/components/shared/EmotionParticles'
import { PetCapsule } from '@/components/shared/PetCapsule'
import { MOODS, RARITY_STYLES, type Mood, type ParticleKind } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { PetSelectionModal } from './PetSelectionModal'
import type { Pet } from './pet-data'
import { PETS } from './pet-data'

/** 4 心情 → 粒子种类映射（方案要求） */
const MOOD_PARTICLES: Record<Mood, ParticleKind[]> = {
  sweet: ['star', 'bubble'], // 甜蜜 → 星星 + 气泡
  fight: ['shard'], // 吵架 → 碎裂晶片
  calm: ['ripple'], // calm → 脉冲波纹（保留共享 MOODS 兼容）
  think: ['ripple'], // 思考 → 脉冲波纹
  sleepy: ['dust'], // 睡觉 → 微光尘埃
}

/** 4 心情按钮配置（保留与原 page.tsx 视觉一致） */
const MOOD_BUTTONS: { id: Mood; icon: string; key: 'sweet' | 'fight' | 'think' | 'sleep'; label: string }[] = [
  { id: 'sweet',  icon: '💕', key: 'sweet',  label: 'Sweet' },
  { id: 'fight',  icon: '😤', key: 'fight',  label: 'Fight' },
  { id: 'think',  icon: '🤔', key: 'think',  label: 'Think' },
  { id: 'sleepy', icon: '😴', key: 'sleep',  label: 'Sleep' },
]

export default function PetDetailClient() {
  const t = useTranslations('pet')

  // ── State ──
  const [mood, setMood] = useState<Mood>('sweet')
  const [pet, setPet] = useState<Pet>(PETS.find((p) => p.current) ?? PETS[0])
  const [altarOpen, setAltarOpen] = useState(false)
  /** 鼠标在主展示宠物上移动时切换为 expression-happy（眯眼+蹭手） */
  const [petting, setPetting] = useState(false)
  const [pettingTrail, setPettingTrail] = useState<{ x: number; y: number; key: number }[]>([])

  const stageRef = useRef<HTMLDivElement>(null)
  const petRef = useRef<HTMLDivElement>(null)
  const lastTrailTs = useRef(0)

  // ── Computed ──
  const moodCfg = MOODS[mood]
  const particleKinds = useMemo(() => MOOD_PARTICLES[mood], [mood])

  // ── 当前宠物 sprite：根据心情 + 是否抚摸切换 ──
  const currentSprite = useMemo(() => {
    if (petting) return '/pets/expression-happy.png' // 眯眼 + 蹭手
    if (mood === 'sleepy') return pet.animation.idle
    if (mood === 'fight') return pet.animation.angry
    if (mood === 'sweet') return pet.animation.happy
    return pet.animation.idle
  }, [mood, pet, petting])

  /** 主展示鼠标移动：触发抚摸反馈 + 留心形拖尾 */
  const handleStageMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = stageRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      // 切换为 happy 表情
      if (!petting) setPetting(true)
      // 心形拖尾（限制频率）
      const now = performance.now()
      if (now - lastTrailTs.current > 80) {
        lastTrailTs.current = now
        setPettingTrail((prev) => {
          const next = [...prev, { x, y, key: now }]
          return next.slice(-6) // 最多 6 个
        })
      }
    },
    [petting],
  )

  /** 鼠标离开主展示 → 恢复 */
  const handleStageLeave = useCallback(() => {
    setPetting(false)
  }, [])

  /** 心情切换时清空拖尾（避免叠加） */
  useEffect(() => {
    setPettingTrail([])
  }, [mood])

  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-[var(--bg-cosmic)] text-[var(--text-primary)]">
      {/* ── Cinematic atmosphere (deep-space gradient + radial mood arc) ── */}
      <div className="pointer-events-none absolute inset-0">
        {/* 大弧光来自当前心情 */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{ background: moodCfg.bgArc }}
          aria-hidden="true"
        />
        {/* 静态星点 */}
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-zinc-200"
            style={{
              top: `${(i * 47) % 100}%`,
              left: `${(i * 79) % 100}%`,
              width: (i % 4) + 1,
              height: (i % 4) + 1,
              opacity: 0.25 + (i % 3) * 0.1,
              animation: `breath ${3 + (i % 3) * 1.5}s ease-in-out ${(i * 0.2) % 3}s infinite`,
            }}
          />
        ))}
        {/* 情绪化粒子（来自共享 EmotionParticles） */}
        <EmotionParticles
          kinds={particleKinds}
          intensity={petting ? 0.85 : 0.55}
          interactive
          className="pointer-events-none absolute inset-0"
        />
      </div>

      {/* ── Header：宠物名 + 稀有度 ── */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-10 text-center">
        <motion.h1
          key={pet.id + pet.rarity}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl"
        >
          <span aria-hidden="true">🐾 </span>
          {pet.name}
        </motion.h1>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-zinc-400">
          <span
            className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase', RARITY_STYLES[pet.rarity].badge)}
            style={{ boxShadow: RARITY_STYLES[pet.rarity].glow }}
          >
            {t(`rarity.${pet.rarity}`)}
          </span>
          <span>·</span>
          <span>{t('subtitle')}</span>
        </div>
      </div>

      {/* ── Pet Stage（主展示 300x300 + 抚摸交互） ── */}
      <div className="relative mx-auto mt-6 flex justify-center">
        <div
          ref={stageRef}
          onMouseMove={handleStageMove}
          onMouseLeave={handleStageLeave}
          className="relative h-[300px] w-[300px] sm:h-[360px] sm:w-[360px]"
          role="img"
          aria-label={`${pet.name} pet stage — move mouse to pet`}
        >
          {/* 心情背景 bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mood}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="absolute right-2 top-2 z-20 max-w-[55%] rounded-2xl border border-white/20 glass-card-emph px-3 py-2 text-xs font-medium text-zinc-100 shadow-lg"
            >
              {moodCfg.bubbleEn}
            </motion.div>
          </AnimatePresence>

          {/* 抚摸提示 */}
          {petting && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-2 top-2 z-20 rounded-full bg-rose-500/20 px-3 py-1 text-[11px] font-medium text-rose-100 ring-1 ring-rose-300/40"
            >
              💕 {t('petting')}
            </motion.div>
          )}

          {/* 宠物本体（PetCapsule xl + expression-happy 替换） */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div ref={petRef} className={cn('relative', mood === 'sleepy' && 'opacity-90')}>
              <PetCapsule
                src={currentSprite}
                size="xl"
                parallax={!petting}
                glow
                sparkles={mood === 'sweet' || pet.rarity === 'legendary'}
                status={petting ? 'hello' : mood === 'sleepy' ? 'sleepy' : 'miss'}
                statusText={petting ? t('statusHello') : mood === 'sleepy' ? t('statusSleepy') : t('statusMiss')}
              />
            </div>
          </div>

          {/* 抚摸心形拖尾 */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <AnimatePresence>
              {pettingTrail.map((p) => (
                <motion.span
                  key={p.key}
                  initial={{ opacity: 0.9, scale: 0.6, y: 0 }}
                  animate={{ opacity: 0, scale: 1.6, y: -24 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute text-rose-300"
                  style={{ left: p.x, top: p.y, fontSize: 18 }}
                  aria-hidden="true"
                >
                  💗
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Mood Selector（4 按钮：甜蜜/吵架/思考/睡觉） ── */}
      <div className="relative z-10 mx-auto mt-6 max-w-2xl px-4">
        <p className="mb-3 text-center text-sm font-medium text-zinc-300">
          {t('pickMood')}
        </p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {MOOD_BUTTONS.map((m) => {
            const isActive = m.id === mood
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all sm:p-4',
                  isActive
                    ? 'scale-105 border-rose-400 bg-rose-500/15 shadow-lg ring-1 ring-rose-300/40'
                    : 'border-white/10 glass-card-emph hover:scale-105 hover:border-rose-300/40',
                )}
                aria-pressed={isActive}
              >
                <span className="text-2xl sm:text-3xl" aria-hidden="true">{m.icon}</span>
                <span className="text-[11px] font-medium text-zinc-200 sm:text-xs">
                  {t(`mood.${m.key}`)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Info Bar（在一起 X 天、互动次数、成长值） ── */}
      <div className="relative z-10 mx-auto mt-6 max-w-2xl px-4">
        <div className="grid grid-cols-3 gap-2 rounded-2xl glass-card-emph p-4 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{t('info.days')}</p>
            <p className="mt-0.5 text-lg font-semibold text-zinc-100 sm:text-xl">42</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{t('info.interactions')}</p>
            <p className="mt-0.5 text-lg font-semibold text-zinc-100 sm:text-xl">128</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{t('info.growth')}</p>
            <p className="mt-0.5 text-lg font-semibold text-amber-300 sm:text-xl">Lv. 7</p>
          </div>
        </div>
      </div>

      {/* ── 操作按钮（更换外观 / 查看成长日记 / 互动记录 / 分享） ── */}
      <div className="relative z-10 mx-auto mt-6 max-w-2xl px-4 pb-16">
        <button
          type="button"
          onClick={() => setAltarOpen(true)}
          className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-rose-400 to-purple-500 p-[2px] shadow-lg transition-transform hover:scale-[1.01]"
        >
          <span className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--bg-cosmic)] px-6 py-3.5 text-sm font-semibold text-zinc-50 sm:text-base">
            <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
            {t('changePet')}
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
              {t('changePetBadge')}
            </span>
          </span>
        </button>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            className="flex flex-col items-center gap-1 rounded-2xl glass-card-emph px-3 py-3 text-[11px] text-zinc-300 transition-colors hover:bg-white/10 sm:text-xs"
          >
            <Camera className="h-4 w-4 text-amber-300" aria-hidden="true" />
            {t('actions.journal')}
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 rounded-2xl glass-card-emph px-3 py-3 text-[11px] text-zinc-300 transition-colors hover:bg-white/10 sm:text-xs"
          >
            <MessageCircle className="h-4 w-4 text-purple-300" aria-hidden="true" />
            {t('actions.history')}
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-1 rounded-2xl glass-card-emph px-3 py-3 text-[11px] text-zinc-300 transition-colors hover:bg-white/10 sm:text-xs"
          >
            <Share2 className="h-4 w-4 text-rose-300" aria-hidden="true" />
            {t('actions.share')}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-zinc-500">
          <Lock className="mr-1 inline h-3 w-3 align-middle" aria-hidden="true" />
          {t('lockHint')}
        </p>
      </div>

      {/* ── 全屏召唤阵 ── */}
      <PetSelectionModal
        open={altarOpen}
        onClose={() => setAltarOpen(false)}
        currentPetId={pet.id}
        onConfirm={(p) => {
          setPet(p)
        }}
      />
    </div>
  )
}
