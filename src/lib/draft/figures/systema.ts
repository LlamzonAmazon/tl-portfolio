import { ellipseArc, lengthFraction, polar, TAU, TOP, type Vec } from '../geometry'
import { sketch } from '../sketch'

/**
 * Systema Mundi: a heliocentric orrery, after Copernicus (1543), seen
 * obliquely so every orbit is an ellipse.
 *
 * The ecliptic axis and the meridian ring; the sun struck and its rays
 * fanned; the orbits drawn inside out, each planet landing on its orbit
 * the moment the pen passes; the moon's epicycle; the armillary ring
 * crossing them all.
 */
export interface SystemaOpts {
  /** Number of planets (orbits), innermost first. Up to five. */
  planets?: number
  /** Index of the keyed planet (in the sheet hue). */
  key?: number
  /**
   * Colour the seven bodies with the seven pigments, as the bodies are: the
   * sun yellow; Mercury violet, Venus indigo, Earth green (the third orbit,
   * which carries the moon's epicycle), Mars red, Jupiter orange; the Moon blue.
   */
  spectrum?: boolean
}

export function systema({ planets = 5, key = 2, spectrum = false }: SystemaOpts = {}) {
  // Pigment per body when `spectrum`: [sun, Mercury, Venus, Earth, Mars, Jupiter, Moon].
  const BODIES = ['orpiment', 'murex', 'indigo', 'verdigris', 'vermilion', 'minium', 'azurite']
  const hue = (i: number) => (spectrum ? `var(--color-${BODIES[i]})` : undefined)
  const s = sketch('systema', [0, 0, 640, 640])
  const c: Vec = [320, 320]
  const tilt = -0.2
  const squash = 0.34
  const orbits = [62, 110, 162, 218, 276].slice(0, Math.max(1, Math.min(5, planets)))
  const phases = [0.15, 0.62, 0.34, 0.83, 0.5]
  const numerals = ['I', 'II', 'III', 'IV', 'V']

  s.pass('together', 'axes')
  s.line(polar(c, 300, Math.PI + tilt), polar(c, 300, tilt), 'construct', { dashed: true })
  s.line(polar(c, 300, TOP + tilt), polar(c, 300, Math.PI / 2 + tilt), 'construct', { dashed: true })

  s.pass('relay', 'meridian')
  s.circle(c, 296, 'datum', { arm: true })

  s.pass('relay', 'sun')
  s.circle(c, 12, 'ink', spectrum ? { nodes: [{ at: c, f: 0 }], nodeR: 5, nodeColor: hue(0) } : {})
  s.pass('fan', 'rays')
  for (let k = 0; k < 16; k++) {
    const a = TOP + (k * TAU) / 16
    s.line(polar(c, 18, a), polar(c, k % 2 ? 25 : 32, a), k % 2 ? 'construct' : 'datum')
  }

  // The datum orbits (II, IV) become currents, each at its Kepler speed
  // (orbital speed ~ r^-1/2, against Earth's orbit): inner faster, outer slower.
  const kepler = (r: number) => Math.sqrt(162 / r)
  s.pass('fan', 'orbits')
  orbits.forEach((r, i) => {
    const t0 = Math.PI * 0.5
    const f = (u: number): Vec => {
      const th = t0 + TAU * u
      const x = r * Math.cos(th)
      const y = r * squash * Math.sin(th)
      return [c[0] + x * Math.cos(tilt) - y * Math.sin(tilt), c[1] + x * Math.sin(tilt) + y * Math.cos(tilt)]
    }
    const planet = f(phases[i])
    s.path(ellipseArc(c, r, r * squash, tilt, t0, t0 + TAU, 140), i % 2 ? 'datum' : 'ink', {
      nodes: [{ at: planet, f: lengthFraction(f, phases[i], 140) }],
      nodeKind: i === key ? 'key' : 'ink',
      nodeR: 3 + i * 0.7,
      nodeColor: hue(i + 1),
      flow: i % 2 ? { mode: 'replace', speed: kepler(r) } : undefined,
    })
    s.label([planet[0] + 9, planet[1] - 8], numerals[i], { size: 8.5, kind: i === key ? 'key' : 'label' })
    if (i === 2) {
      s.pass('relay', 'epicycle')
      s.circle(planet, 16, 'construct', { arm: true, nodes: [0.3], nodeKind: 'key', nodeR: 2, nodeColor: hue(6), flow: { mode: 'replace', speed: 1.5 } })
      s.pass('fan', 'orbits')
    }
  })

  s.pass('relay', 'armillary')
  s.path(ellipseArc(c, 296 * 0.28, 296, tilt, -Math.PI / 2, Math.PI * 1.5, 140), 'construct')
  s.label([36, 610], 'systema mundi', { kind: 'serif', size: 15 })
  return s.build()
}
