import { create } from 'zustand'
import type { SmartView } from '../lib/taskFilters'

interface UIState {
  activeView: SmartView
  activeProjectId: string | null
  quickAddOpen: boolean
  sidebarOpen: boolean
  expandedTaskIds: Set<string>
  setView: (view: SmartView) => void
  setProject: (projectId: string) => void
  setQuickAddOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
  toggleExpandedTask: (taskId: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'today',
  activeProjectId: null,
  quickAddOpen: false,
  sidebarOpen: false,
  expandedTaskIds: new Set(['planning']),
  setView: (activeView) => set({ activeView, activeProjectId: null, sidebarOpen: false }),
  setProject: (activeProjectId) => set({ activeProjectId, sidebarOpen: false }),
  setQuickAddOpen: (quickAddOpen) => set({ quickAddOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleExpandedTask: (taskId) => set((state) => {
    const expandedTaskIds = new Set(state.expandedTaskIds)
    expandedTaskIds.has(taskId) ? expandedTaskIds.delete(taskId) : expandedTaskIds.add(taskId)
    return { expandedTaskIds }
  })
}))
