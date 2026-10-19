import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import { nodePath } from '@/lib/lines'
import { polar } from '@/lib/draft/geometry'
import { schedule } from '@/lib/draft/schedule'
import type { DrawingHandle, DrawingRefs } from '@/lib/draft/choreo'
import type { Figure, Layer, Stroke } from '@/lib/draft/sketch'
import { WIPE_HIDDEN } from '@/components/hero/wipeConstants'
import { FlowPath } from '@/components/ui/FlowPath'
import type { SheetKey } from '@/theme/spectrum'

interface DrawingProps {
  figure: Figure
  /**
   * Undrawn start state for a timeline (lib/draft/choreo.ts). Static
   * (false, default) renders the finished plate: reduced motion, fallbacks,
   * anywhere no timeline drives it.
   */
  animated?: boolean
  /** Sheet key: sets --hue for this plate's keyed lines, nodes and labels. */
  sheet?: SheetKey
  /**
   * meet (default): the whole plate fits inside the box (a plate on a sheet).
   * slice: the plate covers the box and crops at its edges (a stage backdrop
   * whose geometry must hold a fixed point, e.g. a vanishing point on the
   * board origin).
   */
  fit?: 'meet' | 'slice'
  /**
   * ink (default): the plate's own weights. ghost: every role steps two
   * grades lighter (ink to H, datum to 2H, ...) for a plate set BEHIND type;
   * keyed marks keep their hue. See .drawing--ghost in texture.css.
   */
  tone?: 'ink' | 'ghost' | 'pale' | 'faint'
  /**
   * Letter the plate (its annotations and title). Off by default: the site
   * carries no decorative lettering, only the linework. The schedule is
   * built without the labels, so no time is reserved for them.
   */
  lettered?: boolean
  className?: string
  style?: CSSProperties
}

/** Pale is ghost with its darkest roles lifted further, so it carries the ghost class too. */
const TONE_CLASS: Record<NonNullable<DrawingProps['tone']>, string> = {
  ink: '',
  ghost: ' drawing--ghost',
  pale: ' drawing--ghost drawing--pale',
  faint: ' drawing--faint',
}

/** Paint order: light construction under heavy ink, marks and keys on top. */
const ORDER: Layer[] = ['hair', 'construct', 'hatch', 'dim', 'datum', 'ink', 'key', 'mark']
/** Flow lines paint between these: over construction and hatch, under datum and ink. */
const UNDER_FLOW = new Set<Layer>(['hair', 'construct', 'hatch', 'dim'])

/**
 * A drafted figure from the folio (lib/draft), rendered as SVG with every
 * stroke on its line role (.ln-*). Line weights stay true px at any render
 * size (--draw-k). The handle exposes the figure, its schedule and the
 * elements a timeline drives; see drawFigure / figureGuide / playFigure.
 */
