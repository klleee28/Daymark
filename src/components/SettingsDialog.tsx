import { Check, Download, Laptop, Moon, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { downloadBackup } from '../db/backup'
import { LOGBOOK_RETENTION_DAYS } from '../db/logbook'
import { useNavigationData } from '../hooks/useDatabase'
import { type ThemeMode, useUIStore } from '../store/uiStore'

const themes: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
  { id: 'system', label: 'System', icon: Laptop },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon }
]

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, themeMode, setThemeMode } = useUIStore()
  const { pendingMutations } = useNavigationData()
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')

  useEffect(() => {
    if (settingsOpen) setExportStatus('')
  }, [settingsOpen])

  if (!settingsOpen) return null

  async function exportData() {
    setExporting(true)
    setExportStatus('')
    try {
      const fileName = await downloadBackup()
      setExportStatus(`${fileName} downloaded`)
    } catch {
      setExportStatus('Backup could not be downloaded. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={() => setSettingsOpen(false)}>
      <div className="overlay-layer__scrim" aria-hidden="true" />
      <section className="settings-dialog" onClick={(event) => event.stopPropagation()}>
        <header>
          <div><span>Preferences</span><h2 id="settings-title">Settings</h2></div>
          <button onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={19} /></button>
        </header>
        <div className="settings-group">
          <h3>Appearance</h3>
          <div className="theme-options">
            {themes.map(({ id, label, icon: Icon }) => (
              <button key={id} className={themeMode === id ? 'is-active' : ''} onClick={() => setThemeMode(id)}>
                <Icon size={19} /><span>{label}</span>{themeMode === id ? <Check size={16} /> : null}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-group settings-status">
          <h3>Local-first storage</h3>
          <p>Your tasks are saved instantly on this device and remain available offline.</p>
          <span><i className={pendingMutations ? 'is-pending' : ''} />{pendingMutations ? `${pendingMutations} local change${pendingMutations === 1 ? '' : 's'} saved on this device` : 'Local data is up to date'}</span>
        </div>
        <div className="settings-group settings-data">
          <h3>Data & backup</h3>
          <p>Completed to-dos are automatically removed after {LOGBOOK_RETENTION_DAYS} days.</p>
          <button type="button" onClick={() => void exportData()} disabled={exporting}><Download size={17} /><span>{exporting ? 'Preparing backup…' : 'Export backup'}</span></button>
          {exportStatus ? <span className="settings-data__status" role="status">{exportStatus}</span> : null}
        </div>
        <button className="dialog-done" onClick={() => setSettingsOpen(false)}>Done</button>
      </section>
    </div>
  )
}
