import { create } from 'zustand'
import type { SmartView } from '../lib/taskFilters'

export type ThemeMode = 'system' | 'light' | 'dark'
export type SortMode = 'manual' | 'title' | 'project'

interface UIState {
  activeView: SmartView
  activeProjectId: string | null
  activeAreaId: string | null
  quickAddOpen: boolean
  sidebarOpen: boolean
  searchOpen: boolean
  settingsOpen: boolean
  areaDialogOpen: boolean
  projectDialogOpen: boolean
  moreMenuOpen: boolean
  themeMode: ThemeMode
  sortMode: SortMode
  expandedTaskIds: Set<string>
  collapsedSections: Set<string>
  collapsedAreaIds: Set<string>
  setView: (view: SmartView) => void
  setProject: (projectId: string) => void
  setArea: (areaId: string) => void
  setQuickAddOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setAreaDialogOpen: (open: boolean) => void
  setProjectDialogOpen: (open: boolean) => void
  setMoreMenuOpen: (open: boolean) => void
  setThemeMode: (mode: ThemeMode) => void
  setSortMode: (mode: SortMode) => void
  toggleExpandedTask: (taskId: string) => void
  toggleSection: (sectionId: string) => void
  toggleArea: (areaId: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'today',
  activeProjectId: null,
  activeAreaId: null,
  quickAddOpen: false,
  sidebarOpen: false,
  searchOpen: false,
  settingsOpen: false,
  areaDialogOpen: false,
  projectDialogOpen: false,
  moreMenuOpen: false,
  themeMode: (localStorage.getItem('daymark-theme') as ThemeMode | null) ?? 'system',
  sortMode: 'manual',
  expandedTaskIds: new Set(['planning']),
  collapsedSections: new Set(),
  collapsedAreaIds: new Set(),
  setView: (activeView) => set({ activeView, activeProjectId: null, activeAreaId: null, sidebarOpen: false }),
  setProject: (activeProjectId) => set({ activeProjectId, activeAreaId: null, sidebarOpen: false }),
  setArea: (activeAreaId) => set({ activeAreaId, activeProjectId: null, sidebarOpen: false }),
  setQuickAddOpen: (quickAddOpen) => set({ quickAddOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setAreaDialogOpen: (areaDialogOpen) => set({ areaDialogOpen }),
  setProjectDialogOpen: (projectDialogOpen) => set({ projectDialogOpen }),
  setMoreMenuOpen: (moreMenuOpen) => set({ moreMenuOpen }),
  setThemeMode: (themeMode) => {
    localStorage.setItem('daymark-theme', themeMode)
    set({ themeMode })
  },
  setSortMode: (sortMode) => set({ sortMode, moreMenuOpen: false }),
  toggleExpandedTask: (taskId) => set((state) => {
    const expandedTaskIds = new Set(state.expandedTaskIds)
    expandedTaskIds.has(taskId) ? expandedTaskIds.delete(taskId) : expandedTaskIds.add(taskId)
    return { expandedTaskIds }
  }),
  toggleSection: (sectionId) => set((state) => {
    const collapsedSections = new Set(state.collapsedSections)
    collapsedSections.has(sectionId) ? collapsedSections.delete(sectionId) : collapsedSections.add(sectionId)
    return { collapsedSections }
  }),
  toggleArea: (areaId) => set((state) => {
    const collapsedAreaIds = new Set(state.collapsedAreaIds)
    collapsedAreaIds.has(areaId) ? collapsedAreaIds.delete(areaId) : collapsedAreaIds.add(areaId)
    return { collapsedAreaIds }
  })
}))
