import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Drawing } from '@/components/ui/Drawing'
import type { DrawingHandle } from '@/lib/draft/choreo'
import { crosshair } from '@/lib/draft/figures/furniture'

export interface StageFurnitureHandle {
  /** Registration crosshairs, clockwise from top-left. */
  crosshairs: () => Array<DrawingHandle | null>
}

const CROSS = crosshair()
/** Three corners carry a crosshair; the title block holds the fourth (bottom-right). */
const CORNERS: CSSProperties[] = [
  { top: 4, left: 4 },
  { top: 4, right: 4 },
  { bottom: 4, left: 4 },
]

/**
 * Instrumenta on the stage itself: registration crosshairs pinned to the
 * viewport's corners for the whole board. Drawn once, with the title
 * block, at the end of the hero intro (sequences/hero.ts).
 */
export const StageFurniture = forwardRef<StageFurnitureHandle>(function StageFurniture(_props, ref) {
  const crossRefs = useRef<Array<DrawingHandle | null>>([])
  useImperativeHandle(ref, () => ({ crosshairs: () => crossRefs.current }), [])
  return (
    <div aria-hidden className="stage-furniture">
      {CORNERS.map((pos, i) => (
        <div key={i} className="stage-plate" style={{ ...pos, width: 40, height: 40 }}>
          <Drawing
            ref={(h) => {
              crossRefs.current[i] = h
            }}
            figure={CROSS}
            animated
          />
        </div>
      ))}
    </div>
  )
})
