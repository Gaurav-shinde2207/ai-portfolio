import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

interface Pulse {
  a: number
  b: number
  t: number
  speed: number
}

const LINK_DIST = 150
const MOUSE_RADIUS = 170

/**
 * 2D neural-network canvas: drifting nodes, proximity links,
 * data pulses traveling edges, gentle cursor interaction.
 * Pauses when offscreen/hidden. Renders a static frame under reduced motion.
 */
export default function NeuralCanvas({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let running = true
    let nodes: Node[] = []
    let pulses: Pulse[] = []
    const mouse = { x: -9999, y: -9999 }

    const seed = () => {
      const count = Math.min(64, Math.max(24, Math.floor((w * h) / 26000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.4 + Math.random() * 1.8,
      }))
      pulses = []
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      if (reduced) draw(0)
    }

    const pairsCache: [number, number][] = []
    const computePairs = () => {
      pairsCache.length = 0
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i]!.x - nodes[j]!.x
          const dy = nodes[i]!.y - nodes[j]!.y
          if (dx * dx + dy * dy < LINK_DIST * LINK_DIST) pairsCache.push([i, j])
        }
      }
    }

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h)

      // cursor interaction: gentle repel
      if (mouse.x > -999) {
        for (const n of nodes) {
          const dx = n.x - mouse.x
          const dy = n.y - mouse.y
          const d2 = dx * dx + dy * dy
          if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 0.01) {
            const d = Math.sqrt(d2)
            const f = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * 0.35
            n.vx += (dx / d) * f * dt * 6
            n.vy += (dy / d) * f * dt * 6
          }
        }
      }

      for (const n of nodes) {
        n.x += n.vx * dt * 60
        n.y += n.vy * dt * 60
        // damp extreme velocities
        n.vx = Math.max(-0.3, Math.min(0.3, n.vx))
        n.vy = Math.max(-0.3, Math.min(0.3, n.vy))
        if (n.x < -20) n.x = w + 20
        if (n.x > w + 20) n.x = -20
        if (n.y < -20) n.y = h + 20
        if (n.y > h + 20) n.y = -20
      }

      computePairs()

      ctx.lineWidth = 1
      for (const [i, j] of pairsCache) {
        const a = nodes[i]!
        const b = nodes[j]!
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        const alpha = 0.18 * (1 - d / LINK_DIST)
        ctx.strokeStyle = `rgba(245,166,35,${alpha})`
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      for (const n of nodes) {
        ctx.fillStyle = 'rgba(245,166,35,0.8)'
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // data pulses along active edges
      if (!reduced) {
        if (pulses.length < 5 && pairsCache.length > 0 && Math.random() < 0.06) {
          const p = pairsCache[Math.floor(Math.random() * pairsCache.length)]!
          pulses.push({ a: p[0], b: p[1], t: 0, speed: 0.4 + Math.random() * 0.7 })
        }
        for (const p of pulses) {
          const a = nodes[p.a]
          const b = nodes[p.b]
          if (!a || !b) continue
          const x = a.x + (b.x - a.x) * p.t
          const y = a.y + (b.y - a.y) * p.t
          ctx.fillStyle = 'rgba(57,198,200,0.9)'
          ctx.beginPath()
          ctx.arc(x, y, 1.8, 0, Math.PI * 2)
          ctx.fill()
        }
        pulses = pulses.filter((p) => {
          p.t += p.speed * dt * 6
          return p.t <= 1
        })
      }
    }

    let last = performance.now()
    const loop = (now: number) => {
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (visible) draw(dt)
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
    })
    io.observe(canvas)
    const onVis = () => {
      if (document.hidden) visible = false
      else visible = true
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    if (!reduced) raf = requestAnimationFrame(loop)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
