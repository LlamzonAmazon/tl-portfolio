import { motion, useReducedMotion } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'
import { useMediaQuery } from '../hooks/useMediaQuery'
import data from '../data/about.json'

/* Quint-out: evenly distributed, settles gently. */
const ease = [0.22, 1, 0.36, 1]
const vp = { once: true, margin: '-100px' }

export const AboutSection = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const reduceMotion = useReducedMotion()

  /* Same helper shape as ContactSection: reduced motion collapses to an
     instant, no-travel fade. */
  const rise = (delay = 0, distance = 16) =>
    reduceMotion
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: distance },
          whileInView: { opacity: 1, y: 0 },
          transition: { duration: 1.15, delay, ease },
        }

  return (
    <section
      id="about"
      style={{
        padding: 'var(--section-padding-y) var(--section-padding-x)',
        background: 'var(--color-bg)',
      }}
    >
      <SectionLabel index="02" label="ABOUT" />

      {/* ── A. Top block: sticky headline + bio ─────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '3rem' : '8vw',
          alignItems: 'start',
        }}
      >
        <motion.h2
          className="text-section-title"
          viewport={vp}
          style={{
            color: 'var(--color-white)',
            position: isMobile ? 'static' : 'sticky',
            top: isMobile ? undefined : '22vh',
          }}
          {...rise(0, 32)}
        >
          {data.headlineLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < data.headlineLines.length - 1 && <br />}
            </span>
          ))}
        </motion.h2>

        <div>
          {data.bio.map((paragraph, i) => (
            <motion.p
              key={i}
              className="text-body"
              viewport={vp}
              style={{ marginTop: i === 0 ? undefined : '1.5rem' }}
              {...rise(0.14 + i * 0.12)}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </div>

      {/* ── B. Full-bleed domain band ───────────────────────────── */}
      <div className="about-band">
        {/* Hairline draws in from the left, same idiom as the experience rows */}
        <motion.div
          className="about-band__rule"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease }}
        />

        <div
          className="about-band__grid"
          style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)' }}
        >
          {data.domains.map((name, i) => (
            <motion.div
              key={name}
              className="about-domain"
              viewport={{ once: true, margin: '-60px' }}
              style={{
                /* First cell sits flush with the section label above it.
                   Dividers run vertically on desktop, horizontally stacked. */
                paddingLeft: isMobile || i === 0 ? 0 : 'clamp(1.5rem, 3vw, 2.5rem)',
                borderLeft:
                  !isMobile && i > 0 ? '1px solid var(--color-border)' : undefined,
                borderTop:
                  isMobile && i > 0 ? '1px solid var(--color-border)' : undefined,
              }}
              {...rise(0.1 + i * 0.14)}
            >
              <span className="text-label about-domain__index">
                0{i + 1}
              </span>
              <span className="about-domain__rule" aria-hidden />
              <h3 className="about-domain__name">{name}</h3>
            </motion.div>
          ))}
        </div>

        <div className="about-band__rule about-band__rule--static" />
      </div>

      {/* ── C. CTA ──────────────────────────────────────────────── */}
      <motion.div
        viewport={vp}
        style={{
          display: 'flex',
          justifyContent: isMobile ? 'flex-start' : 'flex-end',
          marginTop: '3rem',
        }}
        {...rise(0.2)}
      >
        <a
          href={data.cta.href}
          className="hover-underline-red text-label"
          style={{ color: 'var(--color-white)', fontSize: '0.78rem' }}
        >
          {data.cta.label}
        </a>
      </motion.div>
    </section>
  )
}
