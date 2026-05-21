import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLenis } from '../context/LenisContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { NavMenuOverlay } from './NavMenuOverlay'

const HEADER_Z = 120

const MENU_ICON_SIZE = 18
const MENU_TOGGLE_FADE = { duration: 0.2, ease: 'easeInOut' }
const MENU_BTN_WIDTH_DESKTOP = '4.5rem'
const MENU_BTN_WIDTH_MOBILE = '2.65rem'

const MenuHamburgerIcon = () => (
  <span
    aria-hidden
    style={{
      display:        'flex',
      flexDirection:  'column',
      justifyContent: 'center',
      gap:            '5px',
      width:          `${MENU_ICON_SIZE}px`,
      height:         `${MENU_ICON_SIZE}px`,
    }}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          display:      'block',
          height:       '1.5px',
          width:        '100%',
          background:   'currentColor',
          borderRadius: '1px',
        }}
      />
    ))}
  </span>
)

const MenuCloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
    <path
      d="M2 2L16 16M16 2L2 16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
)

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const lenis = useLenis()
  const menuButtonRef = useRef(null)

  // Lock page scroll (Lenis + body) whenever the menu is open
  useEffect(() => {
    if (menuOpen) lenis?.stop()
    else lenis?.start()
  }, [menuOpen, lenis])

  useEffect(() => {
    const body = document.body
    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight

    if (menuOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      body.style.overflow = prevOverflow || ''
      body.style.paddingRight = prevPaddingRight || ''
    }

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight
    }
  }, [menuOpen])

  // Recolor the custom cursor (white plus-sign would be invisible on cream)
  useEffect(() => {
    const root = document.documentElement
    if (menuOpen) root.style.setProperty('--cursor-color', 'var(--color-accent-red)')
    else root.style.removeProperty('--cursor-color')
    return () => root.style.removeProperty('--cursor-color')
  }, [menuOpen])

  // Escape closes the menu
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  // Return focus to the Menu button when closing
  const closeMenu = () => {
    setMenuOpen(false)
    requestAnimationFrame(() => menuButtonRef.current?.focus())
  }

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    if (lenis) lenis.scrollTo(el, { offset: 0 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNavigate = (id) => {
    closeMenu()
    setTimeout(() => scrollToId(id), 480)
  }

  const handleNameClick = (e) => {
    e.preventDefault()
    if (menuOpen) {
      closeMenu()
      setTimeout(scrollToTop, 480)
    } else {
      scrollToTop()
    }
  }

  const headerColor = menuOpen ? 'var(--nav-overlay-text)' : 'var(--color-white)'

  const pillStyle = {
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         '0.45rem 1rem',
    borderRadius:    '6px',
    border:          '1px solid transparent',
    boxSizing:       'border-box',
    boxShadow:       menuOpen
      ? 'none'
      : 'inset 0 0 0 1px rgba(245, 240, 235, 0.18)',
    background:      menuOpen
      ? 'transparent'
      : 'rgba(0, 0, 0, 0.28)',
    backdropFilter:  menuOpen ? 'none' : 'blur(10px)',
    WebkitBackdropFilter: menuOpen ? 'none' : 'blur(10px)',
    transition:      'background 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease, color 0.4s ease',
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top:      0,
          left:     0,
          right:    0,
          zIndex:   HEADER_Z,
          display:  'flex',
          alignItems: 'center',
          padding:  '1.5rem var(--section-padding-x)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-start' }}>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
            data-cursor
            style={{
              ...pillStyle,
              fontFamily:    'var(--font-body)',
              fontSize:      '0.95rem',
              fontWeight:    500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color:         headerColor,
              cursor:        'none',
              pointerEvents: 'auto',
              position:      'relative',
              flexShrink:    0,
              width:         isMobile ? MENU_BTN_WIDTH_MOBILE : MENU_BTN_WIDTH_DESKTOP,
              minWidth:      isMobile ? MENU_BTN_WIDTH_MOBILE : MENU_BTN_WIDTH_DESKTOP,
              maxWidth:      isMobile ? MENU_BTN_WIDTH_MOBILE : MENU_BTN_WIDTH_DESKTOP,
              padding:       isMobile ? '0.55rem 0' : '0.45rem 0',
            }}
          >
            {isMobile ? (
              <span
                style={{
                  position: 'relative',
                  display:  'inline-block',
                  width:    MENU_ICON_SIZE,
                  height:   MENU_ICON_SIZE,
                  flexShrink: 0,
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={menuOpen ? 'close' : 'open'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={MENU_TOGGLE_FADE}
                    style={{
                      position:       'absolute',
                      inset:          0,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                    }}
                  >
                    {menuOpen ? <MenuCloseIcon /> : <MenuHamburgerIcon />}
                  </motion.span>
                </AnimatePresence>
              </span>
            ) : (
              <span
                style={{
                  position:   'relative',
                  display:    'inline-block',
                  minWidth:   '4.75ch',
                  height:     '1em',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={menuOpen ? 'close' : 'open'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={MENU_TOGGLE_FADE}
                    style={{
                      position:       'absolute',
                      inset:          0,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      whiteSpace:     'nowrap',
                    }}
                  >
                    {menuOpen ? 'Exit' : 'Menu'}
                  </motion.span>
                </AnimatePresence>
              </span>
            )}
          </button>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
          <a
            href="#home"
            onClick={handleNameClick}
            data-cursor
            data-cursor-label="TOP"
            style={{
              ...pillStyle,
              fontFamily:    'var(--font-display)',
              fontSize:      'clamp(1.1rem, 1.4vw, 1.35rem)',
              fontWeight:    500,
              color:         headerColor,
              textDecoration: 'none',
              letterSpacing: '0.02em',
              pointerEvents: 'auto',
              whiteSpace:    'nowrap',
              flexShrink:    0,
            }}
          >
            Thomas Llamzon
          </a>
        </div>

        <div style={{ flex: 1, minWidth: 0 }} aria-hidden />
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <NavMenuOverlay
            key="nav-overlay"
            open={menuOpen}
            onClose={closeMenu}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </>
  )
}
