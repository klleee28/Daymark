import { CalendarDays, Grid2X2, Inbox, Sun } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

export function MobileTabBar() {
  const { activeView, setView, setSidebarOpen } = useUIStore()
  return (
    <nav className="mobile-tabs" aria-label="Mobile navigation">
      <button className={activeView === 'inbox' ? 'is-active' : ''} onClick={() => setView('inbox')}><Inbox /><span>Inbox</span></button>
      <button className={activeView === 'today' ? 'is-active' : ''} onClick={() => setView('today')}><Sun /><span>Today</span></button>
      <button className={activeView === 'upcoming' ? 'is-active' : ''} onClick={() => setView('upcoming')}><CalendarDays /><span>Upcoming</span></button>
      <button onClick={() => setSidebarOpen(true)}><Grid2X2 /><span>Browse</span></button>
    </nav>
  )
}
