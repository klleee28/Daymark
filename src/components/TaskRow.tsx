import { CalendarDays, ChevronDown, ChevronRight, FileText, Folder, MoreHorizontal, Tag } from 'lucide-react'
import { categorizeTask, moveTaskToView, toggleChecklistItem, toggleTask, updateTask } from '../db/mutations'
import { dateFromToday, todayKey } from '../lib/date'
import type { SmartView } from '../lib/taskFilters'
import type { Project, Task } from '../types/entities'
import { useUIStore } from '../store/uiStore'

interface TaskRowProps {
  task: Task
  project?: Project
  projects: Project[]
}

function taskDestination(task: Task): SmartView {
  if (task.status === 'inbox') return 'inbox'
  if (task.status === 'someday') return 'someday'
  if (task.when_date && task.when_date > todayKey()) return 'upcoming'
  if (task.when_date) return 'today'
  return 'anytime'
}

function scheduleLabel(task: Task) {
  if (!task.when_date) return ''
  if (task.when_date === todayKey()) return task.is_evening ? 'This evening' : 'Today'
  if (task.when_date === dateFromToday(1)) return 'Tomorrow'
  return task.when_date
}

export function TaskRow({ task, project, projects }: TaskRowProps) {
  const expanded = useUIStore((state) => state.expandedTaskIds.has(task.id))
  const toggleExpandedTask = useUIStore((state) => state.toggleExpandedTask)
  const setManagedTaskId = useUIStore((state) => state.setManagedTaskId)

  return (
    <article className={`task-row ${expanded ? 'task-row--expanded' : ''}`}>
      <div className="task-row__primary">
        <button className={`task-check ${task.status === 'completed' ? 'task-check--done' : ''}`} onClick={() => toggleTask(task)} aria-label={task.status === 'completed' ? `Restore ${task.title}` : `Complete ${task.title}`}>
          <span />
        </button>
        <button className="task-row__title" onClick={() => toggleExpandedTask(task.id)} aria-expanded={expanded}>
          <span>{task.title}</span>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="task-row__meta">
          {project ? <span><Folder size={14} />{project.title}</span> : null}
          {task.tags.length ? <span><Tag size={14} />{task.tags[0]}</span> : null}
          {task.when_date ? <span><CalendarDays size={14} />{scheduleLabel(task)}</span> : null}
        </div>
        <button className="task-row__manage" onClick={() => setManagedTaskId(task.id)} aria-label={`Edit ${task.title}`}><MoreHorizontal size={18} /></button>
      </div>

      {expanded ? (
        <div className="task-details">
          {task.checklist.map((item) => (
            <button key={item.id} className={`checklist-item ${item.completed ? 'checklist-item--done' : ''}`} onClick={() => toggleChecklistItem(task, item.id)}>
              <span className="checklist-item__check" />
              <span>{item.title}</span>
            </button>
          ))}
          {task.notes ? <p className="task-note"><FileText size={16} /><span>{task.notes}</span></p> : null}

          <div className="task-categorize" aria-label={`Categorize ${task.title}`}>
            <label>
              <span>List</span>
              <select aria-label={`List for ${task.title}`} value={taskDestination(task)} onChange={(event) => void moveTaskToView(task, event.target.value as SmartView)}>
                <option value="inbox">Inbox</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming (tomorrow)</option>
                <option value="anytime">Anytime</option>
                <option value="someday">Someday</option>
              </select>
            </label>
            <label>
              <span>Project</span>
              <select aria-label={`Project for ${task.title}`} value={task.project_id ?? ''} onChange={(event) => void categorizeTask(task, event.target.value || null)}>
                <option value="">No project</option>
                {projects.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </label>
            <label className="task-categorize__tags">
              <span>Tags</span>
              <input aria-label={`Tags for ${task.title}`} defaultValue={task.tags.join(', ')} placeholder="focus, errands" onBlur={(event) => {
                const tags = event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                if (tags.join('|') !== task.tags.join('|')) void updateTask(task, { tags })
              }} />
            </label>
          </div>
        </div>
      ) : null}
    </article>
  )
}
