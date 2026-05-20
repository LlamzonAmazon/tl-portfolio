import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useLenis } from '../context/LenisContext'
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
  const lenis = useLenis()
  const scrollLocked = !animationsReady

  useEffect(() => {
    if (!lenis) return
    if (scrollLocked) lenis.stop()
    else lenis.start()
  }, [lenis, scrollLocked])

  useEffect(() => {
    if (!scrollLocked) return

    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow
    const prevHtmlOverscroll = html.style.overscrollBehavior
    const prevBodyTouchAction = body.style.touchAction

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    body.style.touchAction = 'none'

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
      html.style.overscrollBehavior = prevHtmlOverscroll
      body.style.touchAction = prevBodyTouchAction
    }
  }, [scrollLocked])

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
