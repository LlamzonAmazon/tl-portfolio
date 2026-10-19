import { site } from '@/content/site'
import { stagger } from '@/theme/motion'
import { Reveal } from '@/components/ui/Reveal'
import { SectionPlate } from '@/components/ui/SectionPlate'
import { SheetIndex } from '@/components/ui/SheetIndex'
import { rosa } from '@/lib/draft/figures/rosa'

const ROSA = rosa()
import { CONTACT_LINKS } from './contactLinks'
import { FrameLink } from './FrameLink'

/** Document-flow closing sheet (mobile, touch, reduced motion): name + links, lines complete. */
export function ContactFallback() {
  return (
    <section
      id="contact"
      data-sheet="06"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden text-center"
      style={{ padding: 'var(--section-px)' }}
    >
      <SectionPlate figure={ROSA} width="300%" x="14%" y="60%" tone="pale" />
      <div className="relative flex flex-col items-center">
        <Reveal>
          <span className="text-label text-label--key">
            <SheetIndex sheet="06" />
          </span>
        </Reveal>
        <Reveal delay={stagger.item}>
          <h2 className="text-display mt-4" aria-label={site.wordmark}>
            {site.displayName.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
        </Reveal>
        <Reveal delay={stagger.item * 2} className="mt-10 flex flex-wrap items-center justify-center gap-5">
          {CONTACT_LINKS.map((link) => (
            <FrameLink key={link.key} href={link.href} label={link.label} drawn />
          ))}
        </Reveal>
      </div>
    </section>
  )
}