export const Drawing = forwardRef<DrawingHandle, DrawingProps>(function Drawing(
  { figure: source, animated = false, sheet, fit = 'meet', tone = 'ink', lettered = false, className = '', style },
  ref,
) {
  const figure = useMemo(() => (lettered ? source : { ...source, labels: [] }), [source, lettered])
  const uid = useId().replace(/:/g, '')
  const svgRef = useRef<SVGSVGElement>(null)
  const sched = useMemo(() => schedule(figure), [figure])
  const refs = useRef<DrawingRefs>({ stroke: new Map(), arm: new Map(), node: new Map(), label: new Map(), flow: new Map() })

  useImperativeHandle(ref, () => ({ figure, schedule: sched, refs: refs.current }), [figure, sched])

  // Keep strokes at their token weight whatever the render scale.
  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const [, , bw, bh] = figure.box
    const pick = fit === 'slice' ? Math.max : Math.min
    const rescale = () => {
      const k = pick(svg.clientWidth / bw, svg.clientHeight / bh) || 1
      svg.style.setProperty('--draw-k', String(k))
    }
    rescale()
    const ro = new ResizeObserver(rescale)
    ro.observe(svg)
    return () => ro.disconnect()
  }, [figure, fit])

  const strokes = useMemo(() => {
    const all = figure.passes.flatMap((p) => p.strokes)
    return ORDER.flatMap((layer) => all.filter((s) => s.layer === layer))
  }, [figure])
  const flows = useMemo(() => strokes.filter((s) => s.flow), [strokes])
  // A flow's mask covers the box and a full box beyond it on every side: plates drawn
  // overflow-visible (a flight launched off the sheet, the run that reaches up into the
  // sheet above) put their currents outside their own box.
  const flowRegion = useMemo(() => {
    const [x, y, w, h] = figure.box
    return [x - w, y - h, w * 3, h * 3] as const
  }, [figure])

  // An off-screen plate pauses its flows in place (texture.css [data-offscreen]).
  const hasFlows = flows.length > 0
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !hasFlows) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) delete svg.dataset.offscreen
      else svg.dataset.offscreen = ''
    })
    io.observe(svg)
    return () => io.disconnect()
  }, [hasFlows])

  const undrawn: CSSProperties | undefined = animated ? { strokeDashoffset: 1 } : undefined
  const setStroke = (id: string) => (el: SVGPathElement | null) => {
    if (el) refs.current.stroke.set(id, el)
  }

  const renderStroke = (s: Stroke) => {
    // A replaced stroke is not inked: its flow line is the stroke.
    if (s.flow?.mode === 'replace') return null
    const color = s.color ? { stroke: s.color } : undefined
    if (!s.dashed) {
      return <path key={s.id} ref={setStroke(s.id)} className={`ln-${s.layer}`} d={s.d} pathLength={1} style={{ ...undrawn, ...color }} />
    }
    // Dashed: the dash pattern is the look (.ln-dashed, the --dash-construct tokens), so the pen is a solid stroke drawn in a mask.
    // The mask stroke is luminance only (white = visible), not a drawn colour.
    const [bx, by, bw, bh] = figure.box
    const mid = `${uid}-${s.id}`
    return (
      <g key={s.id}>
        <mask id={mid} maskUnits="userSpaceOnUse" x={bx} y={by} width={bw} height={bh}>
          <path ref={setStroke(s.id)} d={s.d} pathLength={1} stroke="#fff" strokeWidth={6} fill="none" style={undrawn} />
        </mask>
        <path className={`ln-${s.layer} ln-dashed`} d={s.d} mask={`url(#${mid})`} style={color} />
      </g>
    )
  }

  const [bx, by, bw, bh] = figure.box
  return (
    <svg
      ref={svgRef}
      aria-hidden
      data-sheet={sheet}
      className={`drawing${TONE_CLASS[tone]} ${className}`}
      viewBox={`${bx} ${by} ${bw} ${bh}`}
      preserveAspectRatio={`xMidYMid ${fit}`}
      fill="none"
      style={style}
    >
      {strokes.filter((s) => UNDER_FLOW.has(s.layer)).map(renderStroke)}

      {flows.map((s) => (
        <FlowPath
          key={`flow-${s.id}`}
          ref={(h) => {
            if (h) refs.current.flow.set(s.id, h)
          }}
          d={s.flow!.d}
          dir={s.flow!.dir}
          speed={s.flow!.speed}
          animated={animated}
          region={flowRegion}
        />
      ))}

      {strokes.filter((s) => !UNDER_FLOW.has(s.layer)).map(renderStroke)}

      {/* Compass arms: only exist while their arc is being swung. */}
      {animated &&
        strokes
          .filter((s) => s.arm)
          .map((s) => {
            const a = s.arm!
            const tip = polar(a.c, a.r, a.a0)
            return (
              <path
                key={`arm-${s.id}`}
                ref={(el) => {
                  if (el) refs.current.arm.set(s.id, el)
                }}
                className="ln-construct"
                d={`M${a.c[0]} ${a.c[1]} L${tip[0]} ${tip[1]}`}
                pathLength={1}
                style={{ strokeDashoffset: 1 }}
              />
            )
          })}

      {strokes.map((s) =>
        s.nodes.map((n, i) => (
          <path
            key={`${s.id}-n${i}`}
            ref={(el) => {
              const list = refs.current.node.get(s.id) ?? []
              list[i] = el
              refs.current.node.set(s.id, list)
            }}
            className={`ln-node${n.kind === 'key' ? ' ln-node--key' : n.kind === 'open' ? ' ln-node--open' : ''}`}
            d={nodePath(n.at[0], n.at[1], n.r)}
            style={{ ...(n.color ? { fill: n.color } : null), ...(animated ? null : { clipPath: 'none' }) }}
          />
        )),
      )}

      {figure.labels.map((l) => (
        <text
          key={l.id}
          ref={(el) => {
            if (el) refs.current.label.set(l.id, el)
          }}
          className={`ln-label${l.kind === 'key' ? ' ln-label--key' : l.kind === 'serif' ? ' ln-label--serif' : ''}`}
          x={l.at[0]}
          y={l.at[1]}
          fontSize={l.size}
          textAnchor={l.anchor}
          transform={l.rotate ? `rotate(${l.rotate} ${l.at[0]} ${l.at[1]})` : undefined}
          style={{ ...(l.color ? { fill: l.color } : null), ...(animated ? { clipPath: WIPE_HIDDEN } : null) }}
        >
          {l.text}
        </text>
      ))}
    </svg>
  )
})
