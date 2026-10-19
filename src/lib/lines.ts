/**
 * Line tween helpers. Every one takes a Window (theme/sequences.ts) instead
 * of its own duration/ease, so a line can only ever run on its partner's
 * clock.
 *
 * pathLength="1" contract: every drawable SVG path declares pathLength="1"
 * (dasharray 1 comes from the `[pathLength]` rule in texture.css), so:
 *   draw     dashoffset 1 -> 0   pen leaves the anchor
 *   retract  dashoffset 0 -> 1   pen returns to the anchor
 *   pass     dashoffset 0 -> -1  line exits forward (rules, underlines)
 * regardless of the path's real length. No getTotalLength, no estimates.
 */

import { gsap } from 'gsap'
import { invEase, type Window } from '@/theme/sequences'

type Targets = gsap.TweenTarget
const IR = { immediateRender: false } as const

export const draw = (tl: gsap.core.Timeline, el: Targets, w: Window) =>
  tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: w.dur, ease: w.ease, ...IR }, w.at)

export const retract = (tl: gsap.core.Timeline, el: Targets, w: Window) =>
  tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: 1, duration: w.dur, ease: w.ease, ...IR }, w.at)

export const pass = (tl: gsap.core.Timeline, el: Targets, w: Window) =>
  tl.fromTo(el, { strokeDashoffset: 0 }, { strokeDashoffset: -1, duration: w.dur, ease: w.ease, ...IR }, w.at)

/** Node (plotted dot) radius in SVG user units. */
export const NODE_R = 4.5

/** A node: a filled disc. It is revealed by clip (see nodesAlong), never popped. */
export function nodePath(cx: number, cy: number, r = NODE_R): string {
  return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx} ${cy + r} A${r} ${r} 0 1 1 ${cx} ${cy - r}Z`
}

/** Full circle path starting at 12 o'clock, clockwise (compass convention). */
export function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx} ${cy + r} A${r} ${r} 0 1 1 ${cx} ${cy - r}`
}

