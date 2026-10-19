import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Drawing } from '@/components/ui/Drawing'
import { playFigure, type DrawingHandle } from '@/lib/draft/choreo'
import type { Figure } from '@/lib/draft/sketch'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface SectionPlateProps {
  figure: Figure
  /** Plate width relative to its section. Over 100% bleeds past the edges (the section crops it). */
  width: string
  /** Centre of the plate, as a fraction of the section (CSS left / top). */
  x: string
  y: string
  /** Gate for the first draw (e.g. the hero waits for the preloader). Defaults to true. */
  play?: boolean
  /** Line tone: ghost (default), pale (dark lines lifted) or faint (wholly grey), for a plate that must sit very quietly behind type. */
  tone?: 'ghost' | 'pale' | 'faint'
}

/** Longest a section plate takes to draw, in seconds; long figures speed up to fit. */
const MAX_DRAW = 6

/**
 * One oversized ghost plate behind a document-flow section (mobile, touch,
 * reduced motion): the scale contrast the pinned stage gets from its
 * camera. Drawn once, at the figure's own pen pacing, when the section
 * scrolls into view; static (finished) under reduced motion. See
 * .section-plate in texture.css.
 */
export function SectionPlate({ figure, width, x, y, play = true, tone = 'ghost' }: SectionPlateProps) {
  const ref = useRef<DrawingHandle>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  useLayoutEffect(() => {
    const h = ref.current
    const host = hostRef.current
    if (reduced || !play || !h || !host) return
    const tl = playFigure(h, { paused: true, duration: Math.min(MAX_DRAW, h.schedule.freeDuration) })
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        tl.play()
        io.disconnect()
      },
      { threshold: 0.15 },
    )
    io.observe(host)
    return () => {
      io.disconnect()
      tl.kill()
    }
  }, [figure, reduced, play])

  const [, , bw, bh] = figure.box
  const style = {
    '--plate-w': width,
    '--plate-x': x,
    '--plate-y': y,
    '--plate-aspect': String(bw / bh),
  } as CSSProperties

  return (
    <div ref={hostRef} aria-hidden className="section-plate" style={style}>
      <Drawing ref={ref} figure={figure} animated={!reduced} tone={tone} />
    </div>
  )
}
