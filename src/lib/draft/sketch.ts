/**
 * The figure model: a drafted drawing as ordered PASSES of STROKES.
 *
 * A figure is not a picture, it is a procedure. Each pass is one tool at
 * one weight (2H compass construction, the inked figure, H hatching, keyed
 * annotation), and inside a pass the strokes are listed in the order a
 * draughtsman would make them. The choreographer (schedule.ts) turns that
 * order into time; the Drawing component turns it into SVG. Nothing here
 * knows about either.
 *
 *   const s = sketch('arch', [0, 0, 600, 600])
 *   s.pass('relay', 'springing')        // a new pass and how its strokes chain
 *   s.line(a, b, 'construct', { over: 12, nodes: ['start', 'end'] })
 *   s.arc(c, r, a0, a1, 'ink', { arm: true })   // the compass arm swings it
 *   s.label([x, y], 'A', { kind: 'key' })       // wipes in when that arc lands
 *   const fig = s.build()
 */

import { arc, lerp, polar, segment, TOP, TAU, type PathShape, type Vec } from './geometry'

/** Line roles (texture.css .ln-*), lightest to heaviest. */
export type Layer = 'hair' | 'construct' | 'hatch' | 'dim' | 'datum' | 'key' | 'ink' | 'mark'

/**
 * How a pass's strokes chain in time:
 *   relay     one pen: each stroke starts when the last ends (a lift if they
 *             do not touch), so connected strokes read as one continuous line
 *   fan       a family (radials, orthogonals, rays): each starts a fixed
 *             fraction into the previous one, a cascade from the first
 *   together  every stroke at once (symmetric pairs, mirrored halves)
 */
export type PassMode = 'relay' | 'fan' | 'together'

export interface FigNode {
  at: Vec
  /** Position along the parent stroke (0 = pen start, 1 = pen end): revealed when the tip arrives. */
  f: number
  r: number
  kind: 'ink' | 'key' | 'open'
  /** Explicit fill (a CSS value, e.g. a spectrum var): overrides the kind's colour. */
  color?: string
}

export interface Arm {
  c: Vec
  r: number
  a0: number
  a1: number
}

export interface Stroke extends PathShape {
  id: string
  layer: Layer
  /** Dashed construction: revealed through a drawn mask, since dashoffset is the pen. */
  dashed?: boolean
  /** Explicit stroke colour (a CSS value, e.g. a spectrum var). Only the prism uses it. */
  color?: string
  nodes: FigNode[]
  /** Compass arcs: an arm opens from the centre, swings with the pen, then folds back. */
  arm?: Arm
}

export interface Label {
  id: string
  at: Vec
  text: string
  /** Font size in figure units. */
  size: number
  anchor: 'start' | 'middle' | 'end'
  kind: 'label' | 'key' | 'serif'
  /** Stroke id this label waits for: it wipes in once that stroke lands. */
  after: string
  rotate?: number
  /** Explicit fill (a CSS value). Only the prism's band letters use it. */
  color?: string
}

export interface Pass {
  mode: PassMode
  name: string
  strokes: Stroke[]
  /** How far through THIS pass the next one begins (default `pen.passOverlap`). 1 = the next waits for it to land. */
  overlap?: number
}

export interface Figure {
  id: string
  /** viewBox: [x, y, w, h] in figure units. */
  box: readonly [number, number, number, number]
  passes: Pass[]
  labels: Label[]
}

type NodeAt = 'start' | 'end' | number | { at: Vec; f: number; color?: string }

export interface StrokeOpts {
  dashed?: boolean
  color?: string
  nodes?: NodeAt[]
  nodeKind?: FigNode['kind']
  /** Fill for every node of this stroke (a CSS value). */
  nodeColor?: string
  nodeR?: number
}

export interface LabelOpts {
  size?: number
  anchor?: Label['anchor']
  kind?: Label['kind']
  after?: string
  rotate?: number
  color?: string
}

