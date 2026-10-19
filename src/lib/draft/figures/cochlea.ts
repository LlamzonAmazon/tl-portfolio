import { curve, ellipseArc, type Vec } from '../geometry'
import { dimension } from '../annotate'
import { sketch } from '../sketch'

/**
 * Cochlea: the Archimedean screw, two flights wound on a cylinder.
 *
 * The axis (dashed centre line); the end ellipses; the cylinder's
 * silhouette; then each flight wound turn by turn, the half that faces us
 * in ink and the half behind in dashed construction, so the screw turns in
 * depth with no shading at all; then the pitch dimensioned.
 */
export function cochlea() {
  const s = sketch('cochlea', [0, 0, 780, 440])
  const cy = 210
  const r = 110
  const x0 = 110
  const x1 = 660
  const turns = 4.5
  const ex = 34

  s.pass('relay', 'axis')
  s.line([60, cy], [720, cy], 'construct', { dashed: true })

  s.pass('together', 'ends')
  s.path(ellipseArc([x0, cy], ex, r, 0, -Math.PI / 2, Math.PI * 1.5, 80), 'ink')
  s.path(ellipseArc([x1, cy], ex, r, 0, -Math.PI / 2, Math.PI * 1.5, 80), 'construct')

  s.pass('together', 'silhouette')
  s.line([x0, cy - r], [x1, cy - r], 'ink')
  s.line([x0, cy + r], [x1, cy + r], 'ink')

  // A flight: x advances with angle; facing half ink, far half dashed.
  const L = x1 - x0
  for (const phase of [0, Math.PI]) {
    s.pass('relay', `flight ${phase ? 'b' : 'a'}`)
    const halves = Math.floor(turns * 2)
    for (let h = 0; h < halves; h++) {
      const a0 = h * Math.PI + phase
      const front = Math.sin(a0 + Math.PI / 2) > 0
      const f = (u: number): Vec => {
        const a = a0 + Math.PI * u
        const along = (a - phase) / (turns * Math.PI * 2)
        return [x0 + L * along + ex * Math.sin(a), cy - r * Math.cos(a)]
      }
      s.path(curve(f, 40), front ? 'ink' : 'construct', { dashed: !front })
    }
  }

  const pitch = L / turns
  dimension(s, [x0, cy - r], [x0 + pitch, cy - r], -30, 'pitch')
  s.label([60, 420], 'cochlea', { kind: 'serif', size: 15 })
  return s.build()
}
