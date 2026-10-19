import { angleOf, type Vec } from '../geometry'
import { sketch } from '../sketch'

/**
 * Fenestra: two-light Gothic bar tracery, drawn inside Arcus Acutus.
 *
 * Set out in the arch's own coordinates (arcus.ts: springing line y 400,
 * springing points x 150 and 450, span r 300), so it places with the same
 * Placement. The span is halved by a mullion; each half carries an
 * equilateral lancet of span r/2, swung by compass exactly as the arch is.
 * The oculus sits low in the spandrel between the lancets, its centre on
 * the axis at 0.4r above the springing line; its radius is whatever makes
 * it tangent to both lancets (its distance from a springing point less r/2),
 * so it rests on them. A quatrefoil fills it, four foils that just touch.
 * Oculus and foils are drawn on the datum role, a grade lighter than the
 * arch, so the centrepiece stays quiet under the type above it.
 *
 * Passes: lancet swings · oculus set out · lancets · mullion · oculus ·
 * quatrefoil.
 */
export function fenestra() {
  const s = sketch('fenestra', [0, 0, 600, 660])
  const sy = 400
  const ground = 610
  const r = 300
  const half = r / 2
  const L: Vec = [150, sy]
  const M: Vec = [300, sy]
  const R: Vec = [450, sy]
  const lift = half * Math.sin(Math.PI / 3)
  const apexL: Vec = [225, sy - lift]
  const apexR: Vec = [375, sy - lift]

  // Oculus: centred on the axis at 0.4r up; tangent to both lancets, so
  // |c - L| = r/2 + rc.
  const c: Vec = [M[0], sy - 0.4 * r]
  const rc = Math.hypot(c[0] - L[0], c[1] - L[1]) - half

  s.pass('together', 'lancet swings')
  for (const [a, b] of [
    [L, M],
    [M, R],
  ] as Array<[Vec, Vec]>) {
    s.arc(b, half, Math.PI - 0.06, Math.PI + Math.PI / 3 + 0.16, 'construct', { arm: true })
    s.arc(a, half, 0.06, -Math.PI / 3 - 0.16, 'construct', { arm: true })
  }

  s.pass('relay', 'oculus set out')
  s.line(L, c, 'construct', { dashed: true, nodes: ['end'], nodeKind: 'key' })

  s.pass('together', 'lancets')
  for (const [a, b, apex] of [
    [L, M, apexL],
    [M, R, apexR],
  ] as Array<[Vec, Vec, Vec]>) {
    s.arc(b, half, Math.PI, angleOf(b, apex) + Math.PI * 2, 'ink')
    s.arc(a, half, 0, angleOf(a, apex), 'ink')
  }

  s.pass('relay', 'mullion')
  s.line(M, [M[0], ground], 'ink')

  s.pass('relay', 'oculus')
  s.circle(c, rc, 'datum')

  // Quatrefoil: foil centres at d from c, neighbours d*sqrt2 apart, so a
  // foil radius of d/sqrt2 makes them touch; d + f = rc keeps them inside.
  s.pass('fan', 'quatrefoil')
  const d = rc / (1 + Math.SQRT1_2)
  const f = d * Math.SQRT1_2
  for (let i = 0; i < 4; i++) {
    const th = -Math.PI / 2 + (i * Math.PI) / 2
    const fc: Vec = [c[0] + d * Math.cos(th), c[1] + d * Math.sin(th)]
    s.arc(fc, f, th - (3 * Math.PI) / 4, th + (3 * Math.PI) / 4, 'datum')
  }

  s.label([60, 646], 'fenestra', { kind: 'serif', size: 15 })
  return s.build()
}