const NODE_R = 3

export function sketch(id: string, box: Figure['box']) {
  const passes: Pass[] = []
  const labels: Label[] = []
  let seq = 0
  let last = ''

  const current = () => {
    if (!passes.length) passes.push({ mode: 'relay', name: 'main', strokes: [] })
    return passes[passes.length - 1]
  }

  const add = (shape: PathShape, layer: Layer, opts: StrokeOpts, pointAt?: (f: number) => Vec, arm?: Arm) => {
    const sid = `${id}-${seq++}`
    const nodes: FigNode[] = (opts.nodes ?? []).map((spec) => {
      const kind = opts.nodeKind ?? 'ink'
      const r = opts.nodeR ?? NODE_R
      const color = opts.nodeColor
      if (spec === 'start') return { at: shape.a, f: 0, r, kind, color }
      if (spec === 'end') return { at: shape.b, f: 1, r, kind, color }
      if (typeof spec === 'number') {
        if (!pointAt) throw new Error(`${sid}: fractional nodes need a line or arc`)
        return { at: pointAt(spec), f: spec, r, kind, color }
      }
      return { color, ...spec, r, kind }
    })
    current().strokes.push({ ...shape, id: sid, layer, dashed: opts.dashed, color: opts.color, nodes, arm })
    last = sid
    return sid
  }

  const api = {
    /** Start a new pass. Strokes added after this belong to it. */
    pass(mode: PassMode = 'relay', name = `p${passes.length}`, overlap?: number) {
      passes.push({ mode, name, strokes: [], overlap })
      return api
    },

    /** Straight line. `over` runs it past both ends (construction overshoot). */
    line(a: Vec, b: Vec, layer: Layer, opts: StrokeOpts & { over?: number } = {}) {
      const shape = segment(a, b, opts.over ?? 0)
      return add(shape, layer, opts, (f) => lerp(shape.a, shape.b, f))
    },

    /** Arc about c from a0 to a1 (clockwise when a1 > a0). `arm` swings a compass arm with it. */
    arc(c: Vec, r: number, a0: number, a1: number, layer: Layer, opts: StrokeOpts & { arm?: boolean } = {}) {
      const shape = arc(c, r, a0, a1)
      return add(shape, layer, opts, (f) => polar(c, r, a0 + (a1 - a0) * f), opts.arm ? { c, r, a0, a1 } : undefined)
    },

    /** Full circle from `from` (default 12 o'clock), clockwise. */
    circle(c: Vec, r: number, layer: Layer, opts: StrokeOpts & { from?: number; arm?: boolean } = {}) {
      const a0 = opts.from ?? TOP
      return api.arc(c, r, a0, a0 + TAU, layer, opts)
    },

    /** Any prepared shape (curve, polyline, cubic). Nodes: 'start' / 'end' / explicit. */
    path(shape: PathShape, layer: Layer, opts: StrokeOpts = {}) {
      return add(shape, layer, opts)
    },

    /** Annotation text, wiped in once `after` (default: the last stroke) lands. */
    label(at: Vec, text: string, opts: LabelOpts = {}) {
      labels.push({
        id: `${id}-l${labels.length}`,
        at,
        text,
        size: opts.size ?? 9,
        anchor: opts.anchor ?? 'start',
        kind: opts.kind ?? 'label',
        after: opts.after ?? last,
        rotate: opts.rotate,
        color: opts.color,
      })
      return api
    },

    /** Id of the most recent stroke (to hang a label on something earlier). */
    get last() {
      return last
    },

    build(): Figure {
      return { id, box, passes: passes.filter((p) => p.strokes.length), labels }
    },
  }
  return api
}

export type Sketch = ReturnType<typeof sketch>

/** Every stroke of a figure, in pass order. */
export const strokesOf = (fig: Figure) => fig.passes.flatMap((p) => p.strokes)
