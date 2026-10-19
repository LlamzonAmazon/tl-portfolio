import { intersect, type Vec } from '../geometry'
import { hatch } from '../annotate'
import { sketch } from '../sketch'

export interface PicturaOpts {
  /** Plate size in figure units. */
  w?: number
  h?: number
  /** Centric (vanishing) point. On the stage it sits on the board origin, so the dive passes through it. */
  vp?: Vec
  /** Ground line height. */
  ground?: number
  /** Braccia across the ground line (one pavement column each). */
  cols?: number
  /** Ground-line margin either side of the braccia. */
  margin?: number
  /** Hatch only the nearest N rows (the rest stay open, e.g. behind type). */
  hatchRows?: number
  /** 'full' letters the centric and distance points; 'title' only the plate title. */
  lettering?: 'full' | 'title'
  /** Fill for the centric and distance points (a CSS value); defaults to the sheet hue. */
  pointColor?: string
}

/**
 * De Pictura: Alberti's perspective pavement (1435), by the distance-point
 * method.
 *
 * The horizon and its centric point; the ground line ticked into equal
 * braccia; orthogonals fanned from each tick to the centric point; one
 * diagonal to the distance point, whose crossings with the orthogonals set
 * where every transversal falls; the transversals, nearest first; then the
 * pavement hatched in alternate cells, front to back.
 *
 * Passes, in order (stage sequences split them by index):
 *   0 horizon · 1 ground line · 2 braccia · 3 orthogonals · 4 diagonal ·
 *   5 transversals · 6 pavement edges · 7 pavement hatch
 */
export function dePictura(o: PicturaOpts = {}) {
  const w = o.w ?? 800
  const h = o.h ?? 520
  const vp = o.vp ?? [400, 190]
  const gy = o.ground ?? 470
  const cols = o.cols ?? 8
  const margin = o.margin ?? 80
  const hatchRows = o.hatchRows ?? cols
  const lettering = o.lettering ?? 'full'
  const hy = vp[1]
  const step = (w - 2 * margin) / cols
  const x0 = margin
  const dp: Vec = [vp[0] + (w - 2 * margin) * 0.52, hy]
  const ticks = Array.from({ length: cols + 1 }, (_, i) => x0 + i * step)
  const s = sketch('pictura', [0, 0, w, h])

  const hx0 = Math.min(40, margin / 2)
  const hx1 = w - hx0
  s.pass('relay', 'horizon')
  s.line([hx0, hy], [hx1, hy], 'construct', {
    nodes: [(vp[0] - hx0) / (hx1 - hx0), (Math.min(dp[0], hx1) - hx0) / (hx1 - hx0)],
    nodeKind: 'key',
    nodeColor: o.pointColor,
    nodeR: 4,
  })
  if (lettering === 'full') {
    s.label([vp[0], hy - 12], 'punctum centricum', { anchor: 'middle', kind: 'key', size: 8.5 })
    s.label([dp[0], hy - 12], 'distantia', { anchor: 'middle', size: 8 })
  }

  s.pass('relay', 'ground line')
  s.line([x0 - 30, gy], [x0 + cols * step + 30, gy], 'ink')
  s.pass('fan', 'braccia')
  ticks.forEach((x) => s.line([x, gy], [x, gy + 8], 'mark'))

  s.pass('fan', 'orthogonals')
  ticks.forEach((x) => s.line([x, gy], vp, 'construct'))

  // The diagonal to the distance point fixes the depth of every row.
  const diagA: Vec = [x0, gy]
  s.pass('relay', 'diagonal')
  s.line(diagA, dp, 'datum', { dashed: true })
  const rows: number[] = [gy]
  for (let i = 1; i <= cols; i++) rows.push(intersect(diagA, dp, [ticks[i], gy], vp)[1])

  // Pavement edge at depth y on orthogonal i.
  const at = (i: number, y: number): Vec => {
    const t = (gy - y) / (gy - hy)
    return [ticks[i] + (vp[0] - ticks[i]) * t, y]
  }

  s.pass('fan', 'transversals')
  rows.slice(1).forEach((y) => s.line(at(0, y), at(cols, y), 'ink'))
  s.pass('together', 'pavement edges')
  s.line([ticks[0], gy], at(0, rows[cols]), 'ink')
  s.line([ticks[cols], gy], at(cols, rows[cols]), 'ink')

  // Alternate cells hatched, front row first, as one cascade.
  s.pass('fan', 'pavement')
  for (let r = 0; r < Math.min(cols, hatchRows); r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2) continue
      const quad: Vec[] = [at(c, rows[r]), at(c + 1, rows[r]), at(c + 1, rows[r + 1]), at(c, rows[r + 1])]
      hatch(s, quad, -Math.PI / 4, 5.5, { pass: false })
    }
  }

  // Lettered under the ground line; on a full-bleed plate (no margin) it is
  // inset to stay on screen when `slice` crops the sides of a narrow viewport.
  s.label([margin > 0 ? x0 - 30 : w * 0.19, Math.min(h - 12, gy + 30)], 'de pictura · mcdxxxv', { kind: 'serif', size: 15 })
  return s.build()
}
