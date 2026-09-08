import { motion, useReducedMotion } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'
import { useMediaQuery } from '../hooks/useMediaQuery'

/* Quint-out: evenly distributed, settles gently. */
const ease = [0.22, 1, 0.36, 1]

const GithubMark = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 3-.405c1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

const LinkedinMark = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/LlamzonAmazon',
    Icon: GithubMark,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/thomasllamzon',
    Icon: LinkedinMark,
  },
]

export const ContactSection = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const reduceMotion = useReducedMotion()

  /* Reveal order follows visual hierarchy: heading, then the line under it,
     then each tile. Reduced motion collapses to instant, no travel. */
  const rise = (delay) =>
    reduceMotion
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 1.15, delay, ease },
        }

  return (
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '3.5rem' : '8vw',
          alignItems: 'center',
        }}
      >
        {/* Left - the ask */}
        <div>
          <motion.h2
            className="text-section-title"
            viewport={{ once: true, margin: '-100px' }}
            style={{ color: 'var(--color-white)' }}
            {...rise(0)}
          >
            Connect<br />with me.
          </motion.h2>

          <motion.p
            className="text-body"
            viewport={{ once: true, margin: '-100px' }}
            style={{ marginTop: '1.75rem', maxWidth: '38ch' }}
            {...rise(0.14)}
          >
            Open to full-time engineering roles and independent work. The fastest
            way to reach me is either of these.
          </motion.p>
        </div>

        {/* Right - two large targets */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: isMobile ? '1rem' : '1.5rem',
          }}
        >
          {socials.map(({ label, href, Icon }, i) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="connect-tile"
              aria-label={`${label} profile, opens in a new tab`}
              data-cursor-label={`${label.toUpperCase()} →`}
              viewport={{ once: true, margin: '-80px' }}
              {...rise(0.28 + i * 0.14)}
            >
              <span className="connect-tile__arrow" aria-hidden>↗</span>
              <Icon className="connect-tile__icon" />
              <span className="connect-tile__label">{label}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
