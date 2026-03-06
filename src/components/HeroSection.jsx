import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ConstellationCanvas } from './ConstellationCanvas'

const LINES     = ['THOMAS', 'LLAMZON']
const lineDelay = [0.1, 0.46]

const letterVariant = {
  hidden:  { y: 110, x: 30, opacity: 0 },
  visible: { y: 0,   x: 0,  opacity: 1 },
}

export const HeroSection = () => {
  const sectionRef = useRef(null)

  return (
    <section
      id="home"
      ref={sectionRef}
      style={{
        height:         '100dvh',
        position:       'relative',
        overflow:       'hidden',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'flex-end',
        paddingLeft:    'var(--section-padding-x)',
        paddingRight:   'var(--section-padding-x)',
        paddingBottom:  '12vh',
        background:     '#000000',
      }}
    >
      {/* ── Constellation mesh ────────────────────────────────── */}
      <ConstellationCanvas containerRef={sectionRef} />

      {/* ── Name ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {LINES.map((word, lineIdx) => (
          <div
            key={word}
            style={{ display: 'flex', overflow: 'hidden', lineHeight: 0.88 }}
          >
            {[...word].map((letter, i) => (
              <motion.span
                key={i}
                className="text-display"
                style={{ display: 'block', color: 'var(--color-white)' }}
                variants={letterVariant}
                initial="hidden"
                animate="visible"
                transition={{
                  delay:    lineDelay[lineIdx] + i * 0.045,
                  ease:     [0.16, 1, 0.3, 1],
                  duration: 0.9,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        ))}

        {/* ── Tagline ──────────────────────────────────────────── */}
        <motion.p
          className="text-body"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop:    '2.5rem',
            fontSize:     'clamp(0.9rem, 1.4vw, 1.15rem)',
            color:        'var(--color-muted)',
            letterSpacing: '0.01em',
          }}
        >
          Software Engineering&nbsp;&nbsp;·&nbsp;&nbsp;Cybersecurity&nbsp;&nbsp;·&nbsp;&nbsp;Cloud Computing&nbsp;&nbsp;
        </motion.p>

        {/* ── Scroll indicator ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 1 }}
          style={{
            marginTop:  '3.5rem',
            display:    'flex',
            alignItems: 'center',
            gap:        '0.85rem',
          }}
        >
          <div
            style={{
              width:      1,
              height:     '3rem',
              background: 'var(--color-muted)',
              opacity:    0.5,
            }}
          />
          <span className="text-label" style={{ opacity: 0.7 }}>SCROLL DOWN ↓</span>
        </motion.div>
      </div>
    </section>
  )
}
