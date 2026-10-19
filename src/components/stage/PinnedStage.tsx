import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { stageMotion } from '@/theme/motion'
import { NUMBERED_SHEETS } from '@/theme/spectrum'
import { build, totalOf, type Step } from '@/theme/sequences'
import { useLenis } from '@/context/LenisContext'
import { WIPE_HIDDEN } from '@/components/hero/wipeConstants'
import { TitleBlock, type TitleBlockHandle } from './TitleBlock'
import { StageFurniture, type StageFurnitureHandle } from './StageFurniture'
import { HeroScene, type HeroSceneHandle } from './scenes/HeroScene'
import { ProjectsScene, type ProjectsSceneHandle } from './scenes/ProjectsScene'
import { BOARD_ORIGIN_X, BOARD_ORIGIN_Y, BOARD_ZOOM_SCALE, THESIS_GROW } from './scenes/projectsLayout'
import { ExperienceScene, type ExperienceSceneHandle } from './scenes/ExperienceScene'
import { SkillsScene, type SkillsSceneHandle } from './scenes/SkillsScene'
import { ContactScene, type ContactSceneHandle } from './scenes/ContactScene'
import { createCamera } from './camera'
import { createPaperGrid } from './paperGrid'
import { grownFrom, type StageCtx } from './sequences/common'
import { heroIntro, heroScroll } from './sequences/hero'
import { projectsScroll } from './sequences/projects'
import { experienceScroll } from './sequences/experience'
import { skillsScroll } from './sequences/skills'
import { contactScroll } from './sequences/contact'

interface PinnedStageProps {
  /** Preloader-complete gate: the intro only plays once true. */
  ready: boolean
  /** Fires when the intro finishes; Home keeps scroll locked until then. */
  onIntroComplete: () => void
}

/** The scroll timeline starts just after 0 so nothing on it renders over the intro at progress 0. */
const SCROLL_T0 = 0.1
/** Scroll length per timeline unit, in viewport heights. */
const VH_PER_UNIT = 1.05

/** Lay the scene sequences end to end; each starts where the previous one's last step ends. */
function chain(ctx: StageCtx, scenes: Array<(ctx: StageCtx, t0: number) => Step[]>): Step[] {
  const steps: Step[] = []
  let t = SCROLL_T0
  for (const scene of scenes) {
    const s = scene(ctx, t)
    steps.push(...s)
    t = totalOf(s)
  }
  return steps
}

/**
 * The site's single pinned `100svh` stage. Every section lives inside it as
 * a scene plane, driven by ONE scroll timeline against ONE pin; the board
 * camera (camera.ts) moves the paper and the planes together. Choreography
 * lives in sequences/*.ts as step data (theme/sequences.ts contract); this
 * component owns mounting, measuring and wiring.
 *
 * Layer order (back to front): grid texture, scene planes (each with its
 * plates and linework under its content), sheet furniture, title block.
 * Each sheet's plate from the folio (lib/draft) is placed in its scene and
 * drawn on that scene's steps; see sequences/*.ts.
 */