/** Ellipse path starting at 12 o'clock, clockwise (same convention as circlePath). */
export function ellipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx} ${cy - ry} A${rx} ${ry} 0 1 1 ${cx} ${cy + ry} A${rx} ${ry} 0 1 1 ${cx} ${cy - ry}`
}

/** Half the frame stroke: a frame path sits on its stroke's centre line, this far inside the sheet's box. */
export const FRAME_INSET = 0.75

/**
 * How far a registration corner overshoots the sheet's corner, in px: the
 * --mark-over token, read once. The CSS corners (.frame-edge) and the SVG pen
 * frame (rectPathFrom) take the same value, so both draw the same marks.
 */
let markOver: number | null = null
export function readMarkOver(): number {
  if (markOver === null) {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mark-over'))
    markOver = Number.isFinite(v) ? v : 6
  }
  return markOver
}

/**
 * A closed rect (0..w, 0..h, inset by `i`) drawn as ONE pen path that starts
 * at border point (ax, ay) and runs clockwise back to it, so a sheet's frame
 * can continue from wherever its construction line landed. At each corner the
 * pen overshoots both edges by `over` (and returns), leaving the crossed
 * registration mark of the board's corner language; masked to its corners
 * (.sheet-frame) that is the whole frame.
 */
export function rectPathFrom(w: number, h: number, ax: number, ay: number, i = 0, over = readMarkOver()): string {
  const corners: Array<[number, number]> = [[i, i], [w - i, i], [w - i, h - i], [i, h - i]]
  const e = 0.5
  // The edge the anchor sits on, in clockwise order; corner k is where edge k-1 ends.
  const edge = ay <= i + e && ax < w - i - e ? 0 : ax >= w - i - e && ay < h - i - e ? 1 : ay >= h - i - e && ax > i + e ? 2 : 3
  const dir = (a: [number, number], b: [number, number]) => [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])]
  const pts = [0, 1, 2, 3].map((k) => {
    const c = (edge + 1 + k) % 4
    const [x, y] = corners[c]
    const [ix, iy] = dir(corners[(c + 3) % 4], corners[c]) // the way the pen arrives
    const [ox, oy] = dir(corners[c], corners[(c + 1) % 4]) // the way it leaves
    const stubs = over > 0 ? ` L${x + ix * over} ${y + iy * over} L${x} ${y} L${x - ox * over} ${y - oy * over} L${x} ${y}` : ''
    return `L${x} ${y}${stubs}`
  })
  return `M${ax} ${ay} ${pts.join(' ')} L${ax} ${ay}`
}

export interface NodeOnLine {
  el: SVGPathElement | null
  /** Where the node sits along its parent line, 0 (anchor) to 1 (end). */
  f: number
}

/**
 * Node clip states: a node is revealed top to bottom and cleared top to
 * bottom, over long enough to read as motion (pen.node), never popping.
 */
export const NODE_HIDDEN = 'inset(0% 0% 100% 0%)'
const NODE_SHOWN = 'inset(0% 0% 0% 0%)'
const NODE_GONE = 'inset(100% 0% 0% 0%)'

/**
 * Nodes along a line drawn on window `w`: each is revealed (clip, top to
 * bottom) the moment the pen tip reaches it; on retract, it clears the same
 * way the moment the returning tip leaves it. `nd` is the reveal's
 * own length, in the timeline's units.
 */
export function nodesAlong(
  tl: gsap.core.Timeline,
  nodes: NodeOnLine[],
  w: Window,
  nd: number,
  mode: 'draw' | 'retract' = 'draw',
) {
  for (const { el, f } of nodes) {
    if (!el) continue
    if (mode === 'draw') {
      // Starts exactly when the tip arrives (may run past the window's end).
      const reach = w.at + w.dur * invEase(w.ease, f)
      tl.fromTo(el, { clipPath: NODE_HIDDEN }, { clipPath: NODE_SHOWN, duration: nd, ease: 'none', ...IR }, reach)
    } else {
      const pastAt = w.at + w.dur * invEase(w.ease, 1 - f)
      tl.fromTo(el, { clipPath: NODE_SHOWN }, { clipPath: NODE_GONE, duration: nd, ease: 'none', ...IR }, pastAt)
    }
  }
}

/**
 * Short lines hung along a parent line (leaders): each is drawn (dashoffset)
 * the moment the parent's pen tip reaches its foot. `nd` is its draw time.
 */
export function linesAlong(tl: gsap.core.Timeline, lines: NodeOnLine[], w: Window, nd: number) {
  for (const { el, f } of lines) {
    if (!el) continue
    const reach = w.at + w.dur * invEase(w.ease, f)
    const at = Math.max(w.at, Math.min(reach, w.at + w.dur - nd))
    tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: nd, ease: 'none', ...IR }, at)
  }
}

const VERTICAL = /(--r|--l|--cd)\b/

const scaleProp = (e: HTMLElement) => (VERTICAL.test(e.className) ? 'scaleY' : 'scaleX')

/** Collapse HTML edge spans to their undrawn state. */
export function setEdgesHidden(els: Array<HTMLElement | null>) {
  for (const e of els) if (e) gsap.set(e, { [scaleProp(e)]: 0 })
}

/**
 * HTML edge spans (frames, title block rules) drawn as ONE continuous pen
 * path over `w`: each edge gets the slice of time in which the eased
 * progress crosses its share of the path. Retract walks the path backwards.
 * Edge classes ending in --r / --l / --cd scale on Y, the rest on X; each
 * span's transform-origin (in CSS) is its pen's starting point.
 */
export function edges(
  tl: gsap.core.Timeline,
  els: Array<HTMLElement | null>,
  w: Window,
  mode: 'draw' | 'retract' = 'draw',
) {
  const list = (mode === 'draw' ? els : [...els].reverse()).filter((e): e is HTMLElement => e !== null)
  const n = list.length
  list.forEach((e, i) => {
    const a = w.at + w.dur * invEase(w.ease, i / n)
    const b = w.at + w.dur * invEase(w.ease, (i + 1) / n)
    const p = scaleProp(e)
    tl.fromTo(
      e,
      { [p]: mode === 'draw' ? 0 : 1 },
      { [p]: mode === 'draw' ? 1 : 0, duration: Math.max(0.001, b - a), ease: 'none', ...IR },
      a,
    )
  })
}
