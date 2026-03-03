import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export const Cursor = () => {
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const [hovering, setHovering] = useState(false)
  const [label, setLabel] = useState('')

  const spring = { damping: 28, stiffness: 220, mass: 0.4 }
  const x = useSpring(mouseX, spring)
  const y = useSpring(mouseY, spring)

  useEffect(() => {
    const onMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    const onEnter = (e) => {
      const el = e.target.closest('a, button, [data-cursor]')
      if (!el) return
      setHovering(true)
      setLabel(el.dataset.cursorLabel || '')
    }

    const onLeave = (e) => {
      const el = e.target.closest('a, button, [data-cursor]')
      if (!el) return
      setHovering(false)
      setLabel('')
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onEnter, true)
    document.addEventListener('mouseout', onLeave, true)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onEnter, true)
      document.removeEventListener('mouseout', onLeave, true)
    }
  }, [mouseX, mouseY])

  const lineSize = hovering ? 32 : 22
  const lineOpacity = hovering ? 1 : 0.55

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
      }}
      animate={{ scale: hovering ? 1.35 : 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Horizontal bar */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: lineSize,
          height: 1,
          transform: 'translate(-50%, -50%)',
          background: 'var(--color-white)',
          opacity: lineOpacity,
          transition: 'width 0.18s ease, opacity 0.18s ease',
        }}
      />
      {/* Vertical bar */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 1,
          height: lineSize,
          transform: 'translate(-50%, -50%)',
          background: 'var(--color-white)',
          opacity: lineOpacity,
          transition: 'height 0.18s ease, opacity 0.18s ease',
        }}
      />
      {/* Hover label */}
      {label && (
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            left: 18,
            top: -10,
            fontFamily: 'var(--font-body)',
            fontSize: '0.6rem',
            letterSpacing: '0.18em',
            color: 'var(--color-white)',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  )
}
