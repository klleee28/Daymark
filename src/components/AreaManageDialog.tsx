import { AlertTriangle, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { deleteArea, renameArea } from '../db/mutations'
import { useNavigationData } from '../hooks/useDatabase'
import { useUIStore } from '../store/uiStore'

export function AreaManageDialog() {
  const { managedAreaId, setManagedAreaId, activeAreaId, activeProjectId, setView } = useUIStore()
  const { areas, projects, tasks } = useNavigationData()
  const [title, setTitle] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const area = areas.find((item) => item.id === managedAreaId)
  const areaProjects = area ? projects.filter((project) => project.area_id === area.id) : []
  const areaTasks = area ? tasks.filter((task) => task.area_id === area.id) : []

  useEffect(() => {
    setTitle(area?.title ?? '')
    setConfirmingDelete(false)
  }, [area?.id, area?.title])

  if (!managedAreaId || !area) return null
  const currentArea = area

  function close() {
    setManagedAreaId(null)
  }

  async function saveName() {
    const nextTitle = title.trim()
    if (!nextTitle || nextTitle === currentArea.title) return
    await renameArea(currentArea, nextTitle)
    close()
  }

  async function confirmDelete() {
    const activeProjectIsInsideArea = areaProjects.some((project) => project.id === activeProjectId)
    await deleteArea(currentArea)
    close()
    if (activeAreaId === currentArea.id || activeProjectIsInsideArea) setView('today')
  }

  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="manage-area-title" onClick={close}>
      <div className="overlay-layer__scrim" aria-hidden="true" />
      <section className="area-dialog area-manage-dialog" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><span>Area settings</span><h2 id="manage-area-title">Manage {area.title}</h2></div>
          <button type="button" onClick={close} aria-label="Close area settings"><X size={19} /></button>
        </header>

        <form className="area-manage-dialog__rename" onSubmit={(event) => { event.preventDefault(); void saveName() }}>
          <label><span>Name</span><input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Area name" /></label>
          <button type="submit" disabled={!title.trim() || title.trim() === area.title}><Save size={16} />Save name</button>
        </form>

        <div className="area-manage-dialog__danger">
          <div><strong>Delete area</strong><p>This also removes {areaProjects.length} project{areaProjects.length === 1 ? '' : 's'} and {areaTasks.length} to-do{areaTasks.length === 1 ? '' : 's'} stored inside it.</p></div>
          {!confirmingDelete ? (
            <button className="danger-button" onClick={() => setConfirmingDelete(true)}><Trash2 size={16} />Delete area</button>
          ) : (
            <div className="delete-confirmation" role="alert">
              <AlertTriangle size={18} />
              <p>Delete <strong>{area.title}</strong> and all of its contents?</p>
              <div><button onClick={() => setConfirmingDelete(false)}>Cancel</button><button className="danger-button" onClick={() => void confirmDelete()}>Delete permanently</button></div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
