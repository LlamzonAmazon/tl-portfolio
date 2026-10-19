import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { site } from '@/content/site'
import { hero } from '@/content/hero'
import { nodePath } from '@/lib/lines'
import { WipeText } from '@/components/hero/WipeText'
import { TapeText } from '@/components/hero/TapeText'
import { Drawing } from '@/components/ui/Drawing'
import type { DrawingHandle } from '@/lib/draft/choreo'
import { dePictura } from '@/lib/draft/figures/dePictura'
import { SECTIO_CENTRE_X, thesisPlate } from '@/lib/draft/figures/thesis'
import { iactus } from '@/lib/draft/figures/iactus'
import { roman } from '@/theme/spectrum'
import { elBox, glyphBox, setD, textBox } from './geometry'

/**
 * Sheet I plate: Alberti's pavement as the stage backdrop. Laid out on a
 * 16:9 board and fitted with `slice`, so its centric point always sits on
 * the board origin (the screen centre) and the dive passes through it.
 * Only the two nearest rows are hatched: the rest of the pavement runs
 * behind the name and stays open.
 */
const PICTURA = dePictura({
  w: 1600,
  h: 900,
  vp: [800, 450],
  ground: 858,
  cols: 8,
  margin: 0,
  hatchRows: 2,
  lettering: 'title',
  pointColor: 'var(--color-vermilion)',
})
/**
 * Sheet I's second plate: a projectile computed over the name, launched from
 * the middle left, its apex set just above the first line, landing top
 * right. Measured against the name on every layout (same stroke count).
 */
const FLIGHT_DEFAULT = { w: 1440, h: 900, from: [72, 450] as [number, number], to: [1340, 126] as [number, number], apexY: 150 }

/**
 * Sheet II plate: Arcus Acutus (left, behind the title) and Sectio Aurea
 * (right, behind the pillars) on one plate, the rectangle standing on the
 * arch's springing line and the spiral launched from it.
 */
const THESIS_PLATE = thesisPlate()


/** Exit-scale bounds: a glyph sitting on the origin could never leave, so cap the dive. */
const EXIT_MIN = 1.5
const EXIT_MAX = 40
/** Headroom so antialiased glyph edges are clear of the viewport too. */
const EXIT_MARGIN = 1.04

export interface HeroLines {
  titleGuide: SVGPathElement | null
  spine: SVGPathElement | null
  leaders: Array<SVGPathElement | null>
  pillarNodes: Array<SVGPathElement | null>
}

export interface HeroSceneHandle {
  plane: HTMLDivElement | null
  /** The name, the flight and the pavement: scales up and out on the dive. */
  nameLayer: HTMLDivElement | null
  /** The title, pillars and their datum: grows in from the center on the dive. */
  thesisLayer: HTMLDivElement | null
  name: HTMLHeadingElement | null
  nameLines: HTMLElement[]
  title: HTMLElement | null
  pillars: HTMLElement[]
  lines: HeroLines
  /** Sheet I plate (De Pictura), under the name: rides the dive out through its centric point. */
  pictura: () => DrawingHandle | null
  /** Sheet I flight (Iactus Iridis), arcing over the name; retracts at the start of the dive. */
  flight: () => DrawingHandle | null
  /** Sheet II plate (Arcus + Sectio Aurea), under the thesis: grows with it. */
  thesis: () => DrawingHandle | null
  /** Zoom, about the stage center, at which every line of the name is outside the viewport. */
  exitScale: () => number
  /** Measure the rendered text and write every measured line path. */
  layout: () => void
}

const hidden = { strokeDashoffset: 1 }

/**
 * SEQ-01/02 content: the name (tape reveal), its plates, the thesis
 * title and the pillar datum, on two layers the board camera scales for the
 * hero to thesis dive (camera.ts). Each layer's measured linework lives in its
 * own SVG, under its text, so lines scale with the content they serve.
 * Everything starts undrawn/hidden; the stage timeline drives it
 * (stage/sequences/hero.ts).
 */
