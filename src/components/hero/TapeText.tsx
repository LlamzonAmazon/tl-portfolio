import { forwardRef } from 'react'
import type { CSSProperties, ElementType, ReactNode, Ref } from 'react'

interface TapeTextProps {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Renders the mounted-paper plate behind the text. Off by default: the
   * sliding tape band is the paper surface during the reveal, so a plate
   * behind muddies the "magic tape" read. */
  plate?: boolean
  /** Merged with the required initial edge vars (e.g. a font-size override). */
  style?: CSSProperties
}

/**
 * Tape-reveal primitive: a flat paper-white band stretches across the line,
 * then contracts to reveal the ink behind it ("magic tape").
 * Dumb: the parent times the reveal via the forwarded ref by tweening two
 * edge vars in sequence: first `--lead` 0→1 (the band fills the line white),
 * then `--trail` 0→1 (the band collapses rightward, uncovering the ink):
 *   `gsap.to(ref.current, { '--lead': 1, ... })` then `{ '--trail': 1, ... }`.
 * The clip geometry derives from both in CSS (see `.tape-text*` in
 * styles/texture.css). Starts at 0/0 (fully hidden) so there's no FOUC before
 * the driver mounts.
 */
export const TapeText = forwardRef<HTMLElement, TapeTextProps>(function TapeText(
  { children, as = 'span', className = '', plate = false, style },
  ref,
) {
  const Tag = as

  return (
    <Tag
      ref={ref as Ref<never>}
      className={`tape-text ${className}`}
      style={{ ['--lead' as string]: 0, ['--trail' as string]: 0, ...style } as CSSProperties}
    >
      {plate && <span aria-hidden className="paper-card absolute inset-0" />}
      <span className="tape-text__ink relative">{children}</span>
      <span aria-hidden className="tape-text__band" />
    </Tag>
  )
})
