import { ArrowDownAZ, Check, FolderTree, ListOrdered, Menu, MoreHorizontal, Plus, Search, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigationData, useTasks } from '../hooks/useDatabase'
import { friendlyToday } from '../lib/date'
import { viewTitle } from '../lib/taskFilters'
import { useUIStore } from '../store/uiStore'
import { ProgressRing } from './ProgressRing'
import { AreaProjectList } from './AreaProjectList'
import { TaskSection } from './TaskSection'

export function MainView() {
  const { activeView, activeProjectId, activeAreaId, setProject, setManagedProjectId, setProjectDialogOpen, setQuickAddOpen, setSidebarOpen, setSearchOpen, moreMenuOpen, setMoreMenuOpen, sortMode, setSortMode } = useUIStore()
  const { areas, projects, tasks: allTasks } = useNavigationData()
  const tasks = useTasks(activeView, activeProjectId)
  const mainRef = useRef<HTMLElement>(null)
  const activeProject = projects.find((project) => project.id === activeProjectId)
  const activeArea = areas.find((area) => area.id === activeAreaId)
  const areaProjects = activeArea ? projects.filter((project) => project.area_id === activeArea.id) : []
  const headerTasks = activeArea ? allTasks.filter((task) => task.area_id === activeArea.id) : tasks
  const completed = headerTasks.filter((task) => task.status === 'completed').length
  const visibleTasks = useMemo(() => {
    const displayTasks = activeView === 'logbook' ? tasks : tasks.filter((task) => task.status !== 'completed')
    if (sortMode === 'title') return displayTasks.slice().sort((a, b) => a.title.localeCompare(b.title))
    if (sortMode === 'project') {
      const projectNames = new Map(projects.map((project) => [project.id, project.title]))
      return displayTasks.slice().sort((a, b) => (projectNames.get(a.project_id ?? '') ?? '').localeCompare(projectNames.get(b.project_id ?? '') ?? '') || a.title.localeCompare(b.title))
    }
    return displayTasks
  }, [activeView, projects, sortMode, tasks])
  const title = activeProject?.title ?? activeArea?.title ?? viewTitle(activeView)
  const morning = activeView === 'today' ? visibleTasks.filter((task) => !task.is_evening).slice(0, 2) : visibleTasks
  const anytime = activeView === 'today' ? visibleTasks.filter((task) => !task.is_evening).slice(2) : []
  const evening = activeView === 'today' ? visibleTasks.filter((task) => task.is_evening) : []

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [activeAreaId, activeProjectId, activeView])

  return (
    <main ref={mainRef} className="main-view">
      <div className="main-view__toolbar">
        <button className="main-view__menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
        <span />
        <div className="main-view__tools">
          <button onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={18} /><span>Search</span></button>
          {!activeArea ? <div className="more-menu-wrap">
            <button aria-label="More options" aria-expanded={moreMenuOpen} onClick={() => setMoreMenuOpen(!moreMenuOpen)}><MoreHorizontal size={20} /></button>
            {moreMenuOpen ? (
              <div className="more-menu" role="menu" aria-label="Task sorting">
                <span>Sort to-dos</span>
                <button role="menuitem" onClick={() => setSortMode('manual')}><ListOrdered size={16} />Created order{sortMode === 'manual' ? <Check size={15} /> : null}</button>
                <button role="menuitem" onClick={() => setSortMode('title')}><ArrowDownAZ size={16} />Title A–Z{sortMode === 'title' ? <Check size={15} /> : null}</button>
                <button role="menuitem" onClick={() => setSortMode('project')}><FolderTree size={16} />Project{sortMode === 'project' ? <Check size={15} /> : null}</button>
              </div>
            ) : null}
          </div> : null}
        </div>
      </div>

      <div className="content-wrap">
        <header className="page-header">
          <ProgressRing completed={completed} total={headerTasks.length} />
          <div className="page-header__copy">
            <h1>{title}</h1>
            <p>{activeProject ? (activeProject.notes || 'Project') : activeArea ? `${areaProjects.length} project${areaProjects.length === 1 ? '' : 's'}` : activeView === 'today' ? friendlyToday() : activeView === 'logbook' ? `${visibleTasks.length} completed to-do${visibleTasks.length === 1 ? '' : 's'}` : `${visibleTasks.length} open to-do${visibleTasks.length === 1 ? '' : 's'}`}</p>
          </div>
          {activeProject ? <button className="page-header__manage" onClick={() => setManagedProjectId(activeProject.id)}><Settings2 size={16} />Edit project</button> : null}
        </header>

        <div className="task-list">
          {activeArea ? (
            <AreaProjectList area={activeArea} projects={areaProjects} tasks={allTasks} onSelectProject={setProject} onManageProject={setManagedProjectId} onAddProject={() => setProjectDialogOpen(true)} />
          ) : visibleTasks.length ? (
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
