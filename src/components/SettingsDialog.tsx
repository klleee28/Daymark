import { AlertTriangle, Check, Download, Laptop, Moon, Sun, Upload, X } from 'lucide-react'
import { type ChangeEvent, useEffect, useState } from 'react'
import { downloadBackup, importBackup, parseBackupFile, type DaymarkBackup } from '../db/backup'
import { LOGBOOK_RETENTION_DAYS } from '../db/logbook'
import { useNavigationData } from '../hooks/useDatabase'
import { type ThemeMode, useUIStore } from '../store/uiStore'

const themes: Array<{ id: ThemeMode; label: string; icon: typeof Sun }> = [
  { id: 'system', label: 'System', icon: Laptop },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon }
]

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, setView, themeMode, setThemeMode } = useUIStore()
  const { pendingMutations } = useNavigationData()
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState('')
  const [pendingImport, setPendingImport] = useState<{ backup: DaymarkBackup; fileName: string } | null>(null)

  useEffect(() => {
    if (settingsOpen) {
      setExportStatus('')
      setImportStatus('')
      setPendingImport(null)
    }
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

  async function selectBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setImportStatus('')
    setPendingImport(null)
    try {
      const backup = await parseBackupFile(file)
      setPendingImport({ backup, fileName: file.name })
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : 'This backup could not be read.')
    }
  }

  async function confirmImport() {
    if (!pendingImport) return

    setImporting(true)
    setImportStatus('')
    try {
      const { backup, fileName } = pendingImport
      const restored = await importBackup(backup)
      setThemeMode(backup.settings.theme)
      setView('today')
      setPendingImport(null)
      setImportStatus(`${fileName} imported: ${restored.areas} Areas, ${restored.projects} Projects, and ${restored.tasks} to-dos restored.`)
    } catch {
      setImportStatus('The backup could not be imported. Your current data was not changed.')
    } finally {
      setImporting(false)
    }
  }

  const importCounts = pendingImport?.backup.data

  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={() => { if (!importing) setSettingsOpen(false) }}>
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
          <p>Completed to-dos are automatically removed after {LOGBOOK_RETENTION_DAYS} days. Export a backup before replacing or moving your local data.</p>
          <div className="settings-data__actions">
            <button type="button" onClick={() => void exportData()} disabled={exporting || importing}><Download size={17} /><span>{exporting ? 'Preparing backup…' : 'Export backup'}</span></button>
            <label className={`settings-data__import${exporting || importing ? ' is-disabled' : ''}`}>
              <input type="file" accept=".json,application/json" onChange={(event) => void selectBackup(event)} disabled={exporting || importing} aria-label="Choose a Daymark backup file" />
              <Upload size={17} /><span>Import backup</span>
            </label>
          </div>
          {exportStatus ? <span className="settings-data__status" role="status">{exportStatus}</span> : null}
          {pendingImport && importCounts ? (
            <div className="settings-import-confirmation" role="alert">
              <AlertTriangle size={20} />
              <div>
                <strong>Replace current Daymark data?</strong>
                <p><b>{pendingImport.fileName}</b> contains {importCounts.areas.length} Areas, {importCounts.projects.length} Projects, and {importCounts.tasks.length} to-dos.</p>
                <p>Your current Areas, Projects, headings, and to-dos on this device will be permanently replaced.</p>
              </div>
              <div className="settings-import-confirmation__actions">
                <button type="button" onClick={() => setPendingImport(null)} disabled={importing}>Cancel</button>
                <button type="button" className="danger-button" onClick={() => void confirmImport()} disabled={importing}>{importing ? 'Importing…' : 'Import and replace'}</button>
              </div>
            </div>
          ) : null}
          {importStatus ? <span className="settings-data__status" role="status">{importStatus}</span> : null}
        </div>
        <button className="dialog-done" onClick={() => setSettingsOpen(false)} disabled={importing}>Done</button>
      </section>
    </div>
  )
}
