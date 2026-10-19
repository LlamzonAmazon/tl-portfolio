import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { skillGroups } from '@/content/skills'
import { SkillChip } from '@/components/skills/SkillChip'
import { WipeText } from '@/components/hero/WipeText'
import { Drawing } from '@/components/ui/Drawing'
import { SheetIndex } from '@/components/ui/SheetIndex'
import type { DrawingHandle } from '@/lib/draft/choreo'
import { cochlea } from '@/lib/draft/figures/cochlea'
import { diramatio, type DiramatioOpts } from '@/lib/draft/figures/diramatio'
import { elBox, setD } from './geometry'

/** Sheet V's plate: Archimedes' screw, a tool, set in the open band above the board. */
const COCHLEA = cochlea()
/** The transition from Experience before the first layout (same stroke count as every measured one). */
const SPLIT_DEFAULT: DiramatioOpts = {
  w: 1440,
  h: 900,
  from: [1360, -680],
  split: [720, 0],
  lands: skillGroups.map((_, c) => [100 + c * 320, 240] as [number, number]),
}

export interface SkillsColumn {
  header: HTMLElement | null
  headerRule: SVGPathElement | null
  /** Vertical datum down the column's left edge, drawn top to bottom. */
  datum: SVGPathElement | null
  chips: HTMLElement[]
  /** Where each chip sits along the datum, 0 (top) to 1 (bottom). Written by layout. */
  chipF: number[]
}

export interface SkillsSceneHandle {
  plane: HTMLDivElement | null
  headLabel: HTMLElement | null
  headText: HTMLElement | null
  columns: SkillsColumn[]
  /** Cochlea, top right above the kanban. */
  cochlea: () => DrawingHandle | null
  /**
   * Measure and write the linework. `from` is the Experience datum's right
   * end and `splitX` the card gap nearest its centre, already converted into
   * this plane's coordinates (one sheet above): the line leaves the datum's
   * end and splits on the seam between the sheets, under that gap.
   */
  layout: (from?: { x: number; y: number }, splitX?: number, clearY?: number) => void
  /** Diramatio: the run from the Experience datum, the prism, and its four rays. */
  split: () => DrawingHandle | null
}

const hidden = { strokeDashoffset: 1 }

/**
 * SEQ-07 content: the skills as a kanban board, one column per category.
 * Rises in with the camera; each column's datum draws down on the pan's
 * clock and each chip inks in as the datum's tip reaches it
 * (stage/sequences/skills.ts). Chips start clipped (WIPE_HIDDEN in the timeline).
 */
