import { forwardRef, useId, useImperativeHandle, useRef } from 'react'
import type { CSSProperties } from 'react'
import { flow } from '@/theme/motion'
import type { FlowTarget } from '@/lib/lines'

export interface FlowHandle extends FlowTarget {
  /** The marching line itself (a scene that measures its path writes `d` here and on the pen). */
  line: SVGPathElement | null
}

interface FlowPathProps {
  d?: string
  /** 1 marches with the path's direction, -1 against it. */
  dir?: 1 | -1
  /** Multiplier on flow.speed. */
  speed?: number
  /**
   * Undrawn start state for a timeline: dormant (display:none) with its
   * clip closed, until lib/lines.ts drawFlow renders and draws it. Static
   * (false) shows it drawn and marching.
   */
  animated?: boolean
  /** Mask region [x, y, w, h] in user units; it must cover the line (a figure passes its box). */
  region?: readonly [number, number, number, number]
}

/** Default mask region: generous, for a scene plane whose paths are measured at runtime. */
const OPEN_REGION = [-10000, -10000, 30000, 30000] as const

/**
 * A flow line (texture.css .ln-flow): a dashed graphite current that keeps
 * marching once drawn. The dash is the motion, so the pen is a clip: a
 * solid mask stroke along the same path, drawn on dashoffset like any line.
 * Shared by Drawing (a figure's declared flows) and the stage scenes.
 */
export const FlowPath = forwardRef<FlowHandle, FlowPathProps>(function FlowPath(
  { d, dir = 1, speed = 1, animated = false, region = OPEN_REGION },
  ref,
) {
  const id = `flow-${useId().replace(/:/g, '')}`
  const group = useRef<SVGGElement>(null)
  const pen = useRef<SVGPathElement>(null)
  const line = useRef<SVGPathElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return group.current
      },
      get pen() {
        return pen.current
      },
      get line() {
        return line.current
      },
    }),
    [],
  )

  const march = {
    '--flow-dur': `${(flow.period / (flow.speed * speed)).toFixed(3)}s`,
    '--flow-dir': dir < 0 ? 'reverse' : undefined,
  } as CSSProperties

  return (
    <g ref={group} className="flow" style={animated ? { display: 'none' } : undefined}>
      {/* The mask stroke is luminance only (white = visible), not a drawn colour. */}
      <mask id={id} maskUnits="userSpaceOnUse" x={region[0]} y={region[1]} width={region[2]} height={region[3]}>
        <path ref={pen} d={d} pathLength={1} stroke="#fff" strokeWidth={6} fill="none" style={animated ? { strokeDashoffset: 1 } : undefined} />
      </mask>
      <path ref={line} className="ln-flow" d={d} mask={`url(#${id})`} style={march} />
    </g>
  )
})
