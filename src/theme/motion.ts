/**
 * Motion tokens — the JS-side companion to the CSS design tokens.
 *
 * These are the ONLY design values duplicated outside CSS, because GSAP,
 * Framer Motion and anime.js need them as JS. Colours / radii / shadows stay
 * in `styles/tokens.css` (Tailwind `@theme`) and are never mirrored here.
 *
 * Aesthetic: restrained. Slow paper reveals and ink fade-ins, never bounce.
 */

import { cubicBezier } from 'animejs'

/** Durations in seconds (GSAP/Framer speak seconds). */
export const duration = {
  fast: 0.18,
  base: 0.32,
  slow: 0.62,
  reveal: 0.9,
  draw: 1.1, // pen-draw stroke reveal
} as const

/** Cubic-bezier easing arrays — consumable by both GSAP and Framer. */
export const easeInk: [number, number, number, number] = [0.22, 1, 0.36, 1]
export const easePaper: [number, number, number, number] = [0.16, 1, 0.3, 1]

/** GSAP ease string equivalents (GSAP wants `x,y,x,y` CustomEase-free form). */
export const gsapEase = {
  ink: 'power3.out',
  paper: 'expo.out',
  linear: 'none',
} as const

/** anime.js equivalents — same bezier tokens as easing functions. */
export const animeEase = {
  ink: cubicBezier(...easeInk),
  paper: cubicBezier(...easePaper),
} as const

/** anime.js speaks milliseconds; same duration tokens, ×1000. */
export const animeDuration = {
  fast: duration.fast * 1000,
  base: duration.base * 1000,
  slow: duration.slow * 1000,
  reveal: duration.reveal * 1000,
  draw: duration.draw * 1000,
} as const

/** Framer Motion reveal transition — the default "ink fade-in". */
export const inkReveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: duration.reveal, ease: easePaper },
} as const

/** Stagger step for lists (skills, tags, letters). */
export const stagger = {
  tight: 0.035,
  base: 0.06,
  loose: 0.09,
} as const

/**
 * Base pinned-scroll timeline tokens (desktop, motion-OK only — see PinnedStage).
 * `vhTotal` is Hero's own scroll budget; PinnedStage adds further budget per
 * scene on top of it (see e.g. PROJECTS_VH) since it's all one continuous pin.
 */
export const heroMotion = {
  /** Total scroll distance allotted to the pinned scrub, in viewport heights. */
  vhTotal: 4,
  /** Scrub smoothing lag, in seconds. */
  scrub: 0.7,
} as const
