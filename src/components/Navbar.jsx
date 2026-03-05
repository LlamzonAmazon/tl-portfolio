import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMediaQuery } from '../hooks/useMediaQuery'

const links = ['About', 'Projects', 'Experience', 'Skills', 'Contact']

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu when transitioning to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  // Prevent body scroll while sidebar is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem var(--section-padding-x)',
          backdropFilter: scrolled ? 'blur(18px)' : 'none',
          background: scrolled ? 'rgba(0, 0, 0, 0.75)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          transition: 'background 0.5s ease, backdrop-filter 0.5s ease, border-bottom 0.5s ease',
        }}
      >
        <a
          href="#home"
          className="hover-underline-red"
          onClick={(e) => {
            e.preventDefault()
            scrollTo('home')
          }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--color-white)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
        >
          T.L.
        </a>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: 'flex', gap: '2.5rem' }}>
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="hover-underline-red text-label"
                style={{ color: 'var(--color-muted)' }}
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo(link.toLowerCase())
                }}
              >
                {link}
              </a>
            ))}
          </nav>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              cursor: 'none',
              zIndex: 110,
            }}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'block', width: 22, height: 1.5, background: 'var(--color-white)', transformOrigin: 'center' }}
            />
            <motion.span
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'block', width: 22, height: 1.5, background: 'var(--color-white)' }}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'block', width: 22, height: 1.5, background: 'var(--color-white)', transformOrigin: 'center' }}
            />
          </button>
        )}
      </motion.header>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 105,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
              }}
            />

            {/* Drawer */}
            <motion.nav
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: 'min(75vw, 300px)',
                zIndex: 110,
                background: 'rgba(10, 10, 10, 0.97)',
                borderLeft: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: '2.5rem',
                paddingRight: '2rem',
                gap: '2.5rem',
              }}
            >
              {links.map((link, i) => (
                <motion.a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollTo(link.toLowerCase())
                  }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
                    fontWeight: 600,
                    color: 'var(--color-white)',
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                  }}
                >
                  {link}
                </motion.a>
              ))}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
