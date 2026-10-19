import { useEffect } from 'react'
import { useLenis } from '@/context/LenisContext'

/** Keys that scroll the page natively. */
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

/**
 * Hard-locks page scroll (Lenis + native) while `locked` is true, WITHOUT
 * touching overflow: hiding overflow removes the scrollbar, and its return
 * after the lock reflows the whole page sideways. The scrollbar is always
 * there (html overflow-y: scroll, base.css); the lock blocks the inputs and
 * holds the position instead.
 */
export function useScrollLock(locked: boolean): void {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis || !locked) return
    lenis.stop()
    return () => lenis.start()
  }, [lenis, locked])

  useEffect(() => {
    if (!locked) return
    const y = window.scrollY
    // Scrollable panels inside a locked page (detail sheets) opt out, as they do for Lenis.
    const block = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.('[data-lenis-prevent]')) return
      e.preventDefault()
    }
    const blockKeys = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, [contenteditable="true"], [data-lenis-prevent]')) return
      if (SCROLL_KEYS.has(e.key)) e.preventDefault()
    }
    // A scrollbar drag cannot be cancelled: put the page straight back.
    const hold = () => {
      if (window.scrollY !== y) window.scrollTo(0, y)
    }
    const opts = { passive: false } as const
    window.addEventListener('wheel', block, opts)
    window.addEventListener('touchmove', block, opts)
    window.addEventListener('keydown', blockKeys)
    window.addEventListener('scroll', hold)
    document.documentElement.style.overscrollBehavior = 'none'
    return () => {
      window.removeEventListener('wheel', block)
      window.removeEventListener('touchmove', block)
      window.removeEventListener('keydown', blockKeys)
      window.removeEventListener('scroll', hold)
      document.documentElement.style.overscrollBehavior = ''
    }
  }, [locked])
}
