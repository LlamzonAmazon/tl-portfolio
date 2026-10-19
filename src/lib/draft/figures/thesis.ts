import { compose, place, placePoint, tint, type Placement } from '../compose'
import { sketch } from '../sketch'
import { arcus } from './arcus'
import { fenestra } from './fenestra'
import { sectioAurea } from './sectioAurea'

/** Plate size: a 16:9 sheet, fitted (meet) behind the thesis. */
export const THESIS_BOX = [0, 0, 1600, 900] as const

/**
 * Sheet II: Arcus Acutus and Sectio Aurea on one plate, joined.
 *
 * The pointed arch, at monumental scale, bleeds off the bottom-left corner
 * behind the title and the pillars; the golden rectangle hangs top right. A
 * datum carries the arch's springing line on to the right, then turns up to
 * the corner where the spiral starts, so the spiral is still launched from
 * the arch. Fenestra, a two-light window, is traced inside the arch last.
 *
 * Pass ranges (sequences/hero.ts and projects.ts pick them out):
 */
export const THESIS = {
  /** Springing line, the vesica swings, the plumb line. */
  arcSetOut: [0, 3],
  /** Intrados, extrados, voussoir joints. */
  arcInk: [3, 6],
  /** Piers, imposts, ground, pier section, span. */
  arcFinish: [6, 13],
  /** The datum from the arch's springing line to the spiral's first corner. */
  join: [13, 14],
  rectangle: [14, 15],
  cuts: [15, 16],
  diagonals: [16, 17],
  spiral: [17, 18],
  dimensions: [18, 24],
  /** Fenestra, the window traced inside the arch: lancets, mullion, oculus, quatrefoil. */
  tracery: [24, 30],
} as const

/** Golden rectangle: top right of the sheet, clear of the arch's crown. */
const AUREA_AT = { k: 1.05, dx: 887, dy: -30 }
/** The rectangle's local width (sectioAurea: H 380, W = H * phi, set out from x 60). */
const AUREA_CENTRE_LOCAL = 60 + (380 * ((1 + Math.sqrt(5)) / 2)) / 2

/** Centre of the golden rectangle across the plate, 0..1: the pillars hang centred below it. */
export const SECTIO_CENTRE_X = (AUREA_AT.dx + AUREA_CENTRE_LOCAL * AUREA_AT.k) / THESIS_BOX[2]

export function thesisPlate() {
  // Arch at monumental scale (2.4x): its crown just inside the top of the
  // sheet, its left pier off the left edge and its piers running off the
  // bottom; its springing line lands at y 720.
  const archAt = { k: 2.4, dx: -390, dy: -240 }
  const arch: Placement = { figure: arcus(), ...archAt }
  // The window shares the arch's coordinates, so it takes the same placement.
  const window: Placement = { figure: fenestra(), ...archAt }
  const aurea: Placement = { figure: sectioAurea(), ...AUREA_AT }

  const springEnd = placePoint([506, 400], arch) // outer end of the arch's right impost, on the springing line
  const spiralStart = placePoint([60, 440], aurea) // bottom-left corner of the rectangle

  const join = sketch('thesis-join', THESIS_BOX)
  join.pass('relay', 'join')
  // Along the springing line to below the corner, then up to it: one relay.
  const turn: [number, number] = [spiralStart[0], springEnd[1]]
  join.line(springEnd, turn, 'datum')
  join.line(turn, spiralStart, 'datum', { nodes: ['end'], nodeKind: 'key', nodeR: 3.2 })

  // Two studies, two hues: the arch's dots orange; the rectangle's take the sheet's yellow.
  return compose('thesis', THESIS_BOX, [
    tint(place(arch), 'var(--color-minium)'),
    join.build(),
    place(aurea),
    tint(place(window), 'var(--color-minium)'),
  ])
}
