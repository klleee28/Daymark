import { AlertTriangle, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteProject, updateProject } from '../db/mutations'
import { useNavigationData } from '../hooks/useDatabase'
import { useUIStore } from '../store/uiStore'

export function ProjectManageDialog() {
  const { managedProjectId, setManagedProjectId, activeProjectId, setArea, setView } = useUIStore()
  const { areas, projects, tasks } = useNavigationData()
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [areaId, setAreaId] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const project = projects.find((item) => item.id === managedProjectId)
  const projectTasks = project ? tasks.filter((task) => task.project_id === project.id) : []

  useEffect(() => {
    setTitle(project?.title ?? '')
    setNotes(project?.notes ?? '')
    setAreaId(project?.area_id ?? '')
    setConfirmingDelete(false)
  }, [project?.area_id, project?.id, project?.notes, project?.title])

  if (!managedProjectId || !project) return null
  const currentProject = project
  const changed = title.trim() !== currentProject.title || notes.trim() !== (currentProject.notes ?? '') || areaId !== (currentProject.area_id ?? '')

  function close() {
    setManagedProjectId(null)
  }

  async function save() {
    const nextTitle = title.trim()
    if (!nextTitle || !changed) return
    await updateProject(currentProject, { title: nextTitle, notes: notes.trim(), area_id: areaId || null })
    close()
  }

  async function confirmDelete() {
    await deleteProject(currentProject)
    close()
    if (activeProjectId === currentProject.id) {
      if (currentProject.area_id && areas.some((area) => area.id === currentProject.area_id)) setArea(currentProject.area_id)
      else setView('today')
    }
  }

  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="manage-project-title" onClick={close}>
      <div className="overlay-layer__scrim" aria-hidden="true" />
      <section className="area-dialog entity-manage-dialog" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><span>Project settings</span><h2 id="manage-project-title">Manage {project.title}</h2></div>
          <button type="button" onClick={close} aria-label="Close project settings"><X size={19} /></button>
        </header>

        <form className="entity-manage-form" onSubmit={(event) => { event.preventDefault(); void save() }}>
          <label><span>Name</span><input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Project name" /></label>
          <label><span>Area</span><select value={areaId} onChange={(event) => setAreaId(event.target.value)} aria-label="Project area">
            <option value="">No area</option>
            {areas.map((area) => <option key={area.id} value={area.id}>{area.title}</option>)}
          </select></label>
          <label><span>Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Project notes" aria-label="Project notes" rows={3} /></label>
          <button className="dialog-done" type="submit" disabled={!title.trim() || !changed}><Save size={16} />Save changes</button>
        </form>

        <div className="entity-manage-dialog__danger">
          <div><strong>Delete project</strong><p>This also removes {projectTasks.length} to-do{projectTasks.length === 1 ? '' : 's'} stored inside it. The Area stays intact.</p></div>
          {!confirmingDelete ? (
            <button className="danger-button" onClick={() => setConfirmingDelete(true)}><Trash2 size={16} />Delete project</button>
          ) : (
            <div className="delete-confirmation" role="alert">
              <AlertTriangle size={18} />
              <p>Delete <strong>{project.title}</strong> and all of its to-dos?</p>
              <div><button onClick={() => setConfirmingDelete(false)}>Cancel</button><button className="danger-button" onClick={() => void confirmDelete()}>Delete permanently</button></div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
