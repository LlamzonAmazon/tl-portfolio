import { registration, rose } from '../annotate'
import { sketch } from '../sketch'

/** CSS millimetre at the 96 dpi reference (the hero's live dimension uses the same). */
export const MM = 96 / 25.4

/**
 * Sheet furniture: the Instrumenta kit put to work on the stage itself.
 * Each piece is drawn at 1:1 in screen px and pinned by CSS to its corner,
 * so it holds its place at any viewport without measuring.
 */

/** A registration crosshair: circle, then a cross that overshoots it. Box 40 x 40. */
export function crosshair() {
  const s = sketch('crosshair', [0, 0, 40, 40])
  registration(s, [20, 20], 7)
  return s.build()
}

/**
 * The legend that stands on the title block: a north rose, right-aligned
 * to the title block. Box 260 x 84.
 * Passes: rose circle, rose star.
 */
export function legend() {
  const W = 260
  const s = sketch('legend', [0, 0, W, 84])
  rose(s, [W - 22, 38], 20)
  return s.build()
}
