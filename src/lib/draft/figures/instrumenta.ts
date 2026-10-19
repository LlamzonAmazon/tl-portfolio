import { dimension, hatch, leader, protractor, registration, rose, scaleBar } from '../annotate'
import { sketch } from '../sketch'

/**
 * Instrumenta: the annotation kit on one plate, the specimen for every
 * mark a sheet can carry. Each instrument is drawn in its own order (see
 * annotate.ts), plate left to right.
 */
export function instrumenta() {
  const s = sketch('instrumenta', [0, 0, 780, 400])

  rose(s, [110, 150], 74)

  s.pass('relay', 'subject')
  s.line([250, 210], [450, 210], 'ink')
  s.line([450, 210], [450, 110], 'ink')
  s.line([450, 110], [250, 110], 'ink')
  s.line([250, 110], [250, 210], 'ink')
  hatch(s, [[250, 110], [450, 110], [450, 210], [250, 210]], -Math.PI / 4, 9)
  dimension(s, [250, 210], [450, 210], 30, '200')
  dimension(s, [450, 210], [450, 110], 30, '100')
  leader(s, [350, 110], [400, 62], 'sectio a–a')

  protractor(s, [620, 210], 96, Math.PI, Math.PI * 2, Math.PI / 36, 3)
  s.pass('relay', 'reading')
  s.line([620, 210], [620 + 96 * Math.cos(-0.9), 210 + 96 * Math.sin(-0.9)], 'key', { nodes: ['start', 'end'], nodeKind: 'key', nodeR: 2.4 })
  s.label([586, 196], '52°', { kind: 'key', size: 9, anchor: 'end' })

  registration(s, [80, 330], 10)
  scaleBar(s, [250, 340], 200, 10, '1 m')
  s.label([520, 346], 'instrumenta', { kind: 'serif', size: 15 })
  return s.build()
}
