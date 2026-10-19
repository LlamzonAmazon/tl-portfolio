/**
 * SEQ-07: the camera pans up. Experience rises out the top as a unit while
 * the Skills board rises in from below. Diramatio carries the eye down: the
 * line runs on off the end of the Experience datum, down the margin and
 * under the cards into a prism on the seam between the sheets, and leaves
 * it as four rays, one per column; each column's datum then draws down from
 * where its ray lands, and each chip inks in as the datum's tip reaches it.
 */

import { draw, nodesAlong } from '@/lib/lines'
import { figureGuide } from '@/lib/draft/choreo'
import { gsapEase, stageSpan } from '@/theme/motion'
import type { Step } from '@/theme/sequences'
import { IR, reach, setVisible, sheetSwap, wipe, type StageCtx } from './common'
import { win } from '@/theme/sequences'

/** A chip wipes in this long once the column datum's tip reaches it (timeline units). */
const CHIP_INK = 0.14

export function skillsScroll({ experience, skills, titleBlock, camera }: StageCtx, t0: number): Step[] {
  return [
    {
      label: 'Board pans up to Skills (camera)', phase: 'camera', at: t0, dur: stageSpan.pan, ease: gsapEase.pen,
      run: (tl, w) => {
        setVisible(tl, skills.plane, true, w.at)
        tl.fromTo(camera.state, { panY: 0 }, { panY: 1, duration: w.dur, ease: w.ease, onUpdate: camera.apply, ...IR }, w.at)
        setVisible(tl, experience.plane, false, w.at + w.dur)
      },
      guides: [
        {
          label: 'Experience nodes clear (right to left) as the sheet leaves', span: [0, 0.3],
          run: (tl, g) => nodesAlong(tl, experience.nodes.map((el, i) => ({ el, f: experience.cardF[i] ?? 0 })), g, stageSpan.node, 'retract'),
        },
        figureGuide('Flight retracts to its launch', experience.flight, [0, 0.32], 'retract'),
        figureGuide('Orrery retracts, outer orbit first', experience.systema, [0.04, 0.36], 'retract'),
        figureGuide('Screw set out: axis, ends, silhouette', skills.cochlea, [0.3, 0.6], 'draw', { passes: [0, 3] }),
        figureGuide('Two flights wound turn by turn across the columns', skills.cochlea, [0.5, 0.95], 'draw', { passes: [3, 5] }),
        figureGuide('Pitch dimensioned', skills.cochlea, [0.82, 1], 'draw', { passes: [5, 8] }),
        figureGuide('The run: off the datum\'s end, down the margin, under the cards', skills.split, [0.04, 0.42], 'draw', { passes: [0, 1] }),
        figureGuide('The prism is set on the split point', skills.split, [0.3, 0.44], 'draw', { passes: [1, 2] }),
        figureGuide('The beam refracts through the glass', skills.split, [0.42, 0.48], 'draw', { passes: [2, 3] }),
        figureGuide('Four rays leave the base, one per column, nearest first', skills.split, [0.47, 0.64], 'draw', { passes: [3, 4] }),
        { label: 'Column header rules, from where the streams land', span: [0.54, 0.78], run: (tl, g) => draw(tl, skills.columns.map((c) => c.headerRule), g) },
        ...skills.columns.map((col, c) => ({
          label: `Column ${c + 1} datum draws down; chips ink as it passes`,
          span: [0.56 + c * 0.03, 0.9 + c * 0.03] as const,
          run: (tl: gsap.core.Timeline, g: import('@/theme/sequences').Window) => {
            draw(tl, col.datum, g)
            col.chips.forEach((chip, i) => {
              const at = reach(g, col.chipF[i] ?? 0, CHIP_INK)
              wipe(tl, chip, 'in', win(at, CHIP_INK, gsapEase.linear))
            })
          },
        })),
      ],
    },
    { label: 'Sheet 04 → 05', phase: 'text', at: t0 + stageSpan.pan * 0.4, dur: stageSpan.swap, ease: gsapEase.linear, run: sheetSwap(titleBlock, 3, 4), guides: [] },
    { label: 'Hold', phase: 'settle', at: t0 + stageSpan.pan, dur: stageSpan.hold, ease: gsapEase.linear, run: () => {}, guides: [] },
  ]
}
