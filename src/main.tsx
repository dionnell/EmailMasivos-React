import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { EmailMasivosApp } from './app/EmailMasivosApp.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmailMasivosApp />
  </StrictMode>,
)
