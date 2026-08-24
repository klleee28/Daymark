import { CalendarDays, Grid2X2, Inbox, Sun } from 'lucide-react'
import { useUIStore } from '../store/uiStore'

export function MobileTabBar() {
  const { activeView, activeProjectId, activeAreaId, setView, setSidebarOpen } = useUIStore()
  const smartViewActive = !activeProjectId && !activeAreaId
  return (
    <nav className="mobile-tabs" aria-label="Mobile navigation">
      <button className={smartViewActive && activeView === 'inbox' ? 'is-active' : ''} onClick={() => setView('inbox')}><Inbox /><span>Inbox</span></button>
      <button className={smartViewActive && activeView === 'today' ? 'is-active' : ''} onClick={() => setView('today')}><Sun /><span>Today</span></button>
      <button className={smartViewActive && activeView === 'upcoming' ? 'is-active' : ''} onClick={() => setView('upcoming')}><CalendarDays /><span>Upcoming</span></button>
      <button className={!smartViewActive ? 'is-active' : ''} onClick={() => setSidebarOpen(true)}><Grid2X2 /><span>Browse</span></button>
    </nav>
  )
}