export const HeroScene = forwardRef<HeroSceneHandle>(function HeroScene(_props, ref) {
  const planeRef = useRef<HTMLDivElement>(null)
  const nameLayerRef = useRef<HTMLDivElement>(null)
  const thesisLayerRef = useRef<HTMLDivElement>(null)
  const nameSvgRef = useRef<SVGSVGElement>(null)
  const thesisSvgRef = useRef<SVGSVGElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const nameLineRefs = useRef<Array<HTMLElement | null>>([])
  const titleRef = useRef<HTMLElement | null>(null)
  const pillarRefs = useRef<Array<HTMLElement | null>>([])
  const exitScaleRef = useRef(EXIT_MAX)
  const picturaRef = useRef<DrawingHandle>(null)
  const thesisRef = useRef<DrawingHandle>(null)
  const flightRef = useRef<DrawingHandle>(null)
  const [flight, setFlight] = useState(() => iactus(FLIGHT_DEFAULT))

  const titleGuide = useRef<SVGPathElement>(null)
  const spine = useRef<SVGPathElement>(null)
  const leaders = useRef<Array<SVGPathElement | null>>([])
  const pillarNodes = useRef<Array<SVGPathElement | null>>([])

  useImperativeHandle(ref, () => {
    const nameLines = () => nameLineRefs.current.filter((el): el is HTMLElement => el !== null)
    const pillars = () => pillarRefs.current.filter((el): el is HTMLElement => el !== null)

    const layout = () => {
      const plane = planeRef.current
      const name = nameRef.current
      const title = titleRef.current
      const layers = [nameLayerRef.current, thesisLayerRef.current]
      if (!plane || !name || !title) return
      // Measure at rest: the camera may have the layers mid-dive. It writes
      // their scale back right after layout (PinnedStage).
      gsap.set(layers, { clearProps: 'transform' })
      const r = plane.getBoundingClientRect()
      nameSvgRef.current?.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`)
      thesisSvgRef.current?.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`)


      // Exit scale: zooming by k about the center maps a point at offset d to
      // k*d, so a line box is gone once any one of its sides passes the matching
      // viewport edge. The name is gone once its last line is. Measured on the
      // glyphs, not the line boxes: the origin sits in the gap between lines.
      const hw = r.width / 2
      const hh = r.height / 2
      const glyphs = nameLines().map((el) => glyphBox(el.querySelector('.tape-text__ink') ?? el, r))
      const exits = glyphs.map((b) => {
        const [x1, x2, y1, y2] = [b.x - hw, b.x + b.w - hw, b.y - hh, b.y + b.h - hh]
        const k = [x2 < 0 && hw / -x2, x1 > 0 && hw / x1, y2 < 0 && hh / -y2, y1 > 0 && hh / y1]
        return Math.min(EXIT_MAX, ...k.filter((v): v is number => v !== false))
      })
      exitScaleRef.current = Math.min(EXIT_MAX, Math.max(EXIT_MIN, ...exits) * EXIT_MARGIN)

      // The flight: middle left to top right, its apex just above the name.
      if (glyphs.length) {
        const nameTop = Math.min(...glyphs.map((b) => b.y))
        setFlight(
          iactus({
            w: r.width,
            h: r.height,
            // Launched from beyond the left edge: it enters already in flight.
            from: [-r.width * 0.05, r.height * 0.54],
            to: [r.width * 0.93, r.height * 0.14],
            apexY: Math.max(r.height * 0.05, nameTop - r.height * 0.07),
          }),
        )
      }

      // Title guide: starts left of the title text and overshoots its end.
      const t = textBox(title, r)
      setD(titleGuide.current, `M${t.x - 26} ${t.y + t.h + 16} H${t.x + t.w + 30}`)

      // Pillar datum: a spine, then one leader + node per pillar.
      const ps = pillars().map((el) => elBox(el, r))
      if (ps.length) {
        const sx = Math.min(...ps.map((p) => p.x)) - 44
        const last = ps[ps.length - 1]
        setD(spine.current, `M${sx} ${ps[0].y - 22} V${last.y + last.h + 22}`)
        ps.forEach((p, i) => {
          const y = p.y + p.h * 0.55
          setD(leaders.current[i], `M${sx} ${y} H${p.x - 12}`)
          setD(pillarNodes.current[i], nodePath(p.x - 12, y))
        })
      }
    }

    return {
      plane: planeRef.current,
      nameLayer: nameLayerRef.current,
      thesisLayer: thesisLayerRef.current,
      name: nameRef.current,
      nameLines: nameLines(),
      title: titleRef.current,
      pillars: pillars(),
      lines: {
        titleGuide: titleGuide.current,
        spine: spine.current,
        leaders: leaders.current,
        pillarNodes: pillarNodes.current,
      },
      pictura: () => picturaRef.current,
      flight: () => flightRef.current,
      thesis: () => thesisRef.current,
      layout,
      exitScale: () => exitScaleRef.current,
    }
  }, [])

  return (
    <div ref={planeRef} className="pointer-events-none absolute inset-0">
      {/* Name layer: rides the dive up and out past the edges. */}
      <div ref={nameLayerRef} data-sheet="01" className="absolute inset-0">
        {/* The pavement: the deepest layer, its centric point on the board origin. */}
        <div className="stage-plate inset-0">
          <Drawing ref={picturaRef} figure={PICTURA} animated fit="slice" tone="ghost" />
        </div>
        {/* The flight over the name, in this layer's px. */}
        <div className="stage-plate inset-0">
          <Drawing ref={flightRef} figure={flight} animated tone="ghost" className="overflow-visible" />
        </div>
        {/* Linework first: always under the text. */}
        <svg ref={nameSvgRef} aria-hidden className="absolute inset-0 h-full w-full" fill="none">
        </svg>

        {/* Name: absolutely centered, so the hidden title/pillars
            never reserve layout space and skew the name off center. */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center"
          style={{ padding: 'var(--section-px)' }}
        >
          <h1 ref={nameRef} className="text-display">
            {site.displayName.map((line, i) => {
              const isLast = i === site.displayName.length - 1
              return (
                <TapeText
                  key={line}
                  as="span"
                  className={`block px-6 pt-2 md:px-10 lg:px-14 ${isLast ? 'pb-10 md:pb-16 lg:pb-20' : 'pb-2 md:pb-3'}`}
                  ref={(el) => {
                    nameLineRefs.current[i] = el
                  }}
                >
                  {line}
                </TapeText>
              )
            })}
          </h1>

        </div>

      </div>

      {/* Thesis layer: inked small at the center once the name is gone; grows
          to full size as the camera dives onto it. */}
      <div ref={thesisLayerRef} data-sheet="02" className="absolute inset-0">
        {/* The arch behind the title, the golden rectangle behind the pillars, one plate. */}
        <div className="stage-plate" style={{ inset: '3% 2%' }}>
          <Drawing ref={thesisRef} figure={THESIS_PLATE} animated tone="ghost" className="overflow-visible" />
        </div>
        <svg ref={thesisSvgRef} aria-hidden className="absolute inset-0 h-full w-full" fill="none">
          <path ref={titleGuide} className="ln-construct" pathLength={1} style={hidden} />
          <path ref={spine} className="ln-datum" pathLength={1} style={hidden} />
          {hero.pillars.map((p, i) => (
            <path
              key={`lead-${p}`}
              ref={(el) => {
                leaders.current[i] = el
              }}
              className="ln-datum"
              pathLength={1}
              style={hidden}
            />
          ))}
          {hero.pillars.map((p, i) => (
            <path
              key={`node-${p}`}
              ref={(el) => {
                pillarNodes.current[i] = el
              }}
              className="ln-node"
            />
          ))}
        </svg>

        {/* The thesis line top left; the pillars as a column centred below Sectio Aurea. */}
        <div className="absolute inset-0 flex flex-col items-start" style={{ padding: 'calc(var(--section-py) + clamp(2rem, 9vh, 6rem)) var(--section-px) var(--section-py)' }}>
          <WipeText as="p" className="text-heading text-heading--thesis block text-left" ref={titleRef} plate={false}>
            {hero.title}
          </WipeText>

          {/* Centred below Sectio Aurea: the plate box is inset 2% each side, so the
              rectangle's centre on screen is 2% + 96% of its centre on the plate. Lifted clear of the title block; it may overlap the rectangle's foot. */}
          <div
            className="absolute flex flex-col items-start gap-6 lg:gap-7"
            style={{ left: `calc(2% + ${96 * SECTIO_CENTRE_X}%)`, bottom: 'clamp(15rem, 32vh, 20rem)', transform: 'translateX(-50%)' }}
          >
            {hero.pillars.map((pillar, i) => (
              <WipeText
                key={pillar}
                as="div"
                className="flex items-baseline gap-4 text-serif-lg"
                ref={(el) => {
                  pillarRefs.current[i] = el
                }}
                plate={false}
              >
                <span className="numeral" style={{ color: 'var(--hue-ink)', fontSize: '0.62em', marginRight: '0.7em' }}>
                  {roman(i + 1)}
                </span>
                {pillar}
              </WipeText>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})
