/**
 * SEQ-06: one camera pan carries the Projects sheet out to the left and the
 * Experience sheet in from the right, as two cohesive units. The pan's plate
 * is Motus: a projectile launched from the Projects heading, flown over the
 * gap on the pan's own window (so its tip holds near centre while the paper
 * moves under it), landing where the datum starts; then each role's node and
 * leader are drawn as the datum passes, and the orrery in the margin lands
 * one planet per role on the same clock.
 */

import { draw, linesAlong, nodesAlong, retract } from '@/lib/lines'
import { figureGuide } from '@/lib/draft/choreo'
import { gsapEase, stageSpan } from '@/theme/motion'
import type { Step, Window } from '@/theme/sequences'
import { IR, setVisible, sheetSwap, type StageCtx } from './common'

/** A role's leader draws in this long once the datum's tip reaches its foot (timeline units). */
const LEADER_INK = 0.16

export function experienceScroll({ projects, experience, titleBlock, camera }: StageCtx, t0: number): Step[] {
  const nodesAt = (els: Array<SVGPathElement | null>) => els.map((el, i) => ({ el, f: experience.cardF[i] ?? 0 }))
  return [
    {
      label: 'Board pans to Experience (camera)', phase: 'camera', at: t0, dur: stageSpan.pan, ease: gsapEase.pen,
      run: (tl, w) => {
        setVisible(tl, experience.plane, true, w.at)
        tl.fromTo(camera.state, { panX: 0 }, { panX: 1, duration: w.dur, ease: w.ease, onUpdate: camera.apply, ...IR }, w.at)
        setVisible(tl, projects.plane, false, w.at + w.dur)
      },
      guides: [
        // Exit mirrors the entrance: construction lines go back to the ring in
        // reverse draft order (each node lifts as the returning pen leaves it),
        // then the ring itself. Inked sheets, frames and the heading stay on
        // the paper and ride the pan out.
        ...[...projects.sheets].reverse().map((sheet, i, all) => ({
          label: `Radial 0${all.length - i} + node retract to the ring`,
          span: [i * 0.03, 0.14 + i * 0.03] as const,
          run: (tl: gsap.core.Timeline, g: Window) => {
            retract(tl, sheet.radial, g)
            nodesAlong(tl, [{ el: sheet.node, f: 1 }, { el: sheet.ringNode, f: 0 }], g, stageSpan.node, 'retract')
          },
        })),
        { label: 'Heading ring retracts', span: [0.24, 0.5], run: (tl, g) => retract(tl, projects.ring, g) },
        figureGuide('Motus: launched from the heading, flown over the gap, landing on the datum', experience.flight, [0, 0.52]),
        figureGuide('Orrery set out: axes, meridian, the sun and its rays', experience.systema, [0.18, 0.5], 'draw', { passes: [0, 4] }),
        figureGuide('Orbits drawn as the datum passes, a planet per role', experience.systema, [0.45, 1], 'draw', { passes: [4, 99] }),
        {
          label: 'Datum draws; each node and leader as it passes', span: [0.45, 1],
          run: (tl, g) => {
            draw(tl, experience.datum, g)
            nodesAlong(tl, nodesAt(experience.nodes), g, stageSpan.node)
            linesAlong(tl, nodesAt(experience.leaders), g, LEADER_INK)
          },
        },
      ],
    },
    { label: 'Sheet 03 → 04', phase: 'text', at: t0 + stageSpan.pan * 0.4, dur: stageSpan.swap, ease: gsapEase.linear, run: sheetSwap(titleBlock, 2, 3), guides: [] },
    { label: 'Hold', phase: 'settle', at: t0 + stageSpan.pan, dur: stageSpan.hold, ease: gsapEase.linear, run: () => {}, guides: [] },
  ]
}
