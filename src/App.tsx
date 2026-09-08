import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Home } from './pages/Home'
import { LenisContext } from './context/LenisContext'
import { PaperBackdrop } from './components/ui/PaperBackdrop'

gsap.registerPlugin(ScrollTrigger)

// Lenis easing derived from the shared paper cubic-bezier.
const lenisEasing = (t: number): number => 1 - Math.pow(1 - t, 3)

export default function App() {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const instance = new Lenis({
      duration: 1.2,
      easing: lenisEasing,
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
