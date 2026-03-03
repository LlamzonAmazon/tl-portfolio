import { useRef, useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const DOT_COUNT      = 110
const CONNECT_DIST   = 165
const REPEL_DIST     = 200
const FADE_IN_MS     = 1200
// ~22 accent dots out of 110 — split across red, purple, navy
const ACCENT_RATIO   = 0.20
// Base speed range: ±0.15–0.3
const SPEED_MIN      = 0.15
const SPEED_RANGE    = 0.15

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

// Accent colors: red ⅓, purple ⅓, navy ⅓ of the accent pool
const ACCENT_COLORS = [
  'rgba(192, 57,  79,  0.62)',  // velvet red
  'rgba(123, 63,  171, 0.58)',  // velvet purple
  'rgba( 30, 90,  160, 0.55)',  // deep navy blue
]

function makeDot(w, h) {
  const angle  = Math.random() * Math.PI * 2
  const speed  = SPEED_MIN + Math.random() * SPEED_RANGE
  const rand   = Math.random()

  let accentColor = null
  if (rand < ACCENT_RATIO) {
    // Distribute evenly across the three palette colors
    const bucket = Math.floor((rand / ACCENT_RATIO) * ACCENT_COLORS.length)
    accentColor  = ACCENT_COLORS[Math.min(bucket, ACCENT_COLORS.length - 1)]
  }

  return {
    x:          Math.random() * w,
    y:          Math.random() * h,
    vx:         Math.cos(angle) * speed,
    vy:         Math.sin(angle) * speed,
    baseVx:     Math.cos(angle) * speed,
    baseVy:     Math.sin(angle) * speed,
    r:          1 + Math.random() * 0.6,      // 1–1.6 px
    opacity:    0.30 + Math.random() * 0.20,  // 30–50%
    accentColor,
  }
}

export const ConstellationCanvas = ({ containerRef }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx   = canvas.getContext('2d')
    let animId  = null
    let startTs = null

    const mouse           = { x: -9999, y: -9999 }
    const scrollProgress  = { value: 0 }

    // ── Sizing ───────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── Particles ────────────────────────────────────────────────
    let dots = Array.from({ length: DOT_COUNT }, () =>
      makeDot(canvas.width, canvas.height)
    )

    // ── Scroll tracking via GSAP ScrollTrigger ───────────────────
    let st = null
    if (containerRef?.current) {
      st = ScrollTrigger.create({
        trigger: containerRef.current,
        start:   'top top',
        end:     'bottom top',
        onUpdate: (self) => {
          scrollProgress.value = self.progress
        },
      })
    }

    // ── Mouse ────────────────────────────────────────────────────
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onMouseLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    // ── Animation loop ───────────────────────────────────────────
    const frame = (ts) => {
      if (!startTs) startTs = ts

      const fadeIn  = easeInOut(Math.min((ts - startTs) / FADE_IN_MS, 1))
      const scrollP = scrollProgress.value

      // Canvas global opacity: materialise on load, dissolve on scroll
      canvas.style.opacity = fadeIn * (1 - scrollP)

      // Dots slow to a near-stop as section scrolls out
      const velMult = 1 - scrollP * 0.92

      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      // ── Update positions ──────────────────────────────────────
      for (const d of dots) {
        const dx   = d.x - mouse.x
        const dy   = d.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < REPEL_DIST && dist > 0) {
          // Gentle repulsion — push away, don't launch
          const strength = (1 - dist / REPEL_DIST) * 0.07
          d.vx += (dx / dist) * strength
          d.vy += (dy / dist) * strength

          // Clamp speed so repulsion stays subtle
          const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy)
          if (spd > 0.75) {
            d.vx = (d.vx / spd) * 0.75
            d.vy = (d.vy / spd) * 0.75
          }
        } else {
          // Drift velocity back toward natural base speed
          d.vx += (d.baseVx - d.vx) * 0.008
          d.vy += (d.baseVy - d.vy) * 0.008
        }

        d.x += d.vx * velMult
        d.y += d.vy * velMult

        // Wrap at edges
        if (d.x < 0)  d.x += W
        if (d.x > W)  d.x -= W
        if (d.y < 0)  d.y += H
        if (d.y > H)  d.y -= H
      }

      // ── Draw connections ──────────────────────────────────────
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a  = dots[i]
          const b  = dots[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECT_DIST) {
            const t     = 1 - d / CONNECT_DIST
            const alpha = t * 0.22  // 0–22% opacity
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(245,240,235,${alpha.toFixed(3)})`
            ctx.lineWidth   = 0.4 + t * 0.3  // 0.4–0.7 px
            ctx.stroke()
          }
        }
      }

      // ── Draw dots ─────────────────────────────────────────────
      for (const d of dots) {
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = d.accentColor
          ? d.accentColor
          : `rgba(245,240,235,${d.opacity.toFixed(3)})`
        ctx.fill()
      }

      animId = requestAnimationFrame(frame)
    }

    animId = requestAnimationFrame(frame)

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      st?.kill()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [containerRef])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        zIndex:        0,
        pointerEvents: 'none',
        opacity:       0,  // JS will drive this
      }}
    />
  )
}
