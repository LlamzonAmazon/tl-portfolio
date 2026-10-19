import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { animate } from 'animejs'
import { gsap } from 'gsap'
import { site } from '@/content/site'
import { animeEase, bezier, duration, eraseRatio, gsapEase, preloader } from '@/theme/motion'
import { win } from '@/theme/sequences'
import { WIPE_HIDDEN, WIPE_SHOWN } from '@/components/hero/wipeConstants'
import { Drawing } from '@/components/ui/Drawing'
import { drawFigure, type DrawingHandle } from '@/lib/draft/choreo'
import { systema } from '@/lib/draft/figures/systema'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface PreloaderProps {
  onComplete: () => void
}

/**
 * Every face the first screen paints. `document.fonts.ready` alone is not a
 * gate: a face is only fetched once something on the page uses it, so before
 * the hero mounts `ready` resolves without them and the name first paints in
 * the fallback (Georgia 600, a true bold), then swaps.
 */
const FIRST_PAINT_FONTS = [
  '500 1em "Cormorant Garamond"',
  '600 1em "Cormorant Garamond"',
  '400 1em Inter',
  '500 1em Inter',
]
/** Never hold the site hostage to a slow font CDN. */
const FONT_TIMEOUT = 4000

/**
 * The orrery's passes (lib/draft/figures/systema.ts): axes, meridian, sun,
 * rays, the inner orbits and the moon's epicycle are the load; the outer
 * orbits and the armillary ring are the release.
 */
const LOAD_PASSES = [0, 6] as const
const RELEASE_PASSES = [6, 8] as const
/** Release timing, in seconds: the rays fan, the plate holds, then everything retracts. */
const RELEASE = duration.draw
const HOLD = duration.hold
const RETRACT = duration.reveal * eraseRatio

/** The text the first screen sets, so the right unicode-range subsets are fetched. */
const SAMPLE = 'THOMAS LLAMZON Building Scalable 0123456789'

/**
 * The Google Fonts stylesheet registers the @font-face rules. Until it has
 * loaded, document.fonts.load() finds no matching face and resolves at
 * once, which is how the name used to paint in the fallback (Georgia, whose
 * 600 is a true bold) and then swap: so wait for the sheet first.
 */
function fontSheetLoaded(): Promise<void> {
  const link = document.querySelector<HTMLLinkElement>('link[href*="fonts.googleapis.com/css"]')
  if (!link || link.sheet) return Promise.resolve()
  return new Promise((resolve) => {
    link.addEventListener('load', () => resolve(), { once: true })
    link.addEventListener('error', () => resolve(), { once: true })
  })
}

async function loadFonts(): Promise<unknown> {
  const load = (async () => {
    await fontSheetLoaded()
    await Promise.all(FIRST_PAINT_FONTS.map((f) => document.fonts.load(f, SAMPLE)))
    await document.fonts.ready
  })()
  return Promise.race([load.catch(() => undefined), new Promise<void>((r) => window.setTimeout(r, FONT_TIMEOUT))])
}

