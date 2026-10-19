import { intersect, lerp, polar, unit, type Vec } from '../geometry'
import { protractor } from '../annotate'
import { sketch } from '../sketch'
import { SPECTRUM } from '@/theme/spectrum'

/**
 * Experimentum Crucis: Newton's prism (Opticks, 1704). The emblem of this
 * palette: one ink ray in, the seven pigments out.
 *
 * The prism set out as an equilateral triangle; the normal to its first
 * face and the protractor that will measure the incidence; the white ray
 * enters; the refracted ray crosses the glass; the screen; then the seven
 * rays fan out from the second face, least bent first, each in its
 * pigment, each band lettered on the screen.
 *
 * Passes: 0 prism · 1 normal · 2 protractor arc · 3 its ticks ·
 * 4 white ray · 5 screen · 6 dispersion (the preloader splits at 5).
 * The ONLY figure that draws structure in colour, because colour is its
 * subject.
 */
export function spectrum() {
  const s = sketch('spectrum', [0, 0, 780, 460])
  const c: Vec = [350, 245]
  const side = 230
  const top: Vec = polar(c, side / Math.sqrt(3), -Math.PI / 2)
  const bl: Vec = polar(c, side / Math.sqrt(3), (5 * Math.PI) / 6)
  const br: Vec = polar(c, side / Math.sqrt(3), Math.PI / 6)
  const screenX = 720

  s.pass('relay', 'prism')
  s.line(bl, top, 'ink', { over: 10 })
  s.line(top, br, 'ink', { over: 10 })
  s.line(br, bl, 'ink', { over: 10 })

  // Entry and exit at equal heights: the minimum-deviation path, level in the glass.
  const entry = lerp(bl, top, 0.45)
  const exit = lerp(top, br, 0.55)
  const n1 = unit(bl, top)
  const normal: Vec = [-n1[1], n1[0]]
  s.pass('relay', 'normal')
  s.line([entry[0] - normal[0] * 60, entry[1] - normal[1] * 60], [entry[0] + normal[0] * 60, entry[1] + normal[1] * 60], 'construct', { dashed: true })

  // The angle of incidence, measured before the ray arrives.
  protractor(s, entry, 30, Math.atan2(-normal[1], -normal[0]), Math.atan2(330 - entry[1], 40 - entry[0]), 0.1, 3, 'construct')

  s.pass('relay', 'white ray')
  s.line([40, 330], entry, 'ink', { nodes: ['end'] })
  s.line(entry, exit, 'ink', { nodes: ['end'] })

  s.pass('relay', 'screen')
  s.line([screenX, 60], [screenX, 420], 'ink')

  s.pass('fan', 'dispersion')
  SPECTRUM.forEach((p, i) => {
    const a = 0.12 + i * 0.065
    const far: Vec = [exit[0] + Math.cos(a) * 600, exit[1] + Math.sin(a) * 600]
    const hit = intersect(exit, far, [screenX, 0], [screenX, 1])
    s.line(exit, hit, 'key', { color: p.mark })
    s.label([hit[0] + 10, hit[1] + 3.5], p.band, { size: 10, color: p.ink })
  })

  s.label([40, 440], 'experimentum crucis', { kind: 'serif', size: 15 })
  return s.build()
}
