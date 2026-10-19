import { ellipseArc, type Vec } from '../geometry'
import { dimension } from '../annotate'
import { sketch } from '../sketch'

/**
 * Ellipsis: the gardener's ellipse. Two pins at the foci, a loop of string,
 * a pen held taut against it.
 *
 * The axes; the foci pricked on the major axis; then, at six stations, the
 * string drawn as one connected stroke from focus to pen to focus; then the
 * ellipse inked from the vertex in a single sweep; then 2a dimensioned.
 */
export function ellipsis() {
  const s = sketch('ellipsis', [0, 0, 720, 520])
  const c: Vec = [360, 250]
  const a = 260
  const b = 150
  const f = Math.sqrt(a * a - b * b)
  const F1: Vec = [c[0] - f, c[1]]
  const F2: Vec = [c[0] + f, c[1]]

  s.pass('together', 'axes')
  s.line([c[0] - a, c[1]], [c[0] + a, c[1]], 'construct', { over: 24, nodes: [(a - f + 24) / (2 * a + 48), (a + f + 24) / (2 * a + 48)], nodeKind: 'key' })
  s.line([c[0], c[1] - b], [c[0], c[1] + b], 'construct', { over: 24, dashed: true })
  s.label([F1[0], F1[1] + 18], 'F₁', { anchor: 'middle', kind: 'key', size: 10 })
  s.label([F2[0], F2[1] + 18], 'F₂', { anchor: 'middle', kind: 'key', size: 10 })

  const stations = [-2.5, -1.75, -0.95, 0.6, 1.5, 2.3]
  stations.forEach((u, i) => {
    const P: Vec = [c[0] + a * Math.cos(u), c[1] + b * Math.sin(u)]
    s.pass('relay', `string ${i}`)
    s.line(F1, P, 'construct')
    s.line(P, F2, 'construct', { nodes: ['start'], nodeKind: 'open', nodeR: 2.4 })
  })

  s.pass('relay', 'ellipse')
  s.path(ellipseArc(c, a, b, 0, Math.PI, Math.PI * 3, 160), 'ink', { nodes: ['start'] })
  s.label([c[0] + 18, c[1] - b - 22], '|PF₁| + |PF₂| = 2a', { kind: 'serif', size: 15 })
  dimension(s, [c[0] - a, c[1] + b], [c[0] + a, c[1] + b], 40, '2a')
  return s.build()
}
