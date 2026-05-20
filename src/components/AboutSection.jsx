import { motion } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'
import { useMediaQuery } from '../hooks/useMediaQuery'
import data from '../data/about.json'

const reveal = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }
const vp = { once: true, margin: '-100px' }
const ease = [0.16, 1, 0.3, 1]

export const AboutSection = () => {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
  <section
    id="about"
    style={{ padding: 'var(--section-padding-y) var(--section-padding-x)', background: 'var(--color-bg)' }}
  >
    <SectionLabel index="02" label="ABOUT" />

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '3rem' : '8vw',
        alignItems: 'start',
      }}
    >
      {/* Left — sticky editorial headline */}
      <motion.h2
        className="text-section-title"
        style={{
          color: 'var(--color-white)',
          position: isMobile ? 'static' : 'sticky',
          top: isMobile ? undefined : '22vh',
        }}
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
        transition={{ duration: 0.9, ease }}
      >
        {data.headlineLines.map((line, i) => (
          <span key={line}>
            {line}
            {i < data.headlineLines.length - 1 && <br />}
          </span>
        ))}
      </motion.h2>

      {/* Right — bio + open expertise blocks */}
      <div>
        {data.bio.map((paragraph, i) => (
          <motion.p
            key={i}
            className="text-body"
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            transition={{ delay: 0.12 + i * 0.08, duration: 0.9, ease }}
            style={{ marginTop: i === 0 ? undefined : '1.5rem' }}
          >
            {paragraph}
          </motion.p>
        ))}

        {/* Open expertise blocks — no card borders, only a top hairline */}
        <div style={{ marginTop: '4rem' }}>
          {data.expertise.map((item, i) => (
            <motion.div
              key={item.title}
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={vp}
              transition={{ delay: 0.08 * i, duration: 0.8, ease }}
              style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '2rem',
                paddingBottom: '2rem',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.3rem, 2.4vw, 1.9rem)',
                  fontWeight: 600,
                  color: 'var(--color-white)',
                  marginBottom: '0.75rem',
                  lineHeight: 1.1,
                }}
              >
                {item.title}
              </h3>
              <p className="text-body" style={{ maxWidth: '55ch' }}>
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          transition={{ delay: 0.3, duration: 0.8, ease }}
          style={{ marginTop: '3rem' }}
        >
          <a
            href={data.cta.href}
            className="hover-underline-red text-label"
            style={{ color: 'var(--color-white)', fontSize: '0.78rem' }}
          >
            {data.cta.label}
          </a>
        </motion.div>
      </div>
    </div>
  </section>
  )
}
