import type { Task } from '../types/entities'
import { todayKey } from './date'

export type SmartView = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'someday' | 'logbook'

export function taskBelongsToView(task: Task, view: SmartView): boolean {
  if (task.deleted_at) return false
  const today = todayKey()

  switch (view) {
    case 'inbox':
      return task.status === 'inbox'
    case 'today':
      return (task.status === 'todo' || task.status === 'completed') && task.when_date === today
    case 'upcoming':
      return task.status === 'todo' && Boolean(task.when_date && task.when_date > today)
    case 'anytime':
      return task.status === 'todo' && !task.when_date
    case 'someday':
      return task.status === 'someday'
    case 'logbook':
      return task.status === 'completed'
  }
}

export function viewTitle(view: SmartView) {
  return view.charAt(0).toUpperCase() + view.slice(1)
}
