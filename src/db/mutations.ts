import { db } from './database'
import { todayKey } from '../lib/date'
import type { SmartView } from '../lib/taskFilters'
import type { Task } from '../types/entities'

function mutationId() {
  return crypto.randomUUID()
}

export async function createTask(title: string, view: SmartView, isEvening = false) {
  const now = Date.now()
  const task: Task = {
    id: crypto.randomUUID(), title, status: view === 'inbox' ? 'inbox' : view === 'someday' ? 'someday' : 'todo',
    project_id: null, area_id: null, heading_id: null, notes: '', is_evening: isEvening,
    when_date: view === 'today' ? todayKey() : null, deadline: null, checklist: [], tags: [],
    recurrence_rule: null, completed_at: null, order: now, created_at: now, updated_at: now, deleted_at: null
  }

  await db.transaction('rw', [db.tasks, db.sync_mutations], async () => {
    await db.tasks.add(task)
    await db.sync_mutations.add({ id: mutationId(), entity: 'task', entity_id: task.id, action: 'create', payload: task as unknown as Record<string, unknown>, timestamp: now, synced: false })
  })
}

export async function toggleTask(task: Task) {
  const now = Date.now()
  const status = task.status === 'completed' ? 'todo' : 'completed'
  const patch = { status, completed_at: status === 'completed' ? now : null, updated_at: now } as const

  await db.transaction('rw', [db.tasks, db.sync_mutations], async () => {
    await db.tasks.update(task.id, patch)
    await db.sync_mutations.add({ id: mutationId(), entity: 'task', entity_id: task.id, action: 'update', payload: patch, timestamp: now, synced: false })
  })
}

export async function toggleChecklistItem(task: Task, checklistId: string) {
  const now = Date.now()
  const checklist = task.checklist.map((item) => item.id === checklistId ? { ...item, completed: !item.completed } : item)
  const patch = { checklist, updated_at: now }
  await db.transaction('rw', [db.tasks, db.sync_mutations], async () => {
    await db.tasks.update(task.id, patch)
    await db.sync_mutations.add({ id: mutationId(), entity: 'task', entity_id: task.id, action: 'update', payload: patch, timestamp: now, synced: false })
  })
}
