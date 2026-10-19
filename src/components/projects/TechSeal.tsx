import { getTechIcon } from '@/lib/techIcons'

interface TechSealProps {
  tag: string
  /** Icon-only (collapsed card) vs icon + visible text (detail modal). */
  showLabel?: boolean
  /** Compact size for the pinned stage's tighter card footprint. */
  small?: boolean
}

/** A tool's mark on a graphite disc (lib/techIcons.ts resolves every tag to a logo). */
export function TechSeal({ tag, showLabel = false, small = false }: TechSealProps) {
  const { Icon, label } = getTechIcon(tag)
  const badge = (
    <span className={`tech-seal ${small ? 'tech-seal--sm' : ''}`} aria-hidden="true" title={label}>
      <Icon />
    </span>
  )

  if (!showLabel) return badge

  return (
    <span className="inline-flex items-center gap-2">
      {badge}
      <span className="text-label-sm">{label}</span>
    </span>
  )
}
