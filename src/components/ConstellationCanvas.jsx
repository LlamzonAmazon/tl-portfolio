import { useRef, useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Mobile reference baseline (~375x667)
const MOBILE_REFERENCE_AREA = 375 * 667
const BASE_DOT_COUNT        = 110
const BASE_CONNECT_DIST     = 165
const BASE_REPEL_DIST       = 200
const MAX_DOT_COUNT         = 320

const FADE_IN_MS  = 1200
const ACCENT_RATIO = 0.20
const SPEED_MIN   = 0.15
const SPEED_RANGE = 0.15

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

const ACCENT_COLORS = [
  'rgba(192, 57,  79,  1)',
  'rgba(123, 63,  171, 1)',
  'rgba( 30, 90,  160, 1)',
]

function scaledParams(w, h) {
  const area      = w * h
  const ratio     = area / MOBILE_REFERENCE_AREA
  const dotCount  = Math.min(MAX_DOT_COUNT, Math.round(BASE_DOT_COUNT * Math.pow(ratio, 0.42)))
  const distScale = Math.pow(ratio, 0.25)
  const connectDist = Math.round(BASE_CONNECT_DIST * distScale)
  const repelDist   = Math.round(BASE_REPEL_DIST   * distScale)
  return { dotCount, connectDist, repelDist }
}

function makeDot(w, h) {
  const angle = Math.random() * Math.PI * 2
  const speed = SPEED_MIN + Math.random() * SPEED_RANGE
  const rand  = Math.random()

  let accentColor = null
  if (rand < ACCENT_RATIO) {
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
    r:          1 + Math.random() * 0.6,
    opacity:    0.30 + Math.random() * 0.20,
    accentColor,
  }
}

export const ConstellationCanvas = ({ containerRef }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx  = canvas.getContext('2d')
    let animId = null
    let startTs = null

    const mouse          = { x: -9999, y: -9999 }
    const scrollProgress = { value: 0 }

    // Mutable params updated on every resize
    let dots        = []
    let connectDist = BASE_CONNECT_DIST
    let repelDist   = BASE_REPEL_DIST

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      const params = scaledParams(canvas.width, canvas.height)
      connectDist  = params.connectDist
      repelDist    = params.repelDist

      // Rebuild dots to match the new target count, preserving existing ones
      const target = params.dotCount
      if (dots.length < target) {
        const extra = target - dots.length
        for (let i = 0; i < extra; i++) {
          dots.push(makeDot(canvas.width, canvas.height))
        }
      } else if (dots.length > target) {
        dots = dots.slice(0, target)
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

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

    const frame = (ts) => {
      if (!startTs) startTs = ts

      const fadeIn  = easeInOut(Math.min((ts - startTs) / FADE_IN_MS, 1))
      const scrollP = scrollProgress.value

      canvas.style.opacity = fadeIn * (1 - scrollP)

      const velMult = 1 - scrollP * 0.92

      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      for (const d of dots) {
        const dx   = d.x - mouse.x
        const dy   = d.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < repelDist && dist > 0) {
          const strength = (1 - dist / repelDist) * 0.07
          d.vx += (dx / dist) * strength
          d.vy += (dy / dist) * strength

          const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy)
          if (spd > 0.75) {
            d.vx = (d.vx / spd) * 0.75
            d.vy = (d.vy / spd) * 0.75
          }
        } else {
          d.vx += (d.baseVx - d.vx) * 0.008
          d.vy += (d.baseVy - d.vy) * 0.008
        }

        d.x += d.vx * velMult
        d.y += d.vy * velMult

        if (d.x < 0)  d.x += W
        if (d.x > W)  d.x -= W
        if (d.y < 0)  d.y += H
        if (d.y > H)  d.y -= H
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a  = dots[i]
          const b  = dots[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < connectDist) {
            const t     = 1 - d / connectDist
            const alpha = t * 0.22
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(245,240,235,${alpha.toFixed(3)})`
            ctx.lineWidth   = 0.4 + t * 0.3
            ctx.stroke()
          }
        }
      }

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
        opacity:       0,
      }}
    />
  )
}
