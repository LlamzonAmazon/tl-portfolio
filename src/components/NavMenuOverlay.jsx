import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { ConstellationCanvas } from './ConstellationCanvas'

const LINKS = ['About', 'Projects', 'Experience', 'Skills', 'Contact']

const FRAME_DURATION = 0.7
const FRAME_EASE     = [0.76, 0, 0.24, 1]
const LINK_STAGGER   = 0.06
const LINK_BASE_DELAY = 0.35

const OVERLAY_Z = 115

export const NavMenuOverlay = ({ open, onClose, onNavigate }) => {
  const isMobile  = useMediaQuery('(max-width: 768px)')
  const overlayRef = useRef(null)
  const firstLinkRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => firstLinkRef.current?.focus(), FRAME_DURATION * 1000)
    return () => clearTimeout(t)
  }, [open])

  const handleClick = (id) => {
    onNavigate?.(id)
  }

  if (isMobile) {
    return (
      <>
        <NavOverlayLinkStyles />
        <motion.div
          ref={overlayRef}
          key="nav-overlay-mobile"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: FRAME_DURATION, ease: FRAME_EASE }}
          style={{
            position:   'fixed',
            inset:      0,
            zIndex:     OVERLAY_Z,
            background: 'var(--nav-overlay-bg)',
            color:      'var(--nav-overlay-text)',
            display:    'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding:    'var(--section-padding-x)',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {LINKS.map((link, i) => (
              <motion.a
                key={link}
                ref={i === 0 ? firstLinkRef : null}
                href={`#${link.toLowerCase()}`}
                className="nav-overlay-link"
                onClick={(e) => {
                  e.preventDefault()
                  handleClick(link.toLowerCase())
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{
                  delay:    LINK_BASE_DELAY + i * LINK_STAGGER,
                  duration: 0.5,
                  ease:     [0.16, 1, 0.3, 1],
                }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:   'clamp(2.5rem, 9vw, 4rem)',
                  fontWeight: 500,
                  color:      'var(--nav-overlay-text)',
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                  width:      'fit-content',
                }}
              >
                {link}
              </motion.a>
            ))}
          </nav>
        </motion.div>
      </>
    )
  }

  const halfW = 'calc((100vw - var(--nav-hole-width)) / 2)'
  const halfH = 'calc((100vh - var(--nav-hole-height)) / 2)'

  return (
    <>
      <NavOverlayLinkStyles />
      <div
        ref={overlayRef}
        key="nav-overlay-desktop"
        style={{
          position: 'fixed',
          inset:    0,
          zIndex:   OVERLAY_Z,
          pointerEvents: 'none',
        }}
      >
      {/* Layer 1: black backdrop covering the entire viewport (hides the page) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset:    0,
          background: '#000000',
          pointerEvents: 'auto',
        }}
      />

      {/* Layer 2: constellation, reused component, fills the viewport (only the window area will be visible after the frame paints over it) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset:    0,
          pointerEvents: 'none',
        }}
      >
        <ConstellationCanvas containerRef={overlayRef} />
      </motion.div>

      {/* Layer 3: white frame panels */}
      {/* Left panel — full height, animates width */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: halfW }}
        exit={{ width: 0 }}
        transition={{ duration: FRAME_DURATION, ease: FRAME_EASE }}
        style={{
          position: 'absolute',
          top:      0,
          bottom:   0,
          left:     0,
          background: 'var(--nav-overlay-bg)',
          pointerEvents: 'auto',
          display:  'flex',
          alignItems: 'center',
        }}
      >
        <nav
          style={{
            display:        'flex',
            flexDirection:  'column',
            gap:            '0.9rem',
            paddingLeft:    'var(--section-padding-x)',
            paddingRight:   '2rem',
            width:          '100%',
          }}
        >
          {LINKS.map((link, i) => (
            <motion.a
              key={link}
              ref={i === 0 ? firstLinkRef : null}
              href={`#${link.toLowerCase()}`}
              className="nav-overlay-link"
              onClick={(e) => {
                e.preventDefault()
                handleClick(link.toLowerCase())
              }}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.2, ease: 'easeIn' } }}
              transition={{
                delay:    LINK_BASE_DELAY + i * LINK_STAGGER,
                duration: 0.55,
                ease:     [0.16, 1, 0.3, 1],
              }}
              style={{
                fontFamily:     'var(--font-display)',
                fontSize:       'clamp(2rem, 4.2vw, 3.25rem)',
                fontWeight:     500,
                color:          'var(--nav-overlay-text)',
                textDecoration: 'none',
                letterSpacing:  '-0.01em',
                lineHeight:     1.05,
                whiteSpace:     'nowrap',
                width:          'fit-content',
              }}
            >
              {link}
            </motion.a>
          ))}
        </nav>
      </motion.div>

      {/* Right panel — full height, animates width */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: halfW }}
        exit={{ width: 0 }}
        transition={{ duration: FRAME_DURATION, ease: FRAME_EASE }}
        style={{
          position: 'absolute',
          top:      0,
          bottom:   0,
          right:    0,
          background: 'var(--nav-overlay-bg)',
          pointerEvents: 'auto',
        }}
      />

      {/* Top panel — full width, animates height (overlaps L/R in corners; same color so it's seamless) */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: halfH }}
        exit={{ height: 0 }}
        transition={{ duration: FRAME_DURATION, ease: FRAME_EASE }}
        style={{
          position: 'absolute',
          top:      0,
          left:     0,
          right:    0,
          background: 'var(--nav-overlay-bg)',
          pointerEvents: 'auto',
        }}
      />

      {/* Bottom panel — full width, animates height */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: halfH }}
        exit={{ height: 0 }}
        transition={{ duration: FRAME_DURATION, ease: FRAME_EASE }}
        style={{
          position: 'absolute',
          bottom:   0,
          left:     0,
          right:    0,
          background: 'var(--nav-overlay-bg)',
          pointerEvents: 'auto',
        }}
      />

      {/* Click-target over the constellation window — closes the menu */}
      <motion.button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: FRAME_DURATION * 0.6, duration: 0.2 }}
        data-cursor
        data-cursor-label="CLOSE"
        style={{
          position: 'absolute',
          top:      halfH,
          left:     halfW,
          width:    'var(--nav-hole-width)',
          height:   'var(--nav-hole-height)',
          background: 'transparent',
          border:   'none',
          padding:  0,
          margin:   0,
          cursor:   'none',
          pointerEvents: 'auto',
        }}
      />
      </div>
    </>
  )
}

const NavOverlayLinkStyles = () => (
  <style>{`
    .nav-overlay-link {
      transition: color 200ms ease;
    }
    .nav-overlay-link:hover,
    .nav-overlay-link:focus-visible {
      color: var(--color-accent-red) !important;
    }
  `}</style>
)
