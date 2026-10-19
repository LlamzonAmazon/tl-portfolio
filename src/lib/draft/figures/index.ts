/**
 * The folio: every drafted figure, with the sheet it is proposed for and
 * the choreography patterns it exercises. Figures are built lazily (each
 * is a pure function), so importing the folio costs nothing until a plate
 * is drawn.
 */

import type { SheetKey } from '@/theme/spectrum'
import type { Figure } from '../sketch'
import { compose } from '../compose'
import { arcus } from './arcus'
import { cochlea } from './cochlea'
import { curva } from './curva'
import { diramatio } from './diramatio'
import { dePictura } from './dePictura'
import { ellipsis } from './ellipsis'
import { fenestra } from './fenestra'
import { harmonia } from './harmonia'
import { iactus } from './iactus'
import { instrumenta } from './instrumenta'
import { motus } from './motus'
import { rosa } from './rosa'
import { rota } from './rota'
import { sectioAurea } from './sectioAurea'
import { spectrum } from './spectrum'
import { systema } from './systema'

export type Pattern = 'relay' | 'fan' | 'compass' | 'raster' | 'plot' | 'measure' | 'leader' | 'single line'

export interface Plate {
  id: string
  /** Plate title (Latin, as lettered on the plate). */
  title: string
  /** What it shows, in plain words. */
  subject: string
  /** Sheet it is proposed to accompany on the stage. */
  sheet: SheetKey
  patterns: Pattern[]
  build: () => Figure
}

export const FOLIO: readonly Plate[] = [
  { id: 'spectrum', title: 'Experimentum Crucis', subject: "Newton's prism: one ink ray in, seven pigments out", sheet: '00', patterns: ['relay', 'fan', 'measure'], build: spectrum },
  { id: 'pictura', title: 'De Pictura', subject: "Alberti's perspective pavement by the distance point", sheet: '01', patterns: ['fan', 'relay', 'raster'], build: dePictura },
  { id: 'aurea', title: 'Sectio Aurea', subject: 'Golden rectangle cut square by square, spiral in one line', sheet: '02', patterns: ['relay', 'fan', 'single line', 'measure'], build: sectioAurea },
  { id: 'rota', title: 'Rota Dentata', subject: 'Involute spur gear with its unwound-string construction', sheet: '03', patterns: ['compass', 'fan', 'single line', 'leader'], build: rota },
  { id: 'curva', title: 'Curva', subject: "de Casteljau's construction of a cubic Bezier", sheet: '03', patterns: ['relay', 'plot'], build: curva },
  { id: 'iactus', title: 'Iactus Iridis', subject: 'The cast of the rainbow: a projectile thrown over the name, its seven equal instants struck R to V, landing in an impact mark', sheet: '01', patterns: ['plot', 'fan', 'measure'], build: () => iactus() },
  { id: 'motus', title: 'Motus Proiectorum', subject: "Galileo's parabola: the fall grows as the square of time", sheet: '04', patterns: ['plot', 'fan', 'measure'], build: motus },
  { id: 'arcus', title: 'Arcus Acutus', subject: 'Equilateral pointed arch set out by compass, voussoirs fanned', sheet: '04', patterns: ['compass', 'fan', 'raster', 'leader', 'measure'], build: arcus },
  { id: 'fenestra', title: 'Fenestra', subject: 'Two-light bar tracery traced inside the arch: lancets, mullion, and an oculus resting on both lancets, filled with a quatrefoil', sheet: '02', patterns: ['compass', 'fan', 'relay'], build: () => compose('fenestra', [0, 0, 600, 660], [arcus(), fenestra()]) },
  { id: 'systema', title: 'Systema Mundi', subject: 'Oblique heliocentric orrery, planets landing as the pen passes', sheet: '00', patterns: ['compass', 'fan', 'plot'], build: systema },
  { id: 'diramatio', title: 'Diramatio', subject: 'One line through a prism becomes one line per column: the experimentum crucis as a transition', sheet: '05', patterns: ['relay', 'fan'], build: () => diramatio({ w: 720, h: 420, from: [40, 40], split: [420, 220], lands: [[150, 400], [330, 400], [510, 400], [690, 400]], clearY: 120 }) },
  { id: 'cochlea', title: 'Cochlea', subject: 'Archimedean screw: depth from ink in front, dashes behind', sheet: '05', patterns: ['relay', 'measure'], build: cochlea },
  { id: 'rosa', title: 'Rosa', subject: 'Hexafoil rosette by compass alone, rose-window ring', sheet: '06', patterns: ['compass', 'fan'], build: rosa },
  { id: 'ellipsis', title: 'Ellipsis', subject: "The gardener's ellipse: two pins and a string", sheet: '06', patterns: ['relay', 'measure'], build: ellipsis },
  { id: 'harmonia', title: 'Harmonia', subject: 'Harmonograph trace at 2 : 3, a single unbroken gesture', sheet: '06', patterns: ['single line'], build: harmonia },
  { id: 'instrumenta', title: 'Instrumenta', subject: 'The annotation kit: rose, dimension, leader, protractor, scale', sheet: '01', patterns: ['measure', 'leader', 'raster', 'compass'], build: instrumenta },
]
