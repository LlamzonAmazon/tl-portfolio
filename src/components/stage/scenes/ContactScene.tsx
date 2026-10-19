import { forwardRef, useImperativeHandle, useRef } from 'react'
import { site } from '@/content/site'
import { TapeText } from '@/components/hero/TapeText'
import { WipeText } from '@/components/hero/WipeText'
import { FrameLink } from '@/components/contact/FrameLink'
import { CONTACT_LINKS } from '@/components/contact/contactLinks'
import { Drawing } from '@/components/ui/Drawing'
import { SheetIndex } from '@/components/ui/SheetIndex'
import type { DrawingHandle } from '@/lib/draft/choreo'
import { ellipsis } from '@/lib/draft/figures/ellipsis'
import { harmonia } from '@/lib/draft/figures/harmonia'
import { rosa } from '@/lib/draft/figures/rosa'

/**
 * Sheet VI's plates. The rose window, ghosted so the name stays the
 * darkest thing on the sheet, is set at monumental scale: centred on the
 * bottom edge right of centre, it bleeds out of the sheet and only its
 * upper arc shows. Two margin studies: the gardener's ellipse at lower left
 * (two pins and a string: the two links), the harmonograph at upper left
 * (two pendulums, one unbroken line: the last thing drawn).
 */
const ROSA = rosa()
const ELLIPSIS = ellipsis()
const HARMONIA = harmonia()

export interface ContactLinkRefs {
  el: HTMLAnchorElement
  /** Frame edges, clockwise from top-left. */
  edges: HTMLElement[]
  /** Label + arrow: the foreground that wipes in while the frame draws. */
  content: HTMLElement[]
}

export interface ContactSceneHandle {
  plane: HTMLDivElement | null
  label: HTMLElement | null
  nameLines: HTMLElement[]
  links: ContactLinkRefs[]
  rosa: () => DrawingHandle | null
  ellipsis: () => DrawingHandle | null
  harmonia: () => DrawingHandle | null
}

/**
 * SEQ-08/09 content: the closing sheet. The name tapes in exactly like the
 * hero while the hero's compass study is redrawn around it (the bookend),
 * then the two links ink in as their frames draw (stage/sequences/contact.ts).
 * Hidden until the timeline reaches it, so its links are never tabbable early.
 */
export const ContactScene = forwardRef<ContactSceneHandle>(function ContactScene(_props, ref) {
  const planeRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLElement | null>(null)
  const nameLineRefs = useRef<Array<HTMLElement | null>>([])
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const rosaRef = useRef<DrawingHandle>(null)
  const ellipsisRef = useRef<DrawingHandle>(null)
  const harmoniaRef = useRef<DrawingHandle>(null)

  useImperativeHandle(
    ref,
    () => ({
      plane: planeRef.current,
      label: labelRef.current,
      nameLines: nameLineRefs.current.filter((el): el is HTMLElement => el !== null),
      links: linkRefs.current
        .filter((el): el is HTMLAnchorElement => el !== null)
        .map((el) => ({
          el,
          edges: Array.from(el.querySelectorAll<HTMLElement>('.frame-edge')),
          content: Array.from(el.querySelectorAll<HTMLElement>('.frame-link__label, .frame-link__arrow')),
        })),
      rosa: () => rosaRef.current,
      ellipsis: () => ellipsisRef.current,
      harmonia: () => harmoniaRef.current,
    }),
    [],
  )

  return (
    <div
      ref={planeRef}
      data-sheet="06"
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
      style={{ padding: 'var(--section-px)', visibility: 'hidden' }}
    >
      {/* Scale contrast: the rose window is far larger than the sheet, its
          centre on the bottom edge right of centre, so only its upper arc
          rises into view. Static placement: it never moves anything. */}
      <div
        className="stage-plate"
        style={{ left: '70%', top: '88%', height: '219%', aspectRatio: '1', transform: 'translate(-50%, -50%)' }}
      >
        <Drawing ref={rosaRef} figure={ROSA} animated tone="ghost" />
      </div>
      <div className="stage-plate" style={{ left: '2.5%', top: '56%', width: '17%', aspectRatio: '720 / 520' }}>
        <Drawing ref={ellipsisRef} figure={ELLIPSIS} animated />
      </div>
      <div className="stage-plate" style={{ left: '3%', top: '7%', width: '15%', aspectRatio: '1' }}>
        <Drawing ref={harmoniaRef} figure={HARMONIA} animated />
      </div>

      <WipeText as="span" className="text-label text-label--key relative inline-block" ref={labelRef} plate={false}>
        <SheetIndex sheet="06" />
      </WipeText>

      <h2 className="text-display relative mt-4" aria-label={site.wordmark}>
        {site.displayName.map((line, i) => (
          <TapeText
            key={line}
            as="span"
            className="block px-6 pb-2 pt-2 md:px-10 lg:px-14"
            ref={(el) => {
              nameLineRefs.current[i] = el
            }}
          >
            {line}
          </TapeText>
        ))}
      </h2>

      <div className="pointer-events-auto relative mt-10 flex flex-wrap items-center justify-center gap-5">
        {CONTACT_LINKS.map((link, i) => (
          <FrameLink
            key={link.key}
            href={link.href}
            label={link.label}
            ref={(el) => {
              linkRefs.current[i] = el
            }}
          />
        ))}
      </div>
    </div>
  )
})
