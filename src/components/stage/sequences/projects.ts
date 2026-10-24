/**
 * SEQ-03: the thesis datum retracts, then the camera pulls all the way back
 * out of the dive to the Projects sheet: the thesis shrinks back toward the
 * center and its title is erased while small (the dive's entrance mirrored).
 * Only then does the Projects heading ink in, large, and ride the pull-out
 * down to 1x (the hero name's dive in reverse); its ring and rule are drawn
 * once it has all but settled. Then each sheet gets its own step, in draft order:
 * its radial leaves the ring, a node is drawn where it lands, the frame
 * continues from that node clockwise back to it, the paper then fills the
 * closed frame out from that same point, and the face inks last. Nothing is drawn while it moves.
 */

import { draw, nodesAlong, retract } from '@/lib/lines'
import { figureGuide } from '@/lib/draft/choreo'
import { gsapEase, stageSpan } from '@/theme/motion'
import { invEase, win, type Step, type Window } from '@/theme/sequences'
import { ZOOM } from '../camera'
import { atZoom, grow, IR, setVisible, sheetSwap, wipe, type StageCtx } from './common'
import { TITLE_INK_TO } from './hero'

/** Thesis exit slots, last pillar first (exits mirror entrances). */
const PILLAR_EXIT: ReadonlyArray<readonly [number, number]> = [[0, 0.3], [0.12, 0.42], [0.24, 0.54]]

/** The zoom-out: starts once the datum is gone (from t0), and its length. */
const ZOOM_AT = 0.7
const ZOOM_DUR = 3.0
/**
 * Zoom ranges (camera ZOOM units) over which the heading inks in, label
 * first: after the thesis is gone at NAME_OUT, while the heading is large
 * (about 8x to 2.7x) and spans the viewport. Then the zoom at which it counts
 * as settled (~1.15x) and its ring and rule may be drawn around it.
 */
const HEAD_LABEL_INK = [1.5, 1.15] as const
const HEAD_TEXT_INK = [1.4, 1.0] as const
const HEAD_SETTLED = 0.15
/** Sheet drafting: first step's start (from t0), gap between sheets, and each sheet's length. */
const DRAFT_AT = ZOOM_AT + ZOOM_DUR - 0.3
const DRAFT_STAGGER = 0.18
const DRAFT_DUR = 1.0
const HOLD = 0.6
/** A placeholder's study plate: starts just before its sheet's face has inked, and its length. */
const PLATE_LAG = 0.85
const PLATE_DUR = 1.2

