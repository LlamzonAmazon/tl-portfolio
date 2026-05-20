import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'
import data from '../data/projects.json'

const CATEGORY_ORDER = ['thesis', 'pro bono', 'websites', 'solutions']

const grouped = CATEGORY_ORDER
  .map(cat => ({
    category: cat,
    projects: data.projects.filter(p => p.category === cat),
  }))
  .filter(g => g.projects.length > 0)

// Flat ordered list for stable global numbering
const allProjects = grouped.flatMap(g => g.projects)

const ease = [0.16, 1, 0.3, 1]

const containerVariants = {
  hidden: {},
  // delayChildren waits for the background fade (0.3s) before text starts sliding in
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
}

export const ProjectsSection = () => {
  // Single source of truth — persists the last hovered project, never clears on mouse leave
  const [displayedProject, setDisplayedProject] = useState(null)

  return (
    <section
      id="projects"
      style={{
        minHeight: '100vh',
        paddingLeft:   'var(--section-padding-x)',
        paddingRight:  'var(--section-padding-x)',
        paddingTop:    'var(--section-padding-y)',
        paddingBottom: 'var(--section-padding-y)',
      }}
    >
      <SectionLabel index="03" label="PROJECTS" />

      <motion.h2
        className="text-section-title"
        style={{ color: 'var(--color-white)', marginBottom: '4rem' }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        My projects.
      </motion.h2>

      {/* Two-panel grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gridTemplateRows: 'auto 1fr',
          gap: '3rem',
          marginTop: '3.5rem',
          minHeight: '70vh',
        }}
        className="projects-grid"
      >
        {/* ── Left panel: project menu ──────────────────────────────── */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            paddingRight: '1.5rem',
          }}
        >
          {grouped.map(group => (
            <div key={group.category} style={{ marginBottom: '1.75rem' }}>
              <span
                className="text-label"
                style={{
                  display: 'block',
                  color: 'var(--color-muted)',
                  paddingLeft: '1rem',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.1em',
                  opacity: 0.5,
                }}
              >
                {group.category.toUpperCase()}
              </span>

              {group.projects.map((project) => {
                const globalIndex = allProjects.findIndex(p => p.id === project.id)
                const isLit = displayedProject?.id === project.id

                return (
                  <button
                    key={project.id}
                    onMouseEnter={() => setDisplayedProject(project)}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '1.25rem',
                      background: 'none',
                      border: 'none',
                      borderLeft: isLit
                        ? '2px solid var(--color-accent-red)'
                        : '2px solid transparent',
                      paddingLeft: '1rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'border-color var(--transition-fast)',
                    }}
                  >
                    <span
                      className="text-label"
                      style={{
                        color: 'var(--color-muted)',
                        flexShrink: 0,
                        minWidth: '2.5ch',
                        transition: 'color var(--transition-fast)',
                      }}
                    >
                      0{globalIndex + 1}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.05rem, 1.5vw, 1.4rem)',
                        fontWeight: 400,
                        lineHeight: 1.1,
                        letterSpacing: '-0.01em',
                        color: isLit
                          ? 'var(--color-accent-red)'
                          : 'var(--color-muted)',
                        transition: 'color var(--transition-fast)',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      {project.title}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* ── Right panel: preview area ─────────────────────────────── */}
        <div
          className="projects-preview"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '2px',
            minHeight: '50vh',
            background: 'var(--color-surface)',
          }}
        >
          <AnimatePresence mode="wait">
            {displayedProject ? (
              <ProjectPreview key={displayedProject.id} project={displayedProject} />
            ) : (
              <AmbientBackground key="ambient" />
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .projects-grid {
            grid-template-columns: 28% 1fr !important;
            grid-template-rows: unset !important;
            gap: 0 !important;
            align-items: stretch;
          }
          .projects-preview {
            min-height: 0 !important;
          }
        }
      `}</style>
    </section>
  )
}

const ProjectPreview = ({ project }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    style={{ position: 'absolute', inset: 0 }}
  >
    {/* Background image — no blur, just darkened */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url(${project.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.38,
      }}
    />

    {/* Dark overlay */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.52)',
      }}
    />

    {/* Content — strictly confined within preview bounds */}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 'clamp(1.5rem, 4vw, 3rem)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Top: description — left aligned */}
      <motion.p
        variants={itemVariants}
        className="text-body"
        style={{
          maxWidth: '52ch',
          color: 'rgba(245, 240, 235, 0.82)',
          flexShrink: 0,
          overflowWrap: 'break-word',
        }}
      >
        {project.description}
      </motion.p>

      {/* Middle: title + tech stack — vertically & horizontally centered */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '1.25rem',
          padding: '1rem 0',
          minHeight: 0,
        }}
      >
        <motion.h2
          variants={itemVariants}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4.5vw, 4.5rem)',
            fontWeight: 400,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            color: 'var(--color-white)',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {project.title}
        </motion.h2>

        <motion.div
          variants={itemVariants}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem 1.25rem',
            justifyContent: 'center',
          }}
        >
          {project.tags.map((tag) => (
            <span key={tag} className="text-label" style={{ color: 'var(--color-muted)' }}>
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Bottom left: links */}
      <motion.div
        variants={itemVariants}
        style={{ display: 'flex', gap: '2.5rem', flexShrink: 0 }}
      >
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="hover-underline-red text-label"
          data-cursor-label="GITHUB →"
          style={{ color: 'var(--color-white)', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
        >
          GITHUB
        </a>
        {project.demoUrl !== project.githubUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="hover-underline-red text-label"
            data-cursor-label="VISIT →"
            style={{ color: 'var(--color-white)', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
          >
            LIVE SITE
          </a>
        )}
      </motion.div>
    </motion.div>
  </motion.div>
)

const AmbientBackground = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.45, ease: 'easeInOut' }}
    style={{ position: 'absolute', inset: 0 }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'radial-gradient(circle, rgba(245, 240, 235, 0.06) 1.5px, transparent 1.5px)',
        backgroundSize: '32px 32px',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.span
        className="text-label"
        style={{ color: 'var(--color-muted)', letterSpacing: '0.12em' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        HOVER OVER A PROJECT
      </motion.span>
    </div>
  </motion.div>
)
