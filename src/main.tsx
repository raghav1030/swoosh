import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from './components/ui/sonner.tsx'
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  }
]
)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster />

  </StrictMode>
)
