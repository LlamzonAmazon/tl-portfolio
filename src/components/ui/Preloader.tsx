import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { animate } from 'animejs'
import { site } from '@/content/site'
import { duration, easePaper, animeEase } from '@/theme/motion'
import { CompassMark } from '@/components/ui/CompassMark'
import { QuillText } from '@/components/ui/QuillText'

interface PreloaderProps {
  onComplete: () => void
}

const MIN_DURATION = 900
const FINISH_DURATION = 380

/** Paper drafting-board preloader. Gates on fonts + a minimum beat. */
export function Preloader({ onComplete }: PreloaderProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    // Progress lives outside React — anime.js writes straight to the DOM so
    // the bar never triggers per-frame re-renders.
    const progress = { value: 0 }
    let finish: ReturnType<typeof animate> | null = null
    let disposed = false

    const render = () => {
      if (barRef.current) barRef.current.style.width = `${progress.value}%`
      if (counterRef.current) {
        counterRef.current.textContent = `${String(Math.round(progress.value)).padStart(3, '0')}%`
      }
    }

    // Faux-progress: ease toward 90% while assets load, then finish.
    const ramp = animate(progress, {
      value: 90,
      duration: MIN_DURATION,
      ease: 'linear',
      onUpdate: render,
    })

    const ready = Promise.all([
      document.fonts.ready,
      new Promise<void>((r) => window.setTimeout(r, MIN_DURATION)),
    ])

    ready.then(() => {
      if (disposed) return
      ramp.pause()
      finish = animate(progress, {
        value: 100,
        duration: FINISH_DURATION,
        ease: animeEase.paper,
        onUpdate: render,
        onComplete,
      })
    })

    return () => {
      disposed = true
      ramp.revert()
      finish?.revert()
    }
  }, [onComplete])

  return (
    <motion.div
      className="paper-backdrop fixed inset-0 z-[200] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: duration.slow, ease: easePaper } }}
    >
      <div className="flex flex-col items-center gap-6" style={{ width: 'min(80vw, 22rem)' }}>
        <CompassMark />

        <QuillText as="span" text={site.wordmark} className="text-mono text-sepia" delay={0.15} />

        {/* Drawn progress rule */}
        <div className="relative h-px w-full bg-line">
          <div ref={barRef} className="absolute inset-y-0 left-0 bg-ink" style={{ width: '0%' }} />
        </div>

        <span ref={counterRef} className="text-mono-sm text-ink-soft tabular-nums">
          000%
        </span>
      </div>
    </motion.div>
  )
}
