import { useLayoutEffect, useRef } from 'react'
import { usePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { Drawing } from '@/components/ui/Drawing'
import { drawFigure, type DrawingHandle } from '@/lib/draft/choreo'
import type { Figure } from '@/lib/draft/sketch'
import { duration, eraseRatio, gsapEase } from '@/theme/motion'
import { win } from '@/theme/sequences'
import type { SheetKey } from '@/theme/spectrum'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface ColophonProps {
  figure: Figure
  sheet?: SheetKey
}

/**
 * A plate that closes a detail sheet, like a printer's ornament at a
 * chapter's end. Drawn once the sheet has opened (after its corners), at
 * the figure's own pen speed; on close it retracts, last drawn first,
 * before the sheet is allowed to leave (Framer presence).
 */
export function Colophon({ figure, sheet }: ColophonProps) {
  const ref = useRef<DrawingHandle>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const reduced = usePrefersReducedMotion()
  const [isPresent, safeToRemove] = usePresence()

  useLayoutEffect(() => {
    const h = ref.current
    if (!h || reduced) return
    const dur = Math.min(4, h.schedule.freeDuration)
    const tl = gsap.timeline()
    drawFigure(tl, h, win(duration.base, dur, gsapEase.pen))
    tlRef.current = tl
    return () => {
      tl.kill()
    }
  }, [figure, reduced])

  useLayoutEffect(() => {
    if (isPresent) return
    const h = ref.current
    if (!h || reduced) {
      safeToRemove?.()
      return
    }
    tlRef.current?.kill()
    const out = gsap.timeline({ onComplete: () => safeToRemove?.() })
    drawFigure(out, h, win(0, duration.base * eraseRatio, gsapEase.erase), 'retract')
    return () => {
      out.kill()
    }
  }, [isPresent, safeToRemove, reduced])

  const [, , bw, bh] = figure.box
  return (
    <div className="colophon" aria-hidden style={{ ['--plate-aspect' as string]: String(bw / bh) }}>
      <Drawing ref={ref} figure={figure} animated={!reduced} sheet={sheet} />
    </div>
  )
}
