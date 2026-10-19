import { bezierAt, cubic, lerp, type Vec } from '../geometry'
import { sketch } from '../sketch'

/**
 * Curva: de Casteljau's construction of a cubic Bezier. The engineer's
 * page of the folio: the curve every vector tool draws, built from nothing
 * but straight lines and ratios.
 *
 * The control polygon, its points labelled; then, at t = 1/4, 1/2, 3/4,
 * the pen runs the first interpolation (one connected stroke across the
 * three new points), then the second, and the point it lands on is on the
 * curve; then the curve is inked through all three.
 */
export function curva() {
  const s = sketch('curva', [0, 0, 720, 480])
  const P: Vec[] = [[80, 400], [170, 80], [540, 60], [640, 390]]

  s.pass('relay', 'control polygon')
  s.line(P[0], P[1], 'datum', { nodes: ['start'], nodeKind: 'open', nodeR: 3.2 })
  s.line(P[1], P[2], 'datum', { nodes: ['start'], nodeKind: 'open', nodeR: 3.2 })
  s.line(P[2], P[3], 'datum', { nodes: ['start', 'end'], nodeKind: 'open', nodeR: 3.2 })
  const tags: Array<[Vec, string]> = [[[-22, 6], 'P₀'], [[-24, -6], 'P₁'], [[10, -8], 'P₂'], [[12, 6], 'P₃']]
  tags.forEach(([o, t], i) => s.label([P[i][0] + o[0], P[i][1] + o[1]], t, { size: 10 }))

  for (const t of [0.25, 0.5, 0.75]) {
    const Q = [lerp(P[0], P[1], t), lerp(P[1], P[2], t), lerp(P[2], P[3], t)]
    const R = [lerp(Q[0], Q[1], t), lerp(Q[1], Q[2], t)]
    const B = bezierAt(P[0], P[1], P[2], P[3], t)
    s.pass('relay', `t ${t}`)
    s.line(Q[0], Q[1], 'construct', { nodes: ['start'], nodeKind: 'open', nodeR: 2 })
    s.line(Q[1], Q[2], 'construct', { nodes: ['start', 'end'], nodeKind: 'open', nodeR: 2 })
    s.line(R[0], R[1], 'construct', { dashed: true, nodes: ['start', 'end', t], nodeKind: 'key', nodeR: 2.6 })
    s.label([B[0] + 8, B[1] + 16], `t ${t.toFixed(2).replace(/^0/, '')}`, { kind: 'key', size: 8.5 })
  }

  s.pass('relay', 'curve')
  // A current outside the curve, running the way t does. The scaffolding is a proof and stays put.
  s.path(cubic(P[0], P[1], P[2], P[3]), 'ink', { nodes: ['start', 'end'], flow: { mode: 'parallel', off: -9 } })
  s.label([80, 455], 'curva · de casteljau', { kind: 'serif', size: 15 })
  return s.build()
}
