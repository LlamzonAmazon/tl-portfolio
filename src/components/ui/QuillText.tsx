import { useEffect, useRef } from 'react'
import type { ElementType, Ref } from 'react'
import { animate, splitText, stagger } from 'animejs'
import { animeDuration, animeEase, stagger as staggerStep } from '@/theme/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface QuillTextProps {
  text: string
  as?: ElementType
  className?: string
  /** Delay before the first glyph inks in, in seconds. */
  delay?: number
  /** Fires once the last glyph has landed (never fires under reduced motion — text is just static). */
  onComplete?: () => void
}

/**
 * Character-by-character "quill" reveal — each glyph inks in with a slight
 * downward settle, staggered like a hand-written line. Splits via anime.js
 * `splitText` (char-level, screen-reader-safe: the split spans are aria-hidden
 * behind a visually-hidden copy of the full text) and animates the chars
 * directly; this is a one-shot mount reveal, not a scroll-scrubbed timeline,
 * so it stays independent of PinnedStage's scrollTl/WipeText machinery — use
 * WipeText instead for anything that needs to sync with that scrub. Assumes
 * `text` is static post-mount — the splitter rebuilds the DOM subtree it
 * owns, which a later prop change can't cleanly reconcile against.
 */
export function QuillText({ text, as = 'span', className = '', delay = 0, onComplete }: QuillTextProps) {
  const Tag = as
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (reducedMotion) {
      onComplete?.()
      return
    }

    const splitter = splitText(el, { chars: true })

    const animation = animate(splitter.chars, {
      opacity: [0, 1],
      y: [6, 0],
      duration: animeDuration.base,
      ease: animeEase.ink,
      delay: stagger(staggerStep.tight * 1000, { start: delay * 1000 }),
      onComplete: () => onComplete?.(),
    })

    return () => {
      animation.revert()
      splitter.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reducedMotion, delay])

  return (
    <Tag ref={ref as Ref<never>} className={className}>
      {text}
    </Tag>
  )
}
