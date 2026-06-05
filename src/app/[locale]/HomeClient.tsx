'use client'

/**
 * HomeClient — Fusion v2 (Always Here 沉浸式首屏)
 *
 * 5 design pillars (融合方案提示词 1):
 *   1. 宠物休眠舱 (PetCapsule xl) 居中 — 3D 视差 + 呼吸起伏
 *   2. 单行 "Always Here" 打字机（光标闪烁）
 *   3. 关系模式选择器 (4 种模式) → 切换 sprite + 弧光
 *   4. 5 种情感粒子 (kinds=['bubble','star','dust']) — Canvas 2D
 *   5. 鼠标交互：点击 Canvas 触发气泡
 *
 * 增强 (未在原方案但符合情感化定位):
 *   - 首次访问 vs 回访：localStorage 'togthr.lastVisit' 检测
 *   - 深夜模式：isNightMode() 切换弧光强度 + 宠物 status
 *
 * 保留 (HomeClient 现状):
 *   - Bento grid (7 张 BentoCard) — 不改
 *   - Sticker pack (8 张 sticker) — 不改
 *   - 移除旧版 FloatingMascot（与 PetCapsule 重复）
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import {
  MessageCircle,
  Camera,
  Sparkles,
  Star,
  ShoppingBag,
  Heart,
  Lock,
} from 'lucide-react'
import type { Feature } from '@/components/FeatureCard'
import { PetCapsule } from '@/components/shared/PetCapsule'
import { RelationModeSelector } from '@/components/shared/RelationModeSelector'
import { EmotionParticles } from '@/components/shared/EmotionParticles'
import {
  RELATION_MODES,
  isNightMode,
  type RelationMode,
} from '@/lib/design-tokens'
import type { Locale } from '@/i18n/routing'

/* ── Holiday skin auto-detect (保留现有逻辑) ── */
type HolidaySkin = 'default' | 'christmas' | 'valentine' | 'halloween'
function detectHolidaySkin(): HolidaySkin {
  const m = new Date().getMonth() + 1
  const d = new Date().getDate()
  if (m === 12 && d >= 20 && d <= 26) return 'christmas'
  if (m === 2 && d >= 13 && d <= 15) return 'valentine'
  if (m === 10 && d >= 28 && d <= 31) return 'halloween'
  return 'default'
}

/* ── Cinematic background palette (保留) ── */
const SCENE_BG: Record<HolidaySkin, string> = {
  default: 'from-[#1a0b2e] via-[#0f0524] to-[#0a0118]',
  christmas: 'from-[#1a0a1a] via-[#0f0a1a] to-[#0a0518]',
  valentine: 'from-[#1a0b1f] via-[#0f0820] to-[#0a0418]',
  halloween: 'from-[#1a0f0a] via-[#0f0a05] to-[#0a0501]',
}

const STICKERS: Array<{ src: string; label: string }> = [
  { src: '/pets/sticker-surprised.png', label: '😲' },
  { src: '/pets/sticker-loveyou.png', label: '😍' },
  { src: '/pets/sticker-crying.png', label: '😭' },
  { src: '/pets/sticker-sleepy.png', label: '😴' },
  { src: '/pets/sticker-wink.png', label: '😉' },
  { src: '/pets/sticker-fighting.png', label: '💪' },
  { src: '/pets/sticker-shy.png', label: '😊' },
  { src: '/pets/sticker-thumbsup.png', label: '👍' },
]

/* ── Typewriter (本地小组件 — 单行 + 循环光标) ── */
function Typewriter({
  text,
  className,
  speed = 80,
  startDelay = 0,
}: {
  text: string
  className?: string
  speed?: number
  startDelay?: number
}) {
  const prefersReduced = useReducedMotion()
  // SSR-safe 初始值：prefersReduced 时直接显示全文
  const [displayed, setDisplayed] = useState(() => (prefersReduced ? text : ''))

  useEffect(() => {
    if (prefersReduced) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- typewriter 动画必须在 mount 后启动
    setDisplayed('')
    let i = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    const start = setTimeout(() => {
      const tick = () => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) return
        timer = setTimeout(tick, speed)
      }
      tick()
    }, startDelay)
    return () => {
      clearTimeout(start)
      if (timer) clearTimeout(timer)
    }
  }, [text, speed, startDelay, prefersReduced])

  return (
    <span className={className} aria-label={text} role="text">
      <span aria-hidden="true">{displayed || '\u00A0'}</span>
      <span
        aria-hidden="true"
        className="ml-0.5 inline-block w-[2px] align-baseline animate-cursor-blink"
        style={{ height: '0.95em' }}
      >
        |
      </span>
    </span>
  )
}

