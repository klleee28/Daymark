import { db } from './database'
import { cleanupExpiredLogbook, LOGBOOK_RETENTION_DAYS } from './logbook'
import type { Area, Heading, Project, Task } from '../types/entities'

export interface DaymarkBackup {
  app: 'Daymark'
  format_version: 1
  exported_at: string
  logbook_retention_days: number
  settings: { theme: string }
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

  return {
    app: 'Daymark',
    format_version: 1,
    exported_at: new Date().toISOString(),
    logbook_retention_days: LOGBOOK_RETENTION_DAYS,
    settings: { theme: localStorage.getItem('daymark-theme') ?? 'system' },
    data: { areas, projects, headings, tasks }
  }
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
