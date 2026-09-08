/**
 * The whole site's paper surface — fixed behind everything so the entire
 * page reads as one sheet of parchment, not a flat color with textures
 * pasted over individual sections. See `.paper-backdrop` in texture.css.
 *
 * The SVG overlay adds a deckled edge: two roughened, slightly mismatched
 * boundary lines just inside the viewport frame, standing in for a hand-torn
 * cotton-paper edge rather than a hard digital crop.
 */
export function PaperBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="paper-backdrop absolute inset-0" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <filter id="deckle" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <rect x={5} y={5} width={990} height={990} stroke="var(--color-sepia)" strokeWidth={1.4} opacity={0.1} filter="url(#deckle)" />
        <rect x={11} y={11} width={978} height={978} stroke="var(--color-ink)" strokeWidth={0.8} opacity={0.04} filter="url(#deckle)" />
      </svg>
    </div>
  )
}
