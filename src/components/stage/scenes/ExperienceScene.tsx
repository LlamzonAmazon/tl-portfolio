import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { experiences } from '@/content/experience'
import { nodePath } from '@/lib/lines'
import { ExperienceCard } from '@/components/experience/ExperienceCard'
import { ExperienceDetailModal } from '@/components/experience/ExperienceDetailModal'
import { Drawing } from '@/components/ui/Drawing'
import { FlowPath, type FlowHandle } from '@/components/ui/FlowPath'
import { SheetIndex } from '@/components/ui/SheetIndex'
import type { DrawingHandle } from '@/lib/draft/choreo'
import { motusFlight, type FlightOpts } from '@/lib/draft/figures/motus'
import { systema } from '@/lib/draft/figures/systema'
import { elBox, setD } from './geometry'

/**
 * Sheet IV's margin study: the orrery. One planet per role (innermost = most
 * recent, matching the row left to right; the current role is keyed); each
 * lands as the datum passes its role.
 */
const SYSTEMA = systema({ planets: experiences.length, key: 0 })
/** Flight before the first layout: same stroke count as every measured one. */
const FLIGHT_DEFAULT: FlightOpts = { w: 1440, h: 810, from: [-900, 450], to: [80, 200], apexY: 90, current: 'outside' }
/** The datum's current runs this far above it: level with the flight's (outside) and Diramatio's run, so the three read as one line. */
const DATUM_FLOW_OFF = 9

export interface ExperienceSceneHandle {
  plane: HTMLDivElement | null
  /**
   * Motus (the pan's plate): a projectile launched from the end of the
   * Projects heading rule, over the gap between the sheets, landing where
   * the datum starts. The camera pan carries the eye along its flight.
   */
  flight: () => DrawingHandle | null
  /** Systema (margin study, top right): one orbit per role. */
  systema: () => DrawingHandle | null
  /** The horizontal datum every role hangs from, drawn left to right. */
  datum: SVGPathElement | null
  /** The current above the datum, from the flight's landing to where the Skills line leaves. */
  datumFlow: FlowHandle | null
  leaders: Array<SVGPathElement | null>
  nodes: Array<SVGPathElement | null>
  /** Where each card's leader meets the datum, 0 (datum start) to 1 (end). Written by layout. */
  cardF: number[]
  /**
   * Measure and write the linework. `crossFrom` is the Projects heading
   * anchor already converted into this plane's coordinates: the flight is
   * launched from it and lands on the datum's start.
   */
  layout: (crossFrom: { x: number; y: number }) => void
  /**
   * The datum's right-hand end (where the Skills line leaves from) and the
   * card gap nearest its centre (where that line splits, one sheet below),
   * in this plane's px. Written by layout.
   */
  datumEnd: { x: number; y: number }
  datumCentre: { x: number; y: number }
  /** Bottom of the lowest card, in this plane's px. Written by layout. */
  rowBottom: { y: number }
}

const hidden = { strokeDashoffset: 1 }

/**
 * SEQ-06 content: the roles as drafting sheets hung from one datum, reverse
 * chronological left to right. The sheet arrives complete with the camera
 * pan; only its connective lines draw, on the pan's own clock
 * (stage/sequences/experience.ts). Cards open the role's detail sheet.
 */
