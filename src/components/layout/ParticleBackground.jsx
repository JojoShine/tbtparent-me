'use client'

import { useEffect, useRef } from 'react'

// 根据屏幕尺寸动态计算粒子数量
const getParticleCount = () => {
  const area = window.innerWidth * window.innerHeight
  if (area < 768 * 1024) return 45   // 手机
  if (area < 1280 * 800) return 65   // 平板/小屏
  return 85                           // 桌面
}

// 粒子配置
const SPEED = 0.35
const CONNECTION_DISTANCE = 110
const MOUSE_RADIUS = 120
const MOUSE_FORCE = 4
const CLICK_FORCE = 15
const SHOOTING_STAR_INTERVAL = 8000

// Matrix 字符雨配置
const MATRIX_CHARS = '01アイウエオカキクケコ{}[]<>/\\|=+-*&^%$#@!~`'
const MATRIX_SPACING = 50
const MATRIX_SPEED = 0.25

// 网格配置
const GRID_SIZE = 100

export default function ParticleBackground() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animFrameRef = useRef(null)
  const shootingStarsRef = useRef([])
  const lastShootingStarRef = useRef(0)
  const timeRef = useRef(0)
  const matrixRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    // 初始化 Matrix 字符雨
    const initMatrix = () => {
      const cols = Math.ceil(width / MATRIX_SPACING)
      matrixRef.current = Array.from({ length: cols }, () => ({
        y: Math.random() * height,
        speed: MATRIX_SPEED + Math.random() * 0.15,
        char: MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
        opacity: Math.random() * 0.25 + 0.05,
        changeTimer: 0,
      }))
    }
    initMatrix()

    // 初始化粒子
    const particleCount = getParticleCount()
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        radius: Math.random() * 1.5 + 0.5,
        baseRadius: Math.random() * 1.5 + 0.5,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() > 0.8,
        twinklePhase: Math.random() * Math.PI * 2,
      }))
    }

    const onMouseMove = (e) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    const onMouseLeave = () => {
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
    }
    const onClick = (e) => {
      for (const p of particlesRef.current) {
        const dx = p.x - e.clientX
        const dy = p.y - e.clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * CLICK_FORCE
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('click', onClick)
    window.addEventListener('resize', initMatrix)

    const spawnShootingStar = () => {
      const angle = Math.PI / 6 + Math.random() * Math.PI / 6
      const speed = 4 + Math.random() * 3
      shootingStarsRef.current.push({
        x: Math.random() * width * 0.8,
        y: Math.random() * height * 0.3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        length: 30 + Math.random() * 40,
      })
    }

    // 绘制网格
    const drawGrid = (isDark) => {
      const gridColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 0.5

      for (let x = 0; x < width; x += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // 网格交叉点发光
      const dotColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
      for (let x = 0; x < width; x += GRID_SIZE) {
        for (let y = 0; y < height; y += GRID_SIZE) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fillStyle = dotColor
          ctx.fill()
        }
      }
    }

    // 绘制 Matrix 字符雨
    const drawMatrix = (isDark, time) => {
      const matrix = matrixRef.current
      ctx.font = '12px monospace'

      for (let i = 0; i < matrix.length; i++) {
        const col = matrix[i]
        const x = i * MATRIX_SPACING

        // 随机更换字符
        col.changeTimer++
        if (col.changeTimer > 30) {
          col.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
          col.changeTimer = 0
        }

        // 颜色
        const charColor = isDark
          ? `rgba(255,255,255,${col.opacity})`
          : `rgba(0,0,0,${col.opacity * 0.5})`
        ctx.fillStyle = charColor
        ctx.fillText(col.char, x, col.y)

        // 下移
        col.y += col.speed
        if (col.y > height + 20) {
          col.y = -20
          col.opacity = Math.random() * 0.3 + 0.05
          col.char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
        }
      }
    }

    // 动画循环
    const animate = () => {
      timeRef.current += 0.016
      ctx.clearRect(0, 0, width, height)

      const isDark = document.documentElement.classList.contains('dark')
      const particles = particlesRef.current
      const mouse = mouseRef.current
      const time = timeRef.current

      // 1. 网格背景
      drawGrid(isDark)

      // 2. Matrix 字符雨
      drawMatrix(isDark, time)

      // 3. 粒子 + 连线
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.995
        p.vy *= 0.995

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed < SPEED * 0.5) {
          const angle = Math.atan2(p.vy, p.vx)
          p.vx = Math.cos(angle) * SPEED * 0.5
          p.vy = Math.sin(angle) * SPEED * 0.5
        }

        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) }
        if (p.x > width) { p.x = width; p.vx = -Math.abs(p.vx) }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) }
        if (p.y > height) { p.y = height; p.vy = -Math.abs(p.vy) }

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_FORCE
          p.vx += (dx / dist) * force * 0.05
          p.vy += (dy / dist) * force * 0.05
        }

        p.radius = p.baseRadius + Math.sin(time * 1.5 + p.phase) * 0.3

        let alpha = 1
        if (isDark && p.twinkle) {
          alpha = 0.4 + Math.sin(time * 3 + p.twinklePhase) * 0.6
          alpha = Math.max(0.1, alpha)
        }

        const particleColor = isDark
          ? `rgba(255,255,255,${0.5 * alpha})`
          : `rgba(100,100,100,${0.8 * alpha})`

        // 发光效果
        ctx.shadowBlur = isDark ? 6 : 3
        ctx.shadowColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = particleColor
        ctx.fill()

        // Dark 模式闪烁粒子十字星芒
        if (isDark && p.twinkle && alpha > 0.7) {
          ctx.beginPath()
          ctx.moveTo(p.x - p.radius * 3, p.y)
          ctx.lineTo(p.x + p.radius * 3, p.y)
          ctx.moveTo(p.x, p.y - p.radius * 3)
          ctx.lineTo(p.x, p.y + p.radius * 3)
          ctx.strokeStyle = `rgba(255,255,255,${0.15 * alpha})`
          ctx.lineWidth = 0.3
          ctx.stroke()
        }

        ctx.shadowBlur = 0

        // 连线
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const ddx = p.x - p2.x
          const ddy = p.y - p2.y
          const d = Math.sqrt(ddx * ddx + ddy * ddy)

          if (d < CONNECTION_DISTANCE) {
            const baseAlpha = isDark ? 0.35 : 0.5
            const opacity = (1 - d / CONNECTION_DISTANCE) * baseAlpha
            const lineColor = isDark
              ? `rgba(255,255,255,${opacity})`
              : `rgba(0,0,0,${opacity})`
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = lineColor
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // 4. 流星
      const now = Date.now()
      if (now - lastShootingStarRef.current > SHOOTING_STAR_INTERVAL + Math.random() * 3000) {
        if (Math.random() > 0.5) spawnShootingStar()
        lastShootingStarRef.current = now
      }

      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const star = shootingStarsRef.current[i]
        star.x += star.vx
        star.y += star.vy
        star.life -= star.decay

        if (star.life <= 0) {
          shootingStarsRef.current.splice(i, 1)
          continue
        }

        const tailX = star.x - star.vx * star.length * 0.3
        const tailY = star.y - star.vy * star.length * 0.3

        const gradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y)
        const starColor = isDark ? '255,255,255' : '0,0,0'
        gradient.addColorStop(0, `rgba(${starColor},0)`)
        gradient.addColorStop(1, `rgba(${starColor},${0.5 * star.life})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(star.x, star.y)
        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5 * star.life
        ctx.stroke()
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('click', onClick)
      window.removeEventListener('resize', initMatrix)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
