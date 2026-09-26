import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'
import './styles/layout.css'
import './styles/sections.css'
import './styles/tailwind.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
)
