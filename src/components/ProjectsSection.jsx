import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'
import { useMediaQuery } from '../hooks/useMediaQuery'
import data from '../data/projects.json'

const CATEGORY_ORDER = ['research', 'pro bono', 'websites', 'personal']

/* Dot-grid used both as the idle backdrop and as the fallback for projects
   with no preview image (private repos, internal tools). */
const DOT_GRID = {
  backgroundImage:
    'radial-gradient(circle, rgba(245, 240, 235, 0.06) 1.5px, transparent 1.5px)',
  backgroundSize: '32px 32px',
}

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
  /* Hover is not a gesture that exists on touch, so the preview pane is desktop
     only. Mobile gets the same click-to-expand rows the experience section uses. */
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <section
      id="projects"
      style={{
        minHeight: isMobile ? undefined : '100vh',
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
        transition={{ duration: 0.9, ease }}
      >
        My projects.
      </motion.h2>

      {isMobile ? <ProjectList /> : <ProjectBrowser />}

      <style>{`
        .project-preview-tag {
          font-size: 0.625rem;
          letter-spacing: 0.14em;
        }
        /* The global scrollbar thumb is --color-surface, which is the pane's own
           background, so it would be invisible here. */
        .project-preview-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(245, 240, 235, 0.22) transparent;
        }
        .project-preview-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .project-preview-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .project-preview-scroll::-webkit-scrollbar-thumb {
          background: rgba(245, 240, 235, 0.22);
          border-radius: 2px;
        }
        .project-preview-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(245, 240, 235, 0.38);
        }
        @media (max-width: 767px) {
          .project-preview-description {
            font-size: 0.8125rem;
            line-height: 1.55;
          }
        }
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

/* ── Mobile: click-to-expand rows ─────────────────────────────── */

const ProjectList = () => (
  <div>
    {allProjects.map((project, i) => (
      <ProjectRow key={project.id} project={project} index={i} />
    ))}
    <Hairline />
  </div>
)

const Hairline = () => (
  <motion.div
    initial={{ scaleX: 0 }}
    whileInView={{ scaleX: 1 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.8, ease }}
    style={{
      height: 1,
      background: 'var(--color-border)',
      transformOrigin: 'left',
    }}
  />
)

const ProjectRow = ({ project, index }) => {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Hairline />

      <div
        onClick={() => setOpen((o) => !o)}
        data-cursor
        data-cursor-label={open ? 'CLOSE' : 'READ →'}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          paddingTop: '2rem',
          paddingBottom: open ? '1rem' : '2rem',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', minWidth: 0 }}>
          <span
            className="text-label"
            style={{ color: 'var(--color-muted)', flexShrink: 0, minWidth: '2.5ch' }}
          >
            0{index + 1}
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 6vw, 2rem)',
              fontWeight: 600,
              color: open ? 'var(--color-accent-red)' : 'var(--color-white)',
              lineHeight: 1.05,
              overflowWrap: 'break-word',
              transition: 'color var(--transition-base)',
            }}
          >
            {project.title}
          </h3>
        </div>

        <span
          className="text-label"
          style={{ flexShrink: 0, whiteSpace: 'nowrap', paddingTop: '0.4rem' }}
        >
          {project.category.toUpperCase()}
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: '2.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem 1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-label project-preview-tag"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <ProjectLinks project={project} style={{ marginBottom: '1.75rem' }} />

              <p
                className="text-body project-preview-description"
                style={{ color: 'var(--color-white)' }}
              >
                {project.summary}
              </p>
              <PointList points={project.points} style={{ marginTop: '1.25rem' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Desktop: menu + hover preview ────────────────────────────── */

const ProjectBrowser = () => {
  // Single source of truth - persists the last hovered project, never clears on mouse leave
  const [displayedProject, setDisplayedProject] = useState(null)

  return (
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
  )
}

/* Summary sentence plus technical points. The marker is a short accent rule
   rather than a disc, matching the hairline language used everywhere else.
   Grid keeps wrapped lines hanging-indented past the marker. */
const PointList = ({ points, color, style }) => (
  <ul
    style={{
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.7rem',
      ...style,
    }}
  >
    {points.map((point, i) => (
      <li
        key={i}
        className="text-body project-preview-description"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6rem 1fr',
          alignItems: 'start',
          color,
        }}
      >
        <span
          aria-hidden
          style={{
            height: 1,
            width: '0.7rem',
            marginTop: '0.85em',
            background: 'var(--color-accent-red)',
            opacity: 0.85,
          }}
        />
        <span style={{ overflowWrap: 'break-word' }}>{point}</span>
      </li>
    ))}
  </ul>
)

/* Both links are optional - internal tools have neither. */
const ProjectLinks = ({ project, style, centered = false }) => {
  if (!project.githubUrl && !project.demoUrl) return null

  const linkStyle = {
    color: 'var(--color-white)',
    minHeight: '44px',
    display: 'inline-flex',
    alignItems: 'center',
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '2.5rem',
        justifyContent: centered ? 'center' : 'flex-start',
        flexShrink: 0,
        ...style,
      }}
    >
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="hover-underline-red text-label"
          data-cursor-label="GITHUB →"
          style={linkStyle}
        >
          GITHUB
        </a>
      )}
      {project.demoUrl && project.demoUrl !== project.githubUrl && (
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noreferrer"
          className="hover-underline-red text-label"
          data-cursor-label="VISIT →"
          style={linkStyle}
        >
          LIVE SITE
        </a>
      )}
    </div>
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
    {/* Background - the preview image where one exists, dot grid where it doesn't */}
    <div
      style={
        project.image
          ? {
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${project.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.38,
            }
          : { position: 'absolute', inset: 0, ...DOT_GRID }
      }
    />

    {/* Dark overlay */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.52)',
      }}
    />

    {/* Content - strictly confined within preview bounds */}
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
      {/* Top: tool stack - centered */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem 1rem',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {project.tags.map((tag) => (
          <span key={tag} className="text-label project-preview-tag" style={{ color: 'var(--color-muted)' }}>
            {tag}
          </span>
        ))}
      </motion.div>

      {/* Links, directly under the stack. Renders nothing when a project has
          neither, so no phantom gap above the description. */}
      <motion.div variants={itemVariants} style={{ flexShrink: 0 }}>
        <ProjectLinks project={project} centered style={{ marginTop: '1.25rem' }} />
      </motion.div>

      {/* Middle: description block, centered on both axes.
          `margin: auto` on the child rather than `alignItems: center` so the
          block still centres when it fits but scrolls instead of clipping when
          a long description outgrows a short pane. */}
      <div
        className="project-preview-scroll"
        /* Lenis intercepts wheel on window and prevents default, so a nested
           scroll container is dead without this opt-out. */
        data-lenis-prevent
        style={{
          flex: 1,
          display: 'flex',
          padding: '1.5rem 0.25rem 1.5rem 0',
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        <motion.div
          variants={itemVariants}
          style={{ margin: 'auto', maxWidth: '68ch', width: '100%' }}
        >
          <p
            className="text-body project-preview-description"
            style={{ color: 'var(--color-white)', overflowWrap: 'break-word' }}
          >
            {project.summary}
          </p>
          <PointList
            points={project.points}
            color="rgba(245, 240, 235, 0.82)"
            style={{ marginTop: '1.5rem' }}
          />
        </motion.div>
      </div>
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
    <div style={{ position: 'absolute', inset: 0, ...DOT_GRID }} />
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
