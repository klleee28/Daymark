import { db } from './database'
import { dateFromToday, todayKey } from '../lib/date'
import type { SmartView } from '../lib/taskFilters'
import type { Area, Project, SyncMutation, Task } from '../types/entities'

function mutationId() {
  return crypto.randomUUID()
}

export interface CreateTaskInput {
  title: string
  destination: SmartView
  isEvening?: boolean
  projectId?: string | null
  tags?: string[]
}

function taskPlacement(view: SmartView) {
  return {
    status: view === 'inbox' ? 'inbox' as const : view === 'someday' ? 'someday' as const : 'todo' as const,
    when_date: view === 'today' ? todayKey() : view === 'upcoming' ? dateFromToday(1) : null
  }
}

export async function createTask({ title, destination, isEvening = false, projectId = null, tags = [] }: CreateTaskInput) {
  const now = Date.now()
  const project = projectId ? await db.projects.get(projectId) : undefined
  const placement = taskPlacement(destination)
  const task: Task = {
    id: crypto.randomUUID(), title, status: placement.status,
    project_id: project?.id ?? null, area_id: project?.area_id ?? null, heading_id: null, notes: '', is_evening: destination === 'today' && isEvening,
    when_date: placement.when_date, deadline: null, checklist: [], tags,
    recurrence_rule: null, completed_at: null, completed_from_status: null, order: now, created_at: now, updated_at: now, deleted_at: null
  }

  await db.transaction('rw', [db.tasks, db.sync_mutations], async () => {
    await db.tasks.add(task)
    await db.sync_mutations.add({ id: mutationId(), entity: 'task', entity_id: task.id, action: 'create', payload: task as unknown as Record<string, unknown>, timestamp: now, synced: false })
  })
}

export async function createArea(title: string, color: string) {
  const now = Date.now()
  const area: Area = { id: crypto.randomUUID(), title, color, order: now, created_at: now, updated_at: now, deleted_at: null }
  await db.transaction('rw', [db.areas, db.sync_mutations], async () => {
    await db.areas.add(area)
    await db.sync_mutations.add({ id: mutationId(), entity: 'area', entity_id: area.id, action: 'create', payload: area as unknown as Record<string, unknown>, timestamp: now, synced: false })
  })
  return area
}

export async function renameArea(area: Area, title: string) {
  const now = Date.now()
  const patch = { title, updated_at: now }
  await db.transaction('rw', [db.areas, db.sync_mutations], async () => {
    await db.areas.update(area.id, patch)
    await db.sync_mutations.add({ id: mutationId(), entity: 'area', entity_id: area.id, action: 'update', payload: patch, timestamp: now, synced: false })
  })
}

export async function deleteArea(area: Area) {
  const now = Date.now()
  const projects = await db.projects.where('area_id').equals(area.id).filter((project) => !project.deleted_at).toArray()
  const tasks = await db.tasks.where('area_id').equals(area.id).filter((task) => !task.deleted_at).toArray()
  const projectIds = projects.map((project) => project.id)
  const headings = projectIds.length
    ? await db.headings.where('project_id').anyOf(projectIds).filter((heading) => !heading.deleted_at).toArray()
    : []
  const patch = { deleted_at: now, updated_at: now }
  const mutations: SyncMutation[] = [
    { id: mutationId(), entity: 'area', entity_id: area.id, action: 'delete', payload: patch, timestamp: now, synced: false },
    ...projects.map((project) => ({ id: mutationId(), entity: 'project' as const, entity_id: project.id, action: 'delete' as const, payload: patch, timestamp: now, synced: false })),
    ...headings.map((heading) => ({ id: mutationId(), entity: 'heading' as const, entity_id: heading.id, action: 'delete' as const, payload: patch, timestamp: now, synced: false })),
    ...tasks.map((task) => ({ id: mutationId(), entity: 'task' as const, entity_id: task.id, action: 'delete' as const, payload: patch, timestamp: now, synced: false }))
  ]

  await db.transaction('rw', [db.areas, db.projects, db.headings, db.tasks, db.sync_mutations], async () => {
    await db.areas.update(area.id, patch)
    if (projects.length) await db.projects.bulkUpdate(projects.map((project) => ({ key: project.id, changes: patch })))
    if (headings.length) await db.headings.bulkUpdate(headings.map((heading) => ({ key: heading.id, changes: patch })))
    if (tasks.length) await db.tasks.bulkUpdate(tasks.map((task) => ({ key: task.id, changes: patch })))
    await db.sync_mutations.bulkAdd(mutations)
  })
}

export async function createProject(title: string, areaId: string) {
  const now = Date.now()
  const project: Project = {
    id: crypto.randomUUID(), area_id: areaId, title, notes: '', status: 'active',
    when_date: null, deadline: null, order: now, created_at: now, updated_at: now, deleted_at: null
  }
  await db.transaction('rw', [db.projects, db.sync_mutations], async () => {
    await db.projects.add(project)
    await db.sync_mutations.add({ id: mutationId(), entity: 'project', entity_id: project.id, action: 'create', payload: project as unknown as Record<string, unknown>, timestamp: now, synced: false })
  })
  return project
}

export async function updateTask(task: Task, patch: Partial<Task>) {
  const now = Date.now()
  const payload = { ...patch, updated_at: now }
  await db.transaction('rw', [db.tasks, db.sync_mutations], async () => {
    await db.tasks.update(task.id, payload)
    await db.sync_mutations.add({ id: mutationId(), entity: 'task', entity_id: task.id, action: 'update', payload, timestamp: now, synced: false })
  })
}

export async function categorizeTask(task: Task, projectId: string | null) {
  const project = projectId ? await db.projects.get(projectId) : undefined
  await updateTask(task, { project_id: project?.id ?? null, area_id: project?.area_id ?? null, heading_id: null })
}

export async function moveTaskToView(task: Task, destination: SmartView) {
  const placement = taskPlacement(destination)
  await updateTask(task, {
    status: placement.status,
    when_date: placement.when_date,
    is_evening: destination === 'today' ? task.is_evening : false,
    completed_at: null,
    completed_from_status: null
  })
}

export async function toggleTask(task: Task) {
  const now = Date.now()
  const restoring = task.status === 'completed'
  const status: Task['status'] = restoring ? task.completed_from_status ?? 'todo' : 'completed'
  const completedFromStatus: Task['completed_from_status'] = restoring ? null : task.status as Exclude<Task['status'], 'completed'>
  const patch = {
    status,
    completed_at: restoring ? null : now,
    completed_from_status: completedFromStatus,
    updated_at: now
  }

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
