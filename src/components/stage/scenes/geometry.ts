/** Measuring helpers shared by every stage scene's `layout()`. */

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** Bounding box of an element's TEXT (not its full block width), relative to `origin`. */
export function textBox(el: Element, origin: DOMRect): Box {
  const range = document.createRange()
  range.selectNodeContents(el)
  const b = range.getBoundingClientRect()
  return { x: b.left - origin.left, y: b.top - origin.top, w: b.width, h: b.height }
}

/** Border box of an element relative to `origin`. */
export function elBox(el: Element, origin: DOMRect): Box {
  const b = el.getBoundingClientRect()
  return { x: b.left - origin.left, y: b.top - origin.top, w: b.width, h: b.height }
}

/** Write an SVG path's `d`, tolerating a missing ref. */
export function setD(el: SVGPathElement | null | undefined, d: string) {
  el?.setAttribute('d', d)
}

let measureCtx: CanvasRenderingContext2D | null = null

/**
 * Tight box of an element's actual GLYPH ink, relative to `origin`. A text
 * range's rect is the font's full ascent/descent box, which overlaps the gap
 * between two display lines; this trims it to the drawn glyphs vertically.
 */
export function glyphBox(el: Element, origin: DOMRect): Box {
  const box = textBox(el, origin)
  measureCtx ??= document.createElement('canvas').getContext('2d')
  const cs = getComputedStyle(el)
  if (!measureCtx) return box
  measureCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const raw = el.textContent ?? ''
  const text = cs.textTransform === 'uppercase' ? raw.toUpperCase() : raw
  const m = measureCtx.measureText(text)
  const baseline = box.y + m.fontBoundingBoxAscent
  const y = baseline - m.actualBoundingBoxAscent
  return { x: box.x, y, w: box.w, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent }
}
