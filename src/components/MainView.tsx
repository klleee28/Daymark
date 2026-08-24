import { ArrowDownAZ, Check, FolderTree, ListOrdered, Menu, MoreHorizontal, Plus, Search } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigationData, useTasks } from '../hooks/useDatabase'
import { friendlyToday } from '../lib/date'
import { viewTitle } from '../lib/taskFilters'
import { useUIStore } from '../store/uiStore'
import { ProgressRing } from './ProgressRing'
import { TaskSection } from './TaskSection'

export function MainView() {
  const { activeView, activeProjectId, setQuickAddOpen, setSidebarOpen, setSearchOpen, moreMenuOpen, setMoreMenuOpen, sortMode, setSortMode } = useUIStore()
  const { projects } = useNavigationData()
  const tasks = useTasks(activeView, activeProjectId)
  const activeProject = projects.find((project) => project.id === activeProjectId)
  const completed = tasks.filter((task) => task.status === 'completed').length
  const visibleTasks = useMemo(() => {
    const displayTasks = activeView === 'logbook' ? tasks : tasks.filter((task) => task.status !== 'completed')
    if (sortMode === 'title') return displayTasks.slice().sort((a, b) => a.title.localeCompare(b.title))
    if (sortMode === 'project') {
      const projectNames = new Map(projects.map((project) => [project.id, project.title]))
      return displayTasks.slice().sort((a, b) => (projectNames.get(a.project_id ?? '') ?? '').localeCompare(projectNames.get(b.project_id ?? '') ?? '') || a.title.localeCompare(b.title))
    }
    return displayTasks
  }, [activeView, projects, sortMode, tasks])
  const title = activeProject?.title ?? viewTitle(activeView)
  const morning = activeView === 'today' ? visibleTasks.filter((task) => !task.is_evening).slice(0, 2) : visibleTasks
  const anytime = activeView === 'today' ? visibleTasks.filter((task) => !task.is_evening).slice(2) : []
  const evening = activeView === 'today' ? visibleTasks.filter((task) => task.is_evening) : []

  return (
    <main className="main-view">
      <div className="main-view__toolbar">
        <button className="main-view__menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
        <span />
        <div className="main-view__tools">
          <button onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={18} /><span>Search</span></button>
          <div className="more-menu-wrap">
            <button aria-label="More options" aria-expanded={moreMenuOpen} onClick={() => setMoreMenuOpen(!moreMenuOpen)}><MoreHorizontal size={20} /></button>
            {moreMenuOpen ? (
              <div className="more-menu" role="menu" aria-label="Task sorting">
                <span>Sort to-dos</span>
                <button role="menuitem" onClick={() => setSortMode('manual')}><ListOrdered size={16} />My order{sortMode === 'manual' ? <Check size={15} /> : null}</button>
                <button role="menuitem" onClick={() => setSortMode('title')}><ArrowDownAZ size={16} />Title A–Z{sortMode === 'title' ? <Check size={15} /> : null}</button>
                <button role="menuitem" onClick={() => setSortMode('project')}><FolderTree size={16} />Project{sortMode === 'project' ? <Check size={15} /> : null}</button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="content-wrap">
        <header className="page-header">
          <ProgressRing completed={completed} total={tasks.length} />
          <div>
            <h1>{title}</h1>
            <p>{activeProject ? 'Project' : activeView === 'today' ? friendlyToday() : `${visibleTasks.length} open to-do${visibleTasks.length === 1 ? '' : 's'}`}</p>
          </div>
        </header>

        <div className="task-list">
          {visibleTasks.length ? (
            activeView === 'today' && !activeProjectId ? (
              <>
                <TaskSection title="Morning" tone="morning" tasks={morning} projects={projects} />
                <TaskSection title="Anytime" tone="anytime" tasks={anytime} projects={projects} />
                <TaskSection title="This Evening" tone="evening" tasks={evening} projects={projects} />
              </>
            ) : <TaskSection title={activeProject ? 'To-dos' : title} tone="neutral" tasks={visibleTasks} projects={projects} />
          ) : (
            <div className="empty-state">
              <span className="empty-state__check">✓</span>
              <h2>You’re all clear</h2>
              <p>Capture something new or enjoy the breathing room.</p>
            </div>
          )}
        </div>
      </div>

      <button className="floating-add" onClick={() => setQuickAddOpen(true)} aria-label="Add a to-do"><Plus size={30} /><span>Add a to-do</span></button>
    </main>
  )
}
