import { polar, TAU, TOP, type Vec } from '../geometry'
import { sketch } from '../sketch'

/**
 * Rosa: a hexafoil rosette, compass alone.
 *
 * The generating circle; six compass swings, each planted where the last
 * crossed the circle (the classic construction, every radius the same);
 * the petals traced in ink over them; the twelve divisions; the ring of
 * the rose window; its sixty ticks, every fifth long.
 */
export function rosa() {
  const s = sketch('rosa', [0, 0, 600, 600])
  const c: Vec = [300, 300]
  const R = 170

  s.pass('relay', 'generating circle')
  s.circle(c, R, 'construct', { arm: true, nodes: [0], nodeKind: 'key' })

  s.pass('relay', 'compass swings')
  for (let k = 0; k < 6; k++) {
    const pk = polar(c, R, TOP + (k * TAU) / 6)
    const back = TOP + (k * TAU) / 6 + Math.PI
    s.arc(pk, R, back - Math.PI / 3 - 0.12, back + Math.PI / 3 + 0.12, 'construct', { arm: true })
  }

  s.pass('fan', 'petals')
  for (let k = 0; k < 6; k++) {
    const pk = polar(c, R, TOP + (k * TAU) / 6)
    const back = TOP + (k * TAU) / 6 + Math.PI
    s.arc(pk, R, back - Math.PI / 3, back + Math.PI / 3, 'ink', { nodes: ['start'], nodeKind: 'key', nodeR: 2.8 })
  }

  s.pass('fan', 'divisions')
  for (let k = 0; k < 12; k++) {
    const a = TOP + (k * TAU) / 12 + TAU / 24
    s.line(polar(c, 8, a), polar(c, R + 30, a), 'construct')
  }

  s.pass('together', 'rings')
  s.circle(c, R + 30, 'ink')
  s.circle(c, R + 52, 'ink', { from: TOP + Math.PI })

  s.pass('fan', 'ticks')
  for (let k = 0; k < 60; k++) {
    const a = TOP + (k * TAU) / 60
    s.line(polar(c, R + 52, a), polar(c, R + (k % 5 === 0 ? 40 : 46), a), k % 5 === 0 ? 'ink' : 'datum')
  }
  s.label([30, 580], 'rosa · vi', { kind: 'serif', size: 15 })
  return s.build()
}
