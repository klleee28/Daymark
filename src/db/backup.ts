import { db } from './database'
import { cleanupExpiredLogbook, isLogbookTaskExpired, LOGBOOK_RETENTION_DAYS } from './logbook'
import type { Area, EntityType, Heading, Project, SyncMutation, Task } from '../types/entities'

export const MAX_BACKUP_FILE_SIZE = 10 * 1024 * 1024
const BACKUP_INITIALIZED_KEY = 'daymark-database-initialized'
const themes = new Set(['system', 'light', 'dark'])
const projectStatuses = new Set(['active', 'completed', 'canceled', 'someday'])
const taskStatuses = new Set(['inbox', 'todo', 'completed', 'canceled', 'someday'])
const restorableTaskStatuses = new Set(['inbox', 'todo', 'canceled', 'someday'])

type BackupTheme = 'system' | 'light' | 'dark'

export interface DaymarkBackup {
  app: 'Daymark'
  format_version: 1
  exported_at: string
  logbook_retention_days: number
  settings: { theme: BackupTheme }
  data: {
    areas: Area[]
    projects: Project[]
    headings: Heading[]
    tasks: Task[]
  }
}

export async function createBackup(): Promise<DaymarkBackup> {
  await cleanupExpiredLogbook()
  const [areas, projects, headings, tasks] = await Promise.all([
    db.areas.orderBy('order').filter((area) => !area.deleted_at).toArray(),
    db.projects.orderBy('order').filter((project) => !project.deleted_at).toArray(),
    db.headings.orderBy('order').filter((heading) => !heading.deleted_at).toArray(),
    db.tasks.orderBy('order').filter((task) => !task.deleted_at).toArray()
  ])

  const savedTheme = localStorage.getItem('daymark-theme')
  return {
    app: 'Daymark',
    format_version: 1,
    exported_at: new Date().toISOString(),
    logbook_retention_days: LOGBOOK_RETENTION_DAYS,
    settings: { theme: themes.has(savedTheme ?? '') ? savedTheme as BackupTheme : 'system' },
    data: { areas, projects, headings, tasks }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOptionalString(value: unknown) {
  return value === undefined || value === null || typeof value === 'string'
}

function isOptionalNumber(value: unknown) {
  return value === undefined || value === null || typeof value === 'number'
}

function isOptionalDate(value: unknown) {
  return isOptionalString(value) && (value == null || /^\d{4}-\d{2}-\d{2}$/.test(value))
}

function hasBaseEntityFields(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && typeof value.id === 'string' && Boolean(value.id) && typeof value.title === 'string' && typeof value.order === 'number' && typeof value.created_at === 'number' && typeof value.updated_at === 'number' && isOptionalNumber(value.deleted_at)
}

function isArea(value: unknown): value is Area {
  return hasBaseEntityFields(value) && isOptionalString(value.icon) && isOptionalString(value.color)
}

function isProject(value: unknown): value is Project {
  return hasBaseEntityFields(value) && isOptionalString(value.area_id) && isOptionalString(value.notes) && typeof value.status === 'string' && projectStatuses.has(value.status) && isOptionalDate(value.when_date) && isOptionalDate(value.deadline)
}

function isHeading(value: unknown): value is Heading {
  return hasBaseEntityFields(value) && typeof value.project_id === 'string'
}

function isTask(value: unknown): value is Task {
  return hasBaseEntityFields(value) && isOptionalString(value.project_id) && isOptionalString(value.area_id) && isOptionalString(value.heading_id) && typeof value.status === 'string' && taskStatuses.has(value.status) && typeof value.is_evening === 'boolean' && isOptionalDate(value.when_date) && isOptionalDate(value.deadline) && Array.isArray(value.tags) && value.tags.every((tag) => typeof tag === 'string') && Array.isArray(value.checklist) && value.checklist.every((item) => isRecord(item) && typeof item.id === 'string' && typeof item.title === 'string' && typeof item.completed === 'boolean') && isOptionalString(value.notes) && isOptionalString(value.recurrence_rule) && isOptionalNumber(value.completed_at) && (value.completed_from_status == null || (typeof value.completed_from_status === 'string' && restorableTaskStatuses.has(value.completed_from_status)))
}

function hasUniqueIds(items: Array<{ id: string }>) {
  return new Set(items.map((item) => item.id)).size === items.length
}

export function parseBackupText(text: string): DaymarkBackup {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (!isRecord(value) || value.app !== 'Daymark') throw new Error('This is not a Daymark backup file.')
  if (value.format_version !== 1) throw new Error('This backup version is not supported.')
  if (!isRecord(value.settings) || typeof value.settings.theme !== 'string' || !themes.has(value.settings.theme)) throw new Error('The backup settings are invalid.')
  if (!isRecord(value.data)) throw new Error('The backup data section is missing.')

  const { areas, projects, headings, tasks } = value.data
  if (!Array.isArray(areas) || !areas.every(isArea)) throw new Error('The Areas data is invalid.')
  if (!Array.isArray(projects) || !projects.every(isProject)) throw new Error('The Projects data is invalid.')
  if (!Array.isArray(headings) || !headings.every(isHeading)) throw new Error('The headings data is invalid.')
  if (!Array.isArray(tasks) || !tasks.every(isTask)) throw new Error('The to-do data is invalid.')
  if (![areas, projects, headings, tasks].every(hasUniqueIds)) throw new Error('The backup contains duplicate item IDs.')

  const areaIds = new Set(areas.map((area) => area.id))
  const projectIds = new Set(projects.map((project) => project.id))
  const headingIds = new Set(headings.map((heading) => heading.id))
  const headingProjects = new Map(headings.map((heading) => [heading.id, heading.project_id]))
  if (projects.some((project) => project.area_id && !areaIds.has(project.area_id))) throw new Error('A Project refers to a missing Area.')
  if (headings.some((heading) => !projectIds.has(heading.project_id))) throw new Error('A heading refers to a missing Project.')
  if (tasks.some((task) => (task.area_id && !areaIds.has(task.area_id)) || (task.project_id && !projectIds.has(task.project_id)) || (task.heading_id && !headingIds.has(task.heading_id)))) throw new Error('A to-do refers to a missing Area, Project, or heading.')
  if (tasks.some((task) => task.heading_id && task.project_id !== headingProjects.get(task.heading_id))) throw new Error('A to-do heading does not belong to its Project.')

  return value as unknown as DaymarkBackup
}

export async function parseBackupFile(file: File) {
  if (file.size > MAX_BACKUP_FILE_SIZE) throw new Error('The backup is larger than 10 MB.')
  return parseBackupText(await file.text())
}

function createImportMutation(entity: EntityType, record: Area | Project | Heading | Task, now: number): SyncMutation {
  return {
    id: crypto.randomUUID(),
    entity,
    entity_id: record.id,
    action: 'create',
    payload: record as unknown as Record<string, unknown>,
    timestamp: now,
    synced: false
  }
}

export async function importBackup(backup: DaymarkBackup) {
  const now = Date.now()
  const { areas, projects, headings } = backup.data
  const tasks = backup.data.tasks.filter((task) => !isLogbookTaskExpired(task, now))
  const mutations = [
    ...areas.map((area) => createImportMutation('area', area, now)),
    ...projects.map((project) => createImportMutation('project', project, now)),
    ...headings.map((heading) => createImportMutation('heading', heading, now)),
    ...tasks.map((task) => createImportMutation('task', task, now))
  ]

  await db.transaction('rw', [db.areas, db.projects, db.headings, db.tasks, db.sync_mutations], async () => {
    await Promise.all([db.areas.clear(), db.projects.clear(), db.headings.clear(), db.tasks.clear(), db.sync_mutations.clear()])
    if (areas.length) await db.areas.bulkAdd(areas)
    if (projects.length) await db.projects.bulkAdd(projects)
    if (headings.length) await db.headings.bulkAdd(headings)
    if (tasks.length) await db.tasks.bulkAdd(tasks)
    if (mutations.length) await db.sync_mutations.bulkAdd(mutations)
  })

  localStorage.setItem(BACKUP_INITIALIZED_KEY, '1')
  return { areas: areas.length, projects: projects.length, tasks: tasks.length }
}

export async function downloadBackup() {
  const backup = await createBackup()
  const date = backup.exported_at.slice(0, 10)
  const fileName = `daymark-backup-${date}.json`
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return fileName
}
