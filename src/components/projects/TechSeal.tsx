import { getTechIcon } from '@/lib/techIcons'

interface TechSealProps {
  tag: string
  /** Icon-only (collapsed card) vs icon + visible text (detail modal). */
  showLabel?: boolean
  /** Compact size for the pinned stage's tighter card footprint. */
  small?: boolean
}

/** First letter of the first two words, or the first two letters of a single word. */
function monogram(tag: string): string {
  const words = tag.split(/[\s.]+/).filter(Boolean)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return tag.slice(0, 2).toUpperCase()
}

export function TechSeal({ tag, showLabel = false, small = false }: TechSealProps) {
  const match = getTechIcon(tag)
  const sizeClass = small ? 'tech-seal--sm' : ''

  const badge = match ? (
    <span className={`tech-seal ${sizeClass}`} aria-hidden="true">
      <match.Icon />
    </span>
  ) : (
    <span className={`tech-seal tech-seal--stamp ${sizeClass}`} aria-hidden="true">
      <span className="text-mono-sm normal-case">{monogram(tag)}</span>
    </span>
  )

  if (!showLabel) return badge

  return (
    <span className="inline-flex items-center gap-2">
      {badge}
      <span className="text-mono-sm normal-case" style={{ color: 'var(--color-ink-soft)' }}>
        {match?.label ?? tag}
      </span>
    </span>
  )
}
