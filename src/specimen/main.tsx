import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Specimen } from './Specimen'
import '../index.css'
import './specimen.css'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <Specimen />
  </StrictMode>,
)
