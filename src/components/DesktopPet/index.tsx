'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './styles.module.css'

type PetState = 'idle' | 'working' | 'thinking' | 'success'

const BUBBLES: Record<PetState, string[]> = {
  idle:     ['嘿嘿~', '我在呢', '摸鱼中...', '要不要撸撸我？', '嗑瓜子时间'],
  working:  ['⌨️ 哒哒哒...', '别打扰！', '在 debug...', '思考中...'],
  thinking: ['🤔 嗯...', '有思路了！', '等等让我想', '嗯嗯...'],
  success:  ['耶！完成！', '撒花！🌸', '我超棒！', '💪 搞定！'],
}

const STATES: PetState[] = ['idle', 'working', 'thinking', 'success']

export function DesktopPet() {
  const [state, setState] = useState<PetState>('idle')
  const [bubble, setBubble] = useState<string>('')
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [confetti, setConfetti] = useState<number[]>([])
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const petRef = useRef<HTMLDivElement>(null)
  const eyeLRef = useRef<HTMLDivElement>(null)
  const eyeRRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number; moved: boolean } | null>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ===== 状态切换 =====
  const switchState = useCallback((s: PetState, withBubble = false) => {
    setState(s)
    if (s === 'success') {
      setConfetti(Array.from({ length: 14 }, (_, i) => i))
      setTimeout(() => setConfetti([]), 1100)
    }
    if (withBubble) {
      const lines = BUBBLES[s]
      setBubble(lines[Math.floor(Math.random() * lines.length)])
      setBubbleVisible(true)
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
      bubbleTimer.current = setTimeout(() => setBubbleVisible(false), 2800)
    }
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      setState('idle')
    }, 5000)
  }, [])

  // ===== 拖拽 =====
  const onMouseDown = (e: React.MouseEvent) => {
    if (!petRef.current) return
    e.preventDefault()
    const rect = petRef.current.getBoundingClientRect()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: rect.left,
      baseY: rect.top,
      moved: false,
    }
    setDragging(true)
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true
      if (d.moved) {
        const nx = Math.max(0, Math.min(window.innerWidth - 64, d.baseX + dx))
        const ny = Math.max(0, Math.min(window.innerHeight - 64, d.baseY + dy))
        setPosition({ x: nx, y: ny })
      }
    }
    const onUp = () => {
      if (dragRef.current) {
        const wasDragging = dragRef.current.moved
        dragRef.current = null
        setDragging(false)
        if (wasDragging) {
          // 拖拽不算点击
          return
        }
      }
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ===== 点击 =====
  const onClick = () => {
    if (dragRef.current?.moved) return
    const others = STATES.filter(s => s !== state)
    switchState(others[Math.floor(Math.random() * others.length)], true)
  }

  // ===== 眼睛跟随鼠标 =====
  useEffect(() => {
    let lastX = 0, lastY = 0, lastT = 0, mouseMoveT: ReturnType<typeof setTimeout> | null = null
    const onMouseMove = (e: MouseEvent) => {
      if (!petRef.current) return
      const rect = petRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
      const dist = 2.5
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist
      if (eyeLRef.current) eyeLRef.current.style.transform = `translate(${dx}px, ${dy}px)`
      if (eyeRRef.current) eyeRRef.current.style.transform = `translate(${dx}px, ${dy}px)`

      // 快速移动检测 → thinking
      const now = Date.now()
      if (now - lastT < 100) {
        const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY)
        if (speed > 30) switchState('thinking')
      }
      lastX = e.clientX; lastY = e.clientY; lastT = now
      if (mouseMoveT) clearTimeout(mouseMoveT)
      mouseMoveT = setTimeout(() => switchState('idle'), 1200)
    }
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      if (mouseMoveT) clearTimeout(mouseMoveT)
    }
  }, [switchState])

  // ===== 滚动检测 → working =====
  useEffect(() => {
    let lastY = 0, scrollT: ReturnType<typeof setTimeout> | null = null
    const onScroll = () => {
      if (Math.abs(window.scrollY - lastY) > 50) switchState('working')
      lastY = window.scrollY
      if (scrollT) clearTimeout(scrollT)
      scrollT = setTimeout(() => switchState('idle'), 2000)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (scrollT) clearTimeout(scrollT)
    }
  }, [switchState])

  const style: React.CSSProperties = position
    ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
    : {}

  return (
    <div
      ref={petRef}
      className={`${styles.pet} ${styles[state]} ${dragging ? styles.dragging : ''}`}
      style={style}
      onMouseDown={onMouseDown}
      onClick={onClick}
      role="button"
      aria-label="桌面宠物"
    >
      <div className={styles.body} />
      {confetti.map(i => (
        <span
          key={i}
          className={styles.confetti}
          style={{
            background: ['#fbbf24','#ec4899','#8b5cf6','#06b6d4','#10b981','#f43f5e'][i % 6],
            left: `${(i * 7) % 56}px`,
            top: `${(i * 3) % 24}px`,
            ['--dx' as any]: `${(i % 5 - 2) * 24}px`,
            ['--dy' as any]: `${-30 - (i % 5) * 12}px`,
          }}
        />
      ))}
      <div className={styles.bubble + (bubbleVisible ? ' ' + styles.bubbleShow : '')}>
        {bubble}
      </div>
    </div>
  )
}

export default DesktopPet
