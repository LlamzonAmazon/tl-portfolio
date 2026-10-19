import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// The pinned stage is one scroll-scrubbed timeline: a reload must start at the
// top, not wherever the browser restores to (mid-dive, mid-zoom).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
