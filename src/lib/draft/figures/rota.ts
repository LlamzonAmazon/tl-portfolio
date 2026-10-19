import { polar, polyline, TAU, type Vec } from '../geometry'
import { protractor } from '../annotate'
import { sketch } from '../sketch'

/**
 * Rota Dentata: a 20-tooth involute spur gear, after Leonardo's machine
 * studies, with the involute itself constructed the old way.
 *
 * Centre lines; root, base, pitch and tip circles struck in turn; for one
 * tooth, the "unwound string": tangents off the base circle, each as long
 * as the arc it unwinds, whose ends trace the involute; then the whole
 * gear profile inked as ONE path, tooth after tooth; the hub and the
 * lightening holes; the line of action through the pitch point at 20
 * degrees.
 */
export function rota() {
  const s = sketch('rota', [0, 0, 600, 600])
  const c: Vec = [300, 300]
  const z = 20
  const m = 13
  const alpha = (20 * Math.PI) / 180
  const rp = (m * z) / 2
  const rb = rp * Math.cos(alpha)
  const ra = rp + m
  const rf = rp - 1.25 * m
  const inv = (a: number) => Math.tan(a) - a
  const halfB = Math.PI / (2 * z) + inv(alpha)
  const ta = Math.sqrt((ra / rb) ** 2 - 1)
  const theta = (t: number) => t - Math.atan(t)
  const invPt = (t: number, side: 1 | -1, ctr: number): Vec =>
    polar(c, rb * Math.sqrt(1 + t * t), ctr - side * (halfB - theta(t)))

  s.pass('together', 'centre lines')
  s.line([c[0] - ra - 40, c[1]], [c[0] + ra + 40, c[1]], 'construct', { dashed: true })
  s.line([c[0], c[1] - ra - 40], [c[0], c[1] + ra + 40], 'construct', { dashed: true, nodes: [0.5], nodeKind: 'key' })

  s.pass('fan', 'circles')
  s.circle(c, rf, 'construct', { arm: true })
  s.circle(c, rb, 'construct', { arm: true, dashed: true })
  s.circle(c, rp, 'datum', { arm: true })
  s.circle(c, ra, 'construct', { arm: true })

  // The unwound string, for the tooth at 12 o'clock-ish.
  const ctr0 = -Math.PI / 2 - (TAU / z) * 2
  s.pass('fan', 'involute construction')
  for (let k = 1; k <= 5; k++) {
    const t = (ta * k) / 5
    const foot = polar(c, rb, ctr0 - (halfB - 0) + t * 1)
    const tip = invPt(t, 1, ctr0)
    s.line(foot, tip, 'construct', { nodes: ['end'], nodeKind: 'open', nodeR: 2.2 })
  }

  // The whole profile, one path.
  const pts: Vec[] = []
  for (let k = 0; k < z; k++) {
    const ctr = -Math.PI / 2 + (k * TAU) / z
    pts.push(polar(c, rf, ctr - halfB))
    for (let i = 0; i <= 8; i++) pts.push(invPt((ta * i) / 8, 1, ctr))
    const tipA = ctr - halfB + theta(ta)
    const tipB = ctr + halfB - theta(ta)
    for (let i = 1; i < 4; i++) pts.push(polar(c, ra, tipA + ((tipB - tipA) * i) / 4))
    for (let i = 8; i >= 0; i--) pts.push(invPt((ta * i) / 8, -1, ctr))
    pts.push(polar(c, rf, ctr + halfB))
    const next = ctr + TAU / z - halfB
    for (let i = 1; i < 4; i++) pts.push(polar(c, rf, ctr + halfB + ((next - (ctr + halfB)) * i) / 4))
  }
  s.pass('relay', 'profile')
  s.path(polyline(pts, true), 'ink')

  s.pass('relay', 'hub')
  s.circle(c, 34, 'ink', { arm: true })
  s.pass('fan', 'lightening holes')
  for (let k = 0; k < 5; k++) s.circle(polar(c, 82, -Math.PI / 2 + (k * TAU) / 5), 20, 'ink', { from: -Math.PI / 2 + (k * TAU) / 5 })

  // Line of action: tangent to the base circle, through the pitch point.
  const pitchPt = polar(c, rp, 0)
  const dir: Vec = [Math.sin(alpha), -Math.cos(alpha)]
  s.pass('relay', 'line of action')
  s.line(
    [pitchPt[0] - dir[0] * 150, pitchPt[1] - dir[1] * 150],
    [pitchPt[0] + dir[0] * 150, pitchPt[1] + dir[1] * 150],
    'key',
    { nodes: [0.5], nodeKind: 'key' },
  )
  protractor(s, pitchPt, 44, -Math.PI / 2, -Math.PI / 2 + alpha, alpha / 4, 4, 'construct')
  s.label([pitchPt[0] + 20, pitchPt[1] - 50], '\u03B1 = 20\u00B0', { kind: 'serif', size: 13 })
  s.label([40, 40], 'rota dentata', { kind: 'serif', size: 15 })
  return s.build()
}
