/**
 * Small compass-rose loading mark for the Preloader — the same
 * compass-study vocabulary as DraftingGrid's hero backdrop, at instrument
 * scale. The needle sweeps continuously (a bounded, restrained rotation, not
 * a free bounce) as the only "something is happening" affordance while fonts
 * and the minimum beat resolve.
 */
export function CompassMark({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 48 48"
      className={className}
      style={{ width: 40, height: 40 }}
    >
      <circle cx="24" cy="24" r="19" stroke="var(--color-line)" strokeWidth="1" fill="none" />
      <circle cx="24" cy="24" r="1.6" fill="var(--color-ink-soft)" />
      {[0, 90, 180, 270].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="4"
          x2="24"
          y2="8.5"
          stroke="var(--color-sepia)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
      <g style={{ transformOrigin: '24px 24px', animation: 'compass-sweep 2.2s linear infinite' }}>
        <line x1="24" y1="24" x2="24" y2="7" stroke="var(--color-ink)" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="24" y1="24" x2="24" y2="35" stroke="var(--color-sepia)" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
        <circle cx="24" cy="7" r="1.8" fill="var(--color-wax)" />
      </g>
    </svg>
  )
}
