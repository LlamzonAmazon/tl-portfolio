import { curve, type Vec } from '../geometry'
import { sketch } from '../sketch'

/**
 * Harmonia: a harmonograph trace, two damped pendulums at 2 : 3. The
 * figure is ONE line: the pen never lifts, so the whole plate is a single
 * gesture that slows and tightens as the pendulums lose energy.
 *
 * The crossed axes and the starting amplitude (dashed) are set first; then
 * the trace, start node on the first swing, end node where it comes to rest.
 */
export function harmonia() {
  const s = sketch('harmonia', [0, 0, 600, 600])
  const c: Vec = [300, 290]
  const A = 220
  const T = 34 * Math.PI
  // Two pendulums a hair off 2 : 3, equally damped: the figure precesses as
  // it decays, so each loop lands just beside the last.
  const f = (u: number): Vec => {
    const t = T * u
    const k = Math.exp(-0.022 * t)
    return [c[0] + A * k * Math.sin(2 * t + Math.PI / 2), c[1] + A * k * Math.sin(3.012 * t)]
  }

  s.pass('together', 'axes')
  s.line([c[0] - A - 30, c[1]], [c[0] + A + 30, c[1]], 'construct')
  s.line([c[0], c[1] - A - 30], [c[0], c[1] + A + 30], 'construct')
  s.pass('relay', 'amplitude')
  // The trace stays untouched; the amplitude ring drifts, as if still swinging.
  s.circle(c, A, 'construct', { dashed: true, flow: { mode: 'replace', speed: 0.5 } })

  s.pass('relay', 'trace')
  s.path(curve(f, 2400), 'ink', { nodes: ['start', 'end'], nodeKind: 'key' })
  s.label([c[0] + A - 10, c[1] + A + 26], 'f₁ : f₂ = 2 : 3', { kind: 'serif', size: 14, anchor: 'end' })
  s.label([40, 580], 'harmonia', { kind: 'serif', size: 15 })
  return s.build()
}
