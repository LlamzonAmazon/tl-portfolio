import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useScrollLock } from '@/hooks/useScrollLock'
import { Preloader } from '@/components/ui/Preloader'
import { PinnedStage } from '@/components/stage/PinnedStage'
import { HeroFallback } from '@/components/hero/HeroFallback'
import { ProjectsBoard } from '@/components/projects/ProjectsBoard'

// Dev/QA affordance: `?skipIntro` bypasses the preloader (and unlocks anims).
const skipIntro =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skipIntro')

export function Home() {
  const [isLoading, setIsLoading] = useState(!skipIntro)
  const [ready, setReady] = useState(skipIntro)

  useScrollLock(!ready)

  // Single source of truth for the pinned-vs-fallback branch: on capable
  // devices the whole site is one continuous scroll-locked stage (PinnedStage);
  // everyone else gets a normal, unpinned document flow of the same sections.
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reducedMotion = usePrefersReducedMotion()
  const pinnedMode = isDesktop && canHover && !reducedMotion

  return (
    <div className="text-ink" style={{ overflowX: 'hidden' }}>
      <AnimatePresence
        initial={false}
        onExitComplete={() => {
          window.scrollTo(0, 0)
          setReady(true)
        }}
      >
        {isLoading && <Preloader key="preloader" onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {pinnedMode ? (
        <PinnedStage ready={ready} />
      ) : (
        <>
          <HeroFallback ready={ready} />
          <ProjectsBoard />
        </>
      )}
    </div>
  )
}
