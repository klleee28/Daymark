import { ChevronDown, Layers3, Moon, SunMedium } from 'lucide-react'
import type { Project, Task } from '../types/entities'
import { TaskRow } from './TaskRow'

type SectionTone = 'morning' | 'anytime' | 'evening' | 'neutral'

interface TaskSectionProps {
  title: string
  tone: SectionTone
  tasks: Task[]
  projects: Project[]
}

const icons = { morning: SunMedium, anytime: Layers3, evening: Moon, neutral: Layers3 }

export function TaskSection({ title, tone, tasks, projects }: TaskSectionProps) {
  if (!tasks.length) return null
  const Icon = icons[tone]
  return (
    <section className={`task-section task-section--${tone}`}>
      <header className="task-section__header">
        <span className="task-section__name"><Icon size={17} /><span>{title}</span></span>
        <ChevronDown size={17} />
      </header>
      <div className="task-section__rows">
        {tasks.map((task) => <TaskRow key={task.id} task={task} project={projects.find((project) => project.id === task.project_id)} />)}
      </div>
    </section>
  )
}
