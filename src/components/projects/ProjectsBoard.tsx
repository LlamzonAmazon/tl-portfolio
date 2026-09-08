import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '@/content/projects'
import { stagger } from '@/theme/motion'
import { RulerDivider } from '@/components/ui/RulerDivider'
import { ProjectCard } from './ProjectCard'
import { ProjectDetailModal } from './ProjectDetailModal'

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger.loose } },
}

/**
 * Mobile/touch/reduced-motion path: normal document flow, Framer whileInView
 * stagger reveal. No GSAP, no ScrollTrigger — this section is never mounted
 * on the pinned-stage path (see PinnedStage), which scrub-drives the same
 * card/linework components as part of the site's single continuous timeline.
 */
export function ProjectsBoard() {
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null)

  const activeProject = useMemo(() => projects.find((p) => p.id === activeProjectId) ?? null, [activeProjectId])

  return (
    <section
      id="projects"
      className="relative overflow-hidden"
      style={{ padding: 'var(--section-py) var(--section-px)' }}
    >
      <div className="relative mx-auto max-w-[var(--content-max)]">
        <div className="mb-10 sm:mb-14">
          <RulerDivider index="03" label="Projects" />
          <h2 className="text-heading mt-3">My projects.</h2>
        </div>

        <motion.div
          initial="hidden"
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
