import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { bezier, duration, eraseRatio } from '@/theme/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/* A hairline is DRAWN from the left once the sheet has opened, and retracted
   (right to left, via the origin) when it closes. The parent must supply the
   `hidden` / `visible` labels (SheetModal does). */
const rule: Variants = {
  hidden: { scaleX: 0, transition: { duration: duration.base * eraseRatio, ease: bezier.erase } },
  visible: { scaleX: 1, transition: { duration: duration.draw, delay: duration.base * 0.5, ease: bezier.pen } },
}

/** A drawn hairline across a detail sheet. */
export function SheetRule() {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <span aria-hidden className="sheet-rule" />
  return <motion.span aria-hidden className="sheet-rule" variants={rule} />
}

interface SheetHeadingProps {
  children: ReactNode
}

/** A section header on a detail sheet: a keyed small-caps label and a drawn rule to the sheet's edge. */
export function SheetHeading({ children }: SheetHeadingProps) {
  return (
    <div className="sheet-heading">
      <h4 className="sheet-heading__text">{children}</h4>
      <SheetRule />
    </div>
  )
}
