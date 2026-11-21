# FreeTodo

A calm, local-first workspace for tasks, habits, time, plans and money, built with React, TypeScript, Vite and Bun. It includes a GitHub-style contribution grid for habits and optional Supabase cloud sync.

## Features

### Today
- A dashboard that greets you and pulls together tasks, habits, focus time, events and spending.
- One-tap habit check-in and task completion without leaving the page.
- Quick actions to jump into tasks, calendar planning or expense logging.

### Tasks
- Add tasks with a low / medium / high priority and an optional time estimate.
- Complete, rename (inline), and delete tasks, or clear everything completed.
- Filter by All / Active / Completed and search by title.
- Live progress summary; logged focus minutes appear next to each task.

### Habits
- Create habits with an icon, color, and weekly goal (1–7 days).
- A 53-week contribution grid with GitHub's green shades: click any past day to mark or unmark it.
- Darker green marks days in weeks where you reached your weekly goal.
- Overview mode combines all habits into one heatmap.
- Stats for current streak (with a yesterday grace day), longest streak, weekly progress, and 30/90-day consistency.
- A searchable library of **136 ready-made habits**, including Islamic habits such as prayer, Quran recitation, dhikr, sadaqah and fasting.

### Time management
- Pomodoro-style focus timer with configurable focus, short-break and long-break lengths.
- Link a session to a task; finished sessions are logged toward its time.
- Daily timeline of time blocks with start times, durations, linked tasks and completion toggles.

### Calendar
- A six-week month grid with events coloured by Personal / Work / Health / Social / Other.
- Add, edit and delete events with dates, times and notes.
- Clicking a day shows its events plus that day's habits, focus minutes and spending.
- "Coming up" list of the next five events; Today view also surfaces today's schedule.

### Expenses
- Quick-add transactions with categories, amounts, dates and optional notes.
- Monthly spent / income / net summary and a monthly budget with progress feedback.
- Category breakdown bars so you can see where the money went.
- Filterable transaction history grouped by day, with currency selection.

### Themes
- Four themes: GitHub Light, GitHub Dark, Equicord and Mono.
- Mono is a clean black-and-white palette inspired by [medrinnn.dev](https://medrinnn.dev).
- Theme choice is remembered across reloads and follows the system preference until you pick one.

### Cloud sync (optional, Supabase)
- One connection URL: your project URL with the public anon key appended as `?key=...`.
- Revision-based last-write-wins with `409` conflict handling; a stale client adopts the newer cloud state.
- Automatic debounced pushes after local changes, plus a manual "Sync now" button.
- Private sync-code workspaces: the same code on any device with the same connection URL shares one workspace.
- Local `localStorage` data is always kept, whether sync is on or off.
- No accounts required — access is controlled by the SQL functions and your anon key.

### General
- First run starts completely empty; no demo content.
- Responsive layout for desktop, tablet, and mobile.
- Subtle view transitions and hover feedback, with reduced-motion support.

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

## Connecting Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in that project, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run it. This creates the `workspaces` table and the `sync_pull` / `sync_push` functions, and locks the table down behind them.
3. In **Project Settings → API**, copy the **Project URL** and the **anon / publishable key**.
4. In FreeTodo, click the cloud button in the header and paste one URL:

   ```
   https://your-project.supabase.co?key=YOUR_ANON_KEY
   ```

5. Generate a sync code (or type your own). Enter that same URL and code on any other device and it will share the workspace.

If you would rather paste only the project URL, copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before building. The app will use that key as a fallback when the URL has no `?key=` part.

## Project structure

```
src/
├── components/
│   ├── calendar/     # month grid, events, day details
│   ├── cloud/        # connection dialog
│   ├── common/       # Icon, EmptyState, StatCard
│   ├── expenses/     # transactions, budget, category insights
│   ├── habits/       # grid, rail, detail, overview, library, dialogs
│   ├── layout/       # header, sidebar, theme picker
│   ├── time/         # focus timer and daily plan
│   ├── today/        # dashboard
│   └── todos/        # composer, filterable list, task row
├── data/habitLibrary.ts # 136 preset habits
├── hooks/useTheme.ts # theme preference
├── lib/              # dates, finance helpers, ids, storage, Supabase API
├── store/            # reducer, context, persistence + sync provider
├── styles/           # base tokens and one stylesheet per view
├── types.ts          # domain models (workspace schema v3)
└── App.tsx           # shell and view switching
supabase/schema.sql   # Supabase table, policies and sync functions
```

Dates are stored as local `YYYY-MM-DD` keys so the grid and streaks stay in the user's timezone. All state changes go through one reducer in `src/store/reducer.ts`, which the provider persists to local storage and, when connected, pushes to Supabase.
