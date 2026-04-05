import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './bones/registry'
import './index.css'
import './styles/shared.css'
import App from './App.tsx'
import { queryClient } from './app/queryClient'
import { ToastViewport } from './components/feedback/ToastViewport'
import { I18nProvider } from './i18n/I18nProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <App />
        <ToastViewport />
      </I18nProvider>
    </QueryClientProvider>
  </StrictMode>,
)
