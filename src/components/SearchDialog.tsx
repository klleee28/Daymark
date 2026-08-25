import { CheckCircle2, Folder, Layers3, Search, X } from 'lucide-react'
import { useDeferredValue, useMemo, useRef, useState, useEffect } from 'react'
import { useNavigationData } from '../hooks/useDatabase'
import { todayKey } from '../lib/date'
import type { SmartView } from '../lib/taskFilters'
import type { Task } from '../types/entities'
import { useUIStore } from '../store/uiStore'

function destinationForTask(task: Task): SmartView {
  if (task.status === 'completed') return 'logbook'
  if (task.status === 'inbox') return 'inbox'
  if (task.status === 'someday') return 'someday'
  if (task.when_date === todayKey()) return 'today'
  if (task.when_date) return 'upcoming'
  return 'anytime'
}

export function SearchDialog() {
  const { searchOpen, setSearchOpen, setView, setProject, setArea } = useUIStore()
  const { areas, tasks, projects } = useNavigationData()
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const inputRef = useRef<HTMLInputElement>(null)
  const projectMap = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects])
  const areaMap = useMemo(() => new Map(areas.map((area) => [area.id, area])), [areas])
  const results = useMemo(() => {
    if (!deferredQuery) return tasks.slice(0, 8).map((task) => ({ type: 'task' as const, task }))
    const areaResults = areas
      .filter((area) => area.title.toLowerCase().includes(deferredQuery))
      .map((area) => ({ type: 'area' as const, area }))
    const projectResults = projects
      .filter((project) => `${project.title} ${project.notes ?? ''}`.toLowerCase().includes(deferredQuery))
      .map((project) => ({ type: 'project' as const, project }))
    const taskResults = tasks.filter((task) => {
      const projectTitle = task.project_id ? projectMap.get(task.project_id)?.title ?? '' : ''
      return `${task.title} ${task.notes ?? ''} ${task.tags.join(' ')} ${projectTitle}`.toLowerCase().includes(deferredQuery)
    }).map((task) => ({ type: 'task' as const, task }))
    return [...areaResults, ...projectResults, ...taskResults].slice(0, 20)
  }, [areas, deferredQuery, projectMap, projects, tasks])

  useEffect(() => {
    if (!searchOpen) return
    setQuery('')
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [searchOpen])

  if (!searchOpen) return null
  return (
    <div className="overlay-layer" role="dialog" aria-modal="true" aria-labelledby="search-title" onClick={() => setSearchOpen(false)}>
      <div className="overlay-layer__scrim" aria-hidden="true" />
      <section className="search-dialog" onClick={(event) => event.stopPropagation()}>
        <header>
          <Search size={19} />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search to-dos, projects, and areas" aria-label="Search Daymark" />
          <button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={19} /></button>
        </header>
        <h2 id="search-title">{query ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'Recent to-dos'}</h2>
        <div className="search-results">
          {results.length ? results.map((result) => {
            if (result.type === 'area') return (
              <button key={`area-${result.area.id}`} onClick={() => { setArea(result.area.id); setSearchOpen(false) }}>
                <Layers3 size={18} />
                <span><strong>{result.area.title}</strong><small>Area</small></span>
              </button>
            )
            if (result.type === 'project') {
              const area = result.project.area_id ? areaMap.get(result.project.area_id) : undefined
              return (
                <button key={`project-${result.project.id}`} onClick={() => { setProject(result.project.id); setSearchOpen(false) }}>
                  <Folder size={18} />
                  <span><strong>{result.project.title}</strong><small>{area ? `${area.title} · Project` : 'Project'}</small></span>
                </button>
              )
            }
            const task = result.task
            const project = task.project_id ? projectMap.get(task.project_id) : undefined
            return (
              <button key={`task-${task.id}`} onClick={() => {
                if (task.status === 'completed') setView('logbook')
                else if (project) setProject(project.id)
                else setView(destinationForTask(task))
                setSearchOpen(false)
              }}>
                {task.status === 'completed' ? <CheckCircle2 size={18} /> : <span className="search-result__check" />}
                <span><strong>{task.title}</strong><small>{project ? <><Folder size={12} />{project.title}</> : destinationForTask(task)}</small></span>
              </button>
            )
          }) : <p className="search-results__empty">No matching items.</p>}
        </div>
      </section>
    </div>
  )
}
