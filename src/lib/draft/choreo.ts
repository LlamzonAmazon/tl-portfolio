/**
 * Lays a figure's schedule onto a GSAP timeline, inside ONE window.
 *
 * This is the bridge between the folio and the line sync contract
 * (theme/sequences.ts): a drawing is a Guide like any other line, so it
 * only ever runs on its foreground partner's clock. Use `figureGuide` to
 * nest one under a stage step, or `playFigure` where nothing is scrubbed
 * (the specimen, a modal, a hover study).
 *
 *   draw     strokes in schedule order; nodes land as the pen passes;
 *            compass arms open, swing with their arc, fold back; labels
 *            wipe in once their stroke lands
 *   retract  the exact mirror: last drawn, first erased
 *   flows    a replaced stroke's current draws on the stroke's own window;
 *            a parallel one from flow.wake into it, in the pen's wake.
 *            Each is rendered only from its draw's start to its retract's
 *            end (lib/lines.ts drawFlow)
 */

import { gsap } from 'gsap'
import { draw, drawFlow, nodesAlong, retract, type FlowTarget } from '@/lib/lines'
import { win, type Guide, type Window } from '@/theme/sequences'
import { flow as flowMotion, gsapEase, pen } from '@/theme/motion'
import { WIPE_HIDDEN, WIPE_SHOWN } from '@/components/hero/wipeConstants'
import type { Schedule } from './schedule'
import type { Figure } from './sketch'

export interface DrawingRefs {
  /** The element whose dashoffset IS the pen (the mask path, for dashed strokes). */
  stroke: Map<string, SVGPathElement>
  arm: Map<string, SVGPathElement>
  /** Per stroke, aligned with stroke.nodes. */
  node: Map<string, Array<SVGPathElement | null>>
  label: Map<string, SVGTextElement>
  /** Flow lines, by the stroke they ride. */
  flow: Map<string, FlowTarget>
}

export interface DrawingHandle {
  figure: Figure
  schedule: Schedule
  refs: DrawingRefs
}

type TL = gsap.core.Timeline
const IR = { immediateRender: false } as const
const deg = (r: number) => (r * 180) / Math.PI

/**
 * The part of a schedule that belongs to passes [from, to), re-timed to fill
 * the whole window: so one figure can be split across several foreground
 * steps (the hero pavement over the four tape phases) and each part still
 * runs on its own step's clock. Labels go with the stroke they wait for.
 */
export function slicePasses(h: DrawingHandle, from: number, to: number): Schedule {
  const ids = new Set(h.figure.passes.slice(from, to).flatMap((p) => p.strokes.map((s) => s.id)))
  const strokes = h.schedule.strokes.filter((t) => ids.has(t.stroke.id))
  const labels = h.schedule.labels.filter((l) => ids.has(l.label.after))
  if (!strokes.length) return { strokes: [], labels: [], freeDuration: 0 }
  const a = Math.min(...strokes.map((t) => t.t0))
  const b = Math.max(...strokes.map((t) => t.t1), ...labels.map((l) => l.t1))
  const f = (v: number) => (v - a) / (b - a || 1)
  const pair = (p?: readonly [number, number]) => (p ? ([f(p[0]), f(p[1])] as const) : undefined)
  return {
    strokes: strokes.map((t) => ({ ...t, t0: f(t.t0), t1: f(t.t1), draw: [f(t.draw[0]), f(t.draw[1])], open: pair(t.open), close: pair(t.close) })),
    labels: labels.map((l) => ({ ...l, t0: f(l.t0), t1: f(l.t1) })),
    freeDuration: h.schedule.freeDuration,
  }
}

export interface DrawOpts {
  /** Only passes [from, to), re-timed to fill the window (see slicePasses). */
  passes?: readonly [number, number]
}

export function drawFigure(tl: TL, h: DrawingHandle, w: Window, mode: 'draw' | 'retract' = 'draw', opts: DrawOpts = {}) {
  const { refs } = h
  const schedule = opts.passes ? slicePasses(h, opts.passes[0], opts.passes[1]) : h.schedule
  const nd = w.dur * pen.node
  const mirror = (a: number, b: number) => (mode === 'draw' ? w.sub(a, b) : w.sub(1 - b, 1 - a))

  for (const t of schedule.strokes) {
    const s = t.stroke
    const el = refs.stroke.get(s.id)
    const sw = mirror(t.draw[0], t.draw[1])
    if (el) (mode === 'draw' ? draw : retract)(tl, el, sw)
    const nodes = (refs.node.get(s.id) ?? []).map((n, i) => ({ el: n, f: s.nodes[i].f }))
    if (nodes.length) nodesAlong(tl, nodes, sw, nd, mode)

    const flow = refs.flow.get(s.id)
    if (flow && s.flow) {
      const [a, b] = t.draw
      const lead = s.flow.mode === 'parallel' ? flowMotion.wake : 0
      drawFlow(tl, flow, mirror(a + (b - a) * lead, b), mode)
    }

    const arm = refs.arm.get(s.id)
    if (mode === 'draw' && arm && s.arm && t.open && t.close) {
      const origin = `${s.arm.c[0]} ${s.arm.c[1]}`
      draw(tl, arm, w.sub(t.open[0], t.open[1]))
      tl.fromTo(
        arm,
        { rotation: 0, svgOrigin: origin },
        { rotation: deg(s.arm.a1 - s.arm.a0), svgOrigin: origin, duration: sw.dur, ease: sw.ease, ...IR },
        sw.at,
      )
      retract(tl, arm, w.sub(t.close[0], t.close[1]))
    }
  }

  for (const l of schedule.labels) {
    const el = refs.label.get(l.label.id)
    if (!el) continue
    const lw = mirror(l.t0, l.t1)
    const [from, to] = mode === 'draw' ? [WIPE_HIDDEN, WIPE_SHOWN] : [WIPE_SHOWN, WIPE_HIDDEN]
    tl.fromTo(el, { clipPath: from }, { clipPath: to, duration: lw.dur, ease: lw.ease, ...IR }, lw.at)
  }
  return tl
}

/** A drawing as a Guide under a stage step: it takes a span of the step's window and its ease. */
export const figureGuide = (
  label: string,
  h: () => DrawingHandle | null,
  span: readonly [number, number],
  mode: 'draw' | 'retract' = 'draw',
  opts: DrawOpts = {},
): Guide => ({
  label,
  span,
  run: (tl, w) => {
    const handle = h()
    if (handle) drawFigure(tl, handle, w, mode, opts)
  },
})

/**
 * Free play (nothing scrubbed): one timeline at the figure's natural pen
 * speed, each stroke on the pen ease. Paused if asked, so a control can
 * scrub it.
 */
export function playFigure(h: DrawingHandle, opts: { paused?: boolean; duration?: number } = {}) {
  const dur = opts.duration ?? Math.min(9, h.schedule.freeDuration)
  const tl = gsap.timeline({ paused: opts.paused })
  drawFigure(tl, h, win(0, dur, gsapEase.pen))
  // Pad to the window's end so progress() maps 1:1 onto the schedule.
  tl.set({}, {}, dur)
  return tl
}
