import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { experiences } from '@/content/experience'
import { stagger } from '@/theme/motion'
import { Reveal } from '@/components/ui/Reveal'
import { RulerDivider } from '@/components/ui/RulerDivider'
import { SectionPlate } from '@/components/ui/SectionPlate'
import { harmonia } from '@/lib/draft/figures/harmonia'
import { ExperienceCard } from './ExperienceCard'
import { ExperienceDetailModal } from './ExperienceDetailModal'

const HARMONIA = harmonia()

/**
 * Document-flow Experience (mobile, touch, reduced motion): the same role
 * sheets and detail modal as the pinned stage, revealed in order on scroll.
 */
export function ExperienceList() {
  const [activeId, setActiveId] = useState<number | null>(null)
  const active = useMemo(() => experiences.find((e) => e.id === activeId) ?? null, [activeId])

  return (
    <section id="experience" data-sheet="04" className="relative overflow-x-clip" style={{ padding: 'var(--flow-py) var(--section-px)' }}>
      <SectionPlate figure={HARMONIA} width="160%" x="40%" y="0%" tone="faint" />
      <div className="relative mx-auto max-w-[var(--content-max)]">
        <div className="mb-10 sm:mb-14">
          <RulerDivider sheet="04" />
          <h2 className="text-heading mt-3">Experience.</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((entry, i) => (
            <Reveal key={entry.id} delay={i * stagger.item}>
              <ExperienceCard entry={entry} onOpen={setActiveId} className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
      <AnimatePresence>{active && <ExperienceDetailModal entry={active} onClose={() => setActiveId(null)} />}</AnimatePresence>
    </section>
  )
}
