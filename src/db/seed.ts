import { db } from './database'
import { dateFromToday, todayKey } from '../lib/date'
import type { Task } from '../types/entities'

export async function seedDatabase() {
  if ((await db.areas.count()) > 0) return

  const now = Date.now()
  const task = (partial: Partial<Task> & Pick<Task, 'id' | 'title'>): Task => ({
    project_id: null,
    area_id: null,
    heading_id: null,
    status: 'todo',
    is_evening: false,
    when_date: null,
    deadline: null,
    checklist: [],
    tags: [],
    recurrence_rule: null,
    completed_at: null,
    order: 0,
    created_at: now,
    updated_at: now,
    deleted_at: null,
    ...partial
  })

  await db.transaction('rw', [db.areas, db.projects, db.headings, db.tasks], async () => {
    await db.areas.bulkAdd([
      { id: 'personal', title: 'Personal', color: '#7954d6', order: 0, created_at: now, updated_at: now },
      { id: 'work', title: 'Work', color: '#1768e5', order: 1, created_at: now, updated_at: now }
    ])

    await db.projects.bulkAdd([
      { id: 'health', area_id: 'personal', title: 'Health', status: 'active', order: 0, created_at: now, updated_at: now },
      { id: 'home', area_id: 'personal', title: 'Home', status: 'active', order: 1, created_at: now, updated_at: now },
      { id: 'finances', area_id: 'personal', title: 'Finances', status: 'active', order: 2, created_at: now, updated_at: now },
      { id: 'launch', area_id: 'work', title: 'Product Launch', status: 'active', order: 0, created_at: now, updated_at: now },
      { id: 'marketing', area_id: 'work', title: 'Marketing', status: 'active', order: 1, created_at: now, updated_at: now },
      { id: 'operations', area_id: 'work', title: 'Operations', status: 'active', order: 2, created_at: now, updated_at: now }
    ])

    await db.headings.add({ id: 'launch-prep', project_id: 'launch', title: 'Launch prep', order: 0, created_at: now, updated_at: now })

    await db.tasks.bulkAdd([
      task({
        id: 'planning', project_id: 'launch', area_id: 'work', heading_id: 'launch-prep',
        title: 'Prepare quarterly planning notes', when_date: todayKey(), order: 0,
        notes: 'Focus on customer acquisition, retention, and activation. Include metric targets and key dependencies.',
        checklist: [
          { id: 'planning-1', title: 'Review Q2 objectives and key results', completed: false },
          { id: 'planning-2', title: 'Draft priorities and risks', completed: false }
        ], tags: ['focus']
      }),
      task({ id: 'dental', project_id: 'health', area_id: 'personal', title: 'Book dental checkup', when_date: todayKey(), order: 1 }),
      task({ id: 'review', project_id: 'launch', area_id: 'work', title: 'Review launch checklist', when_date: todayKey(), order: 2 }),
      task({ id: 'groceries', project_id: 'home', area_id: 'personal', title: 'Pick up groceries', when_date: todayKey(), order: 3 }),
      task({ id: 'email', project_id: 'marketing', area_id: 'work', title: 'Respond to email from Alex', when_date: todayKey(), is_evening: true, order: 4 }),
      task({ id: 'slides', project_id: 'launch', area_id: 'work', title: 'Prep slide deck for tomorrow', when_date: todayKey(), is_evening: true, order: 5 }),
      task({ id: 'reading', project_id: 'home', area_id: 'personal', title: 'Outline next reading list', order: 0 }),
      task({ id: 'archive', project_id: 'operations', area_id: 'work', title: 'Organize project archive', order: 1 }),
      task({ id: 'passport', status: 'inbox', title: 'Renew passport', order: 0 }),
      task({ id: 'flight', project_id: 'operations', area_id: 'work', title: 'Confirm conference flights', when_date: dateFromToday(2), deadline: dateFromToday(5), order: 0 }),
      task({ id: 'bookshelf', project_id: 'home', area_id: 'personal', status: 'someday', title: 'Build the oak bookshelf', order: 0 }),
      task({ id: 'done-1', project_id: 'finances', area_id: 'personal', status: 'completed', title: 'Review monthly budget', completed_at: now - 86400000, order: 0 })
    ])
  })
}
