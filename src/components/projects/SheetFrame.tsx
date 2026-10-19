import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { FRAME_INSET, readMarkOver, rectPathFrom } from '@/lib/lines'

interface SheetFrameProps {
  /** Placeholder sheets: a lighter frame so they recede. */
  muted?: boolean
  /**
   * Fallback (unpinned) path: the frame path drawn clockwise from top-left by
   * Framer on the parent's variants. Default: an empty path + anchor node
   * whose `d` the stage scene writes (rectPathFrom), so the frame continues
   * from wherever that sheet's construction line lands.
   */
  variants?: Variants
}

/**
 * A sheet's registration corners as ONE vector pen path (pathLength 1), living
 * inside the sheet so the hover lift carries it. Same marks as FrameEdges
 * (the canonical corner component): the svg is the sheet's box grown by
 * --mark-over, the path overshoots each corner by it, and .sheet-frame masks
 * the result to --mark-arm at each corner, so hover grows these arms with the
 * CSS ones. Undrawn until a timeline draws it.
 */
export function SheetFrame({ muted = false, variants }: SheetFrameProps) {
  const cls = `ln-frame${muted ? ' ln-frame--muted' : ''}`
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  // Fallback path: follow the sheet's size (the stage scene does this for the pinned path).
  useLayoutEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    if (!variants || !svg || !path) return
    const fit = () => {
      const over = readMarkOver()
      const w = svg.clientWidth - 2 * over
      const h = svg.clientHeight - 2 * over
      path.setAttribute('d', rectPathFrom(w, h, FRAME_INSET, FRAME_INSET, FRAME_INSET, over))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(svg)
    return () => ro.disconnect()
  }, [variants])

  return (
    <svg ref={svgRef} aria-hidden className="sheet-frame" fill="none">
      <g className="sheet-frame__paths">
        {variants ? (
          <motion.path ref={pathRef} className={cls} pathLength={1} variants={variants} />
        ) : (
          <>
            <path className={`sheet-frame__path ${cls}`} pathLength={1} style={{ strokeDashoffset: 1 }} />
            <path className="sheet-frame__node ln-node" />
          </>
        )}
      </g>
    </svg>
  )
}
