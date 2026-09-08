import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from 'gsap'
import { AnimatePresence } from 'framer-motion'
import { site } from '@/content/site'
import { hero } from '@/content/hero'
import { projects } from '@/content/projects'
import { duration, gsapEase, heroMotion, stagger } from '@/theme/motion'
import { DraftingGrid, type DraftingGridHandle } from '@/components/ui/DraftingGrid'
import { splitBeats } from '@/components/hero/beats'
import { WipeText } from '@/components/hero/WipeText'
import { TapeText } from '@/components/hero/TapeText'
import { WIPE_HIDDEN, WIPE_SHOWN } from '@/components/hero/wipeConstants'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PlaceholderCard } from '@/components/projects/PlaceholderCard'
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal'

interface PinnedStageProps {
  /** Preloader-complete gate — the intro only plays once true. */
  ready: boolean
}

/** Stagger between each name line's intro tape reveal, in seconds. */
const NAME_STAGGER = 0.5

/**
 * Tape-reveal timing (per name line). Deliberately slow and premium: the band
 * stretches to full width, holds a beat, then contracts to uncover the ink.
 *   STRETCH — leading edge fills the line white (`--lead` 0→1).
 *   HOLD    — the line sits fully covered for a beat before it opens.
 *   REVEAL  — trailing edge chases across, uncovering the ink (`--trail` 0→1).
 * Each subsequent line also runs slightly slower (NAME_RATE_STEP) so THOMAS
 * and LLAMZON don't read as locked to the same clock.
 */
const TAPE_STRETCH = duration.reveal * 1.05 // ~0.95s — slow, deliberate stretch
const TAPE_HOLD = 0.1
const TAPE_REVEAL = duration.reveal * 0.85 // ~0.77s — elastic release, smooth decel
const NAME_RATE_STEP = 0.15

/**
 * Intro-only duration overrides — slower than the shared `duration.slow` /
 * `duration.draw` tokens (which stay untouched since Preloader, Reveal, and
 * HeroFallback all key off them too). Scoped here so only the hero's
 * autoplaying construction-line draw slows down. The background line-draw
 * runs on its own pace so it doesn't read as locked to the text reveal.
 */
const INTRO_SLOW = duration.slow * 1.4
const INTRO_DRAW = duration.draw * 1.7

/** Hero's scroll-scrubbed segment durations, in abstract timeline seconds. */
const SEGMENT = {
  nameExit: 1,
  title: 1,
  pillars: 1.5,
  hold: 0.4,
} as const

/**
 * Projects scene's segments, chained directly after Hero's on the SAME
 * scrollTl/pin — the site is one continuous scroll-locked timeline, never a
 * normal-flow section the pin releases into. Additional scroll budget for
 * this scene, in viewport-heights (added to heroMotion.vhTotal).
 */
const PROJECTS_SEGMENT = {
  heroExit: 0.8,
  zoomOut: 1.6,
  headingIn: 0.7,
  hold: 0.4,
} as const
const PROJECTS_VH = 3.5

/**
 * The board zoom-out, expressed WITHOUT any full-viewport scaled plane.
 * (Scaling a viewport-sized textured div 2.7× forces Chrome to rasterize a
 * ~150MB composited layer at Retina dpr; the GPU evicts/re-rasters it
 * mid-scrub, which read as jitter + cards flickering in and out.) Instead
 * the same motion is decomposed into cheap equivalents, all scrubbed over
 * the same window with ease 'none' so nothing can drift out of rate:
 * - Grid fineness: the repeating tile's background-size tweens 140px →
 *   BOARD_GRID_TILE, anchored at the zoom origin via --grid-anchor — a
 *   pattern zooming about its anchor is pixel-identical to plane scaling.
 * - Cards: each collage wrapper gets ONE tween of x/y/scale reproducing
 *   plane-scale ∘ entry-offset exactly: for plane scale S about origin
 *   O = (50vw, 42vh), a card resting at P (%) with entry offset d renders
 *   at O + S·(P + d − O) scaled by S — i.e. with transformOrigin '0 0',
 *   x0 = (S−1)(P_x−50) + S·d_x (vw), y0 = (S−1)(P_y−42) + S·d_y (vh).
 *   Endpoint frames match the old plane math exactly; each card is its own
 *   small composited layer, so no giant texture ever exists.
 */