export const SkillsScene = forwardRef<SkillsSceneHandle>(function SkillsScene(_props, ref) {
  const planeRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const headLabelRef = useRef<HTMLElement | null>(null)
  const headTextRef = useRef<HTMLElement | null>(null)
  const columnRefs = useRef<Array<HTMLDivElement | null>>([])
  const headerRefs = useRef<Array<HTMLDivElement | null>>([])
  const chipRefs = useRef<Array<Array<HTMLLIElement | null>>>(skillGroups.map(() => []))
  const headerRules = useRef<Array<SVGPathElement | null>>([])
  const datums = useRef<Array<SVGPathElement | null>>([])
  const cochleaRef = useRef<DrawingHandle>(null)
  const splitRef = useRef<DrawingHandle>(null)
  const [split, setSplit] = useState(() => diramatio(SPLIT_DEFAULT))

  useImperativeHandle(ref, () => {
    const columns: SkillsColumn[] = skillGroups.map((g, c) => ({
      header: headerRefs.current[c],
      headerRule: headerRules.current[c],
      datum: datums.current[c],
      chips: chipRefs.current[c].filter((el): el is HTMLLIElement => el !== null),
      chipF: g.items.map(() => 0),
    }))

    const layout = (from?: { x: number; y: number }, splitX?: number, clearY?: number) => {
      const lands: Array<[number, number]> = []
      const plane = planeRef.current
      if (!plane) return
      const r = plane.getBoundingClientRect()
      svgRef.current?.setAttribute('viewBox', `0 0 ${plane.clientWidth} ${plane.clientHeight}`)
      columns.forEach((col, c) => {
        const colEl = columnRefs.current[c]
        const header = headerRefs.current[c]
        if (!colEl || !header) return
        const cb = elBox(colEl, r)
        const hb = elBox(header, r)
        const ruleY = hb.y + hb.h
        setD(col.headerRule, `M${cb.x} ${ruleY} H${cb.x + cb.w}`)
        const chips = col.chips.map((el) => elBox(el, r))
        // The column's line starts at the top of its header (where its ray
        // lands, clear of the label) and runs down past the last chip.
        const y1 = hb.y - 4
        const y2 = chips.length ? chips[chips.length - 1].y + chips[chips.length - 1].h + 12 : ruleY + 40
        const x = cb.x + 1
        setD(col.datum, `M${x} ${y1} V${y2}`)
        lands.push([x, y1])
        chips.forEach((b, i) => {
          col.chipF[i] = (b.y + b.h / 2 - y1) / (y2 - y1)
        })
      })
      // The fall splits at the seam between the sheets (this plane's top edge).
      if (from && lands.length === skillGroups.length) {
        const sx = splitX ?? plane.clientWidth / 2
        setSplit(diramatio({ w: plane.clientWidth, h: plane.clientHeight, from: [from.x, from.y], split: [sx, 0], lands, clearY }))
      }
    }

    return {
      plane: planeRef.current,
      headLabel: headLabelRef.current,
      headText: headTextRef.current,
      columns,
      cochlea: () => cochleaRef.current,
      split: () => splitRef.current,
      layout,
    }
  }, [])

  return (
    <div ref={planeRef} data-sheet="05" className="pointer-events-none absolute inset-0" style={{ visibility: 'hidden' }}>

      {/* The band between the heading and the board, right-aligned with the board's edge. */}
      <div
        className="stage-plate"
        style={{
          right: 'var(--section-px)',
          top: 'calc(var(--section-px) * 0.35)',
          height: 'calc(clamp(11rem, 27vh, 15rem) - var(--section-px) * 0.35 - 1.25rem)',
          aspectRatio: '780 / 440',
        }}
      >
        <Drawing ref={cochleaRef} figure={COCHLEA} animated />
      </div>
      <svg ref={svgRef} aria-hidden className="absolute inset-0 h-full w-full" fill="none">
        {skillGroups.map((g, c) => (
          <path
            key={`hr-${g.category}`}
            ref={(el) => {
              headerRules.current[c] = el
            }}
            className="ln-datum"
            pathLength={1}
            style={hidden}
          />
        ))}
        {skillGroups.map((g, c) => (
          <path
            key={`datum-${g.category}`}
            ref={(el) => {
              datums.current[c] = el
            }}
            className="ln-datum"
            pathLength={1}
            style={hidden}
          />
        ))}
      </svg>

      {/* The transition from Experience: drawn in this plane's px, reaching up past its top edge.
          Above the column lines: its landing dots sit on them. */}
      <div className="stage-plate inset-0">
        <Drawing ref={splitRef} figure={split} animated className="overflow-visible" />
      </div>

      <div className="absolute inset-x-0 top-0" style={{ padding: 'var(--section-px)', paddingBottom: 0 }}>
        <WipeText as="span" className="text-label text-label--key inline-block" ref={headLabelRef} plate={false} style={{ clipPath: 'none' }}>
          <SheetIndex sheet="05" />
        </WipeText>
        <WipeText as="h2" className="stage-heading mt-2 block" ref={headTextRef} plate={false} style={{ clipPath: 'none' }}>
          Skills.
        </WipeText>
      </div>

      <div
        className="kanban pointer-events-auto absolute"
        style={{ left: 'var(--section-px)', right: 'var(--section-px)', top: 'clamp(11rem, 27vh, 15rem)' }}
      >
        {skillGroups.map((g, c) => (
          <div
            key={g.category}
            ref={(el) => {
              columnRefs.current[c] = el
            }}
            className="kanban__column"
          >
            <div
              ref={(el) => {
                headerRefs.current[c] = el
              }}
              className="kanban__header"
            >
              <h3 className="text-label">{g.category}</h3>
              <span className="text-label-sm">{String(g.items.length).padStart(2, '0')}</span>
            </div>
            <ul className="kanban__list">
              {g.items.map((item, i) => (
                <SkillChip
                  key={item}
                  name={item}
                  ref={(el) => {
                    chipRefs.current[c][i] = el
                  }}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
})
