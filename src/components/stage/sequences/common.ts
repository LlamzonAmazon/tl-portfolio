/**
 * Shared building blocks for the stage sequences. Lines come from
 * lib/lines.ts; these are the foreground moves they pair with.
 * No opacity anywhere: content reveals and exits by wipe, tape, growth or
 * the camera carrying it out of frame, never by fading; linework is drawn
 * and retracted, never faded.
 */

import { invEase, type Window } from '@/theme/sequences'
import { WIPE_HIDDEN, WIPE_SHOWN } from '@/components/hero/wipeConstants'
import type { TitleBlockHandle } from '../TitleBlock'
import type { StageFurnitureHandle } from '../StageFurniture'
import type { HeroSceneHandle } from '../scenes/HeroScene'
import type { ProjectsSceneHandle } from '../scenes/ProjectsScene'
import type { ExperienceSceneHandle } from '../scenes/ExperienceScene'
import type { SkillsSceneHandle } from '../scenes/SkillsScene'
import type { ContactSceneHandle } from '../scenes/ContactScene'
import type { Camera } from '../camera'

export interface StageCtx {
  furniture: StageFurnitureHandle
  titleBlock: TitleBlockHandle
  hero: HeroSceneHandle
  projects: ProjectsSceneHandle
  experience: ExperienceSceneHandle
  skills: SkillsSceneHandle
  contact: ContactSceneHandle
  camera: Camera
  zoomScale: number
}

export const IR = { immediateRender: false } as const

type TL = gsap.core.Timeline

/** Tape-reveal edge (`--lead` stretch, `--trail` release) of a TapeText line. */
export const tape = (el: HTMLElement | undefined, prop: '--lead' | '--trail') => (tl: TL, w: Window) => {
  if (el) tl.fromTo(el, { [prop]: 0 }, { [prop]: 1, duration: w.dur, ease: w.ease, ...IR }, w.at)
}

/** Clip-path wipe: in reveals left to right, out hides right to left. */
export function wipe(tl: TL, el: gsap.TweenTarget | null | undefined, dir: 'in' | 'out', w: Window) {
  if (!el) return
  const [from, to] = dir === 'in' ? [WIPE_HIDDEN, WIPE_SHOWN] : [WIPE_SHOWN, WIPE_HIDDEN]
  tl.fromTo(el, { clipPath: from }, { clipPath: to, duration: w.dur, ease: w.ease, ...IR }, w.at)
}

/** Rest state of a grown sheet: negative insets so its shadow is never clipped. */
const GROWN = 'inset(-4% -4% -4% -4%)'

/** A sheet's paper collapsed to the point (fx, fy), as fractions of the sheet. */
export const grownFrom = ({ fx, fy }: { fx: number; fy: number }) =>
  `inset(${fy * 100}% ${(1 - fx) * 100}% ${(1 - fy) * 100}% ${fx * 100}%)`

/** Paper grows out from its anchor point to the full sheet (reverses on scrub-back). */
export function grow(tl: TL, el: HTMLElement | null, anchor: { fx: number; fy: number }, w: Window) {
  if (el) tl.fromTo(el, { clipPath: grownFrom(anchor) }, { clipPath: GROWN, duration: w.dur, ease: w.ease, ...IR }, w.at)
}

/**
 * Handoff timing: the moment a line drawn on `w` reaches fraction `f`,
 * clamped so an event of length `d` still finishes inside the window.
 */
export function reach(w: Window, f: number, d: number): number {
  return Math.max(w.at, Math.min(w.at + w.dur * invEase(w.ease, f), w.at + w.dur - d))
}

/**
 * Fraction of `w` at which a camera tween of `z` from `from` to `to` (on w's
 * ease) passes `z`. Places an event on a zoom level rather than a clock time.
 */
export const atZoom = (w: Window, from: number, to: number, z: number) => invEase(w.ease, (z - from) / (to - from))

/**
 * Title block value change (exempt from line pairing): the old value wipes
 * out, then the new one wipes in; at the handover the block takes the new
 * sheet's key, so its hue rule changes pigment with the sheet.
 */
export const sheetSwap = (tb: TitleBlockHandle, from: number, to: number) => (tl: TL, w: Window) => {
  for (const row of tb.values) {
    wipe(tl, row[from], 'out', w.sub(0, 0.5))
    wipe(tl, row[to], 'in', w.sub(0.5, 1))
  }
  if (tb.root) {
    tl.fromTo(tb.root, { attr: { 'data-sheet': tb.keys[from] } }, { attr: { 'data-sheet': tb.keys[to] }, duration: 0.001, ...IR }, w.at + w.dur * 0.5)
  }
}

/** Scene plane visibility switch (reversible on scrub-back). */
export function setVisible(tl: TL, el: HTMLElement | null, visible: boolean, at: number) {
  if (el) tl.set(el, { visibility: visible ? 'visible' : 'hidden' }, at)
}