export function PinnedStage({ ready, onIntroComplete }: PinnedStageProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLCanvasElement>(null)
  const furnitureRef = useRef<StageFurnitureHandle>(null)
  const titleBlockRef = useRef<TitleBlockHandle>(null)
  const heroRef = useRef<HeroSceneHandle>(null)
  const projectsRef = useRef<ProjectsSceneHandle>(null)
  const experienceRef = useRef<ExperienceSceneHandle>(null)
  const skillsRef = useRef<SkillsSceneHandle>(null)
  const contactRef = useRef<ContactSceneHandle>(null)

  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  lenisRef.current = lenis
  const onIntroCompleteRef = useRef(onIntroComplete)
  onIntroCompleteRef.current = onIntroComplete

  // Rule the paper at the hero's 1:1 from first paint (under the preloader);
  // the camera takes over once `ready`.
  useLayoutEffect(() => {
    const canvas = paperRef.current
    if (ready || !canvas) return
    const paper = createPaperGrid(canvas)
    const draw = () => paper.draw(1, (canvas.clientWidth * BOARD_ORIGIN_X) / 100, (canvas.clientHeight * BOARD_ORIGIN_Y) / 100)
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [ready])

  useLayoutEffect(() => {
    if (!ready || !stageRef.current) return

    const introTlRef: { current: gsap.core.Timeline | null } = { current: null }
    const scrollTlRef: { current: gsap.core.Timeline | null } = { current: null }
    let cleanupResize: (() => void) | null = null

    const mm = gsap.matchMedia()

    mm.add(
      '(min-width: 768px) and (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
      () => {
        const stage = stageRef.current
        const paperCanvas = paperRef.current
        const furniture = furnitureRef.current
        const titleBlock = titleBlockRef.current
        const hero = heroRef.current
        const projects = projectsRef.current
        const experience = experienceRef.current
        const skills = skillsRef.current
        const contact = contactRef.current
        if (!stage || !paperCanvas || !furniture || !titleBlock || !hero || !projects || !experience || !skills || !contact) return

        const camera = createCamera({
          stage,
          paper: createPaperGrid(paperCanvas),
          heroName: hero.nameLayer,
          heroThesis: hero.thesisLayer,
          heroExitScale: hero.exitScale,
          projects,
          experiencePlane: experience.plane,
          skillsPlane: skills.plane,
          zoomScale: BOARD_ZOOM_SCALE,
          thesisGrow: THESIS_GROW,
        })
        const ctx: StageCtx = { furniture, titleBlock, hero, projects, experience, skills, contact, camera, zoomScale: BOARD_ZOOM_SCALE }

        /* ── Measure every scene, then place the board ─────────────────── */
        const layout = () => {
          hero.layout()
          projects.layout()
          experience.layout({ x: projects.anchor.x - camera.span(), y: projects.anchor.y })
          // The Skills sheet sits one stage height below Experience on the board.
          const H = stage.clientHeight
          skills.layout(
            { x: experience.datumEnd.x, y: experience.datumEnd.y - H },
            experience.datumCentre.x,
            experience.rowBottom.y - H + 24,
          )
          camera.apply()
        }
        camera.apply()
        layout()

        let raf = 0
        const onResize = () => {
          cancelAnimationFrame(raf)
          raf = requestAnimationFrame(layout)
        }
        window.addEventListener('resize', onResize)
        // A face that lands late (e.g. ?skipIntro on a cold cache) reflows the
        // text every measured line and the hero's exit scale were taken from.
        document.fonts.addEventListener('loadingdone', onResize)
        cleanupResize = () => {
          cancelAnimationFrame(raf)
          window.removeEventListener('resize', onResize)
          document.fonts.removeEventListener('loadingdone', onResize)
        }

        // Undrawn/hidden start states for content the scroll timeline inks in.
        for (const sheet of projects.sheets) {
          if (sheet.paper) gsap.set(sheet.paper, { clipPath: grownFrom(sheet.anchor) })
          if (sheet.face) gsap.set(sheet.face, { clipPath: WIPE_HIDDEN })
        }
        gsap.set(skills.columns.flatMap((c) => c.chips), { clipPath: WIPE_HIDDEN })
        gsap.set(contact.links.flatMap((l) => l.content), { clipPath: WIPE_HIDDEN })

        /* ── SEQ-02..09 on one scrubbed timeline, pinned NOW (not after the
           intro) so the document reaches its full height before anyone can
           scroll. Home keeps scroll locked until the intro completes. ───── */
        const steps = chain(ctx, [heroScroll, projectsScroll, experienceScroll, skillsScroll, contactScroll])
        const total = totalOf(steps)
        const vh = total * VH_PER_UNIT
        const scrollTl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: 'top top',
            end: () => `+=${Math.round(vh * window.innerHeight)}`,
            pin: true,
            pinSpacing: true,
            scrub: stageMotion.scrub,
            invalidateOnRefresh: true,
            // A fromTo writes its start values on first render and fires its
            // onUpdate for it even inside ScrollTrigger's event-suppressed
            // refresh renders, so the camera can be applied mid-refresh at a
            // state the timeline then rewinds away from. Re-apply once settled.
            onRefresh: () => camera.apply(),
          },
        })
        build(steps, scrollTl)
        if (scrollTl.duration() < total) scrollTl.to({}, { duration: total - scrollTl.duration() }, scrollTl.duration())
        scrollTlRef.current = scrollTl

        ScrollTrigger.refresh()
        lenisRef.current?.resize()

        if (import.meta.env.DEV) {
          ;(window as unknown as { __stage?: unknown }).__stage = {
            tl: scrollTl,
            st: scrollTl.scrollTrigger,
            lenis: lenisRef.current,
            maxScroll: () => ScrollTrigger.maxScroll(window),
            report: () => ({
              progress: scrollTl.progress(),
              scroll: window.scrollY,
              end: scrollTl.scrollTrigger?.end,
              maxScroll: ScrollTrigger.maxScroll(window),
              lenisLimit: lenisRef.current?.limit,
            }),
          }
        }

        /* ── SEQ-01: the intro, on time ─────────────────────────────────── */
        const introTl = build(heroIntro(ctx), gsap.timeline({ paused: true }))
        introTlRef.current = introTl
        introTl.eventCallback('onComplete', () => {
          // Scroll unlocks now: re-measure once more so the pin end and
          // Lenis's scroll limit agree before the first wheel event.
          ScrollTrigger.refresh()
          lenisRef.current?.resize()
          onIntroCompleteRef.current()
        })
        introTl.play()
      },
    )

    return () => {
      cleanupResize?.()
      scrollTlRef.current?.scrollTrigger?.kill()
      scrollTlRef.current?.kill()
      introTlRef.current?.kill()
      mm.revert()
    }
  }, [ready])

  return (
    <div ref={stageRef} className="relative h-[100svh] overflow-hidden">
      {/* Must live inside stageRef: GSAP's pin fixes this element in the
          viewport; anything outside it scrolls normally. */}

      {/* Ruled paper: a static (never transformed) canvas the camera redraws
          at every zoom and pan (paperGrid.ts). */}
      <div className="absolute inset-0 overflow-hidden mask-fade-radial">
        <canvas ref={paperRef} aria-hidden className="absolute inset-0 h-full w-full" />
      </div>

      <HeroScene ref={heroRef} />
      <ProjectsScene ref={projectsRef} />
      <ExperienceScene ref={experienceRef} />
      <SkillsScene ref={skillsRef} />
      <ContactScene ref={contactRef} />

      <StageFurniture ref={furnitureRef} />
      <TitleBlock ref={titleBlockRef} sheets={NUMBERED_SHEETS} />
    </div>
  )
}
