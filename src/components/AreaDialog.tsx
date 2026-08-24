import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { createArea } from '../db/mutations'
import { useUIStore } from '../store/uiStore'

const colors = ['#1768e5', '#7954d6', '#e26f4b', '#2e9a70', '#d39b25']

export function AreaDialog() {
  const { areaDialogOpen, setAreaDialogOpen, setArea } = useUIStore()
  const [title, setTitle] = useState('')
  const [color, setColor] = useState(colors[0])
  if (!areaDialogOpen) return null

  async function submit() {
    const value = title.trim()
    if (!value) return
    const area = await createArea(value, color)
    setTitle('')
    setColor(colors[0])
    setAreaDialogOpen(false)
    setArea(area.id)
  }

  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="area-title" onClick={() => setAreaDialogOpen(false)}>
      <div className="overlay-layer__scrim" aria-hidden="true" />
      <form className="area-dialog" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); void submit() }}>
        <header>
          <div><span>Organize projects</span><h2 id="area-title">New area</h2></div>
          <button type="button" onClick={() => setAreaDialogOpen(false)} aria-label="Close add area"><X size={19} /></button>
        </header>
        <label><span>Name</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Learning" aria-label="Area name" /></label>
        <fieldset>
          <legend>Color</legend>
          <div className="color-options">
            {colors.map((item) => <button key={item} type="button" aria-label={`Use color ${item}`} aria-pressed={color === item} style={{ backgroundColor: item }} onClick={() => setColor(item)} />)}
          </div>
        </fieldset>
        <button className="dialog-done" type="submit" disabled={!title.trim()}><Plus size={17} />Add area</button>
      </form>
    </div>
  )
}
