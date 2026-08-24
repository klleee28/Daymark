import { CalendarDays, ChevronDown, ChevronRight, FileText, Folder, Tag } from 'lucide-react'
import { toggleChecklistItem, toggleTask } from '../db/mutations'
import type { Project, Task } from '../types/entities'
import { useUIStore } from '../store/uiStore'

interface TaskRowProps {
  task: Task
  project?: Project
}

export function TaskRow({ task, project }: TaskRowProps) {
  const expanded = useUIStore((state) => state.expandedTaskIds.has(task.id))
  const toggleExpandedTask = useUIStore((state) => state.toggleExpandedTask)
  const hasDetails = Boolean(task.notes || task.checklist.length)

  return (
    <article className={`task-row ${expanded ? 'task-row--expanded' : ''}`}>
      <div className="task-row__primary">
        <button className={`task-check ${task.status === 'completed' ? 'task-check--done' : ''}`} onClick={() => toggleTask(task)} aria-label={task.status === 'completed' ? `Restore ${task.title}` : `Complete ${task.title}`}>
          <span />
        </button>
        <button className="task-row__title" onClick={() => hasDetails && toggleExpandedTask(task.id)} aria-expanded={hasDetails ? expanded : undefined}>
          <span>{task.title}</span>
          {hasDetails ? expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} /> : null}
        </button>
        <div className="task-row__meta">
          {project ? <span><Folder size={14} />{project.title}</span> : null}
          {task.tags.length ? <span><Tag size={14} />{task.tags[0]}</span> : null}
          {task.when_date ? <span><CalendarDays size={14} />{task.is_evening ? 'This evening' : 'Today'}</span> : null}
        </div>
      </div>
      {expanded && hasDetails ? (
        <div className="task-details">
          {task.checklist.map((item) => (
            <button key={item.id} className={`checklist-item ${item.completed ? 'checklist-item--done' : ''}`} onClick={() => toggleChecklistItem(task, item.id)}>
              <span className="checklist-item__check" />
              <span>{item.title}</span>
            </button>
          ))}
          {task.notes ? <p className="task-note"><FileText size={16} /><span>{task.notes}</span></p> : null}
        </div>
      ) : null}
    </article>
  )
}
