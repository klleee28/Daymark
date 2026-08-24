import { Check, Laptop, Moon, Sun, X } from 'lucide-react'
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
  if (!settingsOpen) return null

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
          <span><i className={pendingMutations ? 'is-pending' : ''} />{pendingMutations ? `${pendingMutations} change${pendingMutations === 1 ? '' : 's'} waiting for backend sync` : 'Local data is up to date'}</span>
        </div>
        <button className="dialog-done" onClick={() => setSettingsOpen(false)}>Done</button>
      </section>
    </div>
  )
}
