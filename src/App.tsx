import { useState } from 'react'
import { CalendarView } from './components/calendar/CalendarView'
import { CloudDialog } from './components/cloud/CloudDialog'
import { ExpenseView } from './components/expenses/ExpenseView'
import { GoalsView } from './components/goals/GoalsView'
import { HabitsView } from './components/habits/HabitsView'
import { InsightsView } from './components/insights/InsightsView'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import type { SidebarCounts } from './components/layout/Sidebar'
import { ListsView } from './components/lists/ListsView'
import { TimeView } from './components/time/TimeView'
import { TodayView } from './components/today/TodayView'
import { TodosView } from './components/todos/TodosView'
import { useTheme } from './hooks/useTheme'
import { todayKey } from './lib/date'
import { AppStoreProvider } from './store/AppStoreProvider'
import { useAppData } from './store/context'
import type { View } from './types'

function Workspace() {
  const [view, setView] = useState<View>('today')
  const [cloudOpen, setCloudOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { data } = useAppData()

  const today = todayKey()
  const month = today.slice(0, 7)
  const todayProgress = data.habits.length
    ? Math.round(
      (data.habits.filter((habit) => habit.completedDates.includes(today)).length / data.habits.length) * 100,
    )
    : 0

  const counts: SidebarCounts = {
    activeTodos: data.todos.filter((todo) => !todo.done).length,
    habits: data.habits.length,
    blocksToday: data.timeBlocks.filter((block) => block.date === today).length,
    eventsToday: data.events.filter((event) => event.date === today).length,
    transactionsThisMonth: data.transactions.filter((item) => item.date.startsWith(month)).length,
    activeGoals: data.goals.filter((goal) => !goal.completedAt).length,
    openListItems: data.lists.reduce(
      (total, list) => total + list.items.filter((item) => !item.done).length, 0,
    ),
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        onViewChange={setView}
        counts={counts}
        todayProgress={todayProgress}
      />
      <main className="main">
        <div className="main__inner">
          <Header
            view={view}
            theme={theme}
            onThemeChange={setTheme}
            onCloudClick={() => setCloudOpen(true)}
          />
          <div className="main__content">
            {view === 'today' && <TodayView onNavigate={setView} />}
            {view === 'insights' && <InsightsView onNavigate={setView} />}
            {view === 'todos' && <TodosView />}
            {view === 'habits' && <HabitsView />}
            {view === 'time' && <TimeView />}
            {view === 'goals' && <GoalsView />}
            {view === 'calendar' && <CalendarView />}
            {view === 'expenses' && <ExpenseView />}
            {view === 'lists' && <ListsView />}
          </div>
        </div>
      </main>
      {cloudOpen && <CloudDialog onClose={() => setCloudOpen(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AppStoreProvider>
      <Workspace />
    </AppStoreProvider>
  )
}
