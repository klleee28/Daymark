import { AlertTriangle, CalendarDays, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteTask, updateTask } from '../db/mutations'
import { useNavigationData } from '../hooks/useDatabase'
import { dateFromToday, todayKey } from '../lib/date'
import { useUIStore } from '../store/uiStore'

export function TaskManageDialog() {
  const { managedTaskId, setManagedTaskId } = useUIStore()
  const { tasks } = useNavigationData()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [whenDate, setWhenDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isEvening, setIsEvening] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const task = tasks.find((item) => item.id === managedTaskId)

  useEffect(() => {
    setTitle(task?.title ?? '')
    setNotes(task?.notes ?? '')
    setWhenDate(task?.when_date ?? '')
    setDeadline(task?.deadline ?? '')
    setIsEvening(task?.is_evening ?? false)
    setConfirmingDelete(false)
  }, [task?.deadline, task?.id, task?.is_evening, task?.notes, task?.title, task?.when_date])

  if (!managedTaskId || !task) return null
  const currentTask = task
  const eveningValue = whenDate === todayKey() && isEvening
  const changed = title.trim() !== currentTask.title || notes.trim() !== (currentTask.notes ?? '') || whenDate !== (currentTask.when_date ?? '') || deadline !== (currentTask.deadline ?? '') || eveningValue !== currentTask.is_evening

  function close() {
    setManagedTaskId(null)
  }

  async function save() {
    const nextTitle = title.trim()
    if (!nextTitle || !changed) return
    const patch = {
      title: nextTitle,
      notes: notes.trim(),
      when_date: whenDate || null,
      deadline: deadline || null,
      is_evening: eveningValue,
      status: currentTask.status !== 'completed' && whenDate && (currentTask.status === 'inbox' || currentTask.status === 'someday') ? 'todo' as const : currentTask.status
    }
    await updateTask(currentTask, patch)
    close()
  }

  function setScheduleDate(value: string) {
    setWhenDate(value)
    if (value !== todayKey()) setIsEvening(false)
  }

  async function confirmDelete() {
    await deleteTask(currentTask)
    close()
  }

  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="manage-task-title" onClick={close}>
      <div className="overlay-layer__scrim" aria-hidden="true" />
      <section className="area-dialog entity-manage-dialog" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><span>To-do details</span><h2 id="manage-task-title">Edit to-do</h2></div>
          <button type="button" onClick={close} aria-label="Close to-do details"><X size={19} /></button>
        </header>

        <form className="entity-manage-form" onSubmit={(event) => { event.preventDefault(); void save() }}>
          <label><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="To-do title" /></label>
          <label><span>Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add notes" aria-label="To-do notes" rows={4} /></label>
          <div className="entity-manage-form__dates">
            <label><span>Schedule date</span><input type="date" value={whenDate} onInput={(event) => setScheduleDate(event.currentTarget.value)} aria-label="To-do schedule date" /></label>
            <label><span>Deadline</span><input type="date" value={deadline} onInput={(event) => setDeadline(event.currentTarget.value)} aria-label="To-do deadline" /></label>
          </div>
          <div className="task-date-actions" aria-label="Schedule shortcuts">
            <button type="button" onClick={() => setScheduleDate(todayKey())}><CalendarDays size={15} />Today</button>
            <button type="button" onClick={() => setScheduleDate(dateFromToday(1))}>Tomorrow</button>
            <button type="button" onClick={() => setScheduleDate('')} disabled={!whenDate}>Clear date</button>
            <label className={whenDate === todayKey() ? '' : 'is-disabled'}><input type="checkbox" checked={eveningValue} onChange={(event) => setIsEvening(event.target.checked)} disabled={whenDate !== todayKey()} /><span>This evening</span></label>
          </div>
          <button className="dialog-done" type="submit" disabled={!title.trim() || !changed}><Save size={16} />Save changes</button>
        </form>

        <div className="entity-manage-dialog__danger">
          <div><strong>Delete to-do</strong><p>Remove this to-do from Daymark.</p></div>
          {!confirmingDelete ? (
            <button className="danger-button" onClick={() => setConfirmingDelete(true)}><Trash2 size={16} />Delete to-do</button>
          ) : (
            <div className="delete-confirmation" role="alert">
              <AlertTriangle size={18} />
              <p>Delete <strong>{task.title}</strong>?</p>
              <div><button onClick={() => setConfirmingDelete(false)}>Cancel</button><button className="danger-button" onClick={() => void confirmDelete()}>Delete permanently</button></div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
