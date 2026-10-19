import { motion } from 'framer-motion'
import type { ExperienceEntry } from '@/content/types'
import { bezier, duration, travel } from '@/theme/motion'
import { TechSeal } from '@/components/projects/TechSeal'
import { LiveSeal } from '@/components/projects/LiveSeal'
import { FrameEdges } from '@/components/projects/FrameEdges'

interface ExperienceCardProps {
  entry: ExperienceEntry
  onOpen: (id: number) => void
  className?: string
  /** Pinned-stage size: taller sheet, larger type and full-size seals. */
  stage?: boolean
}

const MAX_SEALS = 5

/**
 * The LIVE disc marks a role that points at a live product (a client site, a
 * deployed tool). A link opts out with `live: false` (an article, a profile);
 * every link is a live product unless it says otherwise.
 */
const hasLiveProduct = (entry: ExperienceEntry) => (entry.links ?? []).some((link) => link.live !== false)

/**
 * One role as a pinned drafting sheet: dates, title, organization, and the
 * stack as seals. Opens the role's detail sheet. Carries the board's
 * registration corners (FrameEdges), drawn further along the edges on hover
 * and focus, on the same clock as the lift.
 */
export function ExperienceCard({ entry, onOpen, className = '', stage = false }: ExperienceCardProps) {
  const extra = entry.tags.length - MAX_SEALS

  return (
    <motion.button
      type="button"
      whileHover={{ y: -travel.lift }}
      transition={{ duration: duration.hover, ease: bezier.settle }}
      onClick={() => onOpen(entry.id)}
      aria-haspopup="dialog"
      aria-label={`${entry.title}, ${entry.organization}: view role details`}
      className={`experience-card ${stage ? 'experience-card--stage' : ''} paper-card relative block w-full text-left ${className}`}
    >
      <FrameEdges drawn />
      {hasLiveProduct(entry) && <LiveSeal />}

      <div className={`flex h-full flex-col gap-2 ${stage ? 'p-5 lg:p-7' : 'p-4 lg:p-5'}`}>
        <span className="text-label-sm">{entry.time}</span>
        <h3 className="experience-card__title">{entry.title}</h3>
        <span className="text-label">{entry.organization}</span>
        {entry.earlierRole && (
          <span className="text-label-sm">
            Prev. {entry.earlierRole.title}, {entry.earlierRole.time}
          </span>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {entry.tags.slice(0, MAX_SEALS).map((tag) => (
            <TechSeal key={tag} tag={tag} small={!stage} />
          ))}
          {extra > 0 && <span className="text-label-sm">+{extra}</span>}
        </div>
      </div>
    </motion.button>
  )
}
