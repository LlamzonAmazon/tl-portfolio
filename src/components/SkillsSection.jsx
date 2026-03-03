import { motion } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'
import data from '../data/skills.json'

const ease = [0.16, 1, 0.3, 1]

export const SkillsSection = () => (
  <section
    id="skills"
    style={{ padding: 'var(--section-padding-y) var(--section-padding-x)' }}
  >
    <SectionLabel index="05" label="SKILLS" />

    <motion.h2
      className="text-section-title"
      style={{ color: 'var(--color-white)', marginBottom: '5rem' }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.9, ease }}
    >
      What I<br />work with.
    </motion.h2>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {data.categories.map((cat) => {
        const skills = data.skills.filter((s) => s.category === cat)
        return (
          <div key={cat}>
            <p className="text-label" style={{ marginBottom: '1.75rem' }}>
              {cat}
            </p>
            {/* Flowing typographic cluster — no grid, no badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem 2rem',
                alignItems: 'baseline',
              }}
            >
              {skills.map((skill, i) => (
                <motion.span
                  key={skill.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.035, duration: 0.65, ease }}
                  whileHover={{ color: 'var(--color-accent-red)' }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.5rem, 2.8vw, 2.4rem)',
                    fontWeight: 600,
                    color: 'var(--color-white)',
                    lineHeight: 1.15,
                    transition: 'color var(--transition-base)',
                  }}
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  </section>
)
