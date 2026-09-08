import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { Project } from '@/content/types'
import { duration, easeInk } from '@/theme/motion'
import { useScrollLock } from '@/hooks/useScrollLock'
import { TechSeal } from './TechSeal'

interface ProjectDetailModalProps {
  project: Project
  onClose: () => void
}

export function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useScrollLock(true)

  // Capture the triggering card on mount, restore focus to it on unmount.
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    return () => {
      previouslyFocused.current?.focus()
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(var(--ink-rgb), 0.82)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration.base, ease: easeInk }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`project-modal-title-${project.id}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: duration.base, ease: easeInk }}
        className="paper-card paper-card-stacked relative z-10 max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[var(--radius-xl)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="hover-lift absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border"
          style={{
            borderColor: 'var(--color-line)',
            color: 'var(--color-sepia)',
            background: 'rgba(var(--paper-rgb), 0.9)',
          }}
        >
          <span aria-hidden style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', lineHeight: 1 }}>
            ×
          </span>
        </button>

        <div className="max-h-[88vh] overflow-y-auto p-6 sm:p-9">
          <div className="mb-6 overflow-hidden rounded-[var(--radius-md)]">
            <img src={project.image} alt="" className="h-48 w-full object-cover sm:h-64" />
          </div>

          <span className="text-mono">{project.category}</span>
          <h3
            id={`project-modal-title-${project.id}`}
            className="text-heading mt-2"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
          >
            {project.title}
          </h3>

          <p className="text-body mt-4">{project.description}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {project.tags.map((tag) => (
              <TechSeal key={tag} tag={tag} showLabel />
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-6">
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="link-underline text-mono">
              View on GitHub ↗
            </a>
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" className="link-underline text-mono">
                View live ↗
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
