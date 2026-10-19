/**
 * Motion tokens: the JS-side companion to the CSS design tokens.
 *
 * These are the ONLY design values duplicated outside CSS, because GSAP,
 * Framer Motion and anime.js need them as JS. `styles/tokens.css` mirrors the
 * durations/eases as CSS custom properties for CSS transitions; keep the two
 * in lockstep. Colours / radii / shadows stay in CSS and are never mirrored.
 *
 * Aesthetic: slow, settled, never bouncy. Every ease has exactly one job:
 *   ink    content arriving (tape release, fades, faces)        quint-out
 *   pen    a wipe and the lines that travel with it, camera     cubic in-out
 *   settle hover, lift, small repeated feedback                 cubic-out
 *   erase  content leaving and the lines retracting with it     sine in-out
 * Lines never get their own ease: they inherit their foreground partner's
 * (see theme/sequences.ts).
 */

import { cubicBezier } from 'animejs'

type Bezier = readonly [number, number, number, number]

/** Durations in seconds (GSAP/Framer speak seconds). */
export const duration = {
  press: 0.16, // :active feedback only
  hover: 0.56,
  base: 0.8,
  reveal: 1.2,
  draw: 1.4,
  construct: 2.0,
  hold: 0.4,
} as const

/** Exits take this fraction of their entrance duration. */
export const eraseRatio = 0.6

/** Cubic-bezier tuples, consumable by Framer Motion. */
export const bezier = {
  ink: [0.22, 1, 0.36, 1],
  pen: [0.65, 0, 0.35, 1],
  settle: [0.33, 1, 0.68, 1],
  erase: [0.37, 0, 0.63, 1],
} as const satisfies Record<string, Bezier>

/** GSAP equivalents of the beziers above (no CustomEase needed). */
export const gsapEase = {
  ink: 'power4.out',
  pen: 'power2.inOut',
  settle: 'power2.out',
  erase: 'sine.inOut',
  linear: 'none',
} as const

/** anime.js equivalents: same bezier tokens as easing functions. */
export const animeEase = {
  ink: cubicBezier(...bezier.ink),
  pen: cubicBezier(...bezier.pen),
  settle: cubicBezier(...bezier.settle),
  erase: cubicBezier(...bezier.erase),
  linear: 'linear', // constant-rate ramps (the preloader's progress counter)
} as const

/** Stagger steps, in seconds. */
export const stagger = {
  char: 0.03, // glyphs, ruler ticks
  item: 0.14, // list items, pillars, cards in a group
  group: 0.28, // between groups in one section
  beat: 0.5, // between phases of a sequence
} as const

/** Translate distances, in px. Reveals never travel further than `max`. */
export const travel = {
  min: 12,
  max: 20,
  lift: 3,
} as const

/**
 * Page smooth scroll (Lenis, App.tsx). The page eases toward the wheel target
 * by `lerp` of the remaining distance each 60fps frame: lower is looser (a
 * longer glide behind the wheel), higher is tighter. Lenis default is 0.1.
 */
export const smoothScroll = {
  lerp: 0.06,
} as const

/** Pinned-stage scroll settings (desktop, motion-OK only; see PinnedStage). */
export const stageMotion = {
  /** ScrollTrigger scrub lag, in seconds. */
  scrub: 0.7,
} as const

/**
 * The pen: how a drafted figure is paced (lib/draft/choreo.ts).
 *
 * A figure is drawn in PASSES, the way a draughtsman works: construction
 * in 2H first, then the figure inked over it, then hatch, then the keyed
 * annotation. Inside a pass, each stroke's time is proportional to
 * length ** `lengthExp`: below 1, long strokes move faster than short ones
 * (a steady hand speeds up on a long rule) and short ticks never flash.
 */
export const pen = {
  /** Stroke time ~ length^lengthExp. 1 = constant nib speed. */
  lengthExp: 0.62,
  /** Pen lift between two strokes that do not connect, as a fraction of the mean stroke time. */
  lift: 0.18,
  /** A pass starts when the previous one is this far through (1 = strictly after). */
  passOverlap: 0.72,
  /** Fan stagger: each stroke in a fan starts this fraction of its own time after the last. */
  fan: 0.22,
  /** Compass arm: share of an arc's time spent opening the arm / closing it. */
  armOpen: 0.22,
  armClose: 0.16,
  /** Node slide-in length, as a fraction of the whole figure window (long enough to read as a slide). */
  node: 0.12,
  label: 0.06,
  /** Free-play speed (figure units per second) when no scroll window drives the pen. */
  speed: 520,
} as const

/**
 * Stage timeline spans. The pinned stage's master timeline is scrubbed by
 * scroll, so these are SCROLL UNITS, not seconds (PinnedStage maps one unit
 * to VH_PER_UNIT viewport heights). Only spans shared by more than one
 * sequence live here; a span used by one sequence stays a named local.
 */
export const stageSpan = {
  /** A node's clip reveal/clear, the same share of a pen stroke as `pen.node`. */
  node: pen.node,
  /** A camera pan between sheets (Projects to Experience, Experience to Skills). */
  pan: duration.construct,
  /** A title block value change (the old value wipes out, the new wipes in). */
  swap: 0.4,
  /** The rest beat after a sheet lands, before the next move. */
  hold: 0.5,
} as const

/** The name's tape (TapeText): `--lead` stretch, then `--trail` release. */
export const nameTape = {
  stretch: duration.base * 1.25,
  release: duration.reveal * 0.8,
  /** The second line of the name runs this much slower than the first. */
  lag: 1.15,
} as const

/**
 * The preloader (ui/Preloader.tsx). Milliseconds, because anime.js drives the
 * progress counter; the plate itself paces on `duration` and `pen`.
 */
export const preloader = {
  /** The ramp to `rampTo` percent takes this long, and release waits at least as long. */
  minMs: 900,
  /** The last stretch to 100 percent, once the page is ready. */
  finishMs: 380,
  /** Where the ramp parks (percent) until the page is ready. */
  rampTo: 90,
  /** Share of progress (0..1) over which the wordmark wipes in. */
  wordmark: 0.18,
  /** Share of progress at which the plate starts drawing, and the share it spans. */
  plateAt: 0.05,
  plateSpan: 0.95,
} as const
