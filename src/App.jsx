import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Err } from './pages/Err'
import { Toaster } from "@/components/ui/toaster";

function App() {

  return (
    <>
      <BrowserRouter basename="/tl-portfolio">
        <Routes>
          <Route index element={<Home />} />
          <Route path="*" element={<Err />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
