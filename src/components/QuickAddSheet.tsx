import { Archive, CalendarClock, CalendarDays, Folder, Inbox, Layers3, Moon, Tag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createTask } from '../db/mutations'
import { useNavigationData } from '../hooks/useDatabase'
import type { SmartView } from '../lib/taskFilters'
import { useUIStore } from '../store/uiStore'

const validDestinations: SmartView[] = ['inbox', 'today', 'upcoming', 'anytime', 'someday']

export function QuickAddSheet() {
  const { quickAddOpen, setQuickAddOpen, activeView, activeProjectId } = useUIStore()
  const { projects } = useNavigationData()
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState<SmartView>('today')
  const [projectId, setProjectId] = useState('')
  const [isEvening, setIsEvening] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [tagText, setTagText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!quickAddOpen) return
    setDestination(validDestinations.includes(activeView) ? activeView : 'anytime')
    setProjectId(activeProjectId ?? '')
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80)
    return () => window.clearTimeout(focusTimer)
  }, [quickAddOpen, activeProjectId, activeView])

  function chooseDestination(nextDestination: SmartView) {
    setDestination(nextDestination)
    if (nextDestination !== 'today') setIsEvening(false)
  }

  async function submit() {
    const value = title.trim()
    if (!value) return
    const tags = tagText.split(',').map((tag) => tag.trim()).filter(Boolean)
    await createTask({ title: value, destination, isEvening, projectId: projectId || null, tags })
    setTitle('')
    setProjectId('')
    setIsEvening(false)
    setShowTags(false)
    setTagText('')
    setQuickAddOpen(false)
  }

  if (!quickAddOpen) return null
  return (
    <div className="quick-add-layer" role="dialog" aria-modal="true" aria-labelledby="quick-add-title" onClick={() => setQuickAddOpen(false)}>
      <div className="quick-add-layer__scrim" aria-hidden="true" />
      <form className="quick-add" onClick={(event) => event.stopPropagation()} onSubmit={(event) => { event.preventDefault(); void submit() }}>
        <div className="quick-add__grabber" />
        <header>
          <div>
            <span className="quick-add__eyeline">Quick capture</span>
            <h2 id="quick-add-title">New to-do</h2>
          </div>
          <button type="button" onClick={() => setQuickAddOpen(false)} aria-label="Close"><X size={20} /></button>
        </header>

        <input ref={inputRef} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What do you want to do?" aria-label="Task title" />

        <div className="quick-add__actions" aria-label="Task scheduling shortcuts">
          <button type="button" className={destination === 'today' && !isEvening ? 'is-active' : ''} onClick={() => { chooseDestination('today'); setIsEvening(false) }}><CalendarDays size={17} />Today</button>
          <button type="button" className={destination === 'today' && isEvening ? 'is-active' : ''} onClick={() => { chooseDestination('today'); setIsEvening((value) => !value) }}><Moon size={17} />Evening</button>
          <button type="button" className={destination === 'inbox' ? 'is-active' : ''} onClick={() => chooseDestination('inbox')}><Inbox size={17} />Inbox</button>
          <button type="button" className={showTags ? 'is-active' : ''} onClick={() => setShowTags((value) => !value)}><Tag size={17} />Tags</button>
        </div>

        <div className="quick-add__fields">
          <label>
            <span>List</span>
            <span className="select-control">
              {destination === 'inbox' ? <Inbox size={16} /> : destination === 'someday' ? <Archive size={16} /> : destination === 'today' ? <CalendarDays size={16} /> : destination === 'upcoming' ? <CalendarClock size={16} /> : <Layers3 size={16} />}
              <select aria-label="Task list" value={destination} onChange={(event) => chooseDestination(event.target.value as SmartView)}>
                <option value="inbox">Inbox</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming (tomorrow)</option>
                <option value="anytime">Anytime</option>
                <option value="someday">Someday</option>
              </select>
            </span>
          </label>
          <label>
            <span>Project</span>
            <span className="select-control">
              <Folder size={16} />
              <select aria-label="Task project" value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                <option value="">No project</option>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
              </select>
            </span>
          </label>
        </div>

        {showTags ? <input className="quick-add__tag-input" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="Tags, separated by commas" aria-label="Task tags" /> : null}

        <button className="quick-add__submit" type="submit" disabled={!title.trim()}>Add to-do</button>
      </form>
    </div>
  )
}
