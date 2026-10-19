/**
 * The choreographer: turns a figure's pass order into time.
 *
 * Output is a set of FRACTIONS of one window, so a figure can be laid on
 * any foreground step's window (theme/sequences.ts) and stay on its clock:
 * retime the step and the whole drawing follows. Pure: no DOM, no GSAP.
 *
 * Pacing (theme/motion.ts `pen`):
 *   - a stroke's time ~ length ** lengthExp (a steady hand, not a plotter)
 *   - relay passes chain stroke to stroke; a pen lift is inserted only
 *     where one stroke does not start where the last one ended
 *   - fan passes cascade; together passes run as one
 *   - each pass begins `passOverlap` of the way into the one before, so
 *     the ink chases the construction rather than waiting for it (a pass
 *     can set its own `overlap`: 1 holds the next until it has landed)
 *   - a compass arc's time is split: the arm opens, sweeps with the pen,
 *     folds back
 *   - labels wipe in once the stroke they annotate has landed
 */

import { pen } from '@/theme/motion'
import { near } from './geometry'
import type { Figure, Label, Stroke } from './sketch'

export interface Timed {
  stroke: Stroke
  /** The stroke's whole slot, arm included. */
  t0: number
  t1: number
  /** The part in which the line itself is drawn. */
  draw: readonly [number, number]
  open?: readonly [number, number]
  close?: readonly [number, number]
}

export interface TimedLabel {
  label: Label
  t0: number
  t1: number
}

export interface Schedule {
  strokes: Timed[]
  labels: TimedLabel[]
  /** Seconds this figure takes when played free at `pen.speed`. */
  freeDuration: number
}

type Pen = typeof pen

export function schedule(fig: Figure, p: Pen = pen): Schedule {
  const all = fig.passes.flatMap((ps) => ps.strokes)
  const weight = (s: Stroke) => Math.max(1, s.len) ** p.lengthExp
  const mean = all.reduce((m, s) => m + weight(s), 0) / Math.max(1, all.length)
  const lift = p.lift * mean

  const raw: Array<{ stroke: Stroke; t0: number; t1: number; d: number }> = []
  let passStart = 0
  for (const ps of fig.passes) {
    let cursor = passStart
    let prev: Stroke | null = null
    let prevSpan = 0
    let passEnd = passStart
    ps.strokes.forEach((s, i) => {
      const d = weight(s)
      const span = s.arm ? d / (1 - p.armOpen - p.armClose) : d
      let t0 = passStart
      if (ps.mode === 'relay') {
        t0 = i === 0 ? passStart : cursor + (prev && near(prev.b, s.a) ? 0 : lift)
      } else if (ps.mode === 'fan') {
        t0 = i === 0 ? passStart : cursor - prevSpan + p.fan * prevSpan
      }
      const t1 = t0 + span
      raw.push({ stroke: s, t0, t1, d: span })
      cursor = t1
      prevSpan = span
      prev = s
      passEnd = Math.max(passEnd, t1)
    })
    passStart = passStart + (ps.overlap ?? p.passOverlap) * (passEnd - passStart)
  }

  const strokeEnd = raw.reduce((m, r) => Math.max(m, r.t1), 0) || 1
  const endOf = new Map(raw.map((r) => [r.stroke.id, r.t1]))
  const labelDur = p.label * strokeEnd
  const rawLabels = fig.labels.map((label) => {
    const t0 = endOf.get(label.after) ?? strokeEnd
    return { label, t0, t1: t0 + labelDur }
  })
  const total = Math.max(strokeEnd, ...rawLabels.map((l) => l.t1))

  const strokes: Timed[] = raw.map(({ stroke, t0, t1 }) => {
    const a = t0 / total
    const b = t1 / total
    if (!stroke.arm) return { stroke, t0: a, t1: b, draw: [a, b] }
    const w = b - a
    const o = a + w * p.armOpen
    const c = b - w * p.armClose
    return { stroke, t0: a, t1: b, open: [a, o], draw: [o, c], close: [c, b] }
  })
  const labels = rawLabels.map(({ label, t0, t1 }) => ({ label, t0: t0 / total, t1: t1 / total }))

  // Free play: a stroke of mean length takes meanLen / speed seconds.
  const meanLen = all.reduce((m, s) => m + s.len, 0) / Math.max(1, all.length)
  const k = meanLen / p.speed / Math.max(1, meanLen) ** p.lengthExp
  return { strokes, labels, freeDuration: Math.max(2.4, total * k) }
}
