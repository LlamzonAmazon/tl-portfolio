import type { Variants } from 'framer-motion'
import { bezier, duration } from '@/theme/motion'
import { WIPE_HIDDEN, WIPE_SHOWN } from '@/components/hero/wipeConstants'

/**
 * Paper unroll = UNROLL_HIDDEN -> UNROLL_SHOWN (the visible boundary sweeps
 * top -> bottom, like a rolled blueprint unrolling). Insets are negative on
 * every side so the paper's shadow is never clipped at rest.
 */
export const UNROLL_HIDDEN = 'inset(-4% -4% 104% -4%)'
export const UNROLL_SHOWN = 'inset(-4% -4% -4% -4%)'

/**
 * Fallback-path sheet drafting (ProjectsBoard). The card is a variant node
 * with no motion of its own (so the board staggers whole sheets); its three
 * layers run in order: the frame is drawn, the paper unrolls, the face inks.
 */
export const sheetVariants: Variants = { hidden: {}, visible: {} }

export const sheetFrameVariants: Variants = {
  hidden: { strokeDashoffset: 1 },
  visible: { strokeDashoffset: 0, transition: { duration: duration.base, ease: bezier.pen } },
}

export const sheetPaperVariants: Variants = {
  hidden: { clipPath: UNROLL_HIDDEN },
  visible: { clipPath: UNROLL_SHOWN, transition: { delay: duration.base * 0.45, duration: duration.base, ease: bezier.ink } },
}

export const sheetFaceVariants: Variants = {
  hidden: { clipPath: WIPE_HIDDEN },
  visible: { clipPath: WIPE_SHOWN, transition: { delay: duration.base * 0.9, duration: duration.base, ease: bezier.ink } },
}
