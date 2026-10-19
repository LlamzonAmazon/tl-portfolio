import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { duration, eraseRatio, gsapEase } from '@/theme/motion'
import { invEase } from '@/theme/sequences'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const EDGES = ['t', 'r', 'b', 'l'] as const
type Edge = (typeof EDGES)[number]

interface Slice {
  delay: number
  duration: number
}

/**
 * Time slices for drawing the four edges as ONE continuous pen path whose
 * overall progress follows `ease` (same idea as lib/lines.ts `edges`, in
 * Framer's per-child delay/duration form).
 */
function slices(ease: string, total: number, reverse: boolean): Record<Edge, Slice> {
  const order = reverse ? [...EDGES].reverse() : [...EDGES]
  const out = {} as Record<Edge, Slice>
  order.forEach((e, i) => {
    const a = total * invEase(ease, i / 4)
    const b = total * invEase(ease, (i + 1) / 4)
    out[e] = { delay: a, duration: Math.max(0.001, b - a) }
  })
  return out
}

const IN = slices(gsapEase.ink, duration.base, false)
const OUT = slices(gsapEase.erase, duration.base * eraseRatio, true)

const vertical = (e: Edge) => e === 'r' || e === 'l'

const target = (e: Edge, v: 0 | 1, t: Slice) => {
  const transition = { ...t, ease: 'linear' as const }
  return vertical(e) ? { scaleY: v, transition } : { scaleX: v, transition }
}

const variants: Variants = {
  hidden: (e: Edge) => target(e, 0, OUT[e]),
  visible: (e: Edge) => target(e, 1, IN[e]),
}

/**
 * The canonical corner marks (FrameEdges' .frame-edge spans), driven by Framer:
 * a sheet frame DRAWN clockwise from top-left when its parent enters, and
 * retracted counter-clockwise when it exits (Framer variants: the parent
 * must use `hidden` / `visible` labels for initial/animate/exit). Timed on
 * the same window and ease as the panel's own ink-in, so the frame and the
 * sheet arrive as one motion. Sits on the parent's padding edge.
 */
export function DrawnFrame() {
  const reduced = usePrefersReducedMotion()
  // Reduced motion: the frame is simply there at full scale, nothing is drawn.
  if (reduced) {
    return (
      <>
        {EDGES.map((e) => (
          <span key={e} aria-hidden className={`frame-edge frame-edge--${e}`} />
        ))}
      </>
    )
  }
  return (
    <>
      {EDGES.map((e) => (
        <motion.span
          key={e}
          aria-hidden
          custom={e}
          variants={variants}
          className={`frame-edge frame-edge--${e}`}
        />
      ))}
    </>
  )
}
