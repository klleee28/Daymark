import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { createProject } from '../db/mutations'
import { useNavigationData } from '../hooks/useDatabase'
import { useUIStore } from '../store/uiStore'

export function ProjectDialog() {
  const { projectDialogOpen, setProjectDialogOpen, activeAreaId, setProject } = useUIStore()
  const { areas } = useNavigationData()
  const [title, setTitle] = useState('')
  const area = areas.find((item) => item.id === activeAreaId)
  if (!projectDialogOpen || !area) return null

  async function submit() {
    const value = title.trim()
    if (!value || !area) return
    const project = await createProject(value, area.id)
    setTitle('')
    setProjectDialogOpen(false)
    setProject(project.id)
  }

  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={() => setProjectDialogOpen(false)}>
      <div className="overlay-layer__scrim" aria-hidden="true" />
      <form className="area-dialog project-dialog" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); void submit() }}>
        <header>
          <div><span>{area.title}</span><h2 id="project-title">New project</h2></div>
          <button type="button" onClick={() => setProjectDialogOpen(false)} aria-label="Close add project"><X size={19} /></button>
        </header>
        <label><span>Name</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Read 12 books" aria-label="Project name" /></label>
        <button className="dialog-done" type="submit" disabled={!title.trim()}><Plus size={17} />Add project</button>
      </form>
    </div>
  )
}
