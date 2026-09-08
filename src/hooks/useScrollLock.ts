import { useEffect } from 'react'
import { useLenis } from '@/context/LenisContext'

/** Hard-locks page scroll (Lenis + native) while `locked` is true. */
export function useScrollLock(locked: boolean): void {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis || !locked) return
    lenis.stop()
    return () => lenis.start()
  }, [lenis, locked])

  useEffect(() => {
    if (!locked) return
    const html = document.documentElement
    const body = document.body
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      overscroll: html.style.overscrollBehavior,
      touch: body.style.touchAction,
    }
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.touchAction = 'none'
    return () => {
      html.style.overflow = prev.htmlOverflow
      body.style.overflow = prev.bodyOverflow
      html.style.overscrollBehavior = prev.overscroll
      body.style.touchAction = prev.touch
    }
  }, [locked])
}
