/**
 * The spectrum: seven pigments in ROYGBIV order, one per sheet.
 *
 * The values are CSS references, never hex: tokens.css owns the colours,
 * this file owns only their ORDER and which sheet each one keys. Use it
 * where JS needs a hue (canvas, the prism figure, a sheet index).
 */

export interface Pigment {
  /** ROYGBIV letter. */
  band: 'R' | 'O' | 'Y' | 'G' | 'B' | 'I' | 'V'
  name: string
  /** Mark value: ticks, swatches, key lines, nodes. */
  mark: string
  /** Text-safe value on paper (>= 4.5:1). */
  ink: string
}

const p = (band: Pigment['band'], name: string): Pigment => ({
  band,
  name,
  mark: `var(--color-${name})`,
  ink: `var(--color-${name}-ink)`,
})

export const SPECTRUM: readonly Pigment[] = [
  p('R', 'vermilion'),
  p('O', 'minium'),
  p('Y', 'orpiment'),
  p('G', 'verdigris'),
  p('B', 'azurite'),
  p('I', 'indigo'),
  p('V', 'murex'),
]

/**
 * Roman numeral for a positive integer. Sheet and pillar indices are
 * lettered this way (set in the display face, see .numeral); data such as
 * counts and dates stays Arabic.
 */
export function roman(n: number): string {
  const table: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let out = ''
  for (const [v, sym] of table) {
    while (n >= v) {
      out += sym
      n -= v
    }
  }
  return out
}

/**
 * Sheet keys: sheet index "00".."06" -> its pigment and its lettered numeral.
 * The spectrum runs once over the six sections: I red, II orange + yellow,
 * III green, IV blue, V indigo, VI violet; the preloader shares the red.
 * Set the key with data-sheet; letter the sheet with `numeral`. The
 * preloader is sheet 00 and carries no numeral (there is no Roman zero).
 */
export const SHEETS = {
  '00': { title: 'Preloader', numeral: '', pigment: SPECTRUM[0] },
  '01': { title: 'Hero', numeral: 'I', pigment: SPECTRUM[0] },
  /** The thesis carries two: orange (Arcus) and yellow (Sectio Aurea, and its labels). */
  '02': { title: 'Thesis', numeral: 'II', pigment: SPECTRUM[2] },
  '03': { title: 'Projects', numeral: 'III', pigment: SPECTRUM[3] },
  '04': { title: 'Experience', numeral: 'IV', pigment: SPECTRUM[4] },
  '05': { title: 'Skills', numeral: 'V', pigment: SPECTRUM[5] },
  '06': { title: 'Contact', numeral: 'VI', pigment: SPECTRUM[6] },
} as const

export type SheetKey = keyof typeof SHEETS

/** The lettered sheets (I..VI) in order: every sheet but the preloader. */
export const NUMBERED_SHEETS: readonly SheetKey[] = (Object.keys(SHEETS) as SheetKey[]).filter((k) => SHEETS[k].numeral !== '')

/** How many sheets the board has, as a numeral: the "VI" of "III of VI". */
export const SHEET_TOTAL = roman(NUMBERED_SHEETS.length)
