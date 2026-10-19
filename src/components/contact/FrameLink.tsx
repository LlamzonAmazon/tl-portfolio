import { forwardRef } from 'react'
import { FrameEdges } from '@/components/projects/FrameEdges'

interface FrameLinkProps {
  href: string
  label: string
  /** Frame starts drawn (fallback). Default undrawn, for the stage timeline. */
  drawn?: boolean
}

/**
 * An outbound link set as a registered drafting label. Its corner marks are
 * drawn by the stage timeline on the same window as the label's wipe; on
 * hover the link inverts to a plate and a hue rule draws under the label
 * while the arrow nudges, on one clock.
 */
export const FrameLink = forwardRef<HTMLAnchorElement, FrameLinkProps>(function FrameLink(
  { href, label, drawn = false },
  ref,
) {
  return (
    <a ref={ref} href={href} target="_blank" rel="noreferrer" className="frame-link">
      <FrameEdges drawn={drawn} />
      <span className="frame-link__label">{label}</span>
      <span aria-hidden className="frame-link__arrow">
        ↗
      </span>
      <span aria-hidden className="frame-link__rule" />
    </a>
  )
})
