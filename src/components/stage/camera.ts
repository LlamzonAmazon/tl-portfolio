import { gsap } from 'gsap'
import type { PaperGrid } from './paperGrid'
import type { ProjectsSceneHandle } from './scenes/ProjectsScene'
import { BOARD_ORIGIN_X, BOARD_ORIGIN_Y, HEADING_RECT } from './scenes/projectsLayout'

/**
 * The board camera: ONE state object drives every board move (D-06,
 * extended). Tweening any field and calling `apply()` on update writes the
 * grid texture and every scene plane from the same numbers, so paper, cards
 * and linework move in exact lockstep under any ease. Tween the state object
 * itself (not a proxy) so its values stay correct through ScrollTrigger's
 * event-suppressed refresh renders.
 *   z     zoom level, one unit per leg (see ZOOM), log-interpolated within each leg
 *   panX  0 = Projects sheet centered, 1 = Experience sheet centered
 *   panY  0 = Experience row, 1 = Skills sheet centered (it sits one sheet below)
 */
export interface CameraState {
  z: number
  panX: number
  panY: number
}

/**
 * Zoom levels. Each leg zooms by its own factor about the board origin:
 *   BOARD to HERO       x zoomScale (the Projects zoom-out, run backwards)
 *   HERO to NAME_OUT    x the hero's measured exit scale: the name's last glyph
 *                       has just left the viewport, at any viewport size
 *   NAME_OUT to THESIS  x thesisGrow: the thesis grows from 1/thesisGrow to 1
 */
export const ZOOM = { BOARD: 0, HERO: 1, NAME_OUT: 2, THESIS: 3 } as const

/** Gap between the Projects and Experience sheets, as a fraction of stage width. */
export const SHEET_GAP = 0.12

interface CameraTargets {
  stage: HTMLElement
  paper: PaperGrid
  /** Hero layers that ride the dive: the name at 1 on the hero, the thesis at 1 once it lands. */
  heroName: HTMLElement | null
  heroThesis: HTMLElement | null
  /** Zoom (from the hero) at which the name has fully left the viewport; re-measured on layout. */
  heroExitScale: () => number
  projects: ProjectsSceneHandle
  experiencePlane: HTMLElement | null
  skillsPlane: HTMLElement | null
  zoomScale: number
  thesisGrow: number
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/**
 * Past this the Projects heading is wiped out and only its scale is moving;
 * capping keeps a hidden layer from being laid out hundreds of times too large.
 */
const HEADING_MAX_SCALE = 40
/** The board origin inside the heading's box, so the heading scales about it too. */
const HEADING_ORIGIN = `${((BOARD_ORIGIN_X - HEADING_RECT.left) / HEADING_RECT.width) * 100}% ${((BOARD_ORIGIN_Y - HEADING_RECT.top) / HEADING_RECT.height) * 100}%`

export function createCamera(t: CameraTargets) {
  const state: CameraState = { z: ZOOM.HERO, panX: 0, panY: 0 }

  /** Horizontal distance between sheet centers, in px. */
  const span = () => t.stage.clientWidth * (1 + SHEET_GAP)

  const apply = () => {
    const W = t.stage.clientWidth
    const H = t.stage.clientHeight
    const { z, panX, panY } = state
    const dx = -panX * W * (1 + SHEET_GAP)
    const dy = -panY * H

    // Zoom relative to the hero sheet (1 there), log-interpolated per leg.
    const exit = Math.max(t.heroExitScale(), 1)
    const logK =
      (clamp01(z) - 1) * Math.log(t.zoomScale) +
      clamp01(z - 1) * Math.log(exit) +
      clamp01(z - 2) * Math.log(t.thesisGrow)
    const k = Math.exp(logK)

    // Paper: ruled about the board origin at zoom k (finer rules resolve as
    // it zooms in, see paperGrid.ts); pans slide the origin. Board sheets never
    // ride the zoom: they are drafted in place once it lands.
    t.paper.draw(k, (W * BOARD_ORIGIN_X) / 100 + dx, (H * BOARD_ORIGIN_Y) / 100 + dy)

    // The dive: both hero layers scale about the board origin with the paper.
    // 2D transforms so the text re-rasterizes crisp instead of upscaling a layer.
    const origin = `${BOARD_ORIGIN_X}% ${BOARD_ORIGIN_Y}%`
    if (t.heroName) gsap.set(t.heroName, { scale: k, transformOrigin: origin, force3D: false })
    if (t.heroThesis) gsap.set(t.heroThesis, { scale: k / (exit * t.thesisGrow), transformOrigin: origin, force3D: false })

    // The Projects heading is ON the board (1x at z = BOARD) and rides the
    // zoom: the name's dive in reverse, it shrinks into place as the camera pulls out.
    if (t.projects.heading) {
      const hs = Math.min(k * t.zoomScale, HEADING_MAX_SCALE)
      gsap.set(t.projects.heading, { scale: hs, transformOrigin: HEADING_ORIGIN, force3D: false })
    }
    if (t.projects.plane) gsap.set(t.projects.plane, { x: dx, force3D: true })
    if (t.experiencePlane) gsap.set(t.experiencePlane, { x: dx + W * (1 + SHEET_GAP), y: dy, force3D: true })
    if (t.skillsPlane) gsap.set(t.skillsPlane, { y: dy + H, force3D: true })
  }

  return { state, apply, span }
}

export type Camera = ReturnType<typeof createCamera>
