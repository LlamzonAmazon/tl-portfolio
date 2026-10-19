import { angleOf, polar, type Vec } from '../geometry'
import { dimension, hatch } from '../annotate'
import { sketch } from '../sketch'

/**
 * Arcus Acutus: an equilateral pointed arch, set out with a compass.
 *
 * The springing line; each compass arm planted on one springing point
 * swings the vesica arc through the apex from the other; the plumb line
 * drops from the apex; then the arch is inked (intrados, extrados), its
 * voussoir joints fanned from each centre, the keystone set; piers and
 * imposts; the piers sectioned with hatching; the span dimensioned. (No
 * leaders: the board carries no lettering for one to point at.)
 */
export function arcus() {
  const s = sketch('arcus', [0, 0, 600, 660])
  const sy = 400
  const L: Vec = [150, sy]
  const R: Vec = [450, sy]
  const span = R[0] - L[0]
  const t = 46
  const apex: Vec = [300, sy - span * Math.sin(Math.PI / 3)]
  const outerApexY = sy - Math.sqrt((span + t) ** 2 - (span / 2) ** 2)
  const ground = 610

  s.pass('relay', 'springing line')
  s.line([60, sy], [540, sy], 'construct', { nodes: [(L[0] - 60) / 480, (R[0] - 60) / 480], nodeKind: 'key' })

  // Compass swings: centred on one springing point, through the other, past the apex.
  s.pass('together', 'vesica')
  s.arc(R, span, Math.PI - 0.06, Math.PI + Math.PI / 3 + 0.16, 'construct', { arm: true })
  s.arc(L, span, 0.06, -Math.PI / 3 - 0.16, 'construct', { arm: true })

  s.pass('relay', 'plumb')
  s.line(apex, [300, ground], 'construct', { dashed: true, nodes: ['start'], nodeKind: 'key' })

  // Left arcs turn clockwise from PI, so their end angles are taken past PI.
  const aApexL = angleOf(R, apex) + Math.PI * 2
  const aApexR = angleOf(L, apex)
  const aOutL = angleOf(R, [300, outerApexY]) + Math.PI * 2
  const aOutR = angleOf(L, [300, outerApexY])

  // The line of thrust: currents down the middle of the arch ring, crown to
  // springing, carried on down the middle of each pier to the ground.
  s.pass('together', 'intrados')
  s.arc(R, span, Math.PI, aApexL, 'ink', { flow: { mode: 'parallel', off: -t / 2, dir: -1 } })
  s.arc(L, span, 0, aApexR, 'ink', { flow: { mode: 'parallel', off: t / 2, dir: -1 } })
  s.pass('together', 'extrados')
  s.arc(R, span + t, Math.PI, aOutL, 'ink')
  s.arc(L, span + t, 0, aOutR, 'ink')

  // Voussoir joints: radial from each arc's centre, springing to crown.
  s.pass('fan', 'voussoirs')
  const joints = 6
  for (let i = 1; i < joints; i++) {
    const f = i / joints
    const al = Math.PI + (aApexL - Math.PI) * f
    const ar = (aApexR - 0) * f
    s.line(polar(R, span, al), polar(R, span + t, al), 'ink')
    s.line(polar(L, span, ar), polar(L, span + t, ar), 'ink')
  }

  // Piers and imposts.
  s.pass('together', 'piers')
  s.line([L[0], sy], [L[0], ground], 'ink', { flow: { mode: 'parallel', off: t / 2 } })
  s.line([R[0], sy], [R[0], ground], 'ink', { flow: { mode: 'parallel', off: -t / 2 } })
  s.line([L[0] - t, sy], [L[0] - t, ground], 'ink')
  s.line([R[0] + t, sy], [R[0] + t, ground], 'ink')
  s.pass('together', 'imposts')
  s.line([L[0] - t - 10, sy], [L[0] + 10, sy], 'ink')
  s.line([R[0] - 10, sy], [R[0] + t + 10, sy], 'ink')
  s.pass('relay', 'ground')
  s.line([60, ground], [540, ground], 'ink')

  s.pass('fan', 'pier section')
  hatch(s, [[L[0] - t, sy + 2], [L[0], sy + 2], [L[0], ground], [L[0] - t, ground]], -Math.PI / 4, 6, { pass: false })
  hatch(s, [[R[0], sy + 2], [R[0] + t, sy + 2], [R[0] + t, ground], [R[0], ground]], -Math.PI / 4, 6, { pass: false })

  dimension(s, L, R, -26, 'span = r')
  s.label([60, 646], 'arcus acutus', { kind: 'serif', size: 15 })
  return s.build()
}
