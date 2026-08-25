import { ChevronRight, FolderPlus, MoreHorizontal, Plus } from 'lucide-react'
import { useMemo } from 'react'
import type { Area, Project, Task } from '../types/entities'

interface AreaProjectListProps {
  area: Area
  projects: Project[]
  tasks: Task[]
  onSelectProject: (projectId: string) => void
  onManageProject: (projectId: string) => void
  onAddProject: () => void
}

export function AreaProjectList({ area, projects, tasks, onSelectProject, onManageProject, onAddProject }: AreaProjectListProps) {
  const openCountByProject = useMemo(() => {
    const counts = new Map<string, number>()
    for (const task of tasks) {
      if (task.project_id && task.status !== 'completed' && !task.deleted_at) {
        counts.set(task.project_id, (counts.get(task.project_id) ?? 0) + 1)
      }
    }
    return counts
  }, [tasks])

  return (
    <section className="area-page" aria-labelledby="area-projects-title">
      <header className="area-page__toolbar">
        <div>
          <h2 id="area-projects-title">Projects</h2>
          <p>{projects.length ? `Everything organized under ${area.title}.` : `Start organizing ${area.title} with a project.`}</p>
        </div>
        <button onClick={onAddProject}><Plus size={17} />Add project</button>
      </header>

      {projects.length ? (
        <div className="area-project-grid">
          {projects.map((project) => {
            const openCount = openCountByProject.get(project.id) ?? 0
            return (
              <article key={project.id} className="area-project-card">
                <button className="area-project-card__open" onClick={() => onSelectProject(project.id)} aria-label={`Open ${project.title} project`}>
                  <span className="area-project-card__icon" style={{ color: area.color }}><FolderPlus size={20} /></span>
                  <span className="area-project-card__copy">
                    <strong>{project.title}</strong>
                    <small>{openCount} open to-do{openCount === 1 ? '' : 's'}</small>
                  </span>
                  <ChevronRight size={18} />
                </button>
                <button className="area-project-card__manage" onClick={() => onManageProject(project.id)} aria-label={`Manage ${project.title}`}><MoreHorizontal size={18} /></button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="area-page__empty">
          <span style={{ color: area.color }}><FolderPlus size={26} /></span>
          <h3>No projects yet</h3>
          <p>Add the first project to create sub-items in this area.</p>
          <button onClick={onAddProject}><Plus size={17} />Add first project</button>
        </div>
      )}
    </section>
  )
}