export function projectsScroll({ hero, projects, titleBlock, camera }: StageCtx, t0: number): Step[] {
  const d = hero.lines
  const n = hero.pillars.length
  const slot = (i: number) => PILLAR_EXIT[n - 1 - i] ?? ([0, 0.3] as const)
  const pen = gsapEase.pen
  /** Fraction of the pull-out window at which the camera passes zoom level z. */
  const zf = (z: number) => invEase(pen, (ZOOM.THESIS - z) / (ZOOM.THESIS - ZOOM.BOARD))

  const drafts: Step[] = projects.sheets.map((sheet, i) => ({
    label: `Sheet 0${i + 1} drafted`, phase: 'ink', at: t0 + DRAFT_AT + i * DRAFT_STAGGER, dur: DRAFT_DUR, ease: pen,
    run: (tl, w) => {
      setVisible(tl, sheet.wrapper, true, w.at)
      grow(tl, sheet.paper, sheet.anchor, w.sub(0.6, 0.88))
      wipe(tl, sheet.face, 'in', w.sub(0.8, 1))
    },
    guides: [
      {
        label: 'Radial leaves the ring (a dot where it leaves); node drawn as it lands', span: [0, 0.35],
        run: (tl, g) => {
          draw(tl, sheet.radial, g)
          nodesAlong(tl, [{ el: sheet.ringNode, f: 0 }, { el: sheet.node, f: 1 }], g, stageSpan.node)
        },
      },
      { label: 'Frame from the node, clockwise, back to it', span: [0.35, 0.75], run: (tl, g) => draw(tl, sheet.frame, g) },
    ],
  }))
  // Studies on the unissued sheet: its plate is drafted on the sheet once
  // its paper is down, construction first, the figure inked over it.
  const studies: Step[] = projects.sheets.flatMap((sheet, i) =>
    sheet.plate
      ? [{
          label: `Study plate drafted on sheet ${i + 1}`, phase: 'ink' as const,
          at: t0 + DRAFT_AT + i * DRAFT_STAGGER + PLATE_LAG, dur: PLATE_DUR, ease: pen,
          run: () => {},
          guides: [figureGuide('Construction, then the figure, then its lettering', sheet.plate, [0, 1])],
        }]
      : [],
  )
  const draftEnd = Math.max(
    t0 + DRAFT_AT + (projects.sheets.length - 1) * DRAFT_STAGGER + DRAFT_DUR,
    ...studies.map((s) => s.at + s.dur),
  )

  return [
    {
      label: 'Pillars exit (reverse order)', phase: 'exit', at: t0, dur: ZOOM_AT, ease: gsapEase.erase,
      run: (tl, w) => hero.pillars.forEach((el, i) => wipe(tl, el, 'out', w.sub(...slot(i)))),
      guides: [
        ...hero.pillars.map((_, i) => ({
          label: `Leader 0${i + 1} + node retract`,
          span: slot(i),
          run: (tl: gsap.core.Timeline, g: Window) => {
            retract(tl, d.leaders[i], g)
            nodesAlong(tl, [{ el: d.pillarNodes[i], f: 1 }], g, stageSpan.node, 'retract')
          },
        })),
        { label: 'Spine retracts', span: [0.3, 0.75], run: (tl, g) => retract(tl, d.spine, g) },
        { label: 'Title guide retracts', span: [0.5, 1], run: (tl, g) => retract(tl, d.titleGuide, g) },
      ],
    },
    {
      label: 'Camera pulls out of the dive to the board', phase: 'camera', at: t0 + ZOOM_AT, dur: ZOOM_DUR, ease: pen,
      run: (tl, w) => {
        const at = (z: number) => w.at + w.dur * atZoom(w, ZOOM.THESIS, ZOOM.BOARD, z)
        tl.fromTo(camera.state, { z: ZOOM.THESIS }, { z: ZOOM.BOARD, duration: w.dur, ease: w.ease, onUpdate: camera.apply, ...IR }, w.at)
        // Mirror of the dive: the title is erased over the zoom range it inked in.
        wipe(tl, hero.title, 'out', win(at(TITLE_INK_TO), at(ZOOM.NAME_OUT) - at(TITLE_INK_TO), gsapEase.erase))
        setVisible(tl, hero.plane, false, at(ZOOM.NAME_OUT))
        // The heading rides the camera (camera.ts); it inks in while large.
        const ink = (el: HTMLElement | null, [a, b]: readonly [number, number]) => wipe(tl, el, 'in', win(at(a), at(b) - at(a), pen))
        ink(projects.headLabel, HEAD_LABEL_INK)
        ink(projects.headText, HEAD_TEXT_INK)
      },
      guides: [
        // The thesis plate stays drawn through the pillar exit, then retracts
        // as the camera pulls out, gone by the time the thesis plane hides.
        figureGuide('Arch and rectangle retract on the pull-out, last drawn first', hero.thesis, [0, zf(ZOOM.NAME_OUT)], 'retract'),
        { label: "Heading ring draws from 12 o'clock as the heading settles", span: [zf(HEAD_SETTLED), 1], run: (tl, g) => draw(tl, projects.ring, g) },
        { label: 'Heading rule draws out from center', span: [zf(HEAD_SETTLED), 1], run: (tl, g) => draw(tl, projects.headRules, g) },
      ],
    },
    // Value change once the thesis is gone.
    { label: 'Sheet 02 → 03', phase: 'text', at: t0 + ZOOM_AT + ZOOM_DUR * 0.4, dur: stageSpan.swap, ease: gsapEase.linear, run: sheetSwap(titleBlock, 1, 2), guides: [] },
    ...drafts,
    ...studies,
    { label: 'Hold', phase: 'settle', at: draftEnd, dur: HOLD, ease: gsapEase.linear, run: () => {}, guides: [] },
  ]
}
