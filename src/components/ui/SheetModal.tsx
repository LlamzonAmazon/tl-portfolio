import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { bezier, duration, eraseRatio } from '@/theme/motion'
import type { SheetKey } from '@/theme/spectrum'
import { useScrollLock } from '@/hooks/useScrollLock'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { DrawnFrame } from './DrawnFrame'

interface SheetModalProps {
  /** id of the element that names the dialog (its heading). */
  labelledBy: string
  /** The sheet (section) this dialog belongs to: keys its labels and focus ring to that sheet's hue. */
  sheet?: SheetKey
  onClose: () => void
  children: ReactNode
}

const INSTANT = { duration: 0 } as const

/* The scrim is the one fade on the board (owner's call): tone and blur over
   the page, in on the base clock, out on the erase clock. The sheet itself
   is never faded: it grows out of its top-left corner (where its corner
   marks start) and retracts the same way. */
const scrim: Variants = {
  hidden: { opacity: 0, transition: { duration: duration.base * eraseRatio, ease: bezier.erase } },
  visible: { opacity: 1, transition: { duration: duration.base, ease: bezier.ink } },
}

const panel: Variants = {
  hidden: { clipPath: 'inset(0% 100% 100% 0%)', transition: { duration: duration.base * eraseRatio, ease: bezier.erase } },
  visible: { clipPath: 'inset(-2% -2% -2% -2%)', transition: { duration: duration.base, ease: bezier.ink } },
}

/* Reduced motion: same end states, no travel between them. */
const scrimInstant: Variants = {
  hidden: { opacity: 0, transition: INSTANT },
  visible: { opacity: 1, transition: INSTANT },
}

const panelInstant: Variants = {
  hidden: { clipPath: 'inset(0% 100% 100% 0%)', transition: INSTANT },
  visible: { clipPath: 'inset(-2% -2% -2% -2%)', transition: INSTANT },
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * The shared dialog shell for every detail sheet (projects, experience):
 * portal to <body>, a scrim that fades in and blurs the board, focus trap,
 * Escape to close, scroll lock, focus restored to the trigger, and a square
 * paper sheet whose frame is DRAWN on open and retracted on close
 * (DrawnFrame) on the panel's own clock. Stacking is explicit: the layer
 * owns --z-modal, the scrim is its bottom, the sheet one step above
 * (tokens.css). Content components supply only what goes on the sheet.
 */
export function SheetModal({ labelledBy, sheet, onClose, children }: SheetModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useScrollLock(true)

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus({ preventScroll: true })
    return () => {
      previouslyFocused.current?.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <motion.div className="sheet-layer" data-sheet={sheet} initial="hidden" animate="visible" exit="hidden">
      {/* A sibling of the sheet, never its ancestor: backdrop-filter only sees the page if nothing above it clips or fades. */}
      <motion.div
        aria-hidden
        className="sheet-scrim"
        variants={reduced ? scrimInstant : scrim}
        onClick={onClose}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        variants={reduced ? panelInstant : panel}
        className="sheet-panel paper-card"
      >
        <DrawnFrame />
        <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close details" className="sheet-close">
          Close
        </button>

        {/* data-lenis-prevent: a stopped Lenis cancels every wheel event outside an opted-out subtree. Focusable so the keyboard can scroll it. */}
        <div data-lenis-prevent tabIndex={0} className="sheet-scroll">
          {children}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  )
}
