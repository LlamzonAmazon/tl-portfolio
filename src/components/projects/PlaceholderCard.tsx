import type { ReactNode } from 'react'
import { SheetFrame } from './SheetFrame'

interface PlaceholderCardProps {
  label?: string
  /** A study plate drafted on the empty sheet: future work, still on the board. */
  plate?: ReactNode
}

/**
 * An unissued sheet holding a spot on the pinned-stage collage for
 * projects not yet written up. Purely decorative: a plain div (never a
 * button), aria-hidden, no modal wiring. Same three drafted layers as
 * ProjectCard (paper, face, frame); its face carries a study plate.
 */
export function PlaceholderCard({ label = 'More soon', plate }: PlaceholderCardProps) {
  return (
    <div aria-hidden className="draft-sheet h-full w-full">
      <span className={`draft-sheet__paper paper-card ${plate ? '' : 'placeholder-face'}`} />
      <SheetFrame muted />
      <span className="card-face relative flex h-full w-full flex-col p-3 sm:p-4">
        {plate && <span className="placeholder-plate">{plate}</span>}
        <span className="text-label mt-auto">{label}</span>
      </span>
    </div>
  )
}
