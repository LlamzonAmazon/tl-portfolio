import { skillGroups } from '@/content/skills'
import { stagger } from '@/theme/motion'
import { Reveal } from '@/components/ui/Reveal'
import { RulerDivider } from '@/components/ui/RulerDivider'
import { SectionPlate } from '@/components/ui/SectionPlate'
import { sectioAurea } from '@/lib/draft/figures/sectioAurea'
import { SkillChip } from './SkillChip'

const AUREA = sectioAurea()

/**
 * Document-flow Skills board (mobile, touch, reduced motion): the same
 * kanban columns as the pinned stage, with static rules (.kanban--static).
 */
export function SkillsBoard() {
  return (
    <section id="skills" data-sheet="05" className="relative overflow-x-clip" style={{ padding: 'var(--flow-py) var(--section-px)' }}>
      <SectionPlate figure={AUREA} width="160%" x="40%" y="0%" tone="faint" />
      <div className="relative mx-auto max-w-[var(--content-max)]">
        <div className="mb-10 sm:mb-14">
          <RulerDivider sheet="05" />
          <h2 className="text-heading mt-3">Skills.</h2>
        </div>
        <div className="kanban kanban--static">
          {skillGroups.map((g, c) => (
            <Reveal key={g.category} delay={c * stagger.item} className="kanban__column">
              <div className="kanban__header">
                <h3 className="text-label">{g.category}</h3>
                <span className="text-label-sm">{String(g.items.length).padStart(2, '0')}</span>
              </div>
              <ul className="kanban__list">
                {g.items.map((item) => (
                  <SkillChip key={item} name={item} />
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
