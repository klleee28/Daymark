import { useEffect } from 'react'
import { AreaDialog } from '../components/AreaDialog'
import { AreaManageDialog } from '../components/AreaManageDialog'
import { MainView } from '../components/MainView'
import { MobileTabBar } from '../components/MobileTabBar'
import { QuickAddSheet } from '../components/QuickAddSheet'
import { ProjectDialog } from '../components/ProjectDialog'
import { ProjectManageDialog } from '../components/ProjectManageDialog'
import { SearchDialog } from '../components/SearchDialog'
import { SettingsDialog } from '../components/SettingsDialog'
import { Sidebar } from '../components/Sidebar'
import { TaskManageDialog } from '../components/TaskManageDialog'
import { useUIStore } from '../store/uiStore'

export function App() {
  const { setQuickAddOpen, setSearchOpen, setSettingsOpen, setAreaDialogOpen, setProjectDialogOpen, setManagedAreaId, setManagedProjectId, setManagedTaskId, setMoreMenuOpen, themeMode } = useUIStore()

  useEffect(() => {
    const preference = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolvedTheme = themeMode === 'system' ? (preference.matches ? 'dark' : 'light') : themeMode
      document.documentElement.dataset.theme = resolvedTheme
      document.documentElement.style.colorScheme = resolvedTheme
    }
    applyTheme()
    if (themeMode === 'system') preference.addEventListener('change', applyTheme)
    return () => preference.removeEventListener('change', applyTheme)
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
        setManagedAreaId(null)
        setManagedProjectId(null)
        setManagedTaskId(null)
        setMoreMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setAreaDialogOpen, setManagedAreaId, setManagedProjectId, setManagedTaskId, setMoreMenuOpen, setProjectDialogOpen, setQuickAddOpen, setSearchOpen, setSettingsOpen])

  return (
    <div className="app-shell">
      <Sidebar />
      <MainView />
      <MobileTabBar />
      <QuickAddSheet />
      <SearchDialog />
      <SettingsDialog />
      <AreaDialog />
      <AreaManageDialog />
      <ProjectDialog />
      <ProjectManageDialog />
      <TaskManageDialog />
    </div>
  )
}
