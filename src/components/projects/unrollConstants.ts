import { duration, easePaper } from '@/theme/motion'

/**
 * Reveal = tween UNROLL_HIDDEN -> UNROLL_SHOWN (visible boundary sweeps
 * bottom -> top, like a rolled blueprint unrolling upward). Bottom-anchored
 * — deliberately a different axis from Hero's WipeText (left -> right).
 */
export const UNROLL_HIDDEN = 'inset(0% 0% 100% 0%)'
export const UNROLL_SHOWN = 'inset(0% 0% 0% 0%)'

/** Framer variants for a card in the stagger container — parent flips "hidden" -> "visible". */
export const unrollCardVariants = {
  hidden: { clipPath: UNROLL_HIDDEN, y: 28 },
  visible: {
    clipPath: UNROLL_SHOWN,
    y: 0,
    transition: { duration: duration.reveal, ease: easePaper },
  },
} as const