/**
 * SEQ-00, sheet 00 (vermilion): Systema Mundi. The load IS the orrery being
 * set out: axes, the meridian ring, the sun and its rays, then the inner
 * orbits, each planet landing as the pen passes, all in proportion to
 * progress. When the page is ready the outer orbits close and the
 * armillary ring sweeps through them. Then the plate retracts, last drawn
 * first, and the sheet lifts away (a wipe, never a fade) onto the hero.
 * Under reduced motion the finished plate is shown as it stands, and the
 * sheet hands over as soon as the faces are loaded, after a short beat.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const figure = useMemo(() => systema({ spectrum: true }), [])
  const reduced = usePrefersReducedMotion()
  const drawingRef = useRef<DrawingHandle>(null)
  const wordRef = useRef<HTMLSpanElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const loadTl = useRef<gsap.core.Timeline | null>(null)
  const releaseTl = useRef<gsap.core.Timeline | null>(null)

  // Timelines: the load is scrubbed by progress, the release plays on time.
  useLayoutEffect(() => {
    const h = drawingRef.current
    if (!h || reduced) return
    const load = gsap.timeline({ paused: true })
    load.fromTo(wordRef.current, { clipPath: WIPE_HIDDEN }, { clipPath: WIPE_SHOWN, duration: preloader.wordmark, ease: gsapEase.pen }, 0)
    drawFigure(load, h, win(preloader.plateAt, preloader.plateSpan, gsapEase.pen), 'draw', { passes: LOAD_PASSES })
    loadTl.current = load

    const release = gsap.timeline({ paused: true })
    drawFigure(release, h, win(0, RELEASE, gsapEase.pen), 'draw', { passes: RELEASE_PASSES })
    const out = win(RELEASE + HOLD, RETRACT, gsapEase.erase)
    drawFigure(release, h, out, 'retract')
    release.fromTo([wordRef.current, counterRef.current], { clipPath: WIPE_SHOWN }, { clipPath: WIPE_HIDDEN, duration: out.dur, ease: out.ease, immediateRender: false }, out.at)
    releaseTl.current = release
    return () => {
      load.kill()
      release.kill()
    }
  }, [figure, reduced])

  useEffect(() => {
    // Reduced motion: no ramp and no draw. Wait for the faces, hold a beat, hand over.
    if (reduced) {
      let live = true
      let beat: number | undefined
      loadFonts().then(() => {
        if (live) beat = window.setTimeout(onComplete, duration.hold * 1000)
      })
      return () => {
        live = false
        window.clearTimeout(beat)
      }
    }

    // Progress lives outside React: anime.js writes it, the load timeline follows it.
    const progress = { value: 0 }
    let finish: ReturnType<typeof animate> | null = null
    let disposed = false

    const render = () => {
      loadTl.current?.progress(progress.value / 100)
      if (counterRef.current) counterRef.current.textContent = `${String(Math.round(progress.value)).padStart(3, '0')}%`
    }

    const ramp = animate(progress, { value: preloader.rampTo, duration: preloader.minMs, ease: animeEase.linear, onUpdate: render })
    const ready = Promise.all([loadFonts(), new Promise<void>((r) => window.setTimeout(r, preloader.minMs))])

    ready.then(() => {
      if (disposed) return
      ramp.pause()
      finish = animate(progress, {
        value: 100,
        duration: preloader.finishMs,
        ease: animeEase.ink,
        onUpdate: render,
        onComplete: () => {
          const release = releaseTl.current
          if (!release) return onComplete()
          release.eventCallback('onComplete', onComplete)
          release.play(0)
        },
      })
    })

    return () => {
      disposed = true
      ramp.revert()
      finish?.revert()
      releaseTl.current?.eventCallback('onComplete', null)
    }
  }, [onComplete, reduced])

  return (
    <motion.div
      data-sheet="00"
      className="paper-backdrop fixed inset-0 z-(--z-preloader) flex flex-col items-center justify-center"
      initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: reduced ? 0 : duration.base, ease: bezier.erase } }}
    >
      {/* Scale contrast: the orrery is far larger than the screen, centred on
          it, its meridian ring and outer orbits running off every edge. */}
      <div
        className="stage-plate"
        style={{ left: '50%', top: '50%', height: 'max(125vh, 92vw)', aspectRatio: '1', transform: 'translate(-50%, -50%)' }}
      >
        <Drawing ref={drawingRef} figure={figure} animated={!reduced} sheet="00" />
      </div>
      <span
        ref={wordRef}
        className="text-label text-label--key absolute inline-block"
        style={{ top: '7%', left: '50%', translate: '-50% 0', clipPath: reduced ? undefined : WIPE_HIDDEN }}
      >
        {site.wordmark}
      </span>
      <span ref={counterRef} className="text-label-sm absolute" style={{ right: '6%', bottom: '7%' }}>
        {reduced ? '100%' : '000%'}
      </span>
    </motion.div>
  )
}
