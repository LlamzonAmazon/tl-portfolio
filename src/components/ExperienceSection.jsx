import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'
import data from '../data/experience.json'

const ease = [0.16, 1, 0.3, 1]

const ExperienceRow = ({ exp }) => {
  const [open, setOpen] = useState(false)

  return (
    <div>
      {/* Animated hairline */}
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

      {/* Role row — click to expand */}
      <div
        onClick={() => setOpen((o) => !o)}
        data-cursor
        data-cursor-label={open ? 'CLOSE' : 'READ →'}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingTop: '2rem',
          paddingBottom: open ? '1rem' : '2rem',
        }}
      >
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.2vw, 2.6rem)',
              fontWeight: 600,
              color: 'var(--color-white)',
              lineHeight: 1.05,
            }}
          >
            {exp.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-body"
            style={{ marginTop: '0.3rem', fontSize: '0.95rem' }}
          >
            {exp.organization}&nbsp;&nbsp;·&nbsp;&nbsp;{exp.location}
          </motion.p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-label"
          style={{ whiteSpace: 'nowrap', paddingTop: '0.4rem', flexShrink: 0 }}
        >
          {exp.time}
        </motion.p>
      </div>

      {/* Expandable description — no box, just text */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="desc"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: '2.5rem', paddingTop: '0.5rem' }}>
              {exp.description.split('\n\n').map((para, j) => (
                <p
                  key={j}
                  className="text-body"
                  style={{
                    maxWidth: '72ch',
                    marginTop: j > 0 ? '1rem' : 0,
                  }}
                >
                  {para}
                </p>
              ))}
              {/* Tags — inline, no badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  marginTop: '1.5rem',
                }}
              >
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-label"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const ExperienceSection = () => (
  <section
    id="experience"
    style={{ padding: 'var(--section-padding-y) var(--section-padding-x)' }}
  >
    <SectionLabel index="04" label="EXPERIENCE" />

    <motion.h2
      className="text-section-title"
      style={{ color: 'var(--color-white)', marginBottom: '4rem' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.9, ease }}
    >
      My experience.
    </motion.h2>

    <div>
      {data.experiences.map((exp) => (
        <ExperienceRow key={exp.id} exp={exp} />
      ))}
      {/* Final hairline */}
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
    </div>
  </section>
)
