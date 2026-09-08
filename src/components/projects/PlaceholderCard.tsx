interface PlaceholderCardProps {
  label?: string
}

/**
 * An empty framed sheet holding a spot on the pinned-stage collage for
 * projects not yet written up. Purely decorative: a plain div (never a
 * button), aria-hidden, no layoutId/modal wiring — the fallback
 * ProjectsBoard never renders these.
 */
export function PlaceholderCard({ label = 'More soon' }: PlaceholderCardProps) {
  return (
    <div
      aria-hidden
      className="frame-draft frame-draft--placeholder paper-card placeholder-face relative flex h-full items-end overflow-hidden p-3 sm:p-4"
    >
      <span className="text-mono" style={{ color: 'var(--color-sepia-light)', opacity: 0.6 }}>
        {label}
      </span>
    </div>
  )
}
