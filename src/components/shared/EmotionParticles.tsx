'use client'

/**
 * EmotionParticles — 5 种情感粒子的 Canvas 2D 渲染器
 *
 * 战略来源：方案「情绪响应式粒子宇宙」
 * - bubble: 上升气泡（用户交互触发）
 * - star:   闪烁星星（宠物心情愉悦，带拖尾）
 * - dust:   微光尘埃（深夜/安静时刻，缓慢飘落）
 * - ripple: 脉冲波纹（对方正在输入，从中心扩散）
 * - shard:  破碎晶片（争吵/冷战，尖锐几何）
 *
 * 用法：
 *   <EmotionParticles kinds={['bubble', 'star']} intensity={0.6} className="..." />
 *
 * 自动遵守 prefers-reduced-motion。
 */

import { useEffect, useRef } from 'react'
import { PARTICLES, type ParticleKind } from '@/lib/design-tokens'

interface Props {
  /** 启用的粒子种类（不指定则全部） */
  kinds?: ParticleKind[]
  /** 整体密度 0..1，默认 0.5 */
  intensity?: number
  /** 是否响应鼠标交互生成气泡（默认 true） */
  interactive?: boolean
  /** Canvas className（用于覆盖 absolute inset-0 等定位） */
  className?: string
  /** aria-hidden 默认 true（纯装饰） */
  decorative?: boolean
}

interface ActiveParticle {
  kind: ParticleKind
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number      // ms 剩余
  maxLife: number
  rotation: number
  rotSpeed: number
  hue: string
}

