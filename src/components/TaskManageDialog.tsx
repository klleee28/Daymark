import { AlertTriangle, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteTask, updateTask } from '../db/mutations'
import { useNavigationData } from '../hooks/useDatabase'
import { useUIStore } from '../store/uiStore'

export function TaskManageDialog() {
  const { managedTaskId, setManagedTaskId } = useUIStore()
  const { tasks } = useNavigationData()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const task = tasks.find((item) => item.id === managedTaskId)

  useEffect(() => {
    setTitle(task?.title ?? '')
    setNotes(task?.notes ?? '')
    setConfirmingDelete(false)
  }, [task?.id, task?.notes, task?.title])

  if (!managedTaskId || !task) return null
  const currentTask = task
  const changed = title.trim() !== currentTask.title || notes.trim() !== (currentTask.notes ?? '')

  function close() {
    setManagedTaskId(null)
  }

  async function save() {
    const nextTitle = title.trim()
    if (!nextTitle || !changed) return
    await updateTask(currentTask, { title: nextTitle, notes: notes.trim() })
    close()
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
