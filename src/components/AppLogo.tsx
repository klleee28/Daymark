import { Check } from 'lucide-react'

export function AppLogo() {
  return (
    <div className="app-logo" aria-label="Daymark">
      <span className="app-logo__mark"><Check size={18} strokeWidth={2.8} /></span>
      <span>Daymark</span>
    </div>
  )
}
