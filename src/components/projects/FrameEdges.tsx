interface FrameEdgesProps {
  /** Render already drawn (static / fallback usage). Default: undrawn, for a timeline to draw. */
  drawn?: boolean
}

/**
 * The canonical corner component: a host's registration marks, as four edge
 * spans clockwise from top-left. They sit outside the host's box, overshoot
 * each corner, and grow their arms on hover and focus (--mark-arm, see
 * "Registration corners" in texture.css). Each span's transform-origin is where
 * its pen starts, so a timeline can draw them (lib/lines.ts `edges`); with
 * `drawn` they are simply there. Any `relative` host takes them: links, role
 * cards, and (via DrawnFrame, the Framer driver of the same spans) modals.
 * SheetFrame is the SVG pen form of the same marks, for project sheets.
 */
export function FrameEdges({ drawn = false }: FrameEdgesProps) {
  const x = drawn ? undefined : { transform: 'scaleX(0)' }
  const y = drawn ? undefined : { transform: 'scaleY(0)' }
  return (
    <>
      <span aria-hidden className="frame-edge frame-edge--t" style={x} />
      <span aria-hidden className="frame-edge frame-edge--r" style={y} />
      <span aria-hidden className="frame-edge frame-edge--b" style={x} />
      <span aria-hidden className="frame-edge frame-edge--l" style={y} />
    </>
  )
}
