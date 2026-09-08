import { motion } from 'framer-motion'
import { site } from '@/content/site'
import { hero } from '@/content/hero'
import { duration, easePaper } from '@/theme/motion'
import { DraftingGrid } from '@/components/ui/DraftingGrid'

interface HeroFallbackProps {
  /** Preloader-complete gate — content stays hidden until true. */
  ready: boolean
}

/**
 * Mobile/touch/reduced-motion path: normal document flow, staggered fade/slide
 * reveals gated on `ready`. No GSAP, no ScrollTrigger, no clip-path (avoids
 * paint-cost concerns on touch hardware).
 */
export function HeroFallback({ ready }: HeroFallbackProps) {
  return (
    <div
      className="relative flex min-h-[100svh] flex-col justify-center"
      style={{ padding: 'var(--section-px)' }}
    >
      <DraftingGrid />

      <div className="relative mx-auto w-full" style={{ maxWidth: 'var(--content-max)' }}>
        <h1 className="text-display">
          {site.displayName.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: '110%' }}
                animate={ready ? { y: '0%' } : { y: '110%' }}
                transition={{ duration: duration.reveal, ease: easePaper, delay: 0.1 + i * 0.14 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="text-mono mt-8 text-sepia"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: duration.slow, ease: easePaper, delay: 0.6 }}
        >
          {hero.subtext}
        </motion.p>

        <motion.p
          className="text-heading mt-20"
          initial={{ opacity: 0, y: 24 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: duration.reveal, ease: easePaper, delay: 0.9 }}
          style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}
        >
          {hero.title}
        </motion.p>

        <ul className="mt-10 flex flex-col gap-3">
          {hero.pillars.map((pillar, i) => (
            <motion.li
              key={pillar}
              className="text-serif-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: duration.reveal, ease: easePaper, delay: 1.2 + i * 0.16 }}
            >
              {pillar}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}
