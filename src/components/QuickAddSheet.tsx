import { CalendarDays, Inbox, Moon, Tag, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createTask } from '../db/mutations'
import { useUIStore } from '../store/uiStore'

export function QuickAddSheet() {
  const { quickAddOpen, setQuickAddOpen, activeView } = useUIStore()
  const [title, setTitle] = useState('')
  const [isEvening, setIsEvening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (quickAddOpen) setTimeout(() => inputRef.current?.focus(), 80)
  }, [quickAddOpen])

  async function submit() {
    const value = title.trim()
    if (!value) return
    await createTask(value, activeView, isEvening)
    setTitle('')
    setIsEvening(false)
    setQuickAddOpen(false)
  }

  if (!quickAddOpen) return null
  return (
    <div className="quick-add-layer" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
      <button className="quick-add-layer__scrim" onClick={() => setQuickAddOpen(false)} aria-label="Close quick add" />
      <form className="quick-add" onSubmit={(event) => { event.preventDefault(); void submit() }}>
        <div className="quick-add__grabber" />
        <header>
          <div>
            <span className="quick-add__eyeline">Quick capture</span>
            <h2 id="quick-add-title">New to-do</h2>
          </div>
          <button type="button" onClick={() => setQuickAddOpen(false)} aria-label="Close"><X size={20} /></button>
        </header>
        <input ref={inputRef} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What do you want to do?" aria-label="Task title" />
        <div className="quick-add__actions">
          <button type="button" className={activeView === 'today' ? 'is-active' : ''}><CalendarDays size={17} />Today</button>
          <button type="button" className={isEvening ? 'is-active' : ''} onClick={() => setIsEvening((value) => !value)}><Moon size={17} />Evening</button>
          <button type="button"><Inbox size={17} />Inbox</button>
          <button type="button"><Tag size={17} />Tag</button>
        </div>
        <button className="quick-add__submit" type="submit" disabled={!title.trim()}>Add to-do</button>
      </form>
    </div>
  )
}
