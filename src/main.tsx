import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './app/App'
import { seedDatabase } from './db/seed'
import { cleanupExpiredLogbook } from './db/logbook'
import './index.css'

registerSW({ immediate: true })

await seedDatabase()
await cleanupExpiredLogbook()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
