import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { duration, easePaper } from '@/theme/motion'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

/** Standard restrained "ink fade-in" on scroll into view. */
export function Reveal({ children, delay = 0, y = 24, className = '' }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: duration.reveal, ease: easePaper, delay }}
    >
      {children}
    </motion.div>
  )
}
