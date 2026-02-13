import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import App from './App.tsx'
import { MemoryRouter, Routes, Route } from 'react-router'
import { Toaster } from '../components/ui/sonner.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MemoryRouter>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </MemoryRouter>
    <Toaster />
  </StrictMode>
)