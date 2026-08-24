# Second Brain

Second-brain is a local-first personal task manager inspired by the calm workflow and visual hierarchy of Things 3. This first milestone delivers the PWA shell, Dexie persistence, reactive data hooks, core smart-list and project navigation, task completion, checklist interaction, and responsive quick capture.

## Included in this milestone

- React 19 + Vite + TypeScript + Tailwind CSS
- Installable PWA metadata, custom app icons, offline precaching, and sync-endpoint runtime caching
- Dexie tables for areas, projects, headings, tasks, and queued sync mutations
- Typed local mutations with optimistic writes and an outbox record
- Reactive smart views: Inbox, Today, Upcoming, Anytime, Someday, and Logbook
- Areas/projects navigation with responsive mobile drawer and bottom tabs
- Expandable tasks, checklists, completion feedback, and quick add (`Cmd/Ctrl + N`)
- Light and OLED-friendly dark themes through system preference

## Run locally

```bash
npm install
npm run dev
```

Build the installable production bundle:

```bash
npm run build
npm run preview
```

## Architecture

- `src/db` — Dexie schema, seed data, and local mutation queue
- `src/hooks` — reactive `useLiveQuery` data access
- `src/store` — transient UI state in Zustand
- `src/components` — focused navigation, task list, and quick-capture components
- `src/lib/taskFilters.ts` — smart-list routing rules
- `docs/concepts` — approved desktop/mobile concepts and implementation QA captures

## Next milestones

1. Inline task editor, date/deadline pickers, drag-and-drop, and full keyboard command surface.
2. Recurrence engine and project progress calculations.
3. Self-hosted sync API, conflict resolution, PostgreSQL/SQLite storage, and Docker Compose stack.
