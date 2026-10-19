import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { projects } from '@/content/projects'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PlaceholderCard } from '@/components/projects/PlaceholderCard'
import { ProjectDetailModal } from '@/components/projects/ProjectDetailModal'
import { WipeText } from '@/components/hero/WipeText'
import { Drawing } from '@/components/ui/Drawing'
import { SheetIndex } from '@/components/ui/SheetIndex'
import type { DrawingHandle } from '@/lib/draft/choreo'
import type { Figure } from '@/lib/draft/sketch'
import { curva } from '@/lib/draft/figures/curva'
import { rota } from '@/lib/draft/figures/rota'
import { ellipsePath, nodePath, rectPathFrom } from '@/lib/lines'
import { elBox, setD, textBox, type Box } from './geometry'
import { BOARD_ORIGIN_X, BOARD_ORIGIN_Y, COLLAGE_LAYOUT, HEADING_RECT } from './projectsLayout'

/** One sheet on the board, with everything the drafting step needs. */
export interface DraftSheet {
  wrapper: HTMLDivElement
  /** Paper layer: grows out from the anchor (clip-path). */
  paper: HTMLElement | null
  /** Content layer: inks in last (wipe). */
  face: HTMLElement | null
  /** The sheet's frame: one pen path from the anchor, clockwise, back to it. */
  frame: SVGPathElement | null
  /** Drawn disc where the radial hands off to the frame. */
  node: SVGPathElement | null
  /** Construction line from the heading ring to the anchor. */
  radial: SVGPathElement | null
  /** Dot where the radial leaves the heading ring (above every line). */
  ringNode: SVGPathElement | null
  /** Where the radial lands, as fractions of the sheet. Written by layout. */
  anchor: { fx: number; fy: number }
  /** A placeholder's study plate, drafted once its sheet is issued. */
  plate: (() => DrawingHandle | null) | null
}

/**
 * Sheet III's plates live on the two unissued sheets: future work, still on
 * the drawing board. The gear takes the square sheet above the heading, the
 * curve construction the wide one at lower right.
 */
const STUDIES: Record<string, Figure> = { 'ph-top': rota(), 'ph-right': curva() }

export interface ProjectsSceneHandle {
  plane: HTMLDivElement | null
  /** Label + title block: rides the camera's pull-out down to 1x (camera.ts). */
  heading: HTMLDivElement | null
  headLabel: HTMLElement | null
  headText: HTMLElement | null
  /** Construction ellipse around the heading; every radial leaves from it. */
  ring: SVGPathElement | null
  headRules: Array<SVGPathElement | null>
  /** In draft order (COLLAGE_LAYOUT order). */
  sheets: DraftSheet[]
  /** End of the heading's right rule, in this plane's px (the Experience flight launches here). */
  anchor: { x: number; y: number }
  layout: () => void
}

const hidden = { strokeDashoffset: 1 }
/** Half the frame stroke: frame paths and radial anchors sit on the stroke's center line. */
const FRAME_INSET = 0.75

