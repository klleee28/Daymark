import Dexie, { type EntityTable } from 'dexie'
import type { Area, Heading, Project, SyncMutation, Task } from '../types/entities'

class DaymarkDatabase extends Dexie {
  areas!: EntityTable<Area, 'id'>
  projects!: EntityTable<Project, 'id'>
  headings!: EntityTable<Heading, 'id'>
  tasks!: EntityTable<Task, 'id'>
  sync_mutations!: EntityTable<SyncMutation, 'id'>

  constructor() {
    super('daymark-local-v1')
    this.version(1).stores({
      areas: 'id, order, updated_at, deleted_at',
      projects: 'id, area_id, status, order, when_date, updated_at, deleted_at',
      headings: 'id, project_id, order, updated_at, deleted_at',
      tasks: 'id, project_id, area_id, heading_id, status, when_date, is_evening, order, updated_at, completed_at, deleted_at, *tags',
      sync_mutations: 'id, entity, entity_id, action, timestamp, synced'
    })
  }
}

export const db = new DaymarkDatabase()
