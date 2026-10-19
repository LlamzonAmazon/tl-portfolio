import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { WIPE_HIDDEN, WIPE_SHOWN } from '@/components/hero/wipeConstants'
import { Drawing } from '@/components/ui/Drawing'
import type { DrawingHandle } from '@/lib/draft/choreo'
import { legend } from '@/lib/draft/figures/furniture'
import { SHEET_TOTAL, SHEETS, type SheetKey } from '@/theme/spectrum'

const LEGEND = legend()

interface TitleBlockProps {
  /**
   * One sheet key per scene, in stage order; numeral and title come from
   * SHEETS (theme/spectrum.ts). The block's column rule takes the current
   * sheet's hue. Values wipe over at scene changes.
   */
  sheets: readonly SheetKey[]
  style?: CSSProperties
}

export interface TitleBlockHandle {
  /** The block itself: its data-sheet follows the current sheet. */
  root: HTMLDivElement | null
  /** Sheet keys, in stage order. */
  keys: SheetKey[]
  /** The legend standing on the block: north rose + 50 mm scale bar (Instrumenta). */
  legend: () => DrawingHandle | null
  /** Paper ground + key/value cells: the foreground that inks in. */
  ink: Array<HTMLElement | null>
  /** Outer frame, clockwise from top-left. */
  frame: Array<HTMLElement | null>
  /** Inner rules: two row rules, then the column divider. */
  rules: Array<HTMLElement | null>
  /** Value spans per row, indexed [row][sheet]. */
  values: Array<Array<HTMLElement | null>>
}

/** "III of VI": both numerals in the display face, as in SheetIndex. */
const ROWS: Array<{ key: string; value: (sheet: SheetKey) => ReactNode }> = [
  {
    key: 'Sheet',
    value: (k) => (
      <>
        <span className="numeral">{SHEETS[k].numeral}</span> of <span className="numeral">{SHEET_TOTAL}</span>
      </>
    ),
  },
  { key: 'Title', value: (k) => SHEETS[k].title },
]

const FRAME = ['t', 'r', 'b', 'l'] as const
const RULES = ['r1', 'cd'] as const

/**
 * A drafting sheet's title block, fixed bottom-right through the whole pinned
 * stage. Its frame and rules are edge spans DRAWN by the stage timeline
 * (never a static border), on the same window as its text inks in. Sheet
 * values are a value change (exempt from line pairing): the old one wipes out
 * and the new one wipes in, in place, at each scene boundary. Decorative: the sections carry their own
 * headings, so this stays aria-hidden. Undrawn and wiped out until driven.
 */
export const TitleBlock = forwardRef<TitleBlockHandle, TitleBlockProps>(function TitleBlock({ sheets, style }, ref) {
  const inkRefs = useRef<Array<HTMLElement | null>>([])
  const frameRefs = useRef<Array<HTMLElement | null>>([])
  const ruleRefs = useRef<Array<HTMLElement | null>>([])
  const valueRefs = useRef<Array<Array<HTMLElement | null>>>(ROWS.map(() => []))
  const rootRef = useRef<HTMLDivElement>(null)
  const legendRef = useRef<DrawingHandle>(null)

  useImperativeHandle(
    ref,
    () => ({
      root: rootRef.current,
      keys: [...sheets],
      legend: () => legendRef.current,
      ink: inkRefs.current,
      frame: frameRefs.current,
      rules: ruleRefs.current,
      values: valueRefs.current,
    }),
    [sheets],
  )

  // ink order: [ground, row0 key, row0 value, row1 key, row1 value, ...]
  const inkRef = (i: number) => (el: HTMLElement | null) => {
    inkRefs.current[i] = el
  }

  return (
    <div ref={rootRef} aria-hidden data-sheet={sheets[0]} className="title-block pointer-events-none" style={style}>
      <div className="title-block__legend">
        <Drawing ref={legendRef} figure={LEGEND} animated />
      </div>
      <span ref={inkRef(0)} className="title-block__bg" style={{ clipPath: WIPE_HIDDEN }} />
      {ROWS.map((row, r) => (
        <div key={row.key} className="contents">
          <div ref={inkRef(1 + r * 2)} className="title-block__cell title-block__cell--key" style={{ clipPath: WIPE_HIDDEN }}>
            {row.key}
          </div>
          <div ref={inkRef(2 + r * 2)} className="title-block__cell title-block__swap" style={{ clipPath: WIPE_HIDDEN }}>
            {sheets.map((k, i) => (
              <span
                key={`${row.key}-${k}`}
                ref={(el) => {
                  valueRefs.current[r][i] = el
                }}
                style={{ clipPath: i === 0 ? WIPE_SHOWN : WIPE_HIDDEN }}
              >
                {row.value(k)}
              </span>
            ))}
          </div>
        </div>
      ))}
      {FRAME.map((e, i) => (
        <span
          key={e}
          ref={(el) => {
            frameRefs.current[i] = el
          }}
          className={`tb-edge tb-edge--${e}`}
          style={{ transform: e === 'r' || e === 'l' ? 'scaleY(0)' : 'scaleX(0)' }}
        />
      ))}
      {RULES.map((e, i) => (
        <span
          key={e}
          ref={(el) => {
            ruleRefs.current[i] = el
          }}
          className={`tb-edge tb-edge--${e}`}
          style={{ transform: e === 'cd' ? 'scaleY(0)' : 'scaleX(0)' }}
        />
      ))}
    </div>
  )
})
