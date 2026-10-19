/**
 * Plane geometry for drafted figures. Pure math, no DOM, no GSAP, so a
 * figure can be built (and measured) anywhere: in a component, in a test,
 * in a static render.
 *
 * Conventions (SVG space, y down):
 *   - Angles are radians. 0 points right (3 o'clock); increasing angles
 *     turn CLOCKWISE on screen. 12 o'clock is -PI/2 (see TOP).
 *   - Every path builder returns its real length alongside `d`, so the pen
 *     can be paced by distance without ever measuring the DOM.
 */

export type Vec = readonly [number, number]

export const TAU = Math.PI * 2
/** 12 o'clock: where a compass study starts every circle. */
export const TOP = -Math.PI / 2

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]]
export const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]]
export const mul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k]
export const dist = (a: Vec, b: Vec) => Math.hypot(b[0] - a[0], b[1] - a[1])
export const lerp = (a: Vec, b: Vec, t: number): Vec => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
export const unit = (a: Vec, b: Vec): Vec => {
  const l = dist(a, b) || 1
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]
}
export const polar = (c: Vec, r: number, a: number): Vec => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]
export const angleOf = (c: Vec, p: Vec) => Math.atan2(p[1] - c[1], p[0] - c[0])
export const near = (a: Vec, b: Vec, e = 0.75) => dist(a, b) <= e

/** Path number: two decimals is sub-pixel at any size we draw. */
export const n = (v: number) => (Math.round(v * 100) / 100).toString()
const pt = (p: Vec) => `${n(p[0])} ${n(p[1])}`

export interface PathShape {
  d: string
  len: number
  /** Where the pen starts and stops: drives pen continuity in the choreographer. */
  a: Vec
  b: Vec
}

/** Straight segment, optionally overshooting BOTH ends (construction lines run past their marks). */
export function segment(a: Vec, b: Vec, over = 0): PathShape {
  const u = unit(a, b)
  const a2 = over ? sub(a, mul(u, over)) : a
  const b2 = over ? add(b, mul(u, over)) : b
  return { d: `M${pt(a2)} L${pt(b2)}`, len: dist(a2, b2), a: a2, b: b2 }
}

/** Open or closed polyline through `pts`. */
export function polyline(pts: Vec[], closed = false): PathShape {
  let len = 0
  for (let i = 1; i < pts.length; i++) len += dist(pts[i - 1], pts[i])
  if (closed) len += dist(pts[pts.length - 1], pts[0])
  const d = `M${pt(pts[0])} ${pts.slice(1).map((p) => `L${pt(p)}`).join(' ')}${closed ? ` L${pt(pts[0])}` : ''}`
  return { d, len, a: pts[0], b: closed ? pts[0] : pts[pts.length - 1] }
}

/**
 * Circular arc about `c` from angle a0 to a1 (a1 > a0 turns clockwise).
 * Split into <= 180 degree pieces so the SVG arc flags are never ambiguous.
 */
export function arc(c: Vec, r: number, a0: number, a1: number): PathShape {
  const sweep = a1 > a0 ? 1 : 0
  const span = Math.abs(a1 - a0)
  const pieces = Math.max(1, Math.ceil(span / Math.PI - 1e-9))
  let d = `M${pt(polar(c, r, a0))}`
  for (let i = 1; i <= pieces; i++) {
    const p = polar(c, r, a0 + ((a1 - a0) * i) / pieces)
    d += ` A${n(r)} ${n(r)} 0 0 ${sweep} ${pt(p)}`
  }
  return { d, len: r * span, a: polar(c, r, a0), b: polar(c, r, a1) }
}

/** Ellipse (axis-aligned then rotated by `rot`), traced from parameter t0 to t1 by sampling. */
export function ellipseArc(c: Vec, rx: number, ry: number, rot: number, t0: number, t1: number, steps = 96): PathShape {
  const cr = Math.cos(rot)
  const sr = Math.sin(rot)
  return curve((t) => {
    const u = t0 + (t1 - t0) * t
    const x = rx * Math.cos(u)
    const y = ry * Math.sin(u)
    return [c[0] + x * cr - y * sr, c[1] + x * sr + y * cr]
  }, steps)
}

/** Any parametric curve f(t), t in [0, 1], sampled into a polyline. */
export function curve(f: (t: number) => Vec, steps = 120): PathShape {
  const pts: Vec[] = []
  for (let i = 0; i <= steps; i++) pts.push(f(i / steps))
  return polyline(pts)
}

