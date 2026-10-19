import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useScrollLock } from '@/hooks/useScrollLock'
import { Preloader } from '@/components/ui/Preloader'
import { PinnedStage } from '@/components/stage/PinnedStage'
import { HeroFallback } from '@/components/hero/HeroFallback'
import { ProjectsBoard } from '@/components/projects/ProjectsBoard'
import { ExperienceList } from '@/components/experience/ExperienceList'
import { SkillsBoard } from '@/components/skills/SkillsBoard'
import { ContactFallback } from '@/components/contact/ContactFallback'

// Dev/QA affordance: `?skipIntro` bypasses the preloader (and unlocks anims).
const skipIntro =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('skipIntro')

export function Home() {
  const [isLoading, setIsLoading] = useState(!skipIntro)
  const [ready, setReady] = useState(skipIntro)
  const [introDone, setIntroDone] = useState(false)

  // Single source of truth for the pinned-vs-fallback branch: on capable
  // devices the whole site is one continuous scroll-locked stage (PinnedStage);
  // everyone else gets a normal, unpinned document flow of the same sections.
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reducedMotion = usePrefersReducedMotion()
  const pinnedMode = isDesktop && canHover && !reducedMotion

  // Locked through the preloader, and in pinned mode through the intro too:
  // the stage is fully pinned and measured before the first scroll.
  useScrollLock(!ready || (pinnedMode && !introDone))

  return (
    <div className="text-ink" style={{ overflowX: 'clip' }}>
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
        <PinnedStage ready={ready} onIntroComplete={() => setIntroDone(true)} />
      ) : (
        // One ruled grid under the whole document, anchored to the page, so
        // every section sits on the same board (as the pinned stage does).
        // Isolated, so the section plates (z -1) sit over the grid (z -2)
        // and under every section's content.
        <div className="relative isolate">
          <div aria-hidden className="bg-grid-ruled absolute inset-0 -z-2" />
          <HeroFallback ready={ready} />
          <ProjectsBoard />
          <ExperienceList />
          <SkillsBoard />
          <ContactFallback />
        </div>
      )}
    </div>
  )
}
