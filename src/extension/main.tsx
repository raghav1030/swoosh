import React from 'react'
import ReactDOM from 'react-dom/client'

import '../index.css' // Or wherever your Tailwind CSS is
import App from './App'
import { initChromeMocks } from '@/chrome.mocks'

initChromeMocks()
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)