/**
 * Fraction of a parametric curve's LENGTH covered at parameter t. Nodes are
 * timed by length (the pen's progress), not by parameter.
 */
export function lengthFraction(f: (t: number) => Vec, t: number, steps = 160): number {
  let total = 0
  let part = 0
  let prev = f(0)
  for (let i = 1; i <= steps; i++) {
    const u = i / steps
    const q = f(u)
    const d = dist(prev, q)
    total += d
    if (u <= t + 1e-9) part += d
    prev = q
  }
  return total ? part / total : 0
}

/**
 * Scale (uniformly, about the origin) then translate an SVG path written
 * with the absolute commands the builders here emit (M, L, H, V, A, C).
 * Arc radii scale; arc flags and rotation are kept.
 */
export function transformPath(d: string, k: number, dx: number, dy: number): string {
  const tokens = d.match(/[MLHVACZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []
  const out: string[] = []
  let cmd = ''
  let args: number[] = []
  const X = (v: number) => n(v * k + dx)
  const Y = (v: number) => n(v * k + dy)
  const flush = () => {
    if (!cmd) return
    const a = args
    if (cmd === 'M' || cmd === 'L') for (let i = 0; i + 1 < a.length; i += 2) out.push(`${i === 0 ? cmd : 'L'}${X(a[i])} ${Y(a[i + 1])}`)
    else if (cmd === 'H') a.forEach((v) => out.push(`H${X(v)}`))
    else if (cmd === 'V') a.forEach((v) => out.push(`V${Y(v)}`))
    else if (cmd === 'C') for (let i = 0; i + 5 < a.length; i += 6) out.push(`C${X(a[i])} ${Y(a[i + 1])} ${X(a[i + 2])} ${Y(a[i + 3])} ${X(a[i + 4])} ${Y(a[i + 5])}`)
    else if (cmd === 'A') for (let i = 0; i + 6 < a.length; i += 7) out.push(`A${n(a[i] * k)} ${n(a[i + 1] * k)} ${a[i + 2]} ${a[i + 3]} ${a[i + 4]} ${X(a[i + 5])} ${Y(a[i + 6])}`)
    args = []
  }
  for (const t of tokens) {
    if (/^[A-Za-z]$/.test(t)) {
      flush()
      cmd = t.toUpperCase()
      if (cmd === 'Z') {
        out.push('Z')
        cmd = ''
      }
    } else args.push(parseFloat(t))
  }
  flush()
  return out.join(' ')
}

/** Point on a cubic Bezier. */
export function bezierAt(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]
}

/** Cubic Bezier as a true SVG curve, with its length measured by sampling. */
export function cubic(p0: Vec, p1: Vec, p2: Vec, p3: Vec): PathShape {
  let len = 0
  let prev = p0
  for (let i = 1; i <= 64; i++) {
    const q = bezierAt(p0, p1, p2, p3, i / 64)
    len += dist(prev, q)
    prev = q
  }
  return { d: `M${pt(p0)} C${pt(p1)} ${pt(p2)} ${pt(p3)}`, len, a: p0, b: p3 }
}

/**
 * Clip the infinite line through `p` with direction `u` to a convex polygon.
 * Returns the chord, or null if the line misses. Used for hatching.
 */
export function chord(p: Vec, u: Vec, poly: Vec[]): [Vec, Vec] | null {
  let lo = -Infinity
  let hi = Infinity
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    // Inward normal for a clockwise (screen) polygon, sign-agnostic via centroid test below.
    const e = sub(b, a)
    let nrm: Vec = [-e[1], e[0]]
    const cx = poly.reduce((s, q) => s + q[0], 0) / poly.length
    const cy = poly.reduce((s, q) => s + q[1], 0) / poly.length
    if ((cx - a[0]) * nrm[0] + (cy - a[1]) * nrm[1] < 0) nrm = [-nrm[0], -nrm[1]]
    const den = u[0] * nrm[0] + u[1] * nrm[1]
    const num = (p[0] - a[0]) * nrm[0] + (p[1] - a[1]) * nrm[1]
    if (Math.abs(den) < 1e-9) {
      if (num < 0) return null
      continue
    }
    const t = -num / den
    if (den > 0) lo = Math.max(lo, t)
    else hi = Math.min(hi, t)
  }
  if (lo >= hi) return null
  return [add(p, mul(u, lo)), add(p, mul(u, hi))]
}

