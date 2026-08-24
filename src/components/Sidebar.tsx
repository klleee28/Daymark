import {
  Archive,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleDashed,
  Inbox,
  Layers3,
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
  const { activeView, activeProjectId, setView, setProject, sidebarOpen, setSidebarOpen } = useUIStore()
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
              <button key={id} className={`nav-item ${activeView === id && !activeProjectId ? 'nav-item--active' : ''}`} onClick={() => setView(id)}>
                <Icon size={19} strokeWidth={1.8} />
                <span>{label}</span>
                {count > 0 ? <span className="nav-item__count">{count}</span> : null}
              </button>
            )
          })}
        </nav>

        <div className="sidebar__section-title">
          <span>Areas</span>
          <button aria-label="Add an area"><Plus size={17} /></button>
        </div>

        <div className="area-list">
          {areas.map((area) => {
            const areaProjects = projects.filter((project) => project.area_id === area.id)
            return (
              <div className="area" key={area.id}>
                <div className="area__title">
                  <ChevronDown size={15} />
                  {area.id === 'work' ? <BriefcaseBusiness size={17} style={{ color: area.color }} /> : <Sparkles size={17} style={{ color: area.color }} />}
                  <span>{area.title}</span>
                </div>
                <div className="area__projects">
                  {areaProjects.map((project) => {
                    const count = tasks.filter((task) => task.project_id === project.id && task.status !== 'completed' && !task.deleted_at).length
                    return (
                      <button key={project.id} className={`project-item ${activeProjectId === project.id ? 'project-item--active' : ''}`} onClick={() => setProject(project.id)}>
                        <span className="project-item__dot" style={{ background: area.color }} />
                        <span>{project.title}</span>
                        {count ? <span className="nav-item__count">{count}</span> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="sidebar__footer">
          <div className="sync-status">
            <span className={`sync-status__dot ${pendingMutations ? 'sync-status__dot--pending' : ''}`} />
            <span>{pendingMutations ? `${pendingMutations} local change${pendingMutations === 1 ? '' : 's'}` : 'All changes synced'}</span>
          </div>
          <button aria-label="Settings"><Settings2 size={18} /></button>
        </div>
      </aside>
    </>
  )
}
