/**
 * SEQ-01 (intro, seconds) and SEQ-02 (name to thesis, scroll units).
 * Contract: theme/sequences.ts. Each tape phase of the name carries one part
 * of the De Pictura pavement (sheet I's plate): horizon, ground and braccia,
 * orthogonals, then the distance diagonal and the transversals; the
 * hatching last. SEQ-02 first retracts that linework and the flight (last
 * drawn, first erased), then is a camera dive through the pavement's
 * centric point (it sits on the board origin): the name rides out of frame,
 * and only once the last glyph is gone does the thesis
 * ink in, small, inside its golden rectangle (sheet II's plate), each
 * pillar cutting a square as it lands and the spiral closing on the eye.
 */

import { draw, edges, nodesAlong } from '@/lib/lines'
import { drawFigure, figureGuide } from '@/lib/draft/choreo'
import { THESIS } from '@/lib/draft/figures/thesis'
import { duration, eraseRatio, gsapEase, nameTape, stageSpan } from '@/theme/motion'
import { win, type Step } from '@/theme/sequences'
import { ZOOM } from '../camera'
import { atZoom, IR, setVisible, sheetSwap, tape, wipe, type StageCtx } from './common'

/** De Pictura passes (lib/draft/figures/dePictura.ts), split across the four tape phases. */
const PAVE = {
  horizon: [0, 1],
  ground: [1, 3],
  orthogonals: [3, 4],
  transversals: [4, 7],
  hatch: [7, 8],
} as const


export function heroIntro({ hero, titleBlock, furniture }: StageCtx): Step[] {
  const pave = (label: string, passes: readonly [number, number], span: readonly [number, number] = [0, 1]) =>
    figureGuide(label, hero.pictura, span, 'draw', { passes })
  return [
    {
      label: 'THOMAS · tape stretches', phase: 'ink', at: 0.2, dur: nameTape.stretch, ease: gsapEase.pen,
      run: tape(hero.nameLines[0], '--lead'),
      guides: [pave('Horizon; the centric point lands on the board origin', PAVE.horizon)],
    },
    {
      label: 'LLAMZON · tape stretches', phase: 'ink', at: 0.65, dur: nameTape.stretch * nameTape.lag, ease: gsapEase.pen,
      run: tape(hero.nameLines[1], '--lead'),
      guides: [pave('Ground line, ticked into braccia', PAVE.ground)],
    },
    {
      label: 'THOMAS · tape releases', phase: 'ink', at: 1.3, dur: nameTape.release, ease: gsapEase.ink,
      run: tape(hero.nameLines[0], '--trail'),
      guides: [pave('Orthogonals fan to the centric point', PAVE.orthogonals)],
    },
    {
      label: 'LLAMZON · tape releases', phase: 'ink', at: 1.95, dur: nameTape.release * nameTape.lag, ease: gsapEase.ink,
      run: tape(hero.nameLines[1], '--trail'),
      guides: [pave('Distance diagonal, transversals, pavement edges', PAVE.transversals)],
    },
    {
      // Starts with the pavement's horizon: the two studies are set out together.
      label: 'A trajectory is computed over the name', phase: 'ink', at: 0.2, dur: duration.construct * 1.3, ease: gsapEase.pen,
      run: () => {},
      guides: [figureGuide('Launch, line of the shot, equal times, the path, its falls', hero.flight, [0, 1])],
    },
    {
      label: 'Pavement hatched', phase: 'ink', at: 2.85, dur: duration.reveal, ease: gsapEase.ink,
      run: () => {},
      guides: [
        pave('Nearest rows hatched, front to back', PAVE.hatch),
      ],
    },
    {
      label: 'Dimension value + title block text', phase: 'ink', at: 3.7, dur: duration.base, ease: gsapEase.settle,
      run: (tl, w) => {
        // Ground first, then each row's key and value, top down.
        const [ground, ...cells] = titleBlock.ink
        wipe(tl, ground, 'in', w.sub(0, 0.6))
        cells.forEach((el, i) => {
          const r = Math.floor(i / 2)
          wipe(tl, el, 'in', w.sub(0.3 + r * 0.15, 0.7 + r * 0.15))
        })
      },
      guides: [
        { label: 'Title block frame, clockwise', span: [0, 0.6], run: (tl, g) => edges(tl, titleBlock.frame, g) },
        { label: 'Title block rules', span: [0.4, 1], run: (tl, g) => edges(tl, titleBlock.rules, g) },
        {
          label: 'Registration crosshairs, clockwise from top-left', span: [0, 0.7],
          run: (tl, g) => furniture.crosshairs().forEach((h, i, all) => {
            if (h) drawFigure(tl, h, g.sub(i / (all.length + 1), (i + 2) / (all.length + 1)))
          }),
        },
        figureGuide('Legend on the title block: rose, then the 50 mm bar', titleBlock.legend, [0.35, 1]),
      ],
    },
  ]
}

/** Each pillar's leader takes this fraction of its slot, then hands off to the wipe. */
export const HANDOFF = 0.35

/** Thesis hold: the golden rectangle is dimensioned in it. */
const HOLD = 0.8
/** Each pillar's slot in the landing step, in scroll units. */
const PILLAR_SLOT = 0.55

/** The dive's start (from t0: a short beat before the camera moves) and length. */
const DIVE_AT = 0.15
const DIVE_DUR = 2.4
/**
 * The name layer's linework withdraws over this span from t0, finishing well
 * before the name leaves the frame (NAME_OUT sits half way through the dive).
 */
