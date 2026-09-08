import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { CSSProperties } from 'react'

interface DraftingGridProps {
  className?: string
  /**
   * When true, the compass/perspective linework starts undrawn (dashoffset
   * at full length, nodes at scale 0) and exposes a ref handle so a parent
   * GSAP timeline can draw it in lockstep with foreground content — lines
   * extending, nodes plotting, exactly as the matching content reveals.
   * Static (false, default) everywhere else — HeroFallback, reduced motion,
   * any usage with no timeline to drive it — so the backdrop is never
   * silently invisible for users who don't get the pinned-scroll hero.
   */
  animated?: boolean
  /**
   * Which backdrop layer(s) to render. The pinned stage splits them: 'grid'
   * goes on the scaling zoom plane (with a caller-supplied `--grid-major`
   * override via `style`), 'lines' stays a non-scaling overlay so stroke
   * weights hold constant. 'both' (default) is the standalone/fallback form.
   */
  layer?: 'both' | 'grid' | 'lines'
  /** Merged onto the root wrapper — lets a caller override `--grid-major`. */
  style?: CSSProperties
}

export interface DraftingGridHandle {
  baseline: SVGLineElement | null
  compassOuter: SVGCircleElement | null
  protractorArc: SVGPathElement | null
  compassNodes: Array<SVGCircleElement | null>
  pillarSpine: SVGLineElement | null
  pillarLines: Array<SVGLineElement | null>
  pillarNodes: Array<SVGCircleElement | null>
}

const stroke = 'var(--color-sepia)'
/** Darker, heavier ink for the animated construction linework — reads as
 * pen-on-paper against the static sepia grid, rather than blending into it. */
const inkStroke = 'var(--color-ink-mid)'

/** Compass/baseline plotted nodes — shared between the static geometry and the node-ref list. */
const COMPASS_NODES: Array<[number, number, number]> = [
  [760, 280, 0.07],
  [900, 200, 0.055],
  [120, 880, 0.06],
  [420, 900, 0.045],
  [580, 470, 0.05],
]

/** A ruled datum line down the right edge, with one leader tick + plotted
 * node per hero pillar — extends downward across the pillars segment while
 * each tick/node fires exactly as its matching pillar wipes in. */
const SPINE_X = 560
const SPINE_Y: [number, number] = [400, 600]
const PILLAR_Y: [number, number, number] = [430, 500, 570]
const TICK_X_END = 620

/** Exact stroke lengths where the geometry allows it; a safe over-estimate for the elliptical arc. */
const LEN_BASELINE = Math.hypot(900 - 120, 200 - 880)
const LEN_COMPASS_OUTER = 2 * Math.PI * 190
const LEN_PROTRACTOR_ESTIMATE = 500
const LEN_SPINE = SPINE_Y[1] - SPINE_Y[0]
const LEN_TICK = TICK_X_END - SPINE_X

const poppedStyle: CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center', transform: 'scale(0)' }

/**
 * The signature backdrop: graph-paper grid + hand-plotted construction lines,
 * pulled from a Renaissance engineer's drafting vocabulary — a compass study
 * (drawn in with the intro) and a pillar timeline (drawn in with the hero's
 * pillar list). Pure SVG — no raster art — lightly roughened via an SVG
 * displacement filter so the linework reads as compass-and-pencil, not
 * vector-perfect. Both groups are timeline-driven (see `animated` above) and
 * drawn in ink-mid at 9–18% opacity so the pen line reads as it draws itself
 * in over the page.
 */
