/**
 * The annotation kit: the marks a drafted sheet is labelled with. Each one
 * adds its own passes to a sketch, in the order they are made on paper:
 *
 *   dimension   extension lines, then the dimension line drawn OUTWARD from
 *               its middle to both ends, then tick slashes, then the value
 *   leader      a key node on the subject, the leader runs out to an elbow,
 *               turns onto a shelf, the label wipes in at the shelf's end
 *   protractor  the arc, then its ticks fanned from the first
 *   hatch       parallel chords across a convex region, cascading across it
 *               (boustrophedon, so the pen zigzags rather than resets)
 *   rose        a compass circle, then a star traced as one stroke
 *   scaleBar    a rule and its divisions, numbered at the ends
 *   registration  a circle and a cross that overshoots it
 *   terminus    a small cross on a line's end, so the end reads as intended
 *
 * Only `key` strokes and `key` labels carry the sheet hue.
 */

import { add, chord, dist, lerp, mul, polar, sub, TAU, TOP, unit, type Vec } from './geometry'
import type { Sketch } from './sketch'

const perp = (u: Vec): Vec => [-u[1], u[0]]

export function dimension(
  s: Sketch,
  a: Vec,
  b: Vec,
  off: number,
  text: string,
  opts: { size?: number; key?: boolean } = {},
) {
  const u = unit(a, b)
  const nrm = mul(perp(u), Math.sign(off) || 1)
  const d = Math.abs(off)
  const a2 = add(a, mul(nrm, d))
  const b2 = add(b, mul(nrm, d))
  s.pass('together', 'dim-extension')
  s.line(add(a, mul(nrm, 5)), add(a2, mul(nrm, 7)), 'dim')
  s.line(add(b, mul(nrm, 5)), add(b2, mul(nrm, 7)), 'dim')
  const mid = lerp(a2, b2, 0.5)
  s.pass('together', 'dim-line')
  s.line(mid, a2, 'dim')
  s.line(mid, b2, 'dim')
  s.pass('together', 'dim-ticks')
  const t = mul(add(u, nrm), 4)
  s.line(sub(a2, t), add(a2, t), 'mark')
  s.line(sub(b2, t), add(b2, t), 'mark')
  const deg = (Math.atan2(u[1], u[0]) * 180) / Math.PI
  const upright = deg > 90 || deg < -90 ? deg + 180 : deg
  s.label(add(mid, mul(nrm, 9)), text, {
    anchor: 'middle',
    kind: opts.key === false ? 'label' : 'key',
    size: opts.size ?? 9,
    rotate: Math.abs(upright) < 0.5 ? undefined : upright,
  })
}

export function leader(s: Sketch, from: Vec, elbow: Vec, text: string, opts: { shelf?: number; size?: number } = {}) {
  const shelf = opts.shelf ?? 26
  const dir = elbow[0] >= from[0] ? 1 : -1
  const end: Vec = [elbow[0] + shelf * dir, elbow[1]]
  s.pass('relay', 'leader')
  s.line(from, elbow, 'key', { nodes: ['start'], nodeKind: 'key', nodeR: 2.6 })
  s.line(elbow, end, 'key')
  s.label([end[0] + 6 * dir, end[1] + 3], text, { anchor: dir > 0 ? 'start' : 'end', kind: 'key', size: opts.size ?? 9 })
}

export function protractor(
  s: Sketch,
  c: Vec,
  r: number,
  a0: number,
  a1: number,
  step: number,
  major = 5,
  layer: 'construct' | 'datum' = 'datum',
) {
  s.pass('relay', 'protractor-arc')
  s.arc(c, r, a0, a1, layer)
  s.pass('fan', 'protractor-ticks')
  const count = Math.floor(Math.abs(a1 - a0) / step + 1e-6)
  for (let i = 0; i <= count; i++) {
    const a = a0 + Math.sign(a1 - a0) * step * i
    const len = i % major === 0 ? 9 : 4.5
    s.line(polar(c, r, a), polar(c, r - len, a), i % major === 0 ? 'datum' : 'construct')
  }
}

