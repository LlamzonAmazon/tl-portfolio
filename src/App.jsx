import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Home } from './pages/Home'
import { Err } from './pages/Err'
import { Cursor } from './components/ui/Cursor'
import { LenisContext } from './context/LenisContext'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [lenis, setLenis] = useState(null)

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    instance.stop()
    setLenis(instance)

    instance.on('scroll', ScrollTrigger.update)

    const lenisRaf = (time) => instance.raf(time * 1000)
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
      <Cursor />
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="*" element={<Err />} />
        </Routes>
      </BrowserRouter>
    </LenisContext.Provider>
  )
}

export default App
