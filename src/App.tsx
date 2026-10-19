import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Home } from './pages/Home'
import { LenisContext } from './context/LenisContext'
import { PaperBackdrop } from './components/ui/PaperBackdrop'
import { smoothScroll } from './theme/motion'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const instance = new Lenis({
      lerp: smoothScroll.lerp,
      smoothWheel: !prefersReduced,
    })

    instance.stop() // Home starts it once the preloader clears.
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)

    const lenisRaf = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(lenisRaf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      instance.destroy()
      gsap.ticker.remove(lenisRaf)
      setLenis(null)
    }
  }, [])

  return (
    <LenisContext.Provider value={lenis}>
      <PaperBackdrop />
      <Home />
    </LenisContext.Provider>
  )
}
