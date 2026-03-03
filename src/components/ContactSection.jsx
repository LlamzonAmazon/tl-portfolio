import { motion } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'

const ease = [0.16, 1, 0.3, 1]

const socials = [
  { label: 'GITHUB',   href: 'https://github.com/LlamzonAmazon' },
  { label: 'LINKEDIN', href: 'https://linkedin.com/in/thomas-llamzon' },
]

export const ContactSection = () => (
  <section
    id="contact"
    style={{
      padding: 'var(--section-padding-y) var(--section-padding-x)',
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <SectionLabel index="06" label="CONTACT" />

    {/* Large editorial CTA */}
    <motion.h2
      className="text-display"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1.0, ease }}
      style={{ color: 'var(--color-white)', marginTop: '3.5rem' }}
    >
      Connect<br />with me.
    </motion.h2>

    {/* Social links */}
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.65, duration: 0.8 }}
      style={{
        display: 'flex',
        gap: '1rem',
        marginTop: '3rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {socials.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="contact-social-link text-label"
        >
          {label}
          <span className="contact-social-arrow" aria-hidden>↗</span>
        </a>
      ))}
    </motion.div>
  </section>
)
