/**
 * SEQ-08 + SEQ-09: the Skills board erases (last column first, each datum
 * retracting with its chips, the screw unwinding), then the closing sheet:
 * the name tapes in as the rose window is constructed behind it by compass
 * alone, one stage per tape phase; the links ink in as their corners draw
 * and the gardener's ellipse is strung between its two pins; then the
 * harmonograph, the board's last and longest line. Ends on a hold so the
 * pin never releases early.
 */

import { edges, retract } from '@/lib/lines'
import { figureGuide } from '@/lib/draft/choreo'
import { gsapEase, stageSpan } from '@/theme/motion'
import type { Step, Window } from '@/theme/sequences'
import { setVisible, sheetSwap, tape, wipe, type StageCtx } from './common'

/** Final hold: the pin releases only after this much settled scroll. */
export const FINAL_HOLD = 0.8
/** The harmonograph's step: one unbroken line, given room to slow as it decays. */
const HARMONIA_DUR = 1.6
/** Rosa passes (lib/draft/figures/rosa.ts). */
const ROSE = { circle: [0, 1], swings: [1, 2], petals: [2, 3], ring: [3, 6] } as const

export function contactScroll({ skills, contact, titleBlock }: StageCtx, t0: number): Step[] {
  const cols = skills.columns
  const nCols = cols.length
  const colSlot = (j: number) => [j * 0.12, j * 0.12 + 0.5] as const // j = 0 is the LAST column
  return [
    {
      label: 'Skills lift (last column first)', phase: 'exit', at: t0, dur: 0.9, ease: gsapEase.erase,
      run: (tl, w) => {
        cols.forEach((col, c) => wipe(tl, col.chips, 'out', w.sub(...colSlot(nCols - 1 - c))))
        wipe(tl, [skills.headLabel, skills.headText, ...cols.map((c) => c.header)], 'out', w.sub(0.5, 1))
        setVisible(tl, skills.plane, false, w.at + w.dur)
      },
      guides: [
        ...cols.map((col, c) => {
          const [a, b] = colSlot(nCols - 1 - c)
          return {
            label: `Column ${c + 1} datum retracts`,
            span: [a + 0.1, Math.min(1, b + 0.1)] as const,
            run: (tl: gsap.core.Timeline, g: Window) => retract(tl, col.datum, g),
          }
        }),
        { label: 'Header rules retract', span: [0.5, 1], run: (tl, g) => retract(tl, cols.map((c) => c.headerRule), g) },
        figureGuide('The screw unwinds, last drawn first', skills.cochlea, [0, 0.7], 'retract'),
        figureGuide('Rays, prism and run retract, last drawn first', skills.split, [0.3, 1], 'retract'),
      ],
    },
    { label: 'Sheet 05 → 06', phase: 'text', at: t0 + 0.5, dur: stageSpan.swap, ease: gsapEase.linear, run: sheetSwap(titleBlock, 4, 5), guides: [] },
    {
      label: 'THOMAS · tape stretches', phase: 'ink', at: t0 + 0.9, dur: 0.55, ease: gsapEase.pen,
      run: (tl, w) => { setVisible(tl, contact.plane, true, w.at); tape(contact.nameLines[0], '--lead')(tl, w) },
      guides: [figureGuide('Rose: the generating circle', contact.rosa, [0, 1], 'draw', { passes: ROSE.circle })],
    },
    {
      label: 'LLAMZON · tape stretches', phase: 'ink', at: t0 + 1.15, dur: 0.6, ease: gsapEase.pen,
      run: tape(contact.nameLines[1], '--lead'),
      guides: [figureGuide('Rose: six compass swings, each from the last crossing', contact.rosa, [0, 1], 'draw', { passes: ROSE.swings })],
    },
    {
      label: 'THOMAS · tape releases', phase: 'ink', at: t0 + 1.5, dur: 0.5, ease: gsapEase.ink,
      run: tape(contact.nameLines[0], '--trail'),
      guides: [figureGuide('Rose: the petals inked over the swings', contact.rosa, [0, 1], 'draw', { passes: ROSE.petals })],
    },
    {
      label: 'LLAMZON · tape releases', phase: 'ink', at: t0 + 1.8, dur: 0.55, ease: gsapEase.ink,
      run: tape(contact.nameLines[1], '--trail'),
      guides: [figureGuide('Rose: divisions, the window ring and its sixty ticks', contact.rosa, [0, 1], 'draw', { passes: ROSE.ring })],
    },
    {
      label: 'Label + links ink in', phase: 'ink', at: t0 + 2.3, dur: 0.9, ease: gsapEase.pen,
      run: (tl, w) => {
        wipe(tl, contact.label, 'in', w.sub(0, 0.45))
        contact.links.forEach((link, i) => wipe(tl, link.content, 'in', w.sub(0.2 + i * 0.2, 0.7 + i * 0.2)))
      },
      guides: [
        ...contact.links.map((link, i) => ({
          label: `Link ${i + 1} corners draw clockwise`,
          span: [0.2 + i * 0.2, 0.7 + i * 0.2] as const,
          run: (tl: gsap.core.Timeline, g: Window) => edges(tl, link.edges, g),
        })),
        figureGuide('Ellipse: two pins, the string, the curve', contact.ellipsis, [0.1, 1]),
      ],
    },
    {
      label: 'Harmonograph: the last line on the board', phase: 'ink', at: t0 + 3.2, dur: HARMONIA_DUR, ease: gsapEase.pen,
      run: () => {},
      guides: [figureGuide('Axes, amplitude, then one unbroken trace', contact.harmonia, [0, 1])],
    },
    { label: 'Final hold, pin releases', phase: 'settle', at: t0 + 3.2 + HARMONIA_DUR, dur: FINAL_HOLD, ease: gsapEase.linear, run: () => {}, guides: [] },
  ]
}
