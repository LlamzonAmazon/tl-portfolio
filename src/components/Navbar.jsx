import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const links = ['About', 'Projects', 'Experience', 'Skills', 'Contact']

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
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
          document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
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

      <nav style={{ display: 'flex', gap: '2.5rem' }}>
        {links.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="hover-underline-red text-label"
            style={{ color: 'var(--color-muted)' }}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {link}
          </a>
        ))}
      </nav>
    </motion.header>
  )
}
