# FreeTodo

A calm, local-first workspace for tasks and habits, built with React, TypeScript and Vite. It includes a GitHub-style contribution grid that shows every day you have checked off a habit.

## Features

### Tasks
- Add tasks with a low / medium / high priority.
- Complete, rename (inline), and delete tasks, or clear everything completed.
- Filter by All / Active / Completed and search by title.
- Live progress summary; tasks are sorted by status, priority, and age.

### Habits
- Create habits with an icon, color, and weekly goal (1–7 days).
- A 53-week contribution grid with GitHub's green shades: click any past day to mark or unmark it.
- Darker green marks days in weeks where you reached your weekly goal.
- Overview mode combines all habits into one heatmap.
- Stats for current streak (with a yesterday grace day), longest streak, weekly progress, and 30/90-day consistency.
- Mark today as done directly from the habit list.

### General
- Light and dark themes (follows system preference until you toggle it).
- All data is saved to `localStorage` under `freetodo.data.v1`; no account or backend needed.
- First run includes sample tasks and habits with a few months of history so the grid is populated.
- Responsive layout for desktop, tablet, and mobile.

## Getting started

```bash
bun install
bun run dev
```

Other scripts:

```bash
bun run lint   # ESLint
bun run build  # type-check + production build
bun run preview
```

## Project structure

```
src/
├── components/
│   ├── common/       # Icon, EmptyState, StatCard
│   ├── habits/       # grid, rail, detail, overview, create/edit dialog
│   ├── layout/       # header and sidebar
│   └── todos/        # composer, filterable list, task row
├── data/seed.ts      # first-run demo data
├── hooks/useTheme.ts # theme preference
├── lib/              # date keys/calendar, statistics, ids, storage
├── store/            # reducer, context, persistence provider
├── styles/           # base tokens, tasks, habits
├── types.ts          # domain models
└── App.tsx           # shell and view switching
```

Dates are stored as local `YYYY-MM-DD` keys so the grid and streaks stay in the user's timezone. All state changes go through one reducer in `src/store/reducer.ts`, which the provider persists to local storage.
