import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { Project, ProjectSize } from '@/content/types'
import { bezier, duration, travel } from '@/theme/motion'
import { roman, SHEETS } from '@/theme/spectrum'
import { LiveSeal } from './LiveSeal'
import { PublishedSeal } from './PublishedSeal'
import { SheetFrame } from './SheetFrame'
import { TechSeal } from './TechSeal'
import { sheetFaceVariants, sheetFrameVariants, sheetPaperVariants, sheetVariants } from './unrollConstants'

interface ProjectCardProps {
  project: Project
  /** Position in the board: the sheet number, and the deterministic size fallback. */
  index: number
  onOpen: (id: number) => void
  /**
   * Pinned-stage usage: the stage timeline drafts the sheet (its frame path
   * from where the radial lands, then the paper grows, then the face inks;
   * see stage/sequences/projects.ts), so no Framer variants are attached.
   * Default false = fallback path: the same three layers on Framer variants
   * (frame draws, paper unrolls, face inks), driven by ProjectsBoard.
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
  const v = <T,>(variants: T) => (pinned ? undefined : variants)

  return (
    <motion.button
      ref={ref}
      variants={v(sheetVariants)}
      whileHover={{ y: -travel.lift }}
      transition={{ duration: duration.hover, ease: bezier.settle }}
      onClick={() => onOpen(project.id)}
      aria-haspopup="dialog"
      aria-label={`${project.title}: view project details`}
      className={`draft-sheet h-full w-full ${pinned ? 'min-h-[100px]' : 'min-h-[220px]'} ${SIZE_CLASSES[size]}`}
    >
      <motion.span aria-hidden className="draft-sheet__paper paper-card" variants={v(sheetPaperVariants)} />
      <SheetFrame variants={v(sheetFrameVariants)} />

      <motion.div
        variants={v(sheetFaceVariants)}
        className={`card-face relative flex h-full w-full flex-col overflow-hidden ${pinned ? 'sheet-face gap-1 p-3 sm:p-4' : 'gap-2 p-5 sm:p-6'}`}
      >
        {project.publishedIn ? <PublishedSeal venue={project.publishedIn} /> : project.demoUrl && <LiveSeal />}
        <span className="text-label text-label--key">
          <span className="numeral">{SHEETS['03'].numeral}</span>.{roman(index + 1).toLowerCase()}
        </span>
        <span className="text-label mt-auto w-fit px-2 py-1" style={{ background: 'var(--color-graphite-9h)' }}>
          {project.category}
        </span>
        <h3
          className={pinned ? '' : 'text-serif-lg'}
          style={{
            color: 'var(--color-ink)',
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
        <p
          className={pinned ? 'sheet-summary' : undefined}
          style={{
            color: 'var(--color-ink-soft)',
            fontSize: pinned ? 'clamp(0.72rem, 0.8vw, 0.85rem)' : '0.9rem',
            lineHeight: 1.45,
          }}
        >
          {project.summary}
        </p>
        <div className={`flex flex-wrap ${pinned ? 'mt-0.5 gap-1' : 'mt-1 gap-2'}`}>
          {project.tags.map((tag) => (
            <TechSeal key={tag} tag={tag} small={pinned} />
          ))}
        </div>
      </motion.div>
    </motion.button>
  )
})