const BOARD_ZOOM_SCALE = 2.7 // tunable 2.2–3.0; larger = cards start further out and shrink more
const BOARD_GRID_TILE = 140 / BOARD_ZOOM_SCALE // ≈52px settled tile (reads as 140px during the hero)
const BOARD_ORIGIN_X = 50 // zoom origin (vw/vh %) = the hero/heading gap
const BOARD_ORIGIN_Y = 42

/**
 * The projects collage — cards positioned around the centered heading
 * (clear zone roughly x 36–64%, y 34–58%), each entering from its own
 * screen edge. At start scale S, a slot only begins off-screen "for free"
 * if its far edge clears x<31.5% / x>68.5% / y<26.4% / y>63.5% of the
 * viewport — none of these do with margin, so every slot carries an
 * explicit entry `offset` (vw/vh, plane-local: the ambient plane scale
 * multiplies it) tweened to 0 across the same zoomOut window as the
 * plane-scale tween, keeping card motion in lockstep with the grid.
 * `from` documents the intended entry edge; `offset` is the tuned value.
 */
interface CollageSlot {
  key: string
  kind: 'project' | 'placeholder'
  projectId?: number
  rect: { left: number; top: number; width: number; height: number } // % of viewport
  offset: { x?: number; y?: number } // vw / vh
  from: 'left' | 'right' | 'top' | 'bottom'
}

const COLLAGE_LAYOUT: CollageSlot[] = [
  { key: 'wsc',    kind: 'project',     projectId: 3, rect: { left: 2,  top: 3,  width: 38, height: 54 }, offset: { x: -20 }, from: 'left' },
  { key: 'ph-a',   kind: 'placeholder',               rect: { left: 42, top: 3,  width: 28, height: 36 }, offset: { y: -16 }, from: 'top' },
  { key: 'ph-b',   kind: 'placeholder',               rect: { left: 72, top: 3,  width: 24, height: 28 }, offset: { y: -10 }, from: 'top' },
  { key: 'thesis', kind: 'project',     projectId: 2, rect: { left: 72, top: 33, width: 24, height: 30 }, offset: { x: 8 },   from: 'right' },
  { key: 'ph-c',   kind: 'placeholder',               rect: { left: 72, top: 65, width: 24, height: 32 }, offset: { y: 6 },   from: 'bottom' },
  // The dashboard card's old footprint (left 2, width 66) is now split in
  // two: it keeps the left half, and a new placeholder takes the right half
  // (the freed center-bottom space), so the bottom row reads as two cards.
  { key: 'dash',   kind: 'project',     projectId: 1, rect: { left: 2,  top: 59, width: 32, height: 38 }, offset: { x: -20 }, from: 'left' },
  { key: 'ph-d',   kind: 'placeholder',               rect: { left: 36, top: 59, width: 32, height: 38 }, offset: { y: 10 },  from: 'bottom' },
]

/**
 * The site's single pinned `100svh` stage — everything (Hero, then Projects,
 * then any future section) lives inside it as stacked absolute layers, wiped
 * in/out by ONE scrollTl scrubbed against ONE pin. Scroll never releases
 * mid-site; it only ever brings the next layer to center while the previous
 * one wipes out and its construction lines erase.
 */
