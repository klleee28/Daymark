import {
  Archive,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Inbox,
  Layers3,
  MoreHorizontal,
  Plus,
  Settings2,
  Sparkles,
  Sun
} from 'lucide-react'
import { AppLogo } from './AppLogo'
import { useNavigationData } from '../hooks/useDatabase'
import { taskBelongsToView, type SmartView } from '../lib/taskFilters'
import { useUIStore } from '../store/uiStore'

const smartViews: Array<{ id: SmartView; label: string; icon: typeof Inbox }> = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'today', label: 'Today', icon: Sun },
  { id: 'upcoming', label: 'Upcoming', icon: CalendarDays },
  { id: 'anytime', label: 'Anytime', icon: Layers3 },
  { id: 'someday', label: 'Someday', icon: Archive },
  { id: 'logbook', label: 'Logbook', icon: BookOpen }
]

export function Sidebar() {
  const { activeView, activeProjectId, activeAreaId, setView, setProject, setArea, setManagedAreaId, setManagedProjectId, sidebarOpen, setSidebarOpen, setAreaDialogOpen, setSettingsOpen, collapsedAreaIds, toggleArea } = useUIStore()
  const { areas, projects, tasks, pendingMutations } = useNavigationData()

  return (
    <>
      {sidebarOpen ? <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" /> : null}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand"><AppLogo /></div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          {smartViews.map(({ id, label, icon: Icon }) => {
            const count = tasks.filter((task) => taskBelongsToView(task, id) && (id === 'logbook' || task.status !== 'completed')).length
            return (
              <button key={id} className={`nav-item ${activeView === id && !activeProjectId && !activeAreaId ? 'nav-item--active' : ''}`} onClick={() => setView(id)}>
                <Icon size={19} strokeWidth={1.8} />
                <span>{label}</span>
                {count > 0 ? <span className="nav-item__count">{count}</span> : null}
              </button>
            )
          })}
        </nav>

        <div className="sidebar__section-title">
          <span>Areas</span>
          <button aria-label="Add an area" onClick={() => setAreaDialogOpen(true)}><Plus size={17} /></button>
        </div>

        <div className="area-list">
          {areas.map((area) => {
            const areaProjects = projects.filter((project) => project.area_id === area.id)
            const collapsed = collapsedAreaIds.has(area.id)
            return (
              <div className="area" key={area.id}>
                <div className="area__heading">
                  <button className="area__toggle" onClick={() => toggleArea(area.id)} aria-expanded={!collapsed} aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${area.title}`}>
                    {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                  </button>
                  <button className={`area__title ${activeAreaId === area.id ? 'area__title--active' : ''}`} onClick={() => setArea(area.id)} aria-current={activeAreaId === area.id ? 'page' : undefined}>
                    {area.id === 'work' ? <BriefcaseBusiness size={17} style={{ color: area.color }} /> : <Sparkles size={17} style={{ color: area.color }} />}
                    <span>{area.title}</span>
                  </button>
                  <button className="area__actions" onClick={() => setManagedAreaId(area.id)} aria-label={`Manage ${area.title}`}><MoreHorizontal size={17} /></button>
                </div>
                {!collapsed ? <div className="area__projects">
                  {areaProjects.map((project) => {
                    const count = tasks.filter((task) => task.project_id === project.id && task.status !== 'completed' && !task.deleted_at).length
                    return (
                      <div className="project-item-wrap" key={project.id}>
                        <button className={`project-item ${activeProjectId === project.id ? 'project-item--active' : ''}`} onClick={() => setProject(project.id)}>
                          <span className="project-item__dot" style={{ background: area.color }} />
                          <span>{project.title}</span>
                          {count ? <span className="nav-item__count">{count}</span> : null}
                        </button>
                        <button className="project-item__manage" onClick={() => setManagedProjectId(project.id)} aria-label={`Manage ${project.title}`}><MoreHorizontal size={16} /></button>
                      </div>
                    )
                  })}
                </div> : null}
              </div>
            )
          })}
        </div>

        <div className="sidebar__footer">
          <div className="sync-status">
            <span className={`sync-status__dot ${pendingMutations ? 'sync-status__dot--pending' : ''}`} />
            <span>{pendingMutations ? `${pendingMutations} local change${pendingMutations === 1 ? '' : 's'}` : 'Stored on this device'}</span>
          </div>
          <button aria-label="Settings" onClick={() => setSettingsOpen(true)}><Settings2 size={18} /></button>
        </div>
      </aside>
    </>
  )
}
