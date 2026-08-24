import { useEffect } from 'react'
import { AreaDialog } from '../components/AreaDialog'
import { MainView } from '../components/MainView'
import { MobileTabBar } from '../components/MobileTabBar'
import { QuickAddSheet } from '../components/QuickAddSheet'
import { ProjectDialog } from '../components/ProjectDialog'
import { SearchDialog } from '../components/SearchDialog'
import { SettingsDialog } from '../components/SettingsDialog'
import { Sidebar } from '../components/Sidebar'
import { useUIStore } from '../store/uiStore'

export function App() {
  const { setQuickAddOpen, setSearchOpen, setSettingsOpen, setAreaDialogOpen, setProjectDialogOpen, setMoreMenuOpen, themeMode } = useUIStore()

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.documentElement.style.colorScheme = themeMode === 'system' ? 'light dark' : themeMode
  }, [themeMode])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setQuickAddOpen(true)
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setQuickAddOpen(false)
        setSearchOpen(false)
        setSettingsOpen(false)
        setAreaDialogOpen(false)
        setProjectDialogOpen(false)
        setMoreMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setAreaDialogOpen, setMoreMenuOpen, setProjectDialogOpen, setQuickAddOpen, setSearchOpen, setSettingsOpen])

  return (
    <div className="app-shell">
      <Sidebar />
      <MainView />
      <MobileTabBar />
      <QuickAddSheet />
      <SearchDialog />
      <SettingsDialog />
      <AreaDialog />
      <ProjectDialog />
    </div>
  )
}
