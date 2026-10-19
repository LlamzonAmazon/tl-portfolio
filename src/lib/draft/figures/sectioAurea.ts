import { arc, dist, n, type Vec } from '../geometry'
import { dimension } from '../annotate'
import { sketch } from '../sketch'

const PHI = (1 + Math.sqrt(5)) / 2

/**
 * Sectio Aurea: the golden rectangle, cut square by square, with the
 * spiral inked through it as ONE continuous line.
 *
 * Construction order: the outer rectangle; the square cuts in the order
 * they are made (left, top, right, bottom, ...); the two diagonals that
 * cross at the spiral's eye; then the spiral in a single sweep that ends
 * on the eye; then the 1 : phi dimensions.
 */
export function sectioAurea() {
  const H = 380
  const W = H * PHI
  const x0 = 60
  const y0 = 60
  const s = sketch('aurea', [0, 0, W + 120, H + 150])

  s.pass('relay', 'rectangle')
  s.line([x0, y0], [x0 + W, y0], 'construct', { over: 14 })
  s.line([x0 + W, y0], [x0 + W, y0 + H], 'construct', { over: 14 })
  s.line([x0 + W, y0 + H], [x0, y0 + H], 'construct', { over: 14 })
  s.line([x0, y0 + H], [x0, y0], 'construct', { over: 14 })

  // Cut squares in rotation; each arc lives in the square just cut.
  let [x, y, w, h] = [x0, y0, W, H]
  const cuts: Array<[Vec, Vec]> = []
  const arcs: Array<{ c: Vec; r: number; a0: number; a1: number }> = []
  for (let k = 0; k < 9; k++) {
    const q = Math.PI / 2
    const base = Math.PI + k * q
    if (k % 4 === 0) {
      const sq = h
      cuts.push([[x + sq, y], [x + sq, y + h]])
      arcs.push({ c: [x + sq, y + h], r: sq, a0: base, a1: base + q })
      x += sq
      w -= sq
    } else if (k % 4 === 1) {
      const sq = w
      cuts.push([[x, y + sq], [x + w, y + sq]])
      arcs.push({ c: [x, y + sq], r: sq, a0: base, a1: base + q })
      y += sq
      h -= sq
    } else if (k % 4 === 2) {
      const sq = h
      cuts.push([[x + w - sq, y], [x + w - sq, y + h]])
      arcs.push({ c: [x + w - sq, y], r: sq, a0: base, a1: base + q })
      w -= sq
    } else {
      const sq = w
      cuts.push([[x, y + h - sq], [x + w, y + h - sq]])
      arcs.push({ c: [x + w, y + h - sq], r: sq, a0: base, a1: base + q })
      h -= sq
    }
  }

  s.pass('fan', 'square cuts')
  // A dot where each of the first four cuts leaves the rectangle's edge
  // (past the overshoot: f is measured along the overshot line).
  cuts.forEach(([a, b], i) => {
    const over = i < 4 ? 8 : 3
    const f = over / (Math.hypot(b[0] - a[0], b[1] - a[1]) + 2 * over)
    s.line(a, b, 'construct', { over, nodes: i < 4 ? [{ at: a, f }] : undefined, nodeR: 2.6 })
  })

  // The eye: the limit the cut rectangles shrink to. It lies on one diagonal
  // of the whole rectangle and one of the first remainder; draw those two.
  for (let k = 9; k < 32; k++) {
    if (k % 4 === 0) [x, w] = [x + h, w - h]
    else if (k % 4 === 1) [y, h] = [y + w, h - w]
    else if (k % 4 === 2) w -= h
    else h -= w
  }
  const eye: Vec = [x + w / 2, y + h / 2]
  const offLine = (a: Vec, b: Vec) => Math.abs((b[0] - a[0]) * (a[1] - eye[1]) - (a[0] - eye[0]) * (b[1] - a[1])) / dist(a, b)
  const diag = (rx: number, ry: number, rw: number, rh: number): [Vec, Vec] => {
    const d1: [Vec, Vec] = [[rx, ry + rh], [rx + rw, ry]]
    const d2: [Vec, Vec] = [[rx, ry], [rx + rw, ry + rh]]
    return offLine(...d1) < offLine(...d2) ? d1 : d2
  }
  const [da, db] = [diag(x0, y0, W, H), diag(x0 + H, y0, W - H, H)]
  s.pass('together', 'diagonals')
  s.line(da[0], da[1], 'construct', { dashed: true })
  s.line(db[0], db[1], 'construct', { dashed: true, nodes: [{ at: eye, f: dist(db[0], eye) / dist(db[0], db[1]) }], nodeKind: 'key' })

  // The spiral: nine quarter arcs joined into one pen path.
  s.pass('relay', 'spiral')
  let d = ''
  let len = 0
  arcs.forEach((q, i) => {
    const p = arc(q.c, q.r, q.a0, q.a1)
    d += i === 0 ? p.d : p.d.replace(/^M[^A]+/, ' ')
    len += p.len
  })
  const start: Vec = [x0, y0 + H]
  const last = arcs[arcs.length - 1]
  const end: Vec = [last.c[0] + last.r * Math.cos(last.a1), last.c[1] + last.r * Math.sin(last.a1)]
  d += ` L${n(eye[0])} ${n(eye[1])}`
  len += dist(end, eye)
  s.path({ d, len, a: start, b: eye }, 'ink', { nodes: ['start'] })
  s.label([eye[0] + 12, eye[1] + 20], 'oculus', { kind: 'serif', size: 13 })

  dimension(s, [x0, y0 + H], [x0 + H, y0 + H], 34, '1')
  dimension(s, [x0, y0 + H], [x0 + W, y0 + H], 62, 'φ = 1.618')
  return s.build()
}
