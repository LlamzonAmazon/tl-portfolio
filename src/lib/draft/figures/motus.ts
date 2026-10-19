import { curve, lengthFraction, polar, type Vec } from '../geometry'
import { impact, protractor } from '../annotate'
import { SPECTRUM } from '@/theme/spectrum'
import { sketch } from '../sketch'

/**
 * Motus Proiectorum: Galileo's parabola (Two New Sciences, 1638).
 *
 * The ground and the line of the shot; the protractor sets its angle; the
 * ground is ticked into equal intervals (equal times: horizontal motion is
 * uniform); the trajectory is inked and a node lands at each instant; then
 * the point of the plate: from the line of the shot down to the path, the
 * fall grows as 1, 4, 9, 16, the squares of the times, in the sheet hue.
 */
export function motus() {
  const s = sketch('motus', [0, 0, 780, 500])
  const g = 430
  const o: Vec = [90, g]
  const R = 600
  const H = 200
  const steps = 8
  const at = (u: number): Vec => [o[0] + R * u, g - 4 * H * u * (1 - u)]
  // Launch tangent: slope 4H/R.
  const shot = (u: number): Vec => [o[0] + R * u, g - 4 * H * u]
  const ang = Math.atan2(-4 * H, R)

  s.pass('relay', 'ground')
  s.line([50, g], [740, g], 'ink')
  s.pass('relay', 'line of the shot')
  s.line(o, shot(0.54), 'construct', { dashed: true })
  protractor(s, o, 58, 0, ang, -ang / 6, 3, 'construct')
  s.label(polar(o, 72, ang / 2), `${Math.round((-ang * 180) / Math.PI)}°`, { kind: 'key', size: 9 })

  s.pass('fan', 'equal times')
  for (let i = 1; i <= steps; i++) {
    const x = o[0] + (R * i) / steps
    s.line([x, g], [x, g + 7], 'mark')
  }

  s.pass('relay', 'trajectory')
  const nodes = Array.from({ length: steps - 1 }, (_, i) => {
    const u = (i + 1) / steps
    return { at: at(u), f: lengthFraction(at, u) }
  })
  s.path(curve(at, 160), 'ink', { nodes: ['start', ...nodes, 'end'] })

  s.pass('fan', 'falls')
  for (let i = 1; i <= 4; i++) {
    const u = i / steps
    s.line(shot(u), at(u), 'key', { nodes: ['end'], nodeKind: 'key', nodeR: 2.4 })
    s.label([shot(u)[0] + 7, (shot(u)[1] + at(u)[1]) / 2 + 3], `${i * i}`, { kind: 'key', size: 9 })
  }
  s.pass('fan', 'verticals')
  for (let i = 1; i < steps; i++) s.line(at(i / steps), [at(i / steps)[0], g], 'construct', { dashed: true })

  s.label([50, 478], 'motus proiectorum', { kind: 'serif', size: 15 })
  return s.build()
}

export interface FlightOpts {
  /** Plane size (px): the flight is drawn in the scene's own coordinates. */
  w: number
  h: number
  /** Launch and landing points. They need not be level: the chord between them is the ground. */
  from: Vec
  to: Vec
  /** Height of the apex (px from the top). */
  apexY: number
  /** The seven equal-time nodes on the path take the spectrum, R to V. */
  spectrum?: boolean
  /** Mark the landing with an impact point instead of a plain node. */
  impact?: boolean
  /** Monotone construction: the falls in graphite, no keyed nodes (pair with a ghost Drawing). */
  quiet?: boolean
}

/**
 * The same study as a stage flight: launched from one point, landing on
 * another, so a camera pan can carry the eye along it. Over any chord the
 * fall from the line of the shot is still 4H u^2: the 1, 4, 9, 16 survive.
 * Stroke count never depends on geometry, so a resize only rewrites paths.
 *
 * Passes: ground chord · line of the shot · protractor arc · its ticks ·
 * equal-time ticks · trajectory (nodes at each instant) · falls (keyed).
 */
export function motusFlight({ w, h, from, to, apexY, spectrum = false, impact: hit = false, quiet = false }: FlightOpts) {
  const s = sketch('flight', [0, 0, w, h])
  const steps = 8
  const H = Math.max(40, (from[1] + to[1]) / 2 - apexY)
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const at = (u: number): Vec => [from[0] + dx * u, from[1] + dy * u - 4 * H * u * (1 - u)]
  const shot = (u: number): Vec => [from[0] + dx * u, from[1] + (dy - 4 * H) * u]
  const chordAng = Math.atan2(dy, dx)
  const shotAng = Math.atan2(dy - 4 * H, dx)

  s.pass('relay', 'ground')
  s.line(from, to, 'construct', { dashed: true })
  s.pass('relay', 'line of the shot')
  s.line(from, shot(0.45), 'construct', { dashed: true, nodes: ['start'], nodeKind: quiet ? 'ink' : 'key' })
  protractor(s, from, 46, chordAng, shotAng, (chordAng - shotAng) / 6, 3, 'construct')

  s.pass('fan', 'equal times')
  for (let i = 1; i < steps; i++) {
    const g: Vec = [from[0] + dx * (i / steps), from[1] + dy * (i / steps)]
    s.line(g, [g[0], g[1] + 7], 'mark')
  }

  // overlap 1: the impact is struck only once the pen has landed.
  s.pass('relay', 'trajectory', hit ? 1 : undefined)
  // Seven instants between launch and landing (steps = 8): with `spectrum`,
  // they take R, O, Y, G, B, I, V in flight order.
  const nodes = Array.from({ length: steps - 1 }, (_, i) => {
    const u = (i + 1) / steps
    return { at: at(u), f: lengthFraction(at, u), color: spectrum ? SPECTRUM[i % SPECTRUM.length].mark : undefined }
  })
  s.path(curve(at, 160), 'ink', { nodes: ['start', ...nodes, ...(hit ? [] : ['end' as const])], nodeR: spectrum ? 3.4 : undefined })
  if (hit) impact(s, to, 16)

  s.pass('fan', 'falls')
  for (let i = 1; i <= 3; i++) {
    const u = i / steps
    s.line(shot(u), at(u), quiet ? 'datum' : 'key', quiet ? {} : { nodes: ['end'], nodeKind: 'key', nodeR: 2.4 })
    s.label([shot(u)[0] + 7, (shot(u)[1] + at(u)[1]) / 2 + 3], `${i * i}`, { kind: 'key', size: 10 })
  }
  const apex = at(0.5)
  s.label([apex[0], apex[1] - 14], 'motus proiectorum', { kind: 'serif', size: 15, anchor: 'middle' })
  return s.build()
}
