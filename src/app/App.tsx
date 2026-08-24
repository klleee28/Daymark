import { useEffect } from 'react'
import { MainView } from '../components/MainView'
import { MobileTabBar } from '../components/MobileTabBar'
import { QuickAddSheet } from '../components/QuickAddSheet'
import { Sidebar } from '../components/Sidebar'
import { useUIStore } from '../store/uiStore'

export function App() {
  const setQuickAddOpen = useUIStore((state) => state.setQuickAddOpen)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setQuickAddOpen(true)
      }
      if (event.key === 'Escape') setQuickAddOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setQuickAddOpen])

  return (
    <div className="app-shell">
      <Sidebar />
      <MainView />
      <MobileTabBar />
      <QuickAddSheet />
    </div>
  )
}
