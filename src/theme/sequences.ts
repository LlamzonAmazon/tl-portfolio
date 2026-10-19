/**
 * The line sync contract.
 *
 * Every motion on the stage is a foreground STEP that owns its clock
 * (`at`, `dur`, `ease`). Background lines are GUIDES nested under a step:
 * they carry only a `span`, a fraction of the step's window, and inherit the
 * step's ease. A guide therefore cannot be timed apart from the content it
 * serves: retime the step and its lines follow. On a scrubbed timeline the
 * shared clock is scroll position, so stopping the wheel stops the pen.
 *
 * Rules (see the Renaissance Board Spec, sheets 01 + 09):
 *   - Every foreground entrance/exit declares its guides. An unpaired line is
 *     a bug: make it static texture or delete it.
 *   - Lines, nodes, ticks, arrowheads, rings and frame edges are always drawn
 *     and retracted, never faded or popped (helpers in lib/lines.ts).
 *   - Exits mirror entrances: last drawn, first erased.
 */

import { gsap } from 'gsap'

export interface Window {
  at: number
  dur: number
  ease: string
  /** A sub-window as fractions [a, b] of this one, same ease. */
  sub: (a: number, b: number) => Window
}

export function win(at: number, dur: number, ease: string): Window {
  return { at, dur, ease, sub: (a, b) => win(at + dur * a, dur * (b - a), ease) }
}

/**
 * Time fraction at which `ease` reaches eased progress `f` (bisection).
 * Used to fire an event exactly when a drawing pen's tip reaches a point,
 * which a plain `dur * f` would miss under any non-linear ease.
 */
export function invEase(ease: string, f: number): number {
  if (f <= 0) return 0
  if (f >= 1) return 1
  const fn = gsap.parseEase(ease)
  let lo = 0
  let hi = 1
  for (let i = 0; i < 28; i++) {
    const m = (lo + hi) / 2
    if (fn(m) < f) lo = m
    else hi = m
  }
  return (lo + hi) / 2
}

export type StepPhase = 'ink' | 'exit' | 'camera' | 'text' | 'settle'

export interface Guide {
  label: string
  /** Fraction of the partner step's window, e.g. [0, 0.35]. */
  span: readonly [number, number]
  run: (tl: gsap.core.Timeline, w: Window) => void
}

export interface Step {
  label: string
  phase: StepPhase
  at: number
  dur: number
  ease: string
  run: (tl: gsap.core.Timeline, w: Window) => void
  /** Background lines bound to this step. Empty only for holds and value changes. */
  guides: Guide[]
}

/** Lay every step and its guides onto `tl`. Returns `tl` for chaining. */
export function build(steps: Step[], tl: gsap.core.Timeline): gsap.core.Timeline {
  for (const s of steps) {
    const w = win(s.at, s.dur, s.ease)
    s.run(tl, w)
    for (const g of s.guides) g.run(tl, w.sub(g.span[0], g.span[1]))
  }
  return tl
}

/** End time of the last step (holds included). */
export function totalOf(steps: Step[]): number {
  return steps.reduce((m, s) => Math.max(m, s.at + s.dur), 0)
}
