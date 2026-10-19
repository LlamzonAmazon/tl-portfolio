/**
 * The living specimen of the design system, Rev C (Graphite + Spectrum).
 *
 * This page IS the design system's documentation, and it lives only here,
 * in the repo. Everything on it is built from the real system: tokens.css,
 * typography.css, texture.css, theme/motion.ts, theme/spectrum.ts, lib/draft
 * and the site's own components. If a value here disagrees with the site,
 * the system file wins and this page is stale. Dev only: open /specimen.html.
 *
 * Data tables below mirror tokens.css (grades, pigments, layers); keep them
 * in step when a token changes.
 */

import { useLayoutEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { Drawing } from '@/components/ui/Drawing'
import { FrameEdges } from '@/components/projects/FrameEdges'
import { FrameLink } from '@/components/contact/FrameLink'
import { SkillChip } from '@/components/skills/SkillChip'
import { TechSeal } from '@/components/projects/TechSeal'
import { LiveSeal } from '@/components/projects/LiveSeal'
import { PublishedSeal } from '@/components/projects/PublishedSeal'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { PlaceholderCard } from '@/components/projects/PlaceholderCard'
import { ExperienceCard } from '@/components/experience/ExperienceCard'
import { RulerDivider } from '@/components/ui/RulerDivider'
import { SheetIndex } from '@/components/ui/SheetIndex'
import { SheetHeading, SheetRule } from '@/components/ui/SheetSection'
import { RichBlocks, RichText } from '@/components/ui/RichText'
import { experiences } from '@/content/experience'
import { projects } from '@/content/projects'
import { edges, setEdgesHidden } from '@/lib/lines'
import { playFigure, type DrawingHandle } from '@/lib/draft/choreo'
import { FOLIO, type Plate } from '@/lib/draft/figures'
import { rosa } from '@/lib/draft/figures/rosa'
import { schedule } from '@/lib/draft/schedule'
import type { Figure, Layer } from '@/lib/draft/sketch'
import {
  bezier,
  duration,
  eraseRatio,
  gsapEase,
  pen,
  smoothScroll,
  stageMotion,
  stageSpan,
  stagger,
  travel,
} from '@/theme/motion'
import { win } from '@/theme/sequences'
import { SHEETS, SHEET_TOTAL, SPECTRUM, type SheetKey } from '@/theme/spectrum'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/* ── Data shown on the sheets (values mirror tokens.css) ─────────────── */

const GRADES: Array<{ grade: string; token: string; hex: string; cr: string; role: string }> = [
  { grade: '9H', token: 'graphite-9h', hex: '#EBEBEB', cr: '1.1', role: 'Grid hairs, faint construction' },
  { grade: '6H', token: 'graphite-6h', hex: '#E0E0E0', cr: '1.2', role: 'Grid minor, seal plates, tone on tone' },
  { grade: '4H', token: 'graphite-4h', hex: '#D0D0D0', cr: '1.4', role: 'Grid major, rules, faint ink' },
  { grade: '2H', token: 'graphite-2h', hex: '#B8B8B8', cr: '1.8', role: 'Construction, pale ink' },
  { grade: 'H', token: 'graphite-h', hex: '#999999', cr: '2.6', role: 'Hatching, ghost ink' },
  { grade: 'F', token: 'graphite-f', hex: '#7A7A7A', cr: '3.9', role: 'Dimension lines' },
  { grade: 'HB', token: 'graphite-hb', hex: '#5E5E5E', cr: '5.9', role: 'Datum, labels' },
  { grade: 'B', token: 'graphite-b', hex: '#454545', cr: '8.7', role: 'Secondary text, captions' },
  { grade: '2B', token: 'graphite-2b', hex: '#2E2E2E', cr: '12.4', role: 'Body text' },
  { grade: '4B', token: 'graphite-4b', hex: '#1A1A1A', cr: '15.8', role: 'Near ink' },
]

/** Pigments in ROYGBIV order, with where each one keys on the site. */
const PIGMENTS: Record<string, { mineral: string; mark: string; ink: string; cr: string; keys: string }> = {
  vermilion: { mineral: 'Mercury sulphide', mark: '#E2341D', ink: '#C42A15', cr: '5.2', keys: 'I · Hero, and the preloader' },
  minium: { mineral: 'Red lead', mark: '#F2711C', ink: '#B4500F', cr: '4.7', keys: 'II · Thesis: the arch and its nodes' },
  orpiment: { mineral: 'Arsenic sulphide', mark: '#F5C518', ink: '#8A6A00', cr: '4.6', keys: 'II · Thesis: Sectio Aurea and the labels' },
  verdigris: { mineral: 'Copper acetate', mark: '#1FA371', ink: '#0E7A51', cr: '4.9', keys: 'III · Projects' },
  azurite: { mineral: 'Copper carbonate', mark: '#2457E0', ink: '#2457E0', cr: '5.4', keys: 'IV · Experience' },
  indigo: { mineral: 'Indigofera', mark: '#3D2E9E', ink: '#3D2E9E', cr: '9.2', keys: 'V · Skills' },
  murex: { mineral: 'Tyrian purple', mark: '#9A2D8E', ink: '#9A2D8E', cr: '6.1', keys: 'VI · Contact' },
}

const LINES: Array<{ layer: Layer | 'flow'; grade: string; w: string; use: string }> = [
  { layer: 'construct', grade: '2H', w: '0.75', use: 'Compass and straightedge geometry. Drawn first, overshoots its marks.' },
  { layer: 'hatch', grade: 'H', w: '0.5', use: 'Shading and section fill, laid stroke by stroke.' },
  { layer: 'dim', grade: 'F', w: '0.75', use: 'Dimension and extension lines.' },
  { layer: 'datum', grade: 'HB', w: '1', use: 'Spines and leaders tied to content.' },
  { layer: 'ink', grade: 'Ink', w: '1.25', use: 'The figure itself, traced over its construction.' },
  { layer: 'mark', grade: 'Ink', w: '1', use: 'Registration corners, ticks, crosshairs.' },
  { layer: 'key', grade: 'Hue', w: '1', use: 'The one coloured line: a leader to a keyed label.' },
  { layer: 'flow', grade: 'H', w: '0.9', use: 'A current: dashed, marching once drawn, only where a figure is about motion. Replaces a stroke or runs parallel in its wake.' },
]

/** Drawing tones: the same figure stepped back for what sits in front of it. */
const TONES: Array<{ tone: 'ink' | 'ghost' | 'pale' | 'faint'; use: string }> = [
  { tone: 'ink', use: 'The plate on its own sheet: the folio, a colophon, a placeholder study.' },
  { tone: 'ghost', use: 'Behind type. Every role two grades lighter; keyed marks keep their hue.' },
  { tone: 'pale', use: 'Behind controls. Ghost, with ink and mark lifted to 2H so buttons stay the darkest thing.' },
  { tone: 'faint', use: 'A dense backdrop. Wholly grey, keys included: 4H ink, 9H construction.' },
]

/** Label tiers (tokens.css --label-*, --micro-*, --caption-*). */
const LABELS: Array<{ cls: string; name: string; spec: string; sample: string }> = [
  { cls: 'text-label', name: 'Label', spec: '0.7rem · 0.12em · caps · Inter 500', sample: 'Research · Projects' },
  { cls: 'text-micro', name: 'Micro', spec: '0.64rem · 0.12em · caps', sample: 'Seals · title block · 412 MM' },
  { cls: 'text-label-sm', name: 'Caption', spec: '0.72rem · 0.02em · sentence case', sample: 'Sep 2025 - Apr 2026 · Remote' },
]

/** Stacking layers (tokens.css --z-*). */
const LAYERS: Array<{ token: string; z: number; what: string }> = [
  { token: '--z-raised', z: 1, what: 'A control lifted over its own sheet (the detail sheet close label).' },
  { token: '--z-frame', z: 2, what: "A sheet's registration corners, above its face." },
  { token: '--z-seal', z: 3, what: 'A seal stamped on a sheet face (Live, Published).' },
  { token: '--z-furniture', z: 4, what: 'Stage furniture: the registration crosshairs.' },
  { token: '--z-titleblock', z: 5, what: 'The title block, over everything on the page.' },
  { token: '--z-modal', z: 100, what: 'Detail sheets: scrim, then the sheet one step above it.' },
  { token: '--z-preloader', z: 200, what: 'The intro covers everything, modals included.' },
]

/** One job per ease (theme/motion.ts). */
const EASES: Array<{ name: keyof typeof bezier; job: string }> = [
  { name: 'ink', job: 'Content arriving: tape release, faces, reveals. Quint out.' },
  { name: 'pen', job: 'A wipe and the lines that travel with it; the camera. Cubic in-out.' },
  { name: 'settle', job: 'Hover, lift, small repeated feedback. Cubic out.' },
  { name: 'erase', job: 'Content leaving and the lines retracting with it. Sine in-out.' },
]

/** The figure-level patterns a plate is tagged with (lib/draft Pattern). */
const PATTERNS: Array<{ name: string; how: string }> = [
  { name: 'Relay', how: 'One pen. Each stroke starts where the last ended, so a chain of strokes reads as one line. A pen lift is added only where they do not touch.' },
  { name: 'Fan', how: 'A family (radials, orthogonals, rays, hatching) cascades: each stroke starts a fixed fraction into the one before it.' },
  { name: 'Compass', how: 'The arm is drawn out from the centre, swings with the arc at the arc tip, then folds back. Arm and arc share one clock.' },
  { name: 'Raster', how: 'Hatching and courses laid row by row in one direction, the way a hand fills a field.' },
  { name: 'Plot', how: 'Nodes land the instant the pen tip reaches them, timed by length along the stroke, not by parameter.' },
  { name: 'Measure', how: 'Extension lines, then the dimension line drawn outward from its middle to both ends, then ticks, then the value.' },
  { name: 'Leader', how: 'A datum line runs from the figure to the thing it names and ends in a node; the label waits for the node.' },
  { name: 'Single line', how: 'The whole figure is one gesture and the pen never lifts (Harmonia, the golden spiral).' },
]

/** Choreography above the figure: how drawings, type and the camera share time. */
const CHOREOGRAPHY: Array<{ name: string; how: string }> = [
  { name: 'Construct, ink, annotate', how: 'Passes overlap (pen.passOverlap): the ink starts while the construction is still finishing, and labels wipe in only after the stroke they name lands.' },
  { name: 'Line sync', how: 'Every line is a guide nested under a foreground step and timed by its span, so a drawing stays on the clock of the type it serves.' },
  { name: 'Tape', how: 'The name: a sheet-white band stretches across each line (--lead), then releases from the left (--trail), leaving the ink.' },
  { name: 'Wipe', how: 'Text, chips, links and title block cells enter by a clip from the left and leave by its mirror. Never an opacity fade.' },
  { name: 'Grow from anchor', how: 'A sheet is drafted in place: a radial leaves a node, the frame runs from the node as one pen path, the paper grows from it, then the face wipes.' },
  { name: 'Handoff', how: 'A leader draws to its node, then hands the pen to the wipe of the text it points at.' },
  { name: 'Retract', how: 'Exits mirror entrances: last drawn, first undrawn, on the erase ease, in eraseRatio of the entrance time. Lines are retracted or carried out by the camera, never faded.' },
  { name: 'Camera', how: 'One board, one camera (zoom, pan). Zoom legs are log-interpolated; the camera carries content in and out, and the name exits by scale.' },
  { name: 'Continuity', how: 'A line can leave one sheet and land on the next: the Motus flight from the Projects heading, Diramatio from the Experience datum.' },
  { name: 'Corner hover', how: 'Registration corner arms draw further along the edges (--mark-arm to --mark-arm-hover) on hover and focus, with the lift.' },
]

/** Where every plate lives on the site, and the step it is drawn on. */
const STAGE: Array<{ sheet: SheetKey; plate: string; place: string; sync: string }> = [
  { sheet: '00', plate: 'Systema Mundi', place: 'Preloader, centred and oversized.', sync: 'The orrery is set out in proportion to load, planets landing as the pen passes; on ready the outer orbits close; the plate retracts and the sheet lifts away. Static under reduced motion.' },
  { sheet: '01', plate: 'Iactus Iridis', place: 'Thrown over the name: launched beyond the left edge, apex just above the type, landing top right in an impact mark.', sync: 'Starts with the first tape stretch and runs across all four tape phases; the impact rings begin when the trajectory lands. Retracts at the start of the dive.' },
  { sheet: '01', plate: 'De Pictura', place: 'Full-bleed under the name; the centric point sits on the board origin.', sync: 'Horizon, ground, orthogonals and transversals ride the four tape phases; the near rows hatch in their own step after. Retracts with Iactus on the dive (its lines run through the origin, so the camera cannot carry them out).' },
  { sheet: '02', plate: 'Arcus + Fenestra + Sectio Aurea', place: 'One plate: the arch (orange nodes) bleeding bottom left behind the thesis line, Fenestra traced inside it, the golden rectangle (yellow) top right with the pillars hung centred below it; a datum runs along the springing line and turns up to the spiral.', sync: 'Arch and rectangle set out as the dive lands; the arch inks while each pillar cuts a square; the spiral ends on the eye; in the hold the arch is finished, the rectangle dimensioned and the window traced. Retracts on the pull-out to Projects.' },
  { sheet: '03', plate: 'Rota Dentata, Curva', place: 'On the two unissued placeholder sheets: future work, still on the board.', sync: 'Each study is drafted on its sheet once the paper is down.' },
  { sheet: '04', plate: 'Motus Proiectorum', place: 'Across the gap between Projects and Experience.', sync: 'Launched from the Projects heading rule, flown on the pan, landing where the datum starts. Retracts on the pan to Skills.' },
  { sheet: '04', plate: 'Systema', place: 'Experience margin, top right: one planet per role.', sync: 'Set out as the pan lands; the orbits share the datum window. Retracts on the pan up.' },
  { sheet: '04', plate: 'Arcus', place: 'Colophon at the foot of every role detail sheet.', sync: 'Drawn after the sheet opens; retracts before it closes.' },
  { sheet: '05', plate: 'Diramatio', place: 'From the right end of the Experience timeline to a prism on the seam above Skills.', sync: 'The line runs down the margin and under the cards into the prism; four rays leave its base, one landing on each column as the pan arrives.' },
  { sheet: '05', plate: 'Cochlea', place: 'The open band above the skills board, right-aligned.', sync: 'Begins just before the column rules; the flights wind as the columns draw; unwinds first on exit.' },
  { sheet: '06', plate: 'Rosa', place: 'Behind the closing name, ghosted, oversized, bleeding bottom right.', sync: 'Circle, compass swings, petals and the window ring, one per tape phase.' },
  { sheet: '06', plate: 'Ellipsis', place: 'Contact margin, lower left.', sync: 'Strung between its two pins as the two links ink in.' },
  { sheet: '06', plate: 'Harmonia', place: 'Contact margin, upper left.', sync: 'The last and longest line on the board, before the pin releases.' },
  { sheet: '01', plate: 'Instrumenta (furniture)', place: 'Corner crosshairs; a north rose on the title block.', sync: 'Drawn with the title block at the end of the intro; held for the whole board.' },
]

/** The document flow (phones, touch, reduced motion): one oversized plate per section (SectionPlate). */
const FLOW: Array<{ sheet: SheetKey; plate: string; place: string }> = [
  { sheet: '01', plate: 'Iactus Iridis + De Pictura', place: 'Iactus hangs over the name (the name sits 10% above centre), oversized, bleeding left so the impact lands on screen. De Pictura, pale, 230% wide under it; the links sit at 75% of the height.' },
  { sheet: '03', plate: 'Arcus', place: 'Ghost, 170% wide, upper right.' },
  { sheet: '04', plate: 'Harmonia', place: 'Faint, 160% wide, left of centre.' },
  { sheet: '05', plate: 'Sectio Aurea', place: 'Faint, 160% wide, high and right.' },
  { sheet: '06', plate: 'Rosa', place: 'Pale, 300% wide, centred off the left edge.' },
]

/* ── Pieces ──────────────────────────────────────────────────────────── */

function SheetHead({ index, title, children }: { index: string; title: string; children?: ReactNode }) {
  return (
    <header className="spec-head">
      <RulerDivider index={index} label={title} />
      {children && <p className="text-body spec-lede">{children}</p>}
    </header>
  )
}

/** A sheet key label: "III · Projects" in the sheet's own hue. */
function Key({ sheet }: { sheet: SheetKey }) {
  return (
    <span className="text-label text-label--key" data-sheet={sheet}>
      {SHEETS[sheet].numeral ? <SheetIndex sheet={sheet} /> : SHEETS[sheet].title}
    </span>
  )
}

/** Per-pass bars of a schedule: the choreography made visible, with a playhead. */
function PassStrip({ figure, playhead }: { figure: Figure; playhead: React.RefObject<HTMLDivElement | null> }) {
  const rows = useMemo(() => {
    const sched = schedule(figure)
    return figure.passes.map((ps) => {
      const ts = sched.strokes.filter((t) => ps.strokes.includes(t.stroke))
      return { name: ps.name, a: Math.min(...ts.map((t) => t.t0)), b: Math.max(...ts.map((t) => t.t1)), layer: ps.strokes[0].layer }
    })
  }, [figure])
  return (
    <div className="pass-strip" aria-hidden>
      {rows.map((r, i) => (
        <div key={i} className="pass-strip__row" title={r.name}>
          <span className={`pass-strip__bar pass-strip__bar--${r.layer}`} style={{ left: `${r.a * 100}%`, width: `${(r.b - r.a) * 100}%` }} />
        </div>
      ))}
      <div ref={playhead} className="pass-strip__head" />
    </div>
  )
}

function PlateCard({ plate, wide = false }: { plate: Plate; wide?: boolean }) {
  const figure = useMemo(() => plate.build(), [plate])
  const reduced = usePrefersReducedMotion()
  const handleRef = useRef<DrawingHandle>(null)
  const hostRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    const h = handleRef.current
    const host = hostRef.current
    if (reduced || !h || !host) return
    const tl = playFigure(h, { paused: true })
    const sync = () => {
      const p = tl.progress()
      if (headRef.current) headRef.current.style.left = `${p * 100}%`
      if (rangeRef.current) rangeRef.current.value = String(Math.round(p * 1000))
    }
    tl.eventCallback('onUpdate', sync)
    tlRef.current = tl
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && tl.progress() === 0) tl.play()
      },
      { threshold: 0.3 },
    )
    io.observe(host)
    return () => {
      io.disconnect()
      tl.kill()
    }
  }, [reduced, figure])

  const replay = () => tlRef.current?.restart()
  const scrub = (v: number) => {
    const tl = tlRef.current
    if (!tl) return
    tl.pause()
    tl.progress(v / 1000)
  }

  return (
    <article ref={hostRef} className={`plate ${wide ? 'plate--wide' : ''}`} data-sheet={plate.sheet}>
      <div className="plate__figure">
        <Drawing ref={handleRef} figure={figure} animated={!reduced} />
      </div>
      <div className="plate__meta">
        <div className="plate__titles">
          <Key sheet={plate.sheet} />
          <h3 className="plate__title">{plate.title}</h3>
          <p className="plate__subject">{plate.subject}</p>
          <p className="text-micro plate__patterns">{plate.patterns.join(' · ')}</p>
        </div>
        {!reduced && (
          <div className="plate__controls">
            <PassStrip figure={figure} playhead={headRef} />
            <div className="plate__buttons">
              <button type="button" className="spec-button" onClick={replay}>
                Replay
              </button>
              <label className="sr-only" htmlFor={`scrub-${plate.id}`}>
                Scrub {plate.title}
              </label>
              <input
                id={`scrub-${plate.id}`}
                ref={rangeRef}
                className="spec-range"
                type="range"
                min={0}
                max={1000}
                defaultValue={0}
                onInput={(e) => scrub(Number((e.target as HTMLInputElement).value))}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

/** A sheet whose corners are drafted by lib/lines.ts `edges` (the stage path), replayable. */
function DraftedSheet() {
  const ref = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  useLayoutEffect(() => {
    const host = ref.current
    if (!host) return
    const els = Array.from(host.querySelectorAll<HTMLElement>('.frame-edge'))
    setEdgesHidden(els)
    const tl = gsap.timeline({ paused: true })
    edges(tl, els, win(0, duration.draw, gsapEase.pen))
    tlRef.current = tl
    const io = new IntersectionObserver(([e]) => e.isIntersecting && tl.progress() === 0 && tl.play(), { threshold: 0.5 })
    io.observe(host)
    return () => {
      io.disconnect()
      tl.kill()
    }
  }, [])
  return (
    <div className="spec-specimen">
      <div ref={ref} className="paper-card spec-sheet" data-sheet="03">
        <FrameEdges />
        <Key sheet="03" />
        <p className="experience-card__title">A drafted sheet</p>
        <p className="text-body">No outline. The pen sweeps each edge and leaves only its corners.</p>
      </div>
      <button type="button" className="spec-button" onClick={() => tlRef.current?.restart()}>
        Redraw corners
      </button>
    </div>
  )
}

/** The detail sheet's chrome, set statically (SheetModal portals the real one). */
function DetailSheet() {
  return (
    <motion.div
      className="paper-card spec-detail"
      data-sheet="03"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      <FrameEdges />
      <span className="sheet-close" aria-hidden>
        Close
      </span>
      <header className="pr-20">
        <span className="text-label text-label--key">Research</span>
        <h3 className="sheet-title mt-2">Asynchronous Layer-Wise Federated Learning</h3>
        <p className="text-label-sm mt-2">Published, IEEE GLOBECOM 2026</p>
      </header>
      <div className="my-5">
        <SheetRule />
      </div>
      <div className="sheet-flow">
        <p className="sheet-lede">
          <RichText>{'A federated learning system that **halves client upload** with *no measurable* accuracy cost.'}</RichText>
        </p>
        <SheetHeading>Highlights</SheetHeading>
        <div className="sheet-prose sheet-flow">
          <RichBlocks>
            {'- Deep layers sync every *K*-th round; shallow layers every round.\n- Published at [IEEE GLOBECOM 2026](https://example.com).\n\n### A header block\nA paragraph after a header, with **bold** and a [link](https://example.com).'}
          </RichBlocks>
        </div>
      </div>
    </motion.div>
  )
}

/** One figure in each drawing tone. */
function ToneStrip() {
  const figure = useMemo(() => rosa(), [])
  return (
    <div className="tones" data-sheet="06">
      {TONES.map((t) => (
        <figure key={t.tone} className="tone">
          <div className="tone__plate">
            <Drawing figure={figure} tone={t.tone} />
          </div>
          <figcaption className="tone__meta">
            <span className="text-label">{t.tone}</span>
            <span className="text-label-sm">{t.use}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function TokenTable({ rows }: { rows: Array<[string, string, string?]> }) {
  return (
    <dl className="pen-tokens">
      {rows.map(([k, v, note]) => (
        <div key={k}>
          <dt className="text-label">{k}</dt>
          <dd className="text-label-sm">
            {v}
            {note && <span className="token-note"> · {note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* ── Page ────────────────────────────────────────────────────────────── */

export function Specimen() {
  const prism = FOLIO.find((p) => p.id === 'spectrum')!
  const rest = FOLIO.filter((p) => p.id !== 'spectrum')
  const project = projects[0]
  const role = experiences[0]

  return (
    <main className="spec">
      {/* Masthead: the thesis is the prism, one ink ray in, seven pigments out. */}
      <section className="spec-mast" data-sheet="00">
        <div className="spec-mast__text">
          <span className="text-label text-label--key">Design system · Rev C</span>
          <h1 className="text-heading">Graphite and Spectrum</h1>
          <p className="text-body spec-lede">
            The engineer's board rebuilt in high contrast. Paper, ink and ten graphite grades carry every surface and
            line. Seven pigments key the sheets and carry the labels. The decoration is a folio of drafted figures, each
            drawn in the order it would be constructed by hand.
          </p>
        </div>
        <div className="title-block spec-tb" aria-hidden>
          <div className="title-block__bg" />
          {[
            ['Sheets', <span key="n"><span className="numeral">I</span> to <span className="numeral">{SHEET_TOTAL}</span></span>],
            ['Title', 'Specimen'],
            ['Rev', 'C · Graphite'],
          ].map(([k, v]) => (
            <div key={String(k)} className="contents">
              <span className="title-block__cell title-block__cell--key">{k}</span>
              <span className="title-block__cell">{v}</span>
            </div>
          ))}
          <span className="tb-edge tb-edge--cd" />
        </div>
        <PlateCard plate={prism} wide />
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="A" title="Rules">
          Four rules hold the system together. Everything else on this page follows from them.
        </SheetHead>
        <ol className="spec-rules">
          <li>
            <span className="spec-rules__n">I</span>
            <p>
              <strong>Monotone.</strong> Surfaces, type and linework are paper, ink and graphite. Nothing else carries
            structure.
            </p>
          </li>
          <li>
            <span className="spec-rules__n">II</span>
            <p>
              <strong>Grades are weights.</strong> Hard leads (9H to H) draw the grid and construction. Soft leads (HB to
            4B) set text and datum lines.
            </p>
          </li>
          <li>
            <span className="spec-rules__n">III</span>
            <p>
              <strong>One sheet, one hue.</strong> Colour only labels. Each sheet is keyed once with{' '}
            <code>data-sheet</code>; Sheet II carries two (orange arch, yellow rectangle). Colour never fills a surface
            and never draws structure.
            </p>
          </li>
          <li>
            <span className="spec-rules__n">IV</span>
            <p>
              <strong>Lines are drawn.</strong> A line arrives by its pen and leaves by retracting or on the camera, never
            by fading, and the next section reveals only after the last has left.
            </p>
          </li>
        </ol>
        <p className="text-body spec-note">
          No borders and no shadows anywhere. A surface is separated by tone (paper, sheet, plate). An edge is implied by
          registration corners that overshoot it. Corners are square; the only round shapes are seals and nodes.
          Components space on the 4px step; layout is free (no grid snapping).
        </p>
        <p className="text-body spec-note">
          Two exceptions, both deliberate: the detail-sheet scrim fades in over the page (a blur, not content), and on
          phones, touch and reduced motion the document-flow sections reveal their content with a short fade and lift.
          Their linework is still drawn.
        </p>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="B" title="Graphite">
          A neutral ramp named by drafting-lead grade. Contrast is against the paper; only HB and softer may set text.
        </SheetHead>
        <div className="grades">
          {GRADES.map((g) => (
            <div key={g.grade} className="grade">
              <span className="grade__swatch" style={{ background: `var(--color-${g.token})` }} />
              <span className="grade__name">{g.grade}</span>
              <span className="text-label-sm grade__hex">{g.hex}</span>
              <span className="text-label-sm grade__cr">{g.cr}:1</span>
              <span className="grade__role">{g.role}</span>
            </div>
          ))}
        </div>
        <div className="surfaces">
          <div className="surface" style={{ background: 'var(--color-paper)' }}>
            <span className="text-label">Paper</span>
            <span className="text-label-sm">#F4F4F4 · the board</span>
          </div>
          <div className="surface paper-card">
            <span className="text-label">Sheet</span>
            <span className="text-label-sm">#FFFFFF · one tone up</span>
          </div>
          <div className="surface ink-plate">
            <span className="text-label">Plate</span>
            <span className="text-label-sm">#0B0B0B · inverted</span>
          </div>
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="B′" title="Two faces">
          Two families only. Cormorant carries names, headings, Latin titles and Roman numerals; Inter carries text and,
          set small and tracked, every label. Italic is always Cormorant: Inter italic is never loaded or synthesised.
        </SheetHead>
        <div className="type-specimen" data-sheet="03">
          <div className="type-row">
            <span className="text-label">Display</span>
            <span className="text-display">Llamzon</span>
          </div>
          <div className="type-row">
            <span className="text-label">Display, phone hero</span>
            <span className="text-label-sm">.text-display--hero · 17.5vw, as large as the name fits across a phone</span>
          </div>
          <div className="type-row">
            <span className="text-label">Heading</span>
            <span className="text-heading">My projects.</span>
          </div>
          <div className="type-row">
            <span className="text-label">Thesis line</span>
            <span className="text-heading text-heading--thesis">Security-first software engineer</span>
          </div>
          <div className="type-row">
            <span className="text-label">Stage heading</span>
            <span className="stage-heading">Experience.</span>
          </div>
          <div className="type-row">
            <span className="text-label">Latin title</span>
            <span className="text-latin type-latin">Iactus Iridis</span>
          </div>
          <div className="type-row">
            <span className="text-label">Sheet index</span>
            <Key sheet="03" />
          </div>
          <div className="type-row">
            <span className="text-label">Sheet serial</span>
            <span className="text-label text-label--key" data-sheet="03">
              <span className="numeral">III.ii</span>
            </span>
          </div>
          <div className="type-row">
            <span className="text-label">Sheet title</span>
            <span className="sheet-title">Global Country Development Scoring Engine</span>
          </div>
          <div className="type-row">
            <span className="text-label">Lede</span>
            <span className="sheet-lede">
              <RichText>{'An Azure pipeline that turns **five feeds** into *one* comparable view.'}</RichText>
            </span>
          </div>
          <div className="type-row">
            <span className="text-label">Body</span>
            <span className="text-body">A federated learning system that cuts what edge clients upload.</span>
          </div>
          {LABELS.map((l) => (
            <div key={l.cls} className="type-row">
              <span className="text-label">{l.name}</span>
              <span className="type-tier">
                <span className={l.cls}>{l.sample}</span>
                <span className="text-label-sm token-note">{l.spec}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="C" title="Spectrum">
          Seven historical pigments in ROYGBIV order. Each has a mark value for swatches, nodes and key lines, and an ink
          value that clears 4.5:1 for small text on paper. Focus rings use the ink value.
        </SheetHead>
        <div className="pigments">
          {SPECTRUM.map((p) => {
            const meta = PIGMENTS[p.name]
            const hue = { '--hue': p.mark, '--hue-ink': p.ink } as React.CSSProperties
            return (
              <div key={p.name} className="pigment" style={hue}>
                <span className="pigment__mark" />
                <span className="pigment__band">{p.band}</span>
                <span className="pigment__name">{p.name}</span>
                <span className="text-label-sm">{meta.mineral}</span>
                <span className="text-label-sm">mark {meta.mark}</span>
                <span className="text-label-sm">ink {meta.ink} · {meta.cr}:1</span>
                <span className="text-label text-label--key">{meta.keys}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="D" title="Line roles">
          Every drawn line takes one role. Weights stay true pixels at any render scale.
        </SheetHead>
        <div className="line-roles" data-sheet="04">
          {LINES.map((l) => (
            <div key={l.layer} className="line-role">
              <svg viewBox="0 0 200 24" className="line-role__svg" aria-hidden>
                <path className={`ln-${l.layer}`} d="M4 12 L196 12" />
              </svg>
              <span className="text-label">{`ln-${l.layer}`}</span>
              <span className="text-label-sm">{`${l.grade} · ${l.w}px`}</span>
              <span className="line-role__use">{l.use}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="D′" title="Tones">
          A plate steps back for whatever sits in front of it. The figure never changes; its line roles move up the
          graphite ramp (Drawing tone, SectionPlate tone).
        </SheetHead>
        <ToneStrip />
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="E" title="Sheets and edges">
          The site's own components. Hover a card or the link: the corner arms draw further along the edges.
        </SheetHead>
        <div className="components">
          <DraftedSheet />
          <div className="spec-specimen" data-sheet="04">
            <ExperienceCard entry={role} onOpen={() => {}} />
          </div>
          <div className="spec-specimen" data-sheet="06">
            <FrameLink href="https://github.com" label="GitHub" drawn />
            <span className="dim-value spec-dim">412.0 MM</span>
          </div>
        </div>
        <div className="spec-cards" data-sheet="03">
          <motion.div className="spec-card" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <ProjectCard project={project} index={0} onOpen={() => {}} />
          </motion.div>
          <div className="spec-card">
            <PlaceholderCard />
          </div>
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="E′" title="Seals and chips">
          A disc marks a live product; a plate marks a publication. Tech seals carry each tag's own mark on a 6H plate.
        </SheetHead>
        <div className="components" data-sheet="05">
          <div className="spec-specimen">
            <div className="spec-seals">
              <span className="spec-seal-host">
                <LiveSeal />
              </span>
              <span className="spec-seal-host spec-seal-host--wide">
                <PublishedSeal venue="IEEE GLOBECOM 2026" />
              </span>
            </div>
          </div>
          <div className="spec-specimen">
            <div className="spec-seals">
              <TechSeal tag="React" />
              <TechSeal tag="Python" />
              <TechSeal tag="Microsoft Sentinel" />
              <TechSeal tag="Something new" />
            </div>
          </div>
          <div className="spec-specimen">
            <ul className="spec-chips">
              <SkillChip name="TypeScript" />
              <SkillChip name="AWS" />
              <SkillChip name="Terraform" />
            </ul>
          </div>
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="E″" title="Detail sheet">
          Opening a project or role: the page blurs and darkens under a scrim that fades in (the one fade on the
          desktop board), then the sheet grows from its corner, its frame and rules are drawn, and a role sheet closes on
          a colophon plate. Body text is 15px; strings carry bold, italic, links, bullets and headers.
        </SheetHead>
        <div className="detail-grid">
          <DetailSheet />
          <TokenTable
            rows={[
              ['Scrim', '--scrim-tone · --scrim-blur', 'ink at 58%, 12px blur, fades on the ink ease'],
              ['Close', '.sheet-close', 'caps label, 28px plate, 40px hit area (--hit-min)'],
              ['Title', '.sheet-title', 'Cormorant 600'],
              ['Lede', '.sheet-lede', '16px; bold Inter 600, italic Cormorant'],
              ['Prose', '.sheet-prose', '15px; links underlined in graphite, ink on hover'],
              ['Heading', 'SheetHeading', 'keyed label + a rule drawn to the edge'],
              ['Markup', 'RichText · RichBlocks', '**bold** *italic* [label](url) · "- " bullets · "### " headers'],
            ]}
          />
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="E‴" title="Layers">
          One stacking scale. Nothing on the site sets a z-index outside it.
        </SheetHead>
        <TokenTable rows={LAYERS.map((l) => [l.token, String(l.z), l.what])} />
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="F" title="Motion">
          Slow, settled, never bouncy. Every ease has one job, and lines never get their own: they inherit their
          foreground partner's. The same values are mirrored in CSS as --ease-* and --dur-*.
        </SheetHead>
        <div className="pen-grid">
          <TokenTable
            rows={EASES.map((e) => [e.name, `cubic-bezier(${bezier[e.name].join(', ')})`, e.job])}
          />
          <TokenTable
            rows={[
              ...Object.entries(duration).map(([k, v]): [string, string] => [`duration.${k}`, `${v}s`]),
              ['eraseRatio', String(eraseRatio), 'an exit takes this share of its entrance'],
              ...Object.entries(stagger).map(([k, v]): [string, string] => [`stagger.${k}`, `${v}s`]),
              ...Object.entries(travel).map(([k, v]): [string, string] => [`travel.${k}`, `${v}px`]),
            ]}
          />
        </div>
        <div className="pen-grid">
          <TokenTable
            rows={[
              ['smoothScroll.lerp', String(smoothScroll.lerp), 'page glide: lower is looser'],
              ['stageMotion.scrub', `${stageMotion.scrub}s`, 'the stage trails scroll by this'],
              ...Object.entries(stageSpan).map(([k, v]): [string, string, string] => [`stageSpan.${k}`, String(v), 'scroll units']),
            ]}
          />
          <ul className="patterns">
            {CHOREOGRAPHY.map((p) => (
              <li key={p.name}>
                <span className="patterns__name">{p.name}</span>
                <span className="text-body">{p.how}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="F′" title="The pen">
          A figure is a procedure, not a picture. It is drawn in passes, and the choreographer turns pass order into time
          inside one window, so a drawing stays on its foreground partner's clock.
        </SheetHead>
        <div className="pen-grid">
          <TokenTable rows={Object.entries(pen).map(([k, v]) => [k, String(v)])} />
          <ul className="patterns">
            {PATTERNS.map((p) => (
              <li key={p.name}>
                <span className="patterns__name">{p.name}</span>
                <span className="text-body">{p.how}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-body spec-note">
          Under each plate, the strip shows its passes against time. Grey bars are construction, black is ink, the
          pigment bar is keyed annotation. The vertical line is the pen.
        </p>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="G" title="Folio">
          Every figure and the annotation kit. Each plays when it scrolls into view. Replay it or scrub it.
        </SheetHead>
        <div className="folio">
          {rest.map((p) => (
            <PlateCard key={p.id} plate={p} />
          ))}
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="H" title="Placement">
          Where each plate is drawn on the pinned board, and the step it is drawn on, under the line sync contract.
          Experimentum Crucis is this page's masthead only.
        </SheetHead>
        <div className="stage-table">
          {STAGE.map((r) => (
            <div key={r.plate} className="stage-row" data-sheet={r.sheet}>
              <Key sheet={r.sheet} />
              <span className="stage-row__plate">{r.plate}</span>
              <span className="text-body">
                <strong className="stage-row__place">{r.place}</strong> {r.sync}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="spec-sheet-section">
        <SheetHead index="H′" title="Document flow">
          Phones, touch and reduced motion get the same sections in normal flow, on one continuous ruled grid, each
          with a single oversized plate (SectionPlate) cropped by its section and drawn once when it scrolls in.
        </SheetHead>
        <div className="stage-table">
          {FLOW.map((r) => (
            <div key={r.sheet} className="stage-row" data-sheet={r.sheet}>
              <Key sheet={r.sheet} />
              <span className="stage-row__plate">{r.plate}</span>
              <span className="text-body">{r.place}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
