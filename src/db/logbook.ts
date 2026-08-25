import { db } from './database'
import type { SyncMutation, Task } from '../types/entities'

export const LOGBOOK_RETENTION_DAYS = 90
const DAY_IN_MS = 24 * 60 * 60 * 1000

export function isLogbookTaskExpired(task: Task, now = Date.now()) {
  return task.status === 'completed' && typeof task.completed_at === 'number' && task.completed_at <= now - LOGBOOK_RETENTION_DAYS * DAY_IN_MS
}

async function permanentlyRemoveCompletedTasks(tasks: Task[], now: number) {
  if (!tasks.length) return 0

  const taskIds = tasks.map((task) => task.id)
  const patch = { deleted_at: now, updated_at: now }
  const tombstones: SyncMutation[] = taskIds.map((taskId) => ({
    id: crypto.randomUUID(),
    entity: 'task',
    entity_id: taskId,
    action: 'delete',
    payload: patch,
    timestamp: now,
    synced: false
  }))

  await db.transaction('rw', [db.tasks, db.sync_mutations], async () => {
    await db.tasks.bulkDelete(taskIds)
    await db.sync_mutations.where('entity_id').anyOf(taskIds).delete()
    await db.sync_mutations.bulkAdd(tombstones)
  })

  return tasks.length
}

export async function cleanupExpiredLogbook(now = Date.now()) {
  const completedTasks = await db.tasks.where('status').equals('completed').filter((task) => !task.deleted_at).toArray()
  return permanentlyRemoveCompletedTasks(completedTasks.filter((task) => isLogbookTaskExpired(task, now)), now)
}

export async function clearLogbook() {
  const now = Date.now()
  const completedTasks = await db.tasks.where('status').equals('completed').filter((task) => !task.deleted_at).toArray()
  return permanentlyRemoveCompletedTasks(completedTasks, now)
}
