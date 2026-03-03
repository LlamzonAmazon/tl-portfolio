import { motion } from 'framer-motion'
import { SectionLabel } from './ui/SectionLabel'

const reveal = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }
const vp = { once: true, margin: '-100px' }
const ease = [0.16, 1, 0.3, 1]

const expertise = [
  {
    title: 'Software Development',
    body: 'Solving unique problems with creative code solutions — from cloud-native pipelines to full-stack web applications built to last.',
  },
  {
    title: 'Project Management',
    body: 'Leading cross-functional teams to develop and deliver quality software products — on time, in scope, and aligned with stakeholder goals.',
  },
  {
    title: 'Security & Cloud Computing',
    body: 'Passionate about cybersecurity and cloud applications, with hands-on SOC operations, KQL threat detection, and infrastructure across Azure, GCP, and AWS.',
  },
]

export const AboutSection = () => (
  <section
    id="about"
    style={{ padding: 'var(--section-padding-y) var(--section-padding-x)', background: 'var(--color-bg)' }}
  >
    <SectionLabel index="02" label="ABOUT" />

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8vw',
        alignItems: 'start',
      }}
    >
      {/* Left — sticky editorial headline */}
      <motion.h2
        className="text-section-title"
        style={{ color: 'var(--color-white)', position: 'sticky', top: '22vh' }}
        variants={reveal}
        initial="hidden"
        whileInView="visible"
        viewport={vp}
        transition={{ duration: 0.9, ease }}
      >
        Crafting<br />software<br />that matters.
      </motion.h2>

      {/* Right — bio + open expertise blocks */}
      <div>
        <motion.p
          className="text-body"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          transition={{ delay: 0.12, duration: 0.9, ease }}
        >
          I live a very balanced and full life. I am a student, software developer, project manager, and mentor.
        </motion.p>

        <motion.p
          className="text-body"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          transition={{ delay: 0.2, duration: 0.9, ease }}
          style={{ marginTop: '1.5rem' }}
        >
          In my professional endeavours, I am pursuing a career in software engineering, with a focus
          in cybersecurity, cloud applications, and machine learning.
        </motion.p>

        <motion.p
          className="text-body"
          variants={reveal}
          initial="hidden"
          whileInView="visible"
          viewport={vp}
          transition={{ delay: 0.28, duration: 0.9, ease }}
          style={{ marginTop: '1.5rem' }}
        >
          I hope to leverage my social and active nature to achieve a well-rounded software-centric
          position where I can make a positive impact in the software field.
        </motion.p>

        {/* Open expertise blocks — no card borders, only a top hairline */}
        <div style={{ marginTop: '4rem' }}>
          {expertise.map((item, i) => (
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
            href="#contact"
            className="hover-underline-red text-label"
            style={{ color: 'var(--color-white)', fontSize: '0.78rem' }}
          >
            CONNECT WITH ME →
          </a>
        </motion.div>
      </div>
    </div>
  </section>
)