/** Intersection of segment-lines (a1,a2) and (b1,b2), as infinite lines. */
export function intersect(a1: Vec, a2: Vec, b1: Vec, b2: Vec): Vec {
  const d = (a1[0] - a2[0]) * (b1[1] - b2[1]) - (a1[1] - a2[1]) * (b1[0] - b2[0])
  const x = ((a1[0] * a2[1] - a1[1] * a2[0]) * (b1[0] - b2[0]) - (a1[0] - a2[0]) * (b1[0] * b2[1] - b1[1] * b2[0])) / d
  const y = ((a1[0] * a2[1] - a1[1] * a2[0]) * (b1[1] - b2[1]) - (a1[1] - a2[1]) * (b1[0] * b2[1] - b1[1] * b2[0])) / d
  return [x, y]
}

/**
 * Points along a circular SVG arc piece (the builders here never emit one
 * over 180 degrees, so the large-arc flag is always 0), every 2 degrees,
 * excluding the start. sweep 1 turns clockwise on screen.
 */
function arcPoints(p0: Vec, r: number, sweep: number, p1: Vec): Vec[] {
  const u = unit(p0, p1)
  const h = dist(p0, p1) / 2
  // Centre: off the chord's midpoint, on the pen's right for a clockwise sweep.
  const k = Math.sqrt(Math.max(0, r * r - h * h)) * (sweep ? 1 : -1)
  const c = add(lerp(p0, p1, 0.5), mul([-u[1], u[0]], k))
  const a0 = angleOf(c, p0)
  let a1 = angleOf(c, p1)
  if (sweep && a1 < a0) a1 += TAU
  if (!sweep && a1 > a0) a1 -= TAU
  const steps = Math.max(2, Math.ceil(Math.abs(a1 - a0) / (Math.PI / 90)))
  return Array.from({ length: steps }, (_, i) => polar(c, r, a0 + ((a1 - a0) * (i + 1)) / steps))
}

/**
 * A path written with the commands the builders here emit (M, L, H, V,
 * circular A, C, Z), as points: lines keep only their ends, arcs are
 * sampled every 2 degrees, cubics in 24 steps.
 */
export function samplePath(d: string): Vec[] {
  const tokens = d.match(/[MLHVACZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []
  const pts: Vec[] = []
  let cur: Vec = [0, 0]
  let start: Vec = [0, 0]
  let cmd = ''
  let args: number[] = []
  const push = (p: Vec) => {
    if (!pts.length || !near(pts[pts.length - 1], p, 1e-6)) pts.push(p)
    cur = p
  }
  const flush = () => {
    const a = args
    if (cmd === 'M' || cmd === 'L') {
      for (let i = 0; i + 1 < a.length; i += 2) {
        if (cmd === 'M' && i === 0) start = [a[0], a[1]]
        push([a[i], a[i + 1]])
      }
    } else if (cmd === 'H') a.forEach((v) => push([v, cur[1]]))
    else if (cmd === 'V') a.forEach((v) => push([cur[0], v]))
    else if (cmd === 'C') {
      for (let i = 0; i + 5 < a.length; i += 6) {
        const p0 = cur
        for (let s = 1; s <= 24; s++) push(bezierAt(p0, [a[i], a[i + 1]], [a[i + 2], a[i + 3]], [a[i + 4], a[i + 5]], s / 24))
      }
    } else if (cmd === 'A') {
      for (let i = 0; i + 6 < a.length; i += 7) arcPoints(cur, a[i], a[i + 4], [a[i + 5], a[i + 6]]).forEach(push)
    }
    args = []
  }
  for (const t of tokens) {
    if (/^[A-Za-z]$/.test(t)) {
      flush()
      cmd = t.toUpperCase()
      if (cmd === 'Z') {
        push(start)
        cmd = ''
      }
    } else args.push(parseFloat(t))
  }
  flush()
  return pts
}

/**
 * The path run parallel to `shape`, `off` figure units to the pen's right:
 * + is the clockwise side, so + lies INSIDE a clockwise arc. Each sample is
 * pushed along the normal of its neighbours' chord, so arcs stay concentric
 * and straight runs stay straight. Smooth paths only (a sharp corner would
 * need a miter); the pen runs the same way as the parent's.
 */
export function offsetPath(shape: PathShape, off: number): PathShape {
  const p = samplePath(shape.d)
  if (p.length < 2 || !off) return shape
  const out = p.map((q, i): Vec => {
    const t = unit(p[Math.max(0, i - 1)], p[Math.min(p.length - 1, i + 1)])
    return [q[0] - t[1] * off, q[1] + t[0] * off]
  })
  return polyline(out)
}
