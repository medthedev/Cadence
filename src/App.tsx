import { useState } from 'react'
import { HabitsView } from './components/habits/HabitsView'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { TodosView } from './components/todos/TodosView'
import { useTheme } from './hooks/useTheme'
import { todayKey } from './lib/date'
import { AppStoreProvider } from './store/AppStoreProvider'
import { useAppData } from './store/context'
import type { View } from './types'

function Workspace() {
  const [view, setView] = useState<View>('todos')
  const { theme, setTheme } = useTheme()
  const { data } = useAppData()

  const today = todayKey()
  const todayProgress = data.habits.length
    ? Math.round(
      (data.habits.filter((habit) => habit.completedDates.includes(today)).length / data.habits.length) * 100,
    )
    : 0

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        onViewChange={setView}
        activeTodos={data.todos.filter((todo) => !todo.done).length}
        habitCount={data.habits.length}
        todayProgress={todayProgress}
      />
      <main className="main">
        <div className="main__inner">
          <Header view={view} theme={theme} onThemeChange={setTheme} />
          <div className="main__content">
            {view === 'todos' ? <TodosView /> : <HabitsView />}
          </div>
        </div>
      </main>
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