export const ExperienceScene = forwardRef<ExperienceSceneHandle>(function ExperienceScene(_props, ref) {
  const planeRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const flightRef = useRef<DrawingHandle>(null)
  const systemaRef = useRef<DrawingHandle>(null)
  const [flight, setFlight] = useState(() => motusFlight(FLIGHT_DEFAULT))
  const datum = useRef<SVGPathElement>(null)
  const datumFlow = useRef<FlowHandle>(null)
  const leaders = useRef<Array<SVGPathElement | null>>([])
  const nodes = useRef<Array<SVGPathElement | null>>([])

  const [activeId, setActiveId] = useState<number | null>(null)
  const active = useMemo(() => experiences.find((e) => e.id === activeId) ?? null, [activeId])

  useImperativeHandle(ref, () => {
    const cardF: number[] = experiences.map(() => 0)
    const datumCentre = { x: 0, y: 0 }
    const datumEnd = { x: 0, y: 0 }
    const rowBottom = { y: 0 }

    const layout = (crossFrom: { x: number; y: number }) => {
      const plane = planeRef.current
      const row = rowRef.current
      if (!plane || !row) return
      const r = plane.getBoundingClientRect()
      svgRef.current?.setAttribute('viewBox', `0 0 ${plane.clientWidth} ${plane.clientHeight}`)

      const rowBox = elBox(row, r)
      const y = rowBox.y - 40
      const x1 = rowBox.x - 24
      const x2 = rowBox.x + rowBox.w + 24
      datumCentre.y = y
      datumEnd.x = x2
      datumEnd.y = y
      setD(datum.current, `M${x1} ${y} H${x2}`)
      const flowD = `M${x1} ${y - DATUM_FLOW_OFF} H${x2}`
      setD(datumFlow.current?.pen, flowD)
      setD(datumFlow.current?.line, flowD)
      // The flight's apex clears the top of the sheet's heading band.
      setFlight(
        motusFlight({ w: plane.clientWidth, h: plane.clientHeight, from: [crossFrom.x, crossFrom.y], to: [x1, y], apexY: plane.clientHeight * 0.11, current: 'outside' }),
      )

      const boxes = cardRefs.current.map((card) => (card ? elBox(card, r) : null))
      boxes.forEach((b, i) => {
        if (!b) return
        const cx = b.x + b.w / 2
        setD(leaders.current[i], `M${cx} ${y} V${b.y}`)
        setD(nodes.current[i], nodePath(cx, y))
        cardF[i] = (cx - x1) / (x2 - x1)
      })
      // The Skills fall leaves the datum through a gap between two cards,
      // never through a card: the gap nearest the datum's centre.
      const mid = (x1 + x2) / 2
      let best: number | null = null
      for (let i = 0; i + 1 < boxes.length; i++) {
        const a = boxes[i]
        const b = boxes[i + 1]
        if (!a || !b) continue
        const gx = (a.x + a.w + b.x) / 2
        if (best === null || Math.abs(gx - mid) < Math.abs(best - mid)) best = gx
      }
      datumCentre.x = best ?? mid
      rowBottom.y = Math.max(...boxes.map((b) => (b ? b.y + b.h : 0)))
    }

    return {
      plane: planeRef.current,
      flight: () => flightRef.current,
      systema: () => systemaRef.current,
      datum: datum.current,
      datumFlow: datumFlow.current,
      leaders: leaders.current,
      nodes: nodes.current,
      cardF,
      datumCentre,
      datumEnd,
      rowBottom,
      layout,
    }
  }, [])

  return (
    <div ref={planeRef} data-sheet="04" className="pointer-events-none absolute inset-0" style={{ visibility: 'hidden' }}>

      {/* Margin study, top right: clear of the heading, above the datum. */}
      <div
        className="stage-plate"
        style={{
          right: 'var(--section-px)',
          top: 'calc(var(--section-px) * 0.3)',
          height: 'calc(clamp(13rem, 30%, 18rem) - 40px - var(--section-px) * 0.3 - 1rem)',
          aspectRatio: '1',
        }}
      >
        <Drawing ref={systemaRef} figure={SYSTEMA} animated />
      </div>

      <svg ref={svgRef} aria-hidden className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <FlowPath ref={datumFlow} animated />
        <path ref={datum} className="ln-datum" pathLength={1} style={hidden} />
        {experiences.map((e, i) => (
          <path
            key={`lead-${e.id}`}
            ref={(el) => {
              leaders.current[i] = el
            }}
            className="ln-datum"
            pathLength={1}
            style={hidden}
          />
        ))}
        {experiences.map((e, i) => (
          <path
            key={`node-${e.id}`}
            ref={(el) => {
              nodes.current[i] = el
            }}
            className="ln-node"
          />
        ))}
      </svg>

      {/* The flight: drawn in this plane's px, launched from beyond its left edge.
          Above the datum: its landing dot sits on the datum's start. */}
      <div className="stage-plate inset-0">
        <Drawing ref={flightRef} figure={flight} animated className="overflow-visible" />
      </div>

      <div className="absolute inset-x-0 top-0" style={{ padding: 'var(--section-px)', paddingBottom: 0 }}>
        <span className="text-label text-label--key">
          <SheetIndex sheet="04" />
        </span>
        <h2 className="stage-heading mt-2">Experience.</h2>
      </div>

      <div
        ref={rowRef}
        className="experience-row pointer-events-auto absolute"
        style={{
          ['--roles' as string]: experiences.length, left: 'var(--section-px)', right: 'var(--section-px)', top: 'clamp(13rem, 30%, 18rem)' }}
      >
        {experiences.map((entry, i) => (
          <div
            key={entry.id}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className={i % 2 ? 'experience-row__drop' : ''}
          >
            <ExperienceCard entry={entry} onOpen={setActiveId} className="h-full" stage />
          </div>
        ))}
      </div>

      <AnimatePresence>{active && <ExperienceDetailModal entry={active} onClose={() => setActiveId(null)} />}</AnimatePresence>
    </div>
  )
})
