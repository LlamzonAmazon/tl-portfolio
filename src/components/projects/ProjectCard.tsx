import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { Project, ProjectSize } from '@/content/types'
import { duration, easeInk } from '@/theme/motion'
import { LiveSeal } from './LiveSeal'
import { TechSeal } from './TechSeal'
import { unrollCardVariants } from './unrollConstants'

interface ProjectCardProps {
  project: Project
  /** Position in the board — used for the deterministic size fallback. */
  index: number
  onOpen: (id: number) => void
  /**
   * Pinned-stage usage: entrance is owned by an ancestor scaling plane (the
   * board zoom-out) plus a wrapper visibility toggle, so Framer's own
   * entrance variants are skipped (only whileHover/click stay Framer-owned).
   * Default false = fallback path's Framer stagger entrance.
   */
  pinned?: boolean
}

const SIZE_CLASSES: Record<ProjectSize, string> = {
  lg: 'col-span-1 sm:col-span-2 lg:col-span-4 lg:row-span-2',
  md: 'col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-2',
  sm: 'col-span-1 sm:col-span-2 lg:col-span-2 lg:row-span-1',
}

/** Applied to any project missing an explicit `size`, so the board still reads as intentionally varied. */
const SIZE_CYCLE: ProjectSize[] = ['lg', 'sm', 'sm', 'md', 'sm', 'sm']

export const ProjectCard = forwardRef<HTMLButtonElement, ProjectCardProps>(function ProjectCard(
  { project, index, onOpen, pinned = false },
  ref,
) {
  const size = project.size ?? SIZE_CYCLE[index % SIZE_CYCLE.length]

  return (
    <motion.button
      ref={ref}
      variants={pinned ? undefined : unrollCardVariants}
      whileHover={{ y: -4 }}
      transition={{ duration: duration.base, ease: easeInk }}
      onClick={() => onOpen(project.id)}
      aria-haspopup="dialog"
      aria-label={`${project.title} — view project details`}
      className={`frame-draft paper-card paper-card-ticks relative block h-full w-full ${pinned ? 'min-h-[100px]' : 'min-h-[220px]'} text-left ${SIZE_CLASSES[size]}`}
    >
      {!pinned && (
        <>
          <span aria-hidden className="tick tick-tl" />
          <span aria-hidden className="tick tick-tr" />
          <span aria-hidden className="tick tick-bl" />
          <span aria-hidden className="tick tick-br" />
        </>
      )}
      {!pinned && project.demoUrl && <LiveSeal />}

      <div
        className={`relative flex h-full w-full flex-col justify-end overflow-hidden ${pinned ? 'gap-1 p-3 sm:p-4' : 'gap-2 p-5 sm:p-6'}`}
      >
        <span
          className="text-mono w-fit rounded-[3px] px-2 py-1"
          style={{ color: 'var(--color-sepia)', background: 'rgba(var(--sepia-rgb), 0.1)' }}
        >
          {project.category}
        </span>
        <h3
          className={pinned ? '' : 'text-serif-lg'}
          style={{
            color: 'var(--color-ink)',
            textShadow: 'var(--emboss-subtle)',
            ...(pinned
              ? {
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 'clamp(0.95rem, 1.4vw, 1.4rem)',
                  lineHeight: 1.15,
                }
              : undefined),
          }}
        >
          {project.title}
        </h3>
        <div className={`flex flex-wrap ${pinned ? 'mt-0.5 gap-1' : 'mt-1 gap-2'}`}>
          {project.tags.map((tag) => (
            <TechSeal key={tag} tag={tag} small={pinned} />
          ))}
        </div>
      </div>
    </motion.button>
  )
})
