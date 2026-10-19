import { cubic, lerp, segment, type PathShape, type Vec } from '../geometry'
import { sketch } from '../sketch'

export interface DiramatioOpts {
  /** Plane size (px): drawn in the receiving scene's own coordinates. */
  w: number
  h: number
  /** Where the line leaves the sheet above: the right-hand end of its datum. */
  from: Vec
  /** The split point: the prism's apex stands on it (centred, on the seam between the sheets). */
  split: Vec
  /** One landing point per ray, left to right. */
  lands: Vec[]
  /** The line stays in the margin until below this height (the lowest card above), then turns in. */
  clearY?: number
  /** Prism side, px. */
  side?: number
}

/** Join path shapes end to end into one pen stroke. */
function join(parts: PathShape[]): PathShape {
  const d = parts.map((p, i) => (i === 0 ? p.d : p.d.replace(/^M[^A-Z]*?(?=[A-Z])/, ' '))).join('')
  return { d, len: parts.reduce((m, p) => m + p.len, 0), a: parts[0].a, b: parts[parts.length - 1].b }
}

/**
 * Diramatio: one line through a prism becomes one line per column. The
 * experimentum crucis of the preloader, reused as a transition: the line
 * leaves the right-hand end of the datum above still travelling right,
 * turns down the margin past the last card, sweeps back under the cards
 * and enters a small prism standing on the seam between the sheets; it
 * refracts through the glass and leaves the base as rays, one landing on
 * each column below, least bent to the nearest column, most to the
 * furthest. Ink rays, keyed landings: here the split is the subject, not
 * the colour.
 *
 * Passes: 0 the run to the prism · 1 the prism · 2 the beam in the glass ·
 * 3 the rays, nearest column first.
 * Stroke count depends only on lands.length, so a resize rewrites paths.
 */
export function diramatio({ w, h, from, split, lands, side = 64, clearY }: DiramatioOpts) {
  const s = sketch('diramatio', [0, 0, w, h])
  const apex: Vec = [split[0], split[1] + 6]
  const ht = side * (Math.sqrt(3) / 2)
  const bl: Vec = [apex[0] - side / 2, apex[1] + ht]
  const br: Vec = [apex[0] + side / 2, apex[1] + ht]
  const entry = lerp(apex, br, 0.45)
  const exit: Vec = [apex[0], apex[1] + ht]

  // How far past the datum's end the line may swing before it turns down:
  // inside the board's right margin, never off the sheet.
  const reach = Math.max(16, Math.min(64, (w - from[0]) * 0.6))
  const turnX = from[0] + reach
  // Turn down into the margin, hold it until clear of the cards, then sweep
  // back in under them and arrive level at the prism's entry face.
  const turnR = Math.min(reach, 40)
  const clear = Math.min(clearY ?? split[1] - 40, entry[1] - 30)
  const run = join([
    cubic(from, [from[0] + turnR * 0.55, from[1]], [turnX, from[1] + turnR * 0.45], [turnX, from[1] + turnR]),
    segment([turnX, from[1] + turnR], [turnX, clear]),
    cubic([turnX, clear], [turnX, entry[1]], [entry[0] + (turnX - entry[0]) * 0.45, entry[1]], entry),
  ])

  s.pass('relay', 'run to the prism')
  s.path(run, 'ink', { nodes: ['start'], nodeKind: 'key', nodeR: 3.2 })

  s.pass('relay', 'prism')
  s.line(bl, apex, 'ink', { over: 6 })
  s.line(apex, br, 'ink', { over: 6 })
  s.line(br, bl, 'ink', { over: 6 })

  s.pass('relay', 'beam in the glass')
  s.line(entry, exit, 'ink', { nodes: ['start', 'end'], nodeKind: 'key', nodeR: 2.6 })

  s.pass('fan', 'rays')
  const order = [...lands].sort((a, b) => Math.abs(a[0] - exit[0]) - Math.abs(b[0] - exit[0]))
  for (const p of order) s.line(exit, p, 'ink', { nodes: ['end'], nodeKind: 'key', nodeR: 3 })
  return s.build()
}
