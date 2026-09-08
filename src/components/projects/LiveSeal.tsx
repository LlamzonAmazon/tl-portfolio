/**
 * "Live" mark for a project with a public demo — a pressed wax seal ringed by
 * a hand-roughened circle, the same feTurbulence/feDisplacementMap technique
 * as DraftingGrid/ProjectsLinework (own filter id per that file's per-usage
 * convention), so the ring reads as pressed into the card rather than
 * printed on it. Purely decorative — the modal's "View live ↗" link is the
 * actual affordance — so this stays aria-hidden.
 */
export function LiveSeal() {
  return (
    <span aria-hidden className="pointer-events-none absolute right-3 top-3 z-10">
      <svg viewBox="0 0 48 48" style={{ width: 44, height: 44, position: 'absolute', inset: -5 }}>
        <defs>
          <filter id="roughen-seal" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="var(--color-wax)"
          strokeWidth="1"
          opacity="0.55"
          filter="url(#roughen-seal)"
        />
      </svg>
      <span className="wax-seal">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: '7.5px',
            letterSpacing: '0.03em',
            color: 'var(--color-paper)',
          }}
        >
          LIVE
        </span>
      </span>
    </span>
  )
}