const LINES_RETRACT = duration.draw * eraseRatio
/** The thesis title inks in over this zoom range, while it is still small. */
export const TITLE_INK_TO = ZOOM.NAME_OUT + 0.35

export function heroScroll({ hero, titleBlock, camera }: StageCtx, t0: number): Step[] {
  const d = hero.lines
  const n = hero.pillars.length
  return [
    {
      // The name layer's linework leaves first, on its own erase clock: the
      // pavement's horizon and orthogonals all run through the centric point
      // (the board origin), so they would stay in frame at any zoom and pop at
      // the hide. Last drawn is first erased, so the dive then carries only type.
      label: 'Name layer linework retracts', phase: 'exit', at: t0, dur: LINES_RETRACT, ease: gsapEase.erase,
      run: () => {},
      guides: [
        figureGuide('Flight retracts, last drawn first', hero.flight, [0, 1], 'retract'),
        figureGuide('Pavement retracts, hatch first, horizon last', hero.pictura, [0, 1], 'retract'),
      ],
    },
    {
      label: 'Camera dives through the name onto the thesis', phase: 'camera', at: t0 + DIVE_AT, dur: DIVE_DUR, ease: gsapEase.pen,
      run: (tl, w) => {
        const at = (z: number) => w.at + w.dur * atZoom(w, ZOOM.HERO, ZOOM.THESIS, z)
        tl.fromTo(camera.state, { z: ZOOM.HERO }, { z: ZOOM.THESIS, duration: w.dur, ease: w.ease, onUpdate: camera.apply, ...IR }, w.at)
        // The name is fully out of frame here (its linework retracted before
        // the dive got going); hide it so the zoom-out to Projects never
        // carries it back through.
        setVisible(tl, hero.nameLayer, false, at(ZOOM.NAME_OUT))
        wipe(tl, hero.title, 'in', win(at(ZOOM.NAME_OUT), at(TITLE_INK_TO) - at(ZOOM.NAME_OUT), gsapEase.pen))
      },
      // The pavement needs no exit: it rides the dive out through its own centric point.
      guides: [
        // Arch and rectangle are set out together, on the same span.
        figureGuide('Arch set out: springing line, compass swings, plumb', hero.thesis, [0.62, 0.92], 'draw', { passes: THESIS.arcSetOut }),
        figureGuide('Golden rectangle set out on the same line', hero.thesis, [0.62, 0.92], 'draw', { passes: THESIS.rectangle }),
        { label: 'Title guide draws as the dive lands', span: [0.75, 1], run: (tl, g) => draw(tl, d.titleGuide, g) },
      ],
    },
    // Value change at the moment the name is gone (the dive's midpoint on a symmetric ease).
    { label: 'Sheet 01 → 02', phase: 'text', at: t0 + DIVE_AT + DIVE_DUR * 0.5, dur: stageSpan.swap, ease: gsapEase.linear, run: sheetSwap(titleBlock, 0, 1), guides: [] },
    {
      label: 'Pillars land (handoffs)', phase: 'ink', at: t0 + DIVE_AT + DIVE_DUR, dur: PILLAR_SLOT * n, ease: gsapEase.linear,
      run: (tl, w) => hero.pillars.forEach((el, i) => wipe(tl, el, 'in', w.sub((i + HANDOFF) / n, (i + 1) / n))),
      guides: [
        { label: 'Spine spans every pillar', span: [0, 1], run: (tl, g) => draw(tl, d.spine, g) },
        ...hero.pillars.map((_, i) => ({
          label: `Leader ${i + 1} to its node, then hands off`,
          span: [i / n, (i + HANDOFF) / n] as const,
          run: (tl: gsap.core.Timeline, g: import('@/theme/sequences').Window) => {
            draw(tl, d.leaders[i], g)
            nodesAlong(tl, [{ el: d.pillarNodes[i], f: 1 }], g, stageSpan.node)
          },
        })),
        // The arch inks while the squares are cut: both on the pillars' clock.
        figureGuide('Arch inked: intrados, extrados, voussoirs', hero.thesis, [0, 0.66], 'draw', { passes: THESIS.arcInk }),
        figureGuide('A golden square is cut as each pillar lands', hero.thesis, [0, 0.66], 'draw', { passes: THESIS.cuts }),
        figureGuide('The springing line carried on to the spiral', hero.thesis, [0, 0.14], 'draw', { passes: THESIS.join }),
        figureGuide('Diagonals cross at the eye', hero.thesis, [0.5, 0.78], 'draw', { passes: THESIS.diagonals }),
        figureGuide('Spiral inked from the arch, ending on the eye with the last pillar', hero.thesis, [0.12, 1], 'draw', { passes: THESIS.spiral }),
      ],
    },
    {
      label: 'Hold', phase: 'settle', at: t0 + DIVE_AT + DIVE_DUR + PILLAR_SLOT * n, dur: HOLD, ease: gsapEase.pen,
      run: () => {},
      guides: [
        // The arch and rectangle finish in the first half of the hold and the
        // window just after; the rest is a beat of stillness before anything leaves.
        figureGuide('Arch finished: piers, imposts, ground, section, span', hero.thesis, [0, 0.5], 'draw', { passes: THESIS.arcFinish }),
        figureGuide('Rectangle dimensioned', hero.thesis, [0.08, 0.55], 'draw', { passes: THESIS.dimensions }),
        figureGuide('Window traced in the arch: lancets, mullion, oculus, quatrefoil', hero.thesis, [0.12, 0.7], 'draw', { passes: THESIS.tracery }),
      ],
    },
  ]
}
