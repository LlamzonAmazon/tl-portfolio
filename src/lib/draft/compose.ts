/**
 * Composition: place several figures on one plate. Each figure is scaled
 * and moved into the plate's frame, then their passes are laid end to end
 * in the order given (a sequence picks them back out by index range), so
 * two studies can share a sheet and be joined by a line of their own.
 */

import { transformPath, type Vec } from './geometry'
import type { Figure, Stroke } from './sketch'

export interface Placement {
  figure: Figure
  /** Uniform scale, then translation, into the plate's frame. */
  k: number
  dx: number
  dy: number
}

const tv = (p: Vec, k: number, dx: number, dy: number): Vec => [p[0] * k + dx, p[1] * k + dy]

/** A figure scaled by k and moved by (dx, dy). Stroke ids are kept (they are already unique per figure). */
export function place({ figure, k, dx, dy }: Placement): Figure {
  const map = (s: Stroke): Stroke => ({
    ...s,
    d: transformPath(s.d, k, dx, dy),
    len: s.len * k,
    a: tv(s.a, k, dx, dy),
    b: tv(s.b, k, dx, dy),
    nodes: s.nodes.map((nd) => ({ ...nd, at: tv(nd.at, k, dx, dy) })),
    arm: s.arm ? { ...s.arm, c: tv(s.arm.c, k, dx, dy), r: s.arm.r * k } : undefined,
  })
  return {
    ...figure,
    passes: figure.passes.map((p) => ({ ...p, strokes: p.strokes.map(map) })),
    labels: figure.labels.map((l) => ({ ...l, at: tv(l.at, k, dx, dy), size: l.size * k })),
  }
}

/** Point p of a figure, mapped as `place` would map it. */
export const placePoint = (p: Vec, { k, dx, dy }: Placement): Vec => tv(p, k, dx, dy)

/** Every dot of a figure in one colour (a CSS value): a study keyed apart from its sheet. */
export function tint(figure: Figure, color: string): Figure {
  return {
    ...figure,
    passes: figure.passes.map((p) => ({
      ...p,
      strokes: p.strokes.map((s) => ({ ...s, nodes: s.nodes.map((nd) => ({ ...nd, color })) })),
    })),
  }
}

/** One plate from several figures (already placed), their passes in order. */
export function compose(id: string, box: Figure['box'], parts: Figure[]): Figure {
  return {
    id,
    box,
    passes: parts.flatMap((f) => f.passes),
    labels: parts.flatMap((f) => f.labels),
  }
}