export function EmotionParticles({
  kinds = ['bubble', 'star', 'dust'],
  intensity = 0.5,
  interactive = true,
  className = 'pointer-events-none absolute inset-0',
  decorative = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ActiveParticle[]>([])
  const rafRef = useRef<number | null>(null)
  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const prefersReduced = useRef(false)

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // ── Resize handling（DPR-aware）──
    const resize = () => {
      // Re-narrow 闭包变量（同 frame 的原因）
      if (!canvas || !ctx) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { clientWidth, clientHeight } = canvas
      canvas.width = clientWidth * dpr
      canvas.height = clientHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── 鼠标交互：移动/点击触发气泡 ──
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => {
      mousePosRef.current = null
    }
    const onClick = (e: MouseEvent) => {
      if (prefersReduced.current) return
      if (!kinds.includes('bubble')) return
      const rect = canvas.getBoundingClientRect()
      spawn('bubble', e.clientX - rect.left, e.clientY - rect.top, 5)
    }
    if (interactive) {
      window.addEventListener('mousemove', onMove)
      canvas.addEventListener('mouseleave', onLeave)
      canvas.addEventListener('click', onClick)
    }

    // ── 粒子生成器 ──
    function spawn(kind: ParticleKind, x: number, y: number, count = 1) {
      const cfg = PARTICLES[kind]
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.abs(cfg.speed) * (0.6 + Math.random() * 0.6)
        particlesRef.current.push({
          kind,
          x,
          y,
          vx: kind === 'bubble' || kind === 'shard' ? Math.cos(angle) * speed : (Math.random() - 0.5) * 0.4,
          vy: cfg.speed >= 0 ? Math.sin(angle) * speed : -speed * (0.7 + Math.random() * 0.5),
          size: cfg.size * (0.7 + Math.random() * 0.6),
          life: cfg.lifetime * (0.8 + Math.random() * 0.4),
          maxLife: cfg.lifetime,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.04,
          hue: cfg.color,
        })
      }
      // 限流：单帧最多 200 粒子
      if (particlesRef.current.length > 200) {
        particlesRef.current.splice(0, particlesRef.current.length - 200)
      }
    }

    // ── 主循环 ──
    let lastT = performance.now()
    function frame(t: number) {
      // Re-narrow 闭包变量（TS 在 function declaration 内有时丢失 outer 的 narrow）
      if (!canvas || !ctx) return
      const dt = Math.min(t - lastT, 50) // cap dt at 50ms (防 tab 切换大跳)
      lastT = t

      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      // 持续生成（低频）
      if (!prefersReduced.current && Math.random() < intensity * 0.05) {
        if (kinds.includes('dust') && Math.random() < 0.6) {
          spawn('dust', Math.random() * w, -10, 1)
        } else if (kinds.includes('star') && Math.random() < 0.3) {
          spawn('star', Math.random() * w, Math.random() * h * 0.6, 1)
        }
      }

      // 鼠标移动生成气泡（仅在 interactive 模式）
      if (interactive && mousePosRef.current && !prefersReduced.current && kinds.includes('bubble')) {
        if (Math.random() < intensity * 0.08) {
          spawn('bubble', mousePosRef.current.x, mousePosRef.current.y, 1)
        }
      }

      // 推进 + 渲染
      const survivors: ActiveParticle[] = []
      for (const p of particlesRef.current) {
        p.life -= dt
        if (p.life <= 0) continue

        p.x += p.vx * (dt / 1000)
        p.y += p.vy * (dt / 1000)
        p.rotation += p.rotSpeed

        // 物理细节
        if (p.kind === 'bubble') {
          p.vx += (Math.random() - 0.5) * 0.05 // 漂浮摇摆
        }
        if (p.kind === 'shard') {
          p.vy += 9.8 * 0.02 // 重力
        }

        const alpha = Math.min(1, p.life / 800) * 0.85

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = alpha

        if (p.kind === 'bubble') {
          // 圆形气泡 + 高光
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.hue
          ctx.globalAlpha = alpha * 0.3
          ctx.fill()
          ctx.beginPath()
          ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.3, 0, Math.PI * 2)
          ctx.fillStyle = '#fff'
          ctx.globalAlpha = alpha * 0.6
          ctx.fill()
        } else if (p.kind === 'star') {
          // 五角星 + 拖尾
          drawStar(ctx, 0, 0, 5, p.size, p.size * 0.4)
          ctx.fillStyle = p.hue
          ctx.globalAlpha = alpha * 0.9
          ctx.fill()
        } else if (p.kind === 'dust') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.hue
          ctx.globalAlpha = alpha * 0.5
          ctx.fill()
        } else if (p.kind === 'ripple') {
          const r = p.size + (1 - p.life / p.maxLife) * 60
          ctx.beginPath()
          ctx.arc(0, 0, r, 0, Math.PI * 2)
          ctx.strokeStyle = p.hue
          ctx.lineWidth = 2
          ctx.globalAlpha = alpha * 0.5
          ctx.stroke()
        } else if (p.kind === 'shard') {
          // 三角晶片
          ctx.beginPath()
          ctx.moveTo(0, -p.size)
          ctx.lineTo(p.size, p.size)
          ctx.lineTo(-p.size, p.size)
          ctx.closePath()
          ctx.fillStyle = p.hue
          ctx.globalAlpha = alpha * 0.7
          ctx.fill()
        }

        ctx.restore()
        survivors.push(p)
      }
      particlesRef.current = survivors

      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)

    // 暴露 spawn 给外部（如心情切换时触发 ripple/shard）
    ;(canvas as any).__spawn = spawn

    return () => {
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (interactive) {
        window.removeEventListener('mousemove', onMove)
        canvas.removeEventListener('mouseleave', onLeave)
        canvas.removeEventListener('click', onClick)
      }
    }
  }, [kinds.join(','), intensity, interactive])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden={decorative ? 'true' : undefined}
      data-testid="emotion-particles"
    />
  )
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerR: number,
  innerR: number,
) {
  const step = Math.PI / spikes
  let rot = (Math.PI / 2) * 3
  ctx.beginPath()
  ctx.moveTo(cx, cy - outerR)
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR)
    rot += step
  }
  ctx.closePath()
}
