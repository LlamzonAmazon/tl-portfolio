import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionLabel } from './ui/SectionLabel'
import data from '../data/projects.json'

gsap.registerPlugin(ScrollTrigger)

// Per-slide dot-grid tint
const palettes = [
  { dot: 'rgba(192, 57,  79,  1)' },  // accent red
  { dot: 'rgba(123, 63,  171, 1)' },  // accent purple
  { dot: 'rgba( 30, 90,  180, 1)' },  // accent navy
]

export const ProjectsSection = () => {
  const sectionRef = useRef(null)
  const trackRef   = useRef(null)
  const fillRef    = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current
      const getShift = () => track.scrollWidth - window.innerWidth

      gsap.to(track, {
        x: () => -getShift(),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start:  'top top',
          end:    () => `+=${getShift() + window.innerHeight * 0.12}`,
          pin:    true,
          scrub:  1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (fillRef.current) {
              fillRef.current.style.width = `${self.progress * 100}%`
            }
          },
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="projects"
      ref={sectionRef}
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      {/* Horizontal track */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          width: `${data.projects.length * 100}vw`,
          height: '100vh',
        }}
      >
        {data.projects.map((project, i) => {
          const pal = palettes[i % palettes.length]
          return (
          <div
            key={project.id}
            style={{
              width: '100vw',
              height: '100vh',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              paddingLeft: 'var(--section-padding-x)',
              paddingRight: 'var(--section-padding-x)',
              paddingBottom: '10vh',
            }}
          >
            {/* Dot-grid texture — repeating pattern blends seamlessly at all edges */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(circle, ${pal.dot} 1.5px, transparent 1.5px)`,
                backgroundSize: '32px 32px',
              }}
            />
            {/* Bottom vignette — fades grid out near text */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, var(--color-bg) 38%, transparent 100%)',
              }}
            />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Section label only on first slide */}
              {i === 0 && (
                <SectionLabel index="03" label="PROJECTS" />
              )}
              {i > 0 && (
                <p className="text-label" style={{ marginBottom: '3.5rem', opacity: 0 }}>
                  &nbsp;
                </p>
              )}

              <span
                className="text-label"
                style={{ marginBottom: '1.25rem', display: 'block' }}
              >
                0{i + 1} / 0{data.projects.length}
              </span>

              <h2
                className="text-section-title"
                style={{ color: 'var(--color-white)' }}
              >
                {project.title}
              </h2>

              <p
                className="text-body"
                style={{ maxWidth: '52ch', marginTop: '1.5rem' }}
              >
                {project.description.split('\n\n')[0]}
              </p>

              {/* Tech tags — inline, no card */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  marginTop: '1.75rem',
                  alignItems: 'center',
                }}
              >
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-label"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div
                style={{
                  display: 'flex',
                  gap: '2.5rem',
                  marginTop: '2rem',
                }}
              >
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover-underline-red text-label"
                  data-cursor-label="GITHUB →"
                  style={{ color: 'var(--color-white)' }}
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
                    style={{ color: 'var(--color-white)' }}
                  >
                    LIVE SITE
                  </a>
                )}
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Horizontal progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: 'var(--section-padding-x)',
          right: 'var(--section-padding-x)',
          height: 1,
          background: 'var(--color-border)',
          zIndex: 10,
        }}
      >
        <div
          ref={fillRef}
          style={{
            height: '100%',
            background: 'var(--color-accent-red)',
            width: '0%',
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </section>
  )
}
