import { forwardRef } from 'react'
import { TechSeal } from '@/components/projects/TechSeal'

interface SkillChipProps {
  name: string
}

/** One tool or language on the skills board: a small paper chip with its seal. */
export const SkillChip = forwardRef<HTMLLIElement, SkillChipProps>(function SkillChip({ name }, ref) {
  return (
    <li ref={ref} className="skill-chip">
      <TechSeal tag={name} small />
      <span className="skill-chip__name">{name}</span>
    </li>
  )
})