export const ProjectsScene = forwardRef<ProjectsSceneHandle>(function ProjectsScene(_props, ref) {
  const planeRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapperRefs = useRef<Array<HTMLDivElement | null>>([])
  const headingRef = useRef<HTMLDivElement>(null)
  const headLabelRef = useRef<HTMLElement | null>(null)
  const headTextRef = useRef<HTMLElement | null>(null)
  const ringRef = useRef<SVGPathElement>(null)
  const radials = useRef<Array<SVGPathElement | null>>([])
  const ringNodes = useRef<Array<SVGPathElement | null>>([])
  const headRules = useRef<Array<SVGPathElement | null>>([])
  const plateRefs = useRef<Record<string, DrawingHandle | null>>({})

  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)
  const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) ?? null, [activeProjectId])

  useImperativeHandle(ref, () => {
    const anchor = { x: 0, y: 0 }
    const sheets: DraftSheet[] = []
    wrapperRefs.current.forEach((wrapper, i) => {
      if (!wrapper) return
      sheets.push({
        wrapper,
        paper: wrapper.querySelector<HTMLElement>('.draft-sheet__paper'),
        face: wrapper.querySelector<HTMLElement>('.card-face'),
        frame: wrapper.querySelector<SVGPathElement>('.sheet-frame__path'),
        node: wrapper.querySelector<SVGPathElement>('.sheet-frame__node'),
        radial: radials.current[i] ?? null,
        ringNode: ringNodes.current[i] ?? null,
        anchor: { fx: 0, fy: 0 },
        plate: STUDIES[COLLAGE_LAYOUT[i].key] ? () => plateRefs.current[COLLAGE_LAYOUT[i].key] ?? null : null,
      })
    })

    const layout = () => {
      const plane = planeRef.current
      const headLabel = headLabelRef.current
      const headText = headTextRef.current
      if (!plane || !headLabel || !headText) return
      // The plane may be mid-pan; measure in its own (untransformed) frame.
      // The heading may be mid-zoom: measure it at rest (the camera rewrites
      // its scale right after layout, see PinnedStage).
      if (headingRef.current) gsap.set(headingRef.current, { clearProps: 'transform' })
      const r = plane.getBoundingClientRect()
      const W = plane.clientWidth
      const H = plane.clientHeight
      svgRef.current?.setAttribute('viewBox', `0 0 ${W} ${H}`)

      const hl = textBox(headLabel, r)
      const ht = textBox(headText, r)
      const hx1 = Math.min(hl.x, ht.x)
      const hx2 = Math.max(hl.x + hl.w, ht.x + ht.w)
      const hy1 = hl.y
      const hy2 = ht.y + ht.h
      const hcx = (hx1 + hx2) / 2
      const halfW = (hx2 - hx1) / 2
      const ruleY = hy2 + 14

      // The ring hugs the heading, centered on the zoom origin. Every radial
      // is a ray from that center to its sheet's anchor, drawn only from where
      // it crosses the ring, so it never touches the heading.
      const ox = (BOARD_ORIGIN_X / 100) * W
      const oy = (BOARD_ORIGIN_Y / 100) * H
      const ry = Math.max(oy - hy1, ruleY - oy, 0) + 40
      const rx = halfW + 56
      setD(ringRef.current, ellipsePath(ox, oy, rx, ry))

      // The rule overhangs the heading but stops short of the ring.
      const v = (ruleY - oy) / ry
      const ruleHalf = Math.min(halfW + 30, rx * Math.sqrt(Math.max(0, 1 - v * v)) - 14)
      setD(headRules.current[0], `M${hcx} ${ruleY} H${hcx - ruleHalf}`)
      setD(headRules.current[1], `M${hcx} ${ruleY} H${hcx + ruleHalf}`)
      anchor.x = hcx + ruleHalf
      anchor.y = ruleY

      const boxes = sheets.map((s) => elBox(s.wrapper, r))
      const starts: Array<[number, number]> = []
      sheets.forEach((s, i) => {
        const b = boxes[i]
        const I = FRAME_INSET
        // Anchor: of the sheet's corners and edge midpoints, the one nearest the center.
        const xs = [b.x + I, b.x + b.w / 2, b.x + b.w - I]
        const ys = [b.y + I, b.y + b.h / 2, b.y + b.h - I]
        let ax = xs[0]
        let ay = ys[0]
        let best = Infinity
        for (let xi = 0; xi < 3; xi++) {
          for (let yi = 0; yi < 3; yi++) {
            if (xi === 1 && yi === 1) continue
            const d = Math.hypot(xs[xi] - ox, ys[yi] - oy)
            if (d < best) [best, ax, ay] = [d, xs[xi], ys[yi]]
          }
        }
        const dx = ax - ox
        const dy = ay - oy
        const k = 1 / Math.hypot(dx / rx, dy / ry) // the ray crosses the ring at origin + k * (dx, dy)
        starts.push([ox + dx * k, oy + dy * k])
        setD(s.radial, `M${ox + dx * k} ${oy + dy * k} L${ax} ${ay}`)
        setD(s.ringNode, nodePath(ox + dx * k, oy + dy * k, 3.2))

        const lx = ax - b.x
        const ly = ay - b.y
        setD(s.frame, rectPathFrom(b.w, b.h, lx, ly, I))
        setD(s.node, nodePath(lx, ly))
        s.anchor.fx = lx / b.w
        s.anchor.fy = ly / b.h
      })

      if (import.meta.env.DEV) checkGeometry({ ox, oy, rx, ry }, boxes, sheets.map((s, i) => [starts[i], s]), r)
    }

    return {
      plane: planeRef.current,
      heading: headingRef.current,
      headLabel: headLabelRef.current,
      headText: headTextRef.current,
      ring: ringRef.current,
      headRules: headRules.current,
      sheets,
      anchor,
      layout,
    }
  }, [])

  return (
    <div ref={planeRef} data-sheet="03" className="pointer-events-none absolute inset-0">
      <svg ref={svgRef} aria-hidden className="absolute inset-0 h-full w-full" fill="none">
        <g>
          <path ref={ringRef} className="ln-construct" pathLength={1} style={hidden} />
          {COLLAGE_LAYOUT.map((slot, i) => (
            <path
              key={`rad-${slot.key}`}
              ref={(el) => {
                radials.current[i] = el
              }}
              className="ln-construct"
              pathLength={1}
              style={hidden}
            />
          ))}
        </g>
        {[0, 1].map((i) => (
          <path
            key={`hr-${i}`}
            ref={(el) => {
              headRules.current[i] = el
            }}
            className="ln-datum"
            pathLength={1}
            style={hidden}
          />
        ))}
        {/* Dots last: always above the lines they sit on. */}
        {COLLAGE_LAYOUT.map((slot, i) => (
          <path
            key={`rn-${slot.key}`}
            ref={(el) => {
              ringNodes.current[i] = el
            }}
            className="ln-node"
          />
        ))}
      </svg>

      {/* Sheets sit on their authored rects throughout; each stays hidden (and
          un-hittable) until its drafting step starts. */}
      <div className="absolute inset-0">
        {COLLAGE_LAYOUT.map((slot, i) => {
          const project = projects.find((p) => p.id === slot.projectId)
          return (
            <div
              key={slot.key}
              ref={(el) => {
                wrapperRefs.current[i] = el
              }}
              className="pointer-events-auto absolute"
              style={{
                left: `${slot.rect.left}%`,
                top: `${slot.rect.top}%`,
                width: `${slot.rect.width}%`,
                height: `${slot.rect.height}%`,
                visibility: 'hidden',
              }}
            >
              {slot.kind === 'project' && project ? (
                <ProjectCard project={project} index={i} pinned onOpen={setActiveProjectId} />
              ) : (
                <PlaceholderCard
                  plate={
                    STUDIES[slot.key] && (
                      <Drawing
                        ref={(h) => {
                          plateRefs.current[slot.key] = h
                        }}
                        figure={STUDIES[slot.key]}
                        animated
                      />
                    )
                  }
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Heading: owns the grid's center cell, the point the board zooms out around. */}
      <div
        ref={headingRef}
        className="absolute flex flex-col items-center justify-center text-center"
        style={{
          left: `${HEADING_RECT.left}%`,
          top: `${HEADING_RECT.top}%`,
          width: `${HEADING_RECT.width}%`,
          height: `${HEADING_RECT.height}%`,
        }}
      >
        <WipeText as="span" className="text-label text-label--key inline-block" ref={headLabelRef} plate={false}>
          <SheetIndex sheet="03" />
        </WipeText>
        <WipeText as="h2" className="stage-heading mt-2 block" ref={headTextRef} plate={false}>
          My projects.
        </WipeText>
      </div>

      <AnimatePresence>
        {activeProject && <ProjectDetailModal project={activeProject} onClose={() => setActiveProjectId(null)} />}
      </AnimatePresence>
    </div>
  )
})

/** Clearance kept between any sheet and the title block, in px. */
const TITLE_BLOCK_CLEARANCE = 24

const inside = (b: Box, x: number, y: number, pad = 1) =>
  x > b.x + pad && x < b.x + b.w - pad && y > b.y + pad && y < b.y + b.h - pad

const gap = (a: Box, b: Box) => {
  const dx = Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w), 0)
  const dy = Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h), 0)
  return Math.hypot(dx, dy)
}

