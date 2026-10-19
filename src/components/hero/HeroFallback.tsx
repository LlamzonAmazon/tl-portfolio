import { useLayoutEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { site } from '@/content/site'
import { bezier, duration, stagger, travel } from '@/theme/motion'
import { Drawing } from '@/components/ui/Drawing'
import { SectionPlate } from '@/components/ui/SectionPlate'
import { CONTACT_LINKS } from '@/components/contact/contactLinks'
import { FrameLink } from '@/components/contact/FrameLink'
import { playFigure, type DrawingHandle } from '@/lib/draft/choreo'
import { dePictura } from '@/lib/draft/figures/dePictura'
import { iactus } from '@/lib/draft/figures/iactus'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const PICTURA = dePictura()
const IACTUS = iactus()

interface HeroFallbackProps {
  /** Preloader-complete gate: content stays hidden until true. */
  ready: boolean
}

/**
 * Mobile/touch/reduced-motion hero: the name and the contact links, with Iactus Iridis
 * thrown over it and De Pictura oversized beneath. The name rises line by
 * line once the preloader clears; the projectile is drawn by the pen as the
 * first line lands. Static under reduced motion.
 */
export function HeroFallback({ ready }: HeroFallbackProps) {
  const reduced = usePrefersReducedMotion()
  const flightRef = useRef<DrawingHandle>(null)

  useLayoutEffect(() => {
    const h = flightRef.current
    if (!h || reduced || !ready) return
    const tl = playFigure(h, { duration: Math.min(duration.construct, h.schedule.freeDuration) })
    tl.delay(duration.base)
    return () => {
      tl.kill()
    }
  }, [ready, reduced])

  const [, , bw, bh] = IACTUS.box

  return (
    <div
      data-sheet="01"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden"
      style={{ padding: 'var(--section-px)' }}
    >
      <SectionPlate figure={PICTURA} width="230%" x="50%" y="66%" play={ready} tone="pale" />

      <div className="relative mx-auto w-full" style={{ maxWidth: 'var(--content-max)', transform: 'translateY(-10svh)' }}>
        {/* Hung above the name (out of flow) so the name itself sits on the viewport's vertical centre; oversized, bleeding off the left so the impact mark lands inside the screen. */}
        <div aria-hidden className="absolute bottom-full" style={{ left: '-56%', width: '160%', aspectRatio: String(bw / bh), transform: 'translateY(30%)' }}>
          <Drawing ref={flightRef} figure={IACTUS} animated={!reduced} tone="ghost" className="block h-full w-full overflow-visible" />
        </div>
        <h1 className="text-display text-display--hero">
          {site.displayName.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={reduced ? false : { y: '110%' }}
                animate={ready || reduced ? { y: '0%' } : { y: '110%' }}
                transition={{ duration: duration.reveal, ease: bezier.ink, delay: stagger.item + i * stagger.item }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
      </div>

      {/* The links sit at 75% of the hero's height (out of flow, so the name keeps its place), over the pavement. */}
      <motion.div
        className="absolute flex flex-wrap items-center gap-5"
        style={{ top: '75%', left: 'var(--section-px)', right: 'var(--section-px)' }}
        initial={reduced ? false : { opacity: 0, y: travel.min }}
        animate={ready || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: travel.min }}
        transition={{ duration: duration.reveal, ease: bezier.ink, delay: stagger.item * 4 }}
      >
        {CONTACT_LINKS.map((link) => (
          <FrameLink key={link.key} href={link.href} label={link.label} drawn />
        ))}
      </motion.div>
    </div>
  )
}
