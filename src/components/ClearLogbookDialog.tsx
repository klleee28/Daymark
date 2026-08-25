import { AlertTriangle, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { clearLogbook, LOGBOOK_RETENTION_DAYS } from '../db/logbook'
import { useNavigationData } from '../hooks/useDatabase'
import { useUIStore } from '../store/uiStore'

export function ClearLogbookDialog() {
  const { clearLogbookOpen, setClearLogbookOpen } = useUIStore()
  const { tasks } = useNavigationData()
  const [clearing, setClearing] = useState(false)
  const completedCount = tasks.filter((task) => task.status === 'completed' && !task.deleted_at).length

  if (!clearLogbookOpen) return null

  function close() {
    if (!clearing) setClearLogbookOpen(false)
  }

  async function confirmClear() {
    setClearing(true)
    try {
      await clearLogbook()
      setClearLogbookOpen(false)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="clear-logbook-title" onClick={close}>
      <div className="overlay-layer__scrim" aria-hidden="true" />
      <section className="area-dialog clear-logbook-dialog" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><span>Logbook cleanup</span><h2 id="clear-logbook-title">Clear Logbook?</h2></div>
          <button type="button" onClick={close} aria-label="Close clear Logbook"><X size={19} /></button>
        </header>
        <div className="clear-logbook-dialog__warning">
          <AlertTriangle size={21} />
          <div><strong>{completedCount} completed to-do{completedCount === 1 ? '' : 's'} will be permanently removed.</strong><p>This cannot be undone. Areas, Projects, and open to-dos are not affected.</p></div>
        </div>
        <p className="clear-logbook-dialog__retention">Daymark automatically removes completed to-dos after {LOGBOOK_RETENTION_DAYS} days.</p>
        <div className="dialog-actions">
          <button type="button" onClick={close} disabled={clearing}>Cancel</button>
          <button type="button" className="danger-button" onClick={() => void confirmClear()} disabled={clearing || completedCount === 0}><Trash2 size={16} />{clearing ? 'Clearing…' : 'Clear Logbook'}</button>
        </div>
      </section>
    </div>
  )
}
