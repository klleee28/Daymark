export type ProjectStatus = 'active' | 'completed' | 'canceled' | 'someday'
export type TaskStatus = 'inbox' | 'todo' | 'completed' | 'canceled' | 'someday'
export type EntityType = 'area' | 'project' | 'heading' | 'task'

export interface Area {
  id: string
  title: string
  icon?: string
  color?: string
  order: number
  created_at: number
  updated_at: number
  deleted_at?: number | null
}

export interface Project {
  id: string
  area_id?: string | null
  title: string
  notes?: string
  status: ProjectStatus
  when_date?: string | null
  deadline?: string | null
  order: number
  created_at: number
  updated_at: number
  deleted_at?: number | null
}

export interface Heading {
  id: string
  project_id: string
  title: string
  order: number
  created_at: number
  updated_at: number
  deleted_at?: number | null
}

export interface ChecklistItem {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  project_id?: string | null
  area_id?: string | null
  heading_id?: string | null
  title: string
  notes?: string
  status: TaskStatus
  is_evening: boolean
  when_date?: string | null
  deadline?: string | null
  checklist: ChecklistItem[]
  tags: string[]
  recurrence_rule?: string | null
  completed_at?: number | null
  completed_from_status?: Exclude<TaskStatus, 'completed'> | null
  order: number
  created_at: number
  updated_at: number
  deleted_at?: number | null
}

export interface SyncMutation {
  id: string
  entity: EntityType
  entity_id: string
  action: 'create' | 'update' | 'delete'
  payload: Record<string, unknown>
  timestamp: number
  synced: boolean
}