export function PinnedStage({ ready }: PinnedStageProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const nameLineRefs = useRef<Array<HTMLElement | null>>([])
  const subtextRef = useRef<HTMLParagraphElement | null>(null)
  const titleRef = useRef<HTMLElement | null>(null)
  const pillarRefs = useRef<Array<HTMLElement | null>>([])
  const draftingRef = useRef<DraftingGridHandle>(null)

  const projectsLabelRef = useRef<HTMLElement | null>(null)
  const projectsHeadingRef = useRef<HTMLElement | null>(null)
  const gridPlaneRef = useRef<HTMLDivElement>(null)
  const cardsPlaneRef = useRef<HTMLDivElement>(null)
  const cardsWrapperRef = useRef<HTMLDivElement>(null)
  const collageWrapperRefs = useRef<Array<HTMLDivElement | null>>([])

  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)
  const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) ?? null, [activeProjectId])

  useLayoutEffect(() => {
    if (!ready || !stageRef.current) return

    const introTlRef: { current: gsap.core.Timeline | null } = { current: null }
    const scrollTlRef: { current: gsap.core.Timeline | null } = { current: null }

    const mm = gsap.matchMedia()

    mm.add(
      '(min-width: 768px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
      () => {
        const introTl = gsap.timeline({ paused: true })
        introTlRef.current = introTl
        const grid = draftingRef.current

        // Each name line is a two-phase tape reveal: the band first STRETCHES
        // to fill the line white (`--lead`), holds, then CONTRACTS to uncover
        // the ink (`--trail`). THOMAS leads; LLAMZON starts NAME_STAGGER later
        // and runs a touch slower (NAME_RATE_STEP), so the two read staggered,
        // not locked to one clock.
        nameLineRefs.current.forEach((el, i) => {
          const at = i * NAME_STAGGER
          const rate = 1 + i * NAME_RATE_STEP
          const stretch = TAPE_STRETCH * rate
          // Stretch: elastic ease-in-out reads as the band pulling to full width.
          introTl.to(el, { '--lead': 1, ease: 'power2.inOut', duration: stretch }, at)
          // Reveal: begins once full width + hold has elapsed. power3.out (ink)
          // releases quick but decelerates smoothly — an elastic snap-back
          // without expo.out's abrupt, jittery initial spike.
          introTl.to(
            el,
            { '--trail': 1, ease: gsapEase.ink, duration: TAPE_REVEAL * rate },
            at + stretch + TAPE_HOLD,
          )
        })
        // Subtext joins late — as the first name line is well into its reveal —
        // so it never appears while the names are still covered white bars.
        const subtextAt = TAPE_STRETCH + TAPE_HOLD + TAPE_REVEAL * 0.6
        introTl.to(
          subtextRef.current,
          { opacity: 1, y: 0, ease: gsapEase.paper, duration: INTRO_SLOW },
          subtextAt,
        )

        // Background draws in step with the name: baseline first, then the
        // compass sweep, then the arc — plotted nodes land as it settles.
        if (grid) {
          introTl.to(grid.baseline, { strokeDashoffset: 0, ease: gsapEase.paper, duration: INTRO_DRAW }, 0)
          introTl.to(
            grid.compassOuter,
            { strokeDashoffset: 0, ease: gsapEase.paper, duration: INTRO_DRAW },
            NAME_STAGGER * 0.5,
          )
          introTl.to(
            grid.protractorArc,
            { strokeDashoffset: 0, ease: gsapEase.paper, duration: INTRO_DRAW },
            NAME_STAGGER,
          )
          introTl.to(
            grid.compassNodes,
            { scale: 1, ease: gsapEase.ink, duration: INTRO_SLOW, stagger: stagger.tight },
            nameLineRefs.current.length * NAME_STAGGER * 0.6,
          )
        }

        introTl.eventCallback('onComplete', () => {
          const STAGE_VH_TOTAL = heroMotion.vhTotal + PROJECTS_VH

          const scrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              start: 'top top',
              end: `+=${STAGE_VH_TOTAL * 100}%`,
              pin: true,
              pinSpacing: true,
              scrub: heroMotion.scrub,
            },
          })
          scrollTlRef.current = scrollTl

          // ---- Hero segment 1: name-exit is a simple scroll-driven fade (the
          // tape only ever reveals — the text-out is intentionally not a
          // reverse tape) + subtext fade-out.
          nameLineRefs.current.forEach((el) => {
            scrollTl.to(el, { opacity: 0, ease: 'none', duration: SEGMENT.nameExit }, 0)
          })
          scrollTl.to(subtextRef.current, { opacity: 0, ease: 'none', duration: SEGMENT.nameExit }, 0)

          // The compass study retracts in step with the name it accompanied —
          // getTotalLength() is measured live, so this exactly undoes
          // whatever the intro drew, regardless of the initial estimate.
          if (grid) {
            scrollTl.to(
              [grid.baseline, grid.compassOuter, grid.protractorArc],
              {
                strokeDashoffset: (_i, target: SVGGeometryElement) => target.getTotalLength(),
                ease: 'none',
                duration: SEGMENT.nameExit,
              },
              0,
            )
            scrollTl.to(grid.compassNodes, { scale: 0, ease: 'none', duration: SEGMENT.nameExit }, 0)
          }

          // ---- Hero segment 2: title wipes in top-center.
          const titleStart = SEGMENT.nameExit
          scrollTl.to(titleRef.current, { clipPath: WIPE_SHOWN, ease: 'none', duration: SEGMENT.title }, titleStart)

          // ---- Hero segment 3: three pillars wipe in sequentially, each drawing its
          // own leader tick + plotting its own node as it lands. The spine
          // they hang off of draws continuously across the whole segment.
          const pillarsStart = titleStart + SEGMENT.title
          if (grid) {
            scrollTl.to(grid.pillarSpine, { strokeDashoffset: 0, ease: 'none', duration: SEGMENT.pillars }, pillarsStart)
          }
          const pillarBeats = splitBeats(pillarsStart, pillarsStart + SEGMENT.pillars, pillarRefs.current.length)
          pillarBeats.forEach((b, i) => {
            scrollTl.to(pillarRefs.current[i], { clipPath: WIPE_SHOWN, ease: 'none', duration: b.end - b.start }, b.start)
            const line = grid?.pillarLines[i]
            const node = grid?.pillarNodes[i]
            if (line) {
              scrollTl.to(line, { strokeDashoffset: 0, ease: 'none', duration: b.end - b.start }, b.start)
            }
            if (node) {
              scrollTl.to(
                node,
                { scale: 1, ease: 'none', duration: (b.end - b.start) * 0.6 },
                b.start + (b.end - b.start) * 0.3,
              )
            }
          })

          // ---- Hero hold: a short pause so the pillars' completed state settles
          // before the site moves on — nothing here reverses further scroll into Projects.
          const heroExitStart = pillarsStart + SEGMENT.pillars + SEGMENT.hold

          // ---- Projects segment 1: Hero's title + pillars wipe back out, and every
          // piece of grid linework tied to them retracts — the board being erased
          // before the next drawing starts, not just covered up.
          scrollTl.to(titleRef.current, { clipPath: WIPE_HIDDEN, ease: 'none', duration: PROJECTS_SEGMENT.heroExit }, heroExitStart)
          pillarRefs.current.forEach((el) => {
            scrollTl.to(el, { clipPath: WIPE_HIDDEN, ease: 'none', duration: PROJECTS_SEGMENT.heroExit }, heroExitStart)
          })
          if (grid) {
            const pillarLines = grid.pillarLines.filter((el): el is SVGLineElement => el !== null)
            scrollTl.to(
              [grid.pillarSpine, ...pillarLines].filter((el): el is SVGLineElement => el !== null),
              {
                strokeDashoffset: (_i, target: SVGGeometryElement) => target.getTotalLength(),
                ease: 'none',
                duration: PROJECTS_SEGMENT.heroExit,
              },
              heroExitStart,
            )
            scrollTl.to(grid.pillarNodes, { scale: 0, ease: 'none', duration: PROJECTS_SEGMENT.heroExit }, heroExitStart)
          }

          // ---- Projects segment 2: the board zoom-out. The grid's tile size
          // and every card's x/y/scale scrub over the SAME window with the
          // same linear ease, so grid fineness and card motion stay in
          // lockstep. Overlaps the tail of hero-exit so the motion reads
          // continuous.
          const zoomStart = heroExitStart + PROJECTS_SEGMENT.heroExit * 0.7
          scrollTl.to(
            gridPlaneRef.current,
            { '--grid-major': `${BOARD_GRID_TILE}px`, ease: 'none', duration: PROJECTS_SEGMENT.zoomOut },
            zoomStart,
          )

          // Per-card zoom+entry (see the BOARD_ZOOM_SCALE comment for the
          // derivation) — GSAP owns these wrapper divs; the Framer
          // motion.button inside keeps its own transform for hover/layoutId.
          const S = BOARD_ZOOM_SCALE
          COLLAGE_LAYOUT.forEach((slot, i) => {
            const x0 = (S - 1) * (slot.rect.left - BOARD_ORIGIN_X) + S * (slot.offset.x ?? 0)
            const y0 = (S - 1) * (slot.rect.top - BOARD_ORIGIN_Y) + S * (slot.offset.y ?? 0)
            scrollTl.fromTo(
              collageWrapperRefs.current[i],
              { x: `${x0}vw`, y: `${y0}vh`, scale: S },
              { x: 0, y: 0, scale: 1, ease: 'none', duration: PROJECTS_SEGMENT.zoomOut, force3D: true },
              zoomStart,
            )
          })

          // Cards become hit-testable/tabbable only once the zoom is underway —
          // before this they're off-screen but would still be in the tab order.
          scrollTl.set(cardsWrapperRef.current, { visibility: 'visible' }, zoomStart)

          // ---- Projects segment 3: the section label + heading wipe into the
          // central gap the hero occupied, partway through the zoom.
          const projectsHeadingStart = zoomStart + PROJECTS_SEGMENT.zoomOut * 0.35
          scrollTl.to(
            projectsLabelRef.current,
            { clipPath: WIPE_SHOWN, ease: 'none', duration: PROJECTS_SEGMENT.headingIn },
            projectsHeadingStart,
          )
          scrollTl.to(
            projectsHeadingRef.current,
            { clipPath: WIPE_SHOWN, ease: 'none', duration: PROJECTS_SEGMENT.headingIn },
            projectsHeadingStart + 0.1,
          )

          // Trailing hold: the pin releases once this completes, at scale
          // exactly 1 — the scrub state persists and the cards stay interactive.
          scrollTl.to({}, { duration: PROJECTS_SEGMENT.hold }, zoomStart + PROJECTS_SEGMENT.zoomOut)
        })

        introTl.play()
      },
    )

    return () => {
      scrollTlRef.current?.scrollTrigger?.kill()
      scrollTlRef.current?.kill()
      introTlRef.current?.kill()
      mm.revert()
    }
  }, [ready])

  return (
    <div ref={stageRef} className="relative h-[100svh] overflow-hidden">
      {/* Must live inside stageRef, not a sibling above it — GSAP's pin fixes
          this element in the viewport; anything outside it scrolls normally. */}

      {/* Grid — a static (never transformed) div; the zoom is a tween of the
          tile's --grid-major, anchored at the origin via --grid-anchor, which
          is pixel-identical to scaling the plane but repaints only a tiny
          repeating tile. The masked wrapper keeps the vignette viewport-fixed. */}
      <div className="absolute inset-0 overflow-hidden mask-fade-radial">
        <div
          ref={gridPlaneRef}
          className="absolute inset-0"
          style={{ '--grid-major': '140px', '--grid-anchor': `${BOARD_ORIGIN_X}% ${BOARD_ORIGIN_Y}%` } as CSSProperties}
        >
          <DraftingGrid layer="grid" />
        </div>
      </div>

      {/* Construction linework — sits above the grid background but below the
          cards/text planes: the connective layer between paper and content.
          Non-scaling overlay, so stroke weights and drawn positions hold
          constant while the paper zooms behind them. */}
      <DraftingGrid ref={draftingRef} layer="lines" animated />

      {/* Cards — authored at their final scale-1 positions (percent rects
          around the heading's clear zone); each wrapper carries its own
          x/y/scale zoom+entry tween (see the timeline), so every card is a
          small independent compositor layer instead of one giant plane. */}
      <div ref={cardsPlaneRef} className="absolute inset-0">
        <div ref={cardsWrapperRef} className="pointer-events-auto absolute inset-0" style={{ visibility: 'hidden' }}>
          {COLLAGE_LAYOUT.map((slot, i) => (
            <div
              key={slot.key}
              ref={(el) => {
                collageWrapperRefs.current[i] = el
              }}
              className="absolute"
              style={{
                left: `${slot.rect.left}%`,
                top: `${slot.rect.top}%`,
                width: `${slot.rect.width}%`,
                height: `${slot.rect.height}%`,
                transformOrigin: '0 0',
                willChange: 'transform',
              }}
            >
              {slot.kind === 'project' ? (
                <ProjectCard
                  project={projects.find((p) => p.id === slot.projectId)!}
                  index={i}
                  pinned
                  onOpen={setActiveProjectId}
                />
              ) : (
                <PlaceholderCard />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Name + subtext — its own absolutely-centered layer, so the hidden
          title/pillars content below it never reserves layout space and
          skews the name off true center. */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ padding: 'var(--section-px)' }}
      >
        <h1 className="text-display">
          {site.displayName.map((line, i) => {
            const isLast = i === site.displayName.length - 1
            return (
              <TapeText
                key={line}
                as="span"
                className={`block px-6 pt-2 md:px-10 lg:px-14 ${isLast ? 'pb-10 md:pb-16 lg:pb-20' : 'pb-2 md:pb-3'}`}
                ref={(el) => {
                  nameLineRefs.current[i] = el
                }}
              >
                {line}
              </TapeText>
            )
          })}
        </h1>

        <p ref={subtextRef} className="text-mono mt-8 text-sepia" style={{ opacity: 0 }}>
          {hero.subtext}
        </p>
      </div>

      {/* Title + pillars — its own absolutely-centered layer, overlapping the
          name layer above (only one is ever visible at a time via clip-path).
          Title sits left-of-center; pillars run down the right as a plain
          list, each keyed to its own leader tick + node in the background
          timeline (see DraftingGrid's pillar spine). */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center gap-8 lg:gap-16"
        style={{ padding: 'var(--section-px)' }}
      >
        <WipeText as="p" className="text-heading block flex-1 text-left" ref={titleRef} plate={false}>
          {hero.title}
        </WipeText>

        <div className="flex flex-shrink-0 flex-col items-start gap-6 lg:gap-7">
          {hero.pillars.map((pillar, i) => (
            <WipeText
              key={pillar}
              as="div"
              className="flex items-baseline gap-4 text-serif-lg"
              ref={(el) => {
                pillarRefs.current[i] = el
              }}
              plate={false}
            >
              <span className="text-mono text-sepia">{`0${i + 1}`}</span>
              {pillar}
            </WipeText>
          ))}
        </div>
      </div>

      {/* Projects heading — a non-scaling centered overlay that wipes into the
          central gap the hero occupied, as the board zooms out around it. The
          cards themselves live on the cards plane above. */}
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ padding: 'var(--section-px)' }}
      >
        <WipeText as="span" className="text-mono inline-block" ref={projectsLabelRef} plate={false}>
          03 — Projects
        </WipeText>
        <WipeText
          as="h2"
          className="mt-2 block"
          ref={projectsHeadingRef}
          plate={false}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
            color: 'var(--color-ink)',
            textShadow: 'var(--emboss-heading)',
          }}
        >
          My projects.
        </WipeText>
      </div>

      <AnimatePresence>
        {activeProject && <ProjectDetailModal project={activeProject} onClose={() => setActiveProjectId(null)} />}
      </AnimatePresence>
    </div>
  )
}
