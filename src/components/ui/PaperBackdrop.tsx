/**
 * The whole site's paper surface, fixed behind everything so the entire
 * page reads as one sheet: flat paper, graphite grain, ink speckle. See
 * `.paper-backdrop` in texture.css. Rev C has no deckled edge: an outline
 * around the viewport is a border, and the board has none.
 */
export function PaperBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="paper-backdrop absolute inset-0" />
    </div>
  )
}
