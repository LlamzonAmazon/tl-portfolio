import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '@/content/projects'
import { stagger } from '@/theme/motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { RulerDivider } from '@/components/ui/RulerDivider'
import { SectionPlate } from '@/components/ui/SectionPlate'
import { arcus } from '@/lib/draft/figures/arcus'
import { ProjectCard } from './ProjectCard'
import { ProjectDetailModal } from './ProjectDetailModal'

const ARCUS = arcus()

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.item } },
}

/**
 * Mobile/touch/reduced-motion path: normal document flow. On whileInView
 * each sheet is drafted at item stagger (frame draws, paper unrolls, face
 * inks; see unrollConstants.ts); reduced motion renders them drafted.
 * No GSAP, no ScrollTrigger: this section is never mounted on the
 * pinned-stage path (see PinnedStage), which scrub-drives the same card
 * components as part of the site's single continuous timeline.
 */
export function ProjectsBoard() {
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) ?? null, [activeProjectId])

  return (
    <section
      id="projects"
      data-sheet="03"
      className="relative overflow-x-clip"
      style={{ padding: 'var(--section-py) var(--section-px) var(--flow-py)' }}
    >
      {/* Its top edge level with the title: the section's top padding plus half
          the plate's height (min(170%, 72rem) wide, 600 x 660 box). */}
      <SectionPlate figure={ARCUS} width="170%" x="72%" y="calc(var(--section-py) + min(170vw, 72rem) * 0.55)" />
      <div className="relative mx-auto max-w-[var(--content-max)]">
        <div className="mb-10 sm:mb-14">
          <RulerDivider sheet="03" />
          <h2 className="text-heading mt-3">My projects.</h2>
        </div>

        <motion.div
          initial={reducedMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[minmax(220px,1fr)] lg:gap-6"
        >
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} onOpen={setActiveProjectId} />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {activeProject && <ProjectDetailModal project={activeProject} onClose={() => setActiveProjectId(null)} />}
      </AnimatePresence>
    </section>
  )
}
