# FreeTodo

A calm, local-first workspace for tasks, habits and focused time, built with React, TypeScript, Vite and Bun. It includes a GitHub-style contribution grid that shows every day you have checked off a habit, plus optional self-hosted cloud sync.

## Features

### Tasks
- Add tasks with a low / medium / high priority and an optional time estimate.
- Complete, rename (inline), and delete tasks, or clear everything completed.
- Filter by All / Active / Completed and search by title.
- Live progress summary; tasks are sorted by status, priority, and age.
- Logged focus minutes appear next to each task alongside its estimate.

### Habits
- Create habits with an icon, color, and weekly goal (1–7 days).
- A 53-week contribution grid with GitHub's green shades: click any past day to mark or unmark it.
- Darker green marks days in weeks where you reached your weekly goal.
- Overview mode combines all habits into one heatmap.
- Stats for current streak (with a yesterday grace day), longest streak, weekly progress, and 30/90-day consistency.
- A searchable library of **136 ready-made habits**, including Islamic habits such as prayer, Quran recitation, dhikr, sadaqah and fasting.

### Time management
- Pomodoro-style focus timer with configurable focus, short-break and long-break lengths.
- Optional auto-rotation through breaks after every fourth focus session.
- Link a session to a task; finished sessions are logged and counted toward its time.
- Daily timeline of time blocks with start times, durations, linked tasks and completion toggles.

### Themes
- Four themes: GitHub Light, GitHub Dark, Equicord and Mono.
- Mono is a clean black-and-white palette inspired by [medrinnn.dev](https://medrinnn.dev).
- Theme choice is remembered across reloads and follows the system preference until you pick one.

### Cloud sync (optional)
- Private sync-code workspaces; the same code on two devices shares one workspace.
- Revision-based last-write-wins with `409` conflict handling, so a stale client adopts the newer cloud state.
- Automatic debounced pushes after local changes, plus a manual "Sync now" button.
- Local `localStorage` data is always kept, whether sync is on or off.
- No accounts, no third-party services — the included Bun server stores one JSON file per workspace.

### General
- First run starts completely empty; no demo content.
- Responsive layout for desktop, tablet, and mobile.

## Getting started

```bash
bun install
bun run dev
```

`bun run dev` starts both the Vite client and the local cloud server. Vite proxies `/api` to `http://localhost:8787`, so the default cloud URL works out of the box. Open the cloud button in the header to connect — generate a code, then enter that same code on another device pointed at the same server.

Other scripts:

```bash
bun run dev:client   # Vite only (no cloud server)
bun run cloud        # cloud server only (also: bun run start:cloud)
bun run lint         # ESLint
bun run build        # type-check + production build
bun run preview      # preview build (also proxies /api)
```

To point the client at a remote server, set `VITE_CLOUD_URL` at build time, or enter the full URL in the cloud dialog. The server accepts `PORT` and `HOST` environment variables and defaults to port `8787` on `0.0.0.0`. Workspace files live in `server/.data/` (git-ignored).

## Project structure

```
src/
├── components/
│   ├── cloud/        # connection dialog
│   ├── common/       # Icon, EmptyState, StatCard
│   ├── habits/       # grid, rail, detail, overview, library, create/edit dialog
│   ├── layout/       # header, sidebar, theme picker
│   ├── time/         # focus timer and daily plan
│   └── todos/        # composer, filterable list, task row
├── data/habitLibrary.ts # 136 preset habits
├── hooks/useTheme.ts # theme preference
├── lib/              # date keys/calendar, statistics, ids, storage, cloud API
├── store/            # reducer, context, persistence + sync provider
├── styles/           # base tokens, tasks, habits, time, cloud
├── types.ts          # domain models
└── App.tsx           # shell and view switching
server/index.js       # Bun cloud sync server
scripts/dev.js        # runs Vite and the cloud server together
```

Dates are stored as local `YYYY-MM-DD` keys so the grid and streaks stay in the user's timezone. All state changes go through one reducer in `src/store/reducer.ts`, which the provider persists to local storage and, when connected, pushes to the cloud.
