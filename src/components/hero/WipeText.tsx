import { forwardRef } from 'react'
import type { CSSProperties, ElementType, ReactNode, Ref } from 'react'
import { WIPE_HIDDEN } from './wipeConstants'

interface WipeTextProps {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Renders the mounted-paper plate behind the text. Off for text meant to
   * sit directly on the page rather than read as a tape-mounted card. */
  plate?: boolean
  /** Merged with the required initial clip-path (e.g. a font-size override). */
  style?: CSSProperties
}

/**
 * Shared tape-wipe primitive: text (optionally backed by a mounted-paper
 * plate layer), both clipped by one `clip-path`. Dumb: the parent times the
 * reveal/close directly via the forwarded ref
 * (`gsap.to(ref.current, { clipPath: WIPE_SHOWN | WIPE_HIDDEN }, ...)`).
 * Starts fully clipped so there's no FOUC before GSAP mounts.
 */
export const WipeText = forwardRef<HTMLElement, WipeTextProps>(function WipeText(
  { children, as = 'span', className = '', plate = true, style },
  ref,
) {
  const Tag = as

  return (
    <Tag ref={ref as Ref<never>} className={`relative ${className}`} style={{ clipPath: WIPE_HIDDEN, ...style }}>
      {plate && <span aria-hidden className="paper-card absolute inset-0" />}
      <span className="relative">{children}</span>
    </Tag>
  )
})
