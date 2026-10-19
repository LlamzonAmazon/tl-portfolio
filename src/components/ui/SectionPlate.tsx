import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Drawing } from '@/components/ui/Drawing'
import { playFigure, type DrawingHandle } from '@/lib/draft/choreo'
import type { Figure } from '@/lib/draft/sketch'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface SectionPlateProps {
  figure: Figure
  /** Plate width relative to its section. Over 100% bleeds past the sides (the crop cuts it there). */
  width: string
  /** Cap on the width (CSS length). Defaults to 72rem. */
  maxWidth?: string
  /** Centre of the plate, as a fraction of the section (CSS left / top). A y near 0% puts it between this section and the one before. */
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
 * scrolls into view; static (finished) under reduced motion. It may draw
 * above its section's top edge, never past its sides or bottom. See
 * .section-plate-crop in texture.css.
 */
export function SectionPlate({ figure, width, maxWidth, x, y, play = true, tone = 'ghost' }: SectionPlateProps) {
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
    '--plate-max': maxWidth,
    '--plate-x': x,
    '--plate-y': y,
    '--plate-aspect': String(bw / bh),
  } as CSSProperties

  return (
    <div aria-hidden className="section-plate-crop">
      <div className="section-plate-frame">
        <div ref={hostRef} className="section-plate" style={style}>
          <Drawing ref={ref} figure={figure} animated={!reduced} tone={tone} />
        </div>
      </div>
    </div>
  )
}
