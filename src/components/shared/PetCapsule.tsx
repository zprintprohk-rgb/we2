'use client'

/**
 * PetCapsule — 玻璃拟态宠物休眠舱
 *
 * 战略来源：方案「宠物休眠舱」概念
 * - Glassmorphism 胶囊：backdrop-filter blur(16px)
 * - 内部宠物呼吸起伏（scale 1.0 → 1.02，3s 循环）
 * - 监听 onMouseMove：3D 视差 (perspective 1000px + rotateX/rotateY ±2°)
 * - 宠物眼睛微随鼠标移动
 *
 * 4 个页面都可以用：
 * - 首页：作为 hero 元素（Always Here 主视觉）
 * - 定价页：作为卡片内嵌的宠物预览
 * - 聊天页：作为角落悬浮宠物
 * - 宠物页：作为 detail 主显示
 *
 * 用法：
 *   <PetCapsule
 *     src="/pets/hero-golden.png"
 *     size="lg"           // sm | md | lg | xl
 *     parallax
 *     sparkles
 *     status="hello"      // 可选：hello | miss | sleepy
 *   />
 */

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type PetCapsuleSize = 'sm' | 'md' | 'lg' | 'xl' | 'fill'
export type PetCapsuleStatus = 'hello' | 'miss' | 'sleepy' | null

interface Props {
  src: string
  alt?: string
  size?: PetCapsuleSize
  /** 启用 3D 视差（默认 true） */
  parallax?: boolean
  /** 启用 4 周呼吸光晕（默认 true） */
  glow?: boolean
  /** 启用慢速星光粒子（默认 false） */
  sparkles?: boolean
  /** 状态气泡 */
  status?: PetCapsuleStatus
  /** 状态气泡文本（i18n） */
  statusText?: string
  className?: string
  onClick?: () => void
}

const SIZE_CLASS: Record<PetCapsuleSize, string> = {
  sm:   'h-24 w-24',
  md:   'h-40 w-40',
  lg:   'h-64 w-64 sm:h-80 sm:w-80',
  xl:   'h-80 w-80 sm:h-96 sm:w-96',
  fill: 'h-full w-full',
}

const STATUS_BUBBLE: Record<NonNullable<PetCapsuleStatus>, string> = {
  hello:  '👋',
  miss:   '💕',
  sleepy: '💤',
}

export function PetCapsule({
  src,
  alt = 'Togthr companion',
  size = 'lg',
  parallax = true,
  glow = true,
  sparkles = false,
  status = null,
  statusText,
  className,
  onClick,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const eyeRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [breath, setBreath] = useState(1)
  const [isHovering, setIsHovering] = useState(false)

  // ── 3D 视差 ──
  useEffect(() => {
    if (!parallax) return
    const onMove = (e: MouseEvent) => {
      if (!wrapRef.current) return
      const rect = wrapRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (window.innerWidth / 2)
      const dy = (e.clientY - cy) / (window.innerHeight / 2)
      // 限制 ±2 度
      setTilt({ x: dy * -2, y: dx * 2 })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [parallax])

  // ── 呼吸动画（CSS-driven 通过 animate-breath className 代替手动）──
  // 这里用 useEffect 是为了 size 改变时强制 reset
  useEffect(() => {
    setBreath(1)
  }, [size])

  return (
    <div
      ref={wrapRef}
      className={cn(
        'group relative',
        SIZE_CLASS[size],
        parallax && 'transition-transform duration-200 ease-out',
        onClick && 'cursor-pointer',
        className,
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
      style={
        parallax
          ? {
              transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transformStyle: 'preserve-3d',
            }
          : undefined
      }
    >
      {/* ── 外层光晕（4 层叠加） ── */}
      {glow && (
        <>
          <div className="absolute -inset-12 rounded-full bg-gradient-to-br from-pink-300/20 via-purple-300/15 to-blue-300/20 blur-3xl animate-arc-drift" />
          <div className="absolute -inset-6 rounded-full bg-gradient-to-br from-amber-200/15 via-rose-200/15 to-purple-300/15 blur-2xl animate-breath" />
        </>
      )}

      {/* ── 玻璃拟态舱体 ── */}
      <div className="relative h-full w-full overflow-hidden rounded-[28px] glass-card shadow-2xl ring-1 ring-white/10">
        {/* 内部高光（顶部） */}
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        {/* 内部底色渐变（防止透明导致的视觉空洞） */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/20" />

        {/* 宠物本体 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative h-[80%] w-[80%] animate-breath"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              loading="lazy"
            />
            {/* 眼睛跟随（仅 lg/xl 显示） */}
            {(size === 'lg' || size === 'xl' || size === 'fill') && parallax && (
              <div
                ref={eyeRef}
                className="pointer-events-none absolute inset-0"
                style={{
                  transform: `translate(${tilt.y * 1.5}px, ${tilt.x * -1.5}px)`,
                  transition: 'transform 0.2s ease-out',
                }}
              />
            )}
          </div>
        </div>

        {/* ── 内部星光（可选） ── */}
        {sparkles && (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-amber-200"
                style={{
                  top: `${10 + (i * 41) % 80}%`,
                  left: `${5 + (i * 67) % 90}%`,
                  width: 2,
                  height: 2,
                  opacity: 0.7,
                  animation: `breath ${2 + (i % 3)}s ease-in-out ${(i * 0.3) % 2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 状态气泡 ── */}
      {status && (
        <div
          className={cn(
            'absolute -top-2 -right-2 z-10 flex items-center gap-1 rounded-full glass-card-emph px-3 py-1.5 text-xs font-medium text-white shadow-lg',
            'animate-pulse-glow',
          )}
        >
          <span aria-hidden="true">{STATUS_BUBBLE[status]}</span>
          {statusText && <span className="max-w-[8rem] truncate">{statusText}</span>}
        </div>
      )}

      {/* ── Hover 增强 ── */}
      {isHovering && glow && (
        <div className="pointer-events-none absolute -inset-2 rounded-[32px] ring-1 ring-pink-300/30 transition-opacity" />
      )}
    </div>
  )
}