/** Parallel chords across a convex polygon at `angle`, `gap` apart. */
export function hatch(
  s: Sketch,
  poly: Vec[],
  angle: number,
  gap: number,
  opts: { layer?: 'hatch' | 'construct'; pass?: boolean } = {},
) {
  const layer = opts.layer ?? 'hatch'
  const u: Vec = [Math.cos(angle), Math.sin(angle)]
  const nrm = perp(u)
  const proj = poly.map((p) => p[0] * nrm[0] + p[1] * nrm[1])
  const lo = Math.min(...proj)
  const hi = Math.max(...proj)
  if (opts.pass !== false) s.pass('fan', 'hatch')
  let flip = false
  for (let k = lo + gap / 2; k < hi; k += gap) {
    const c = chord(mul(nrm, k), u, poly)
    if (!c || dist(c[0], c[1]) < 2) continue
    if (flip) s.line(c[1], c[0], layer)
    else s.line(c[0], c[1], layer)
    flip = !flip
  }
}

export function rose(s: Sketch, c: Vec, r: number, points = 8) {
  s.pass('relay', 'rose-circle')
  s.circle(c, r * 0.42, 'construct', { arm: true })
  s.pass('relay', 'rose-star')
  const pts: Vec[] = []
  for (let i = 0; i < points * 2; i++) {
    const a = TOP + (i * TAU) / (points * 2)
    const rr = i % 2 === 0 ? (i % 4 === 0 ? r : r * 0.62) : r * 0.16
    pts.push(polar(c, rr, a))
  }
  pts.push(pts[0])
  let len = 0
  for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i])
  s.path({ d: `M${pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L')}`, len, a: pts[0], b: pts[0] }, 'ink', {
    nodes: [{ at: c, f: 1 }],
  })
  s.label(polar(c, r + 12, TOP), 'N', { anchor: 'middle', kind: 'serif', size: 15 })
}

export function scaleBar(s: Sketch, at: Vec, len: number, divisions: number, unitLabel: string) {
  const end: Vec = [at[0] + len, at[1]]
  s.pass('relay', 'scale-rule')
  s.line(at, end, 'ink')
  s.pass('fan', 'scale-ticks')
  for (let i = 0; i <= divisions; i++) {
    const x = at[0] + (len * i) / divisions
    s.line([x, at[1]], [x, at[1] - (i % divisions === 0 ? 8 : 4.5)], 'mark')
  }
  s.label([at[0], at[1] + 13], '0', { anchor: 'middle', size: 8 })
  s.label([end[0], end[1] + 13], unitLabel, { anchor: 'middle', size: 8 })
}

/**
 * Impact point: where a flight lands. Three rings struck from the centre,
 * innermost first, then a burst of ticks fanned round them (long and short
 * alternating) and a node on the point itself. Not a registration mark:
 * those sit on a sheet's corners; this marks an event on the drawing.
 */
export function impact(s: Sketch, c: Vec, r: number) {
  s.pass('fan', 'impact rings')
  s.circle(c, r * 0.32, 'datum', { nodes: [{ at: c, f: 0 }], nodeR: 2.2 })
  s.circle(c, r * 0.66, 'construct')
  s.circle(c, r, 'construct', { dashed: true })
  s.pass('fan', 'impact burst')
  const ticks = 12
  for (let i = 0; i < ticks; i++) {
    const a = TOP + (i * TAU) / ticks
    s.line(polar(c, r * 1.18, a), polar(c, r * (i % 2 ? 1.42 : 1.7), a), i % 2 ? 'construct' : 'datum')
  }
}

export function registration(s: Sketch, c: Vec, r: number) {
  s.pass('relay', 'registration')
  s.circle(c, r, 'mark')
  s.pass('together', 'registration-cross')
  s.line([c[0] - r * 1.6, c[1]], [c[0] + r * 1.6, c[1]], 'mark')
  s.line([c[0], c[1] - r * 1.6], [c[0], c[1] + r * 1.6], 'mark')
}

/** A small cross on the end of a line running along `ang` (radians): the line stops here on purpose. */
export function terminus(s: Sketch, at: Vec, ang: number, r = 6) {
  s.pass('together', 'terminus')
  s.line(polar(at, r, ang + TAU / 8), polar(at, r, ang + TAU * 5 / 8), 'construct')
  s.line(polar(at, r, ang - TAU / 8), polar(at, r, ang + TAU * 3 / 8), 'construct')
}