/** DEV only: warn when the composition breaks its own drafting rules at this viewport. */
function checkGeometry(
  ring: { ox: number; oy: number; rx: number; ry: number },
  boxes: Box[],
  radials: Array<[[number, number], DraftSheet]>,
  origin: DOMRect,
) {
  const warn = (msg: string) => console.warn(`[projects layout ${Math.round(origin.width)}x${Math.round(origin.height)}] ${msg}`)
  const keys = COLLAGE_LAYOUT.map((s) => s.key)
  radials.forEach(([[sx, sy], sheet], i) => {
    const b = boxes[i]
    const ax = b.x + sheet.anchor.fx * b.w
    const ay = b.y + sheet.anchor.fy * b.h
    for (let t = 0; t <= 0.98; t += 0.02) {
      const x = sx + (ax - sx) * t
      const y = sy + (ay - sy) * t
      const hit = boxes.findIndex((o) => inside(o, x, y))
      if (hit !== -1) {
        warn(`radial ${keys[i]} crosses sheet ${keys[hit]}`)
        break
      }
    }
  })
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 48) {
    const x = ring.ox + ring.rx * Math.cos(a)
    const y = ring.oy + ring.ry * Math.sin(a)
    const hit = boxes.findIndex((o) => inside(o, x, y))
    if (hit !== -1) {
      warn(`heading ring overlaps sheet ${keys[hit]}`)
      break
    }
  }
  const tb = document.querySelector('.title-block')
  if (tb) {
    const t = elBox(tb, origin)
    boxes.forEach((b, i) => {
      if (gap(b, t) < TITLE_BLOCK_CLEARANCE) warn(`sheet ${keys[i]} is within ${TITLE_BLOCK_CLEARANCE}px of the title block`)
    })
  }
}
