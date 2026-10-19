import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { bezier, duration, travel } from '@/theme/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

/**
 * Standard restrained "ink fade-in" on scroll into view. This is the
 * document-flow fallback (mobile, touch), the one place opacity is allowed to
 * reveal; under reduced motion it renders in place, with no fade and no travel.
 */
export function Reveal({ children, delay = 0, y = travel.max, className = '' }: RevealProps) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: duration.reveal, ease: bezier.ink, delay }}
    >
      {children}
    </motion.div>
  )
}
