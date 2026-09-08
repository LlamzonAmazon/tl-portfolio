interface RulerDividerProps {
  /** Section number, e.g. "04" — printed as-is, so pass it pre-padded. */
  index: string
  label: string
  className?: string
}

/**
 * "NN — Label" section marker + a drafting-scale dashed rule, formalizing the
 * pattern already used inline for the hero/projects headings (see
 * PinnedStage's "03 — Projects"). Document-flow sections only — the pinned
 * stage keeps driving its own headings via WipeText on the shared scrollTl,
 * not this component.
 */
export function RulerDivider({ index, label, className = '' }: RulerDividerProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-mono whitespace-nowrap">
        {index} — {label}
      </span>
      <div className="ruler-divider-line flex-1" />
    </div>
  )
}