export function HomeClient({
  locale,
  heroTitle,
  heroSubtitle,
  heroWelcomeFirst,
  heroWelcomeBack,
  heroSleepyGreeting,
  heroCta,
  heroSecondary,
  heroSocialProof,
  heroEyebrow,
  heroStatusHello,
  heroStatusMiss,
  heroStatusSleepy,
  heroRelationsEyebrow,
  heroRelationsHint,
}: {
  locale: Locale | string
  heroTitle: string
  heroSubtitle: string
  heroWelcomeFirst: string
  heroWelcomeBack: string
  heroSleepyGreeting: string
  heroCta: string
  heroSecondary: string
  heroSocialProof: string
  heroEyebrow: string
  heroStatusHello: string
  heroStatusMiss: string
  heroStatusSleepy: string
  heroRelationsEyebrow: string
  heroRelationsHint: string
  /** bento grid 的扩展 hook（保留 API 但当前实现不直接使用 — 复用 home.companions.* 标题） */
  features?: Feature[]
}) {
  const prefersReduced = useReducedMotion()
  const tCompanions = useTranslations('home.companions')
  const skin = detectHolidaySkin()

  /* ── 关系模式 ── */
  const [mode, setMode] = useState<RelationMode>('couple')
  const modeConfig = useMemo(
    () => RELATION_MODES.find((m) => m.id === mode) ?? RELATION_MODES[0],
    [mode],
  )

  /* ── 首次访问 vs 回访（client-only, SSR-safe） ── */
  const [visitStatus, setVisitStatus] = useState<'first' | 'returning' | 'loading'>(
    'loading',
  )
  const [isNight, setIsNight] = useState(false)

  useEffect(() => {
    try {
      const KEY = 'togthr.lastVisit'
      const last = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount 时同步 localStorage 状态
      setVisitStatus(last ? 'returning' : 'first')
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(KEY, new Date().toISOString())
      }
    } catch {
      // localStorage 不可用（隐私模式 / SSR）— 视为首次
      setVisitStatus('first')
    }
    setIsNight(isNightMode())
  }, [])

  /* ── 派生状态 ── */
  const petStatus: 'hello' | 'miss' | 'sleepy' =
    isNight ? 'sleepy' : visitStatus === 'returning' ? 'miss' : 'hello'
  const statusText = isNight
    ? heroStatusSleepy
    : visitStatus === 'returning'
      ? heroStatusMiss
      : heroStatusHello
  const subtitleText = isNight
    ? heroSleepyGreeting
    : visitStatus === 'returning'
      ? heroWelcomeBack
      : visitStatus === 'loading'
        ? heroSubtitle
        : heroWelcomeFirst

  /* ── 弧光强度：深夜更柔和（×0.55） ── */
  const arcOpacity = isNight ? 0.55 : 1
  const particleIntensity = isNight ? 0.35 : 0.55

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-gradient-to-b ${SCENE_BG[skin]} text-zinc-100`}
    >
      {/* ════════════════ Hero — Always Here 沉浸式首屏 ════════════════ */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-12"
        aria-label="Always Here hero"
      >
        {/* ── Layer 1: 大弧光 (关系模式驱动，深夜自动柔和) ── */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[820px] w-[820px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: modeConfig.arcColor,
            filter: 'blur(80px)',
            opacity: arcOpacity,
            transition: 'opacity 1.2s ease',
          }}
          animate={
            prefersReduced
              ? undefined
              : { scale: [1, 1.08, 1], x: ['-50%', '-48%', '-50%'], y: ['-50%', '-52%', '-50%'] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* 副弧光 — 与主弧光互补色调 */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-[20%] top-[15%] h-[420px] w-[420px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(168,85,247,0.20) 0%, transparent 70%)',
            filter: 'blur(80px)',
            opacity: arcOpacity * 0.7,
            transition: 'opacity 1.2s ease',
          }}
          animate={
            prefersReduced
              ? undefined
              : { x: [0, 20, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* ── Layer 2: 情感粒子 (Canvas 2D — bubble + star + dust) ── */}
        <EmotionParticles
          kinds={['bubble', 'star', 'dust']}
          intensity={particleIntensity}
          interactive
          className="pointer-events-auto absolute inset-0 z-0"
        />

        {/* ── 主体内容 ── */}
        <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-[10px] font-semibold uppercase tracking-[0.4em] text-amber-200/80 sm:text-xs"
          >
            ✦ {heroEyebrow} ✦
          </motion.p>

          {/* PetCapsule (xl) — 中央休眠舱 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1.0, type: 'spring', stiffness: 90 }}
          >
            <PetCapsule
              src={modeConfig.petSprite}
              alt={modeConfig.labelEn}
              size="xl"
              parallax
              glow
              sparkles
              status={visitStatus === 'loading' ? null : petStatus}
              statusText={visitStatus === 'loading' ? undefined : statusText}
            />
          </motion.div>

          {/* Typewriter "Always Here" — 单行大字 */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="text-center text-4xl font-bold leading-none sm:text-5xl lg:text-6xl"
          >
            <Typewriter
              text={heroTitle}
              className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-transparent"
              startDelay={900}
            />
          </motion.h1>

          {/* Subtitle (随访问状态 / 深夜模式变化) */}
          <motion.p
            key={subtitleText /* 切换时重新淡入 */}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-xl text-center text-sm text-zinc-300/90 sm:text-base"
          >
            {subtitleText}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            className="mt-2 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.span
              whileHover={prefersReduced ? undefined : { scale: 1.04 }}
              whileTap={prefersReduced ? undefined : { scale: 0.96 }}
            >
              <Link
                href={`/${locale}/onboarding`}
                className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 px-7 text-sm font-semibold text-white shadow-[0_0_36px_rgba(168,85,247,0.4)] transition-shadow hover:shadow-[0_0_52px_rgba(168,85,247,0.6)] sm:text-base"
              >
                <span className="relative z-10">{heroCta}</span>
                <span className="relative z-10 transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.span>
            <motion.span
              whileHover={prefersReduced ? undefined : { scale: 1.04 }}
              whileTap={prefersReduced ? undefined : { scale: 0.96 }}
            >
              <Link
                href={`/${locale}/features`}
                className="group inline-flex h-12 items-center gap-2 rounded-full border border-zinc-700/50 bg-white/5 px-5 text-sm font-medium text-zinc-200 backdrop-blur-xl transition-colors hover:bg-white/10 hover:border-amber-300/30"
              >
                <span>{heroSecondary}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </motion.span>
          </motion.div>

          {/* 关系模式选择器 (底部) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            className="mt-4 flex w-full max-w-2xl flex-col items-center gap-2"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500 sm:text-xs">
              ✦ {heroRelationsEyebrow} ✦
            </p>
            <RelationModeSelector
              value={mode}
              onChange={setMode}
              locale={locale as Locale}
              className="max-w-full"
            />
            <p className="text-xs text-zinc-500">{heroRelationsHint}</p>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.5 }}
            className="mt-2 flex flex-col items-center gap-1.5"
          >
            <span
              className="flex items-center gap-0.5"
              aria-label="5 out of 5 stars"
            >
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
              ))}
            </span>
            <p className="text-[11px] text-zinc-500 sm:text-xs">{heroSocialProof}</p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ delay: 2.3, duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <motion.div
            animate={prefersReduced ? undefined : { y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-[9px] uppercase tracking-widest text-zinc-500"
          >
            <span>scroll</span>
            <span>↓</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════ Bento Grid — Features (保留现状) ════════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
            ✦ 04 Moments ✦
          </p>
          <h2 className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {tCompanions('title')}
          </h2>
          <p className="mt-3 text-sm text-zinc-400">{tCompanions('subtitle')}</p>
        </motion.div>

        {/* Bento grid: 1 large + 1 wide + 1 medium + 1 small, asymmetric */}
        <div className="grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <BentoCard
            className="lg:col-span-2 lg:row-span-2"
            href={`/${locale}/daily`}
            hue="rose"
            delay={0}
            icon={<Heart className="h-6 w-6" />}
            title="喂食时间"
            description="给 TA 一颗心，看它满足的样子"
            visual={
              <div className="absolute inset-0 flex items-center justify-center opacity-90">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-8xl"
                >
                  ❤️
                </motion.div>
              </div>
            }
            big
          />
          <BentoCard
            className="lg:col-span-2"
            href={`/${locale}/capsule`}
            hue="amber"
            delay={0.1}
            icon={<Camera className="h-6 w-6" />}
            title="时光胶囊 · 挖宝"
            description="埋下一个，宠物帮你挖出来"
            visual={
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-80">
                {['🌱', '🌿', '🌳', '🌻'].map((e, i) => (
                  <motion.span
                    key={i}
                    className="text-3xl"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {e}
                  </motion.span>
                ))}
              </div>
            }
          />
          <BentoCard
            href={`/${locale}/pet`}
            hue="purple"
            delay={0.2}
            icon={<Sparkles className="h-6 w-6" />}
            title="共生形态"
            description="会反映你们关系的小生命"
            visual={
              <div className="absolute right-3 top-3 text-5xl opacity-90">✨</div>
            }
          />
          <BentoCard
            href={`/${locale}/store`}
            hue="indigo"
            delay={0.3}
            icon={<ShoppingBag className="h-5 w-5" />}
            title="6+1 盲盒"
            description="¥199 首单"
            badge="新"
            visual={
              <div className="absolute right-3 top-3 text-3xl">🛒</div>
            }
          />
          <BentoCard
            className="lg:col-span-2"
            href={`/${locale}/journal`}
            hue="emerald"
            delay={0.4}
            icon={<MessageCircle className="h-6 w-6" />}
            title="筑巢"
            description="每条日记，都给你们的共同小窝添砖加瓦"
            visual={
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-80">
                {['🌱', '🪺', '🏡'].map((e, i) => (
                  <span key={i} className="text-3xl">
                    {e}
                  </span>
                ))}
              </div>
            }
          />
          <BentoCard
            href={`/${locale}/chat`}
            hue="violet"
            delay={0.5}
            icon={<MessageCircle className="h-5 w-5" />}
            title="灵魂伴侣 AI"
            description="聊聊天，听你说话"
            visual={
              <div className="absolute right-3 top-3 text-3xl">💬</div>
            }
          />
          <BentoCard
            href={`/${locale}/community`}
            hue="slate"
            delay={0.6}
            icon={<Lock className="h-5 w-5" />}
            title="树洞"
            description="匿名留言，24h 自动消失"
            visual={
              <div className="absolute right-3 top-3 text-3xl">🕳️</div>
            }
          />
        </div>
      </section>

      {/* ════════════════ Sticker Pack Section (保留现状) ════════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">
            ✦ 8 Expressions ✦
          </p>
          <h2 className="bg-gradient-to-r from-amber-200 via-rose-200 to-purple-200 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {tCompanions('title')}
          </h2>
          <p className="mt-3 text-sm text-zinc-400">{tCompanions('subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-4 gap-3 sm:grid-cols-8"
        >
          {STICKERS.map((s) => (
            <motion.div
              key={s.src}
              whileHover={prefersReduced ? undefined : { scale: 1.15, y: -6 }}
              whileTap={prefersReduced ? undefined : { scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl transition-colors hover:border-amber-300/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.label}
                className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <span className="pointer-events-none absolute bottom-1 right-1 text-xs opacity-60">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-sm text-zinc-400"
        >
          ✨ {tCompanions('cta')} ✨
        </motion.p>
      </section>
    </div>
  )
}

/* ── BentoCard sub-component (保留现状，不改) ── */
interface BentoCardProps {
  className?: string
  href: string
  hue: 'rose' | 'amber' | 'purple' | 'indigo' | 'emerald' | 'violet' | 'slate'
  delay: number
  icon: React.ReactNode
  title: string
  description: string
  badge?: string
  visual?: React.ReactNode
  big?: boolean
}

const HUE_STYLES: Record<BentoCardProps['hue'], string> = {
  rose: 'from-rose-500/10 via-rose-500/5 to-pink-500/10 border-rose-500/20 hover:border-rose-400/40 hover:from-rose-500/20',
  amber:
    'from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/20 hover:border-amber-400/40 hover:from-amber-500/20',
  purple:
    'from-purple-500/10 via-purple-500/5 to-violet-500/10 border-purple-500/20 hover:border-purple-400/40 hover:from-purple-500/20',
  indigo:
    'from-indigo-500/10 via-indigo-500/5 to-blue-500/10 border-indigo-500/20 hover:border-indigo-400/40 hover:from-indigo-500/20',
  emerald:
    'from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-emerald-500/20 hover:border-emerald-400/40 hover:from-emerald-500/20',
  violet:
    'from-violet-500/10 via-violet-500/5 to-purple-500/10 border-violet-500/20 hover:border-violet-400/40 hover:from-violet-500/20',
  slate:
    'from-slate-500/10 via-slate-500/5 to-zinc-500/10 border-slate-500/20 hover:border-slate-400/40 hover:from-slate-500/20',
}

function BentoCard({
  className = '',
  href,
  hue,
  delay,
  icon,
  title,
  description,
  badge,
  visual,
  big,
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <Link
        href={href}
        className={`group relative flex h-full min-h-[180px] flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${HUE_STYLES[hue]}`}
      >
        {visual}
        <div className="relative z-10 flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${HUE_STYLES[hue]
              .split(' ')
              .filter((c) => c.startsWith('from-') || c.startsWith('via-') || c.startsWith('to-'))
              .join(' ')} text-white shadow-lg`}
          >
            {icon}
          </div>
          {badge && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-950 shadow">
              {badge}
            </span>
          )}
        </div>
        <div className="relative z-10">
          <h3
            className={`font-bold text-zinc-100 ${big ? 'text-2xl sm:text-3xl' : 'text-lg'}`}
          >
            {title}
          </h3>
          <p
            className={`mt-1 text-zinc-400 ${big ? 'text-base' : 'text-sm'}`}
          >
            {description}
          </p>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-300/0 via-rose-300/0 to-purple-400/0 transition-opacity group-hover:from-amber-300/10 group-hover:via-rose-300/10 group-hover:to-purple-400/10" />
      </Link>
    </motion.div>
  )
}
