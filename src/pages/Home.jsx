import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Navbar }            from '../components/Navbar'
import { HeroSection }       from '../components/HeroSection'
import { AboutSection }      from '../components/AboutSection'
import { ProjectsSection }   from '../components/ProjectsSection'
import { ExperienceSection } from '../components/ExperienceSection'
import { SkillsSection }     from '../components/SkillsSection'
import { ContactSection }    from '../components/ContactSection'
import { Footer }            from '../components/Footer'
import { Preloader }         from '../components/ui/Preloader'

export const Home = () => {
  const [isLoading, setIsLoading]           = useState(true)
  const [animationsReady, setAnimationsReady] = useState(false)

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-white)', overflowX: 'hidden' }}>
      <AnimatePresence
        initial={false}
        onExitComplete={() => {
          window.scrollTo(0, 0)
          setAnimationsReady(true)
        }}
      >
        {isLoading && (
          <Preloader key="preloader" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <Navbar />
      <main>
        <HeroSection shouldAnimate={animationsReady} />
        <AboutSection />
        <ProjectsSection />
        <ExperienceSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
