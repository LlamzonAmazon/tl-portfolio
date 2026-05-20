import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const IMAGES = [
  '/preview-dash.png',
  '/preview-async.png',
  '/preview-wsc.png',
  '/GitHub.png',
  '/tab-icon.png',
]

const NAV_WIDTHS = ['2.9rem', '4.6rem', '5.8rem', '3.5rem', '4.1rem']

const containerVariants = {
  show: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { delay: 0.5, duration: 0.35, ease: 'easeOut' },
  },
}

const makeItem = (delay) => ({
  show: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: -8,
    transition: { delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
})

const navVariant    = makeItem(0)
const title1Variant = makeItem(0.08)
const title2Variant = makeItem(0.16)
const taglineVariant = makeItem(0.24)
const scrollVariant = makeItem(0.32)

const SkeletonBox = ({ style }) => (
  <div
    className="skeleton-pulse"
    style={{ borderRadius: 4, flexShrink: 0, ...style }}
  />
)

export const Preloader = ({ onComplete }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    const imgPromises = IMAGES.map(
      (src) => new Promise((res) => {
        const img = new Image()
        img.onload = img.onerror = res
        img.src = src
      })
    )
    const minDelay = new Promise((res) => setTimeout(res, 800))
    Promise.all([document.fonts.ready, ...imgPromises, minDelay])
      .then(() => onCompleteRef.current?.())
  }, [])

  return (
    <motion.div
      variants={containerVariants}
      initial="show"
      animate="show"
      exit="exit"
      style={{ position: 'fixed', inset: 0, background: '#000000', zIndex: 200 }}
    >
      {/* ── Skeleton Navbar ──────────────────────────────────────── */}
      <motion.div
        variants={navVariant}
        style={{
          position:       'absolute',
          top:            0,
          left:           0,
          right:          0,
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '1.5rem var(--section-padding-x)',
        }}
      >
        <SkeletonBox style={{ width: '2.5rem', height: '1.2rem' }} />

        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[0, 1, 2].map((i) => (
              <SkeletonBox key={i} style={{ width: 22, height: 1.5 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            {NAV_WIDTHS.map((w, i) => (
              <SkeletonBox
                key={i}
                style={{ width: w, height: '0.72rem', animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Skeleton Hero ─────────────────────────────────────────── */}
      <div
        style={{
          position:      'absolute',
          bottom:        0,
          left:          0,
          right:         0,
          paddingLeft:   'var(--section-padding-x)',
          paddingRight:  'var(--section-padding-x)',
          paddingBottom: '12vh',
        }}
      >
        {/* Title line 1 — "THOMAS" */}
        <motion.div variants={title1Variant}>
          <SkeletonBox
            style={{
              width:  '52vw',
              height: 'clamp(2.5rem, 13vw, 14rem)',
              animationDelay: '0.2s',
            }}
          />
        </motion.div>

        {/* Title line 2 — "LLAMZON" */}
        <motion.div variants={title2Variant} style={{ marginTop: '0.4rem' }}>
          <SkeletonBox
            style={{
              width:  '61vw',
              height: 'clamp(2.5rem, 13vw, 14rem)',
              animationDelay: '0.4s',
            }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.div variants={taglineVariant} style={{ marginTop: '2.5rem' }}>
          <SkeletonBox
            style={{
              width:  'min(34rem, 85%)',
              height: '1.1rem',
              animationDelay: '0.6s',
            }}
          />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={scrollVariant}
          style={{ marginTop: '3.5rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        >
          <SkeletonBox style={{ width: 1, height: '3rem', animationDelay: '0.8s' }} />
          <SkeletonBox style={{ width: '5rem', height: '0.65rem', animationDelay: '0.8s' }} />
        </motion.div>
      </div>
    </motion.div>
  )
}