export const DraftingGrid = forwardRef<DraftingGridHandle, DraftingGridProps>(function DraftingGrid(
  { className = '', animated = false, layer = 'both', style },
  ref,
) {
  const baselineRef = useRef<SVGLineElement>(null)
  const compassOuterRef = useRef<SVGCircleElement>(null)
  const protractorArcRef = useRef<SVGPathElement>(null)
  const compassNodeRefs = useRef<Array<SVGCircleElement | null>>([])
  const pillarSpineRef = useRef<SVGLineElement>(null)
  const pillarLineRefs = useRef<Array<SVGLineElement | null>>([])
  const pillarNodeRefs = useRef<Array<SVGCircleElement | null>>([])

  useImperativeHandle(
    ref,
    () => ({
      baseline: baselineRef.current,
      compassOuter: compassOuterRef.current,
      protractorArc: protractorArcRef.current,
      compassNodes: compassNodeRefs.current,
      pillarSpine: pillarSpineRef.current,
      pillarLines: pillarLineRefs.current,
      pillarNodes: pillarNodeRefs.current,
    }),
    [],
  )

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={style}>
      {/* Graph paper — the pinned stage renders this on its scaling plane and
          supplies its own viewport-fixed mask wrapper, so the radial fade only
          applies here when this component owns both layers. */}
      {layer !== 'lines' && (
        <div className={`absolute inset-0 bg-grid-ruled opacity-70 ${layer === 'both' ? 'mask-fade-radial' : ''}`} />
      )}

      {/* Construction linework */}
      {layer !== 'grid' && (
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <filter id="roughen" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.011" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* Generic "trails off before completing" fade, reused per-path via opacity. */}
          <linearGradient id="fadeOut" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={stroke} stopOpacity="1" />
            <stop offset="55%" stopColor={stroke} stopOpacity="0.6" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
          {/* Same fade, in the heavier ink tone used by the animated linework. */}
          <linearGradient id="fadeOutInk" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={inkStroke} stopOpacity="1" />
            <stop offset="55%" stopColor={inkStroke} stopOpacity="0.6" />
            <stop offset="100%" stopColor={inkStroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Compass study (upper right) — draws in with the hero name, retracts as it exits.
            Heavier ink than the ambient groups below: this is the "pen" line, not the paper. */}
        <g stroke={inkStroke} filter="url(#roughen)">
          <circle
            ref={compassOuterRef}
            cx={760}
            cy={280}
            r={190}
            strokeWidth={1.2}
            opacity={0.16}
            strokeDasharray={animated ? LEN_COMPASS_OUTER : undefined}
            strokeDashoffset={animated ? LEN_COMPASS_OUTER : undefined}
          />
          <circle cx={760} cy={280} r={120} strokeWidth={1} opacity={0.12} strokeDasharray="4 6" />
          <line
            ref={baselineRef}
            x1={120}
            y1={880}
            x2={900}
            y2={200}
            strokeWidth={1.1}
            opacity={0.14}
            strokeDasharray={animated ? LEN_BASELINE : undefined}
            strokeDashoffset={animated ? LEN_BASELINE : undefined}
          />
          <path
            ref={protractorArcRef}
            d="M 80 620 A 260 260 0 0 1 420 900"
            strokeWidth={1.3}
            stroke="url(#fadeOutInk)"
            opacity={0.18}
            strokeDasharray={animated ? LEN_PROTRACTOR_ESTIMATE : undefined}
            strokeDashoffset={animated ? LEN_PROTRACTOR_ESTIMATE : undefined}
          />
        </g>

        {/* Plotted nodes — one per compass/baseline vertex. */}
        <g fill={inkStroke} filter="url(#roughen)">
          {COMPASS_NODES.map(([cx, cy, o], i) => (
            <circle
              key={`${cx}-${cy}`}
              ref={(el) => {
                compassNodeRefs.current[i] = el
              }}
              cx={cx}
              cy={cy}
              r={4.5}
              opacity={o * 2}
              style={animated ? poppedStyle : undefined}
            />
          ))}
        </g>

        {/* Pillar timeline (right edge) — a ruled datum line that extends
            downward across the whole pillars segment, with one leader tick +
            plotted node per pillar, drawn in lockstep with its text. */}
        <g stroke={inkStroke} filter="url(#roughen)">
          <line
            ref={pillarSpineRef}
            x1={SPINE_X}
            y1={SPINE_Y[0]}
            x2={SPINE_X}
            y2={SPINE_Y[1]}
            strokeWidth={1}
            opacity={0.15}
            strokeDasharray={animated ? LEN_SPINE : undefined}
            strokeDashoffset={animated ? LEN_SPINE : undefined}
          />
          {PILLAR_Y.map((y, i) => (
            <line
              key={y}
              ref={(el) => {
                pillarLineRefs.current[i] = el
              }}
              x1={SPINE_X}
              y1={y}
              x2={TICK_X_END}
              y2={y}
              strokeWidth={0.9}
              opacity={0.17}
              strokeDasharray={animated ? LEN_TICK : undefined}
              strokeDashoffset={animated ? LEN_TICK : undefined}
            />
          ))}
        </g>
        <g fill={inkStroke} filter="url(#roughen)">
          {PILLAR_Y.map((y, i) => (
            <circle
              key={`node-${y}`}
              ref={(el) => {
                pillarNodeRefs.current[i] = el
              }}
              cx={TICK_X_END}
              cy={y}
              r={4}
              opacity={0.18}
              style={animated ? poppedStyle : undefined}
            />
          ))}
        </g>
      </svg>
      )}
    </div>
  )
})
