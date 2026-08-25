import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import type { SmartView } from '../lib/taskFilters'
import { taskBelongsToView } from '../lib/taskFilters'

export function useNavigationData() {
  const areas = useLiveQuery(() => db.areas.orderBy('order').filter((area) => !area.deleted_at).toArray(), [], [])
  const projects = useLiveQuery(() => db.projects.orderBy('order').filter((project) => !project.deleted_at && project.status === 'active').toArray(), [], [])
  const tasks = useLiveQuery(() => db.tasks.filter((task) => !task.deleted_at).toArray(), [], [])
  const pendingMutations = useLiveQuery(() => db.sync_mutations.filter((mutation) => !mutation.synced).count(), [], 0)
  return { areas, projects, tasks, pendingMutations }
}

export function useTasks(view: SmartView, projectId: string | null) {
  return useLiveQuery(async () => {
    const all = await db.tasks.orderBy('order').toArray()
    if (projectId) return all.filter((task) => task.project_id === projectId && !task.deleted_at)
    return all.filter((task) => taskBelongsToView(task, view))
  }, [view, projectId], [])
}
