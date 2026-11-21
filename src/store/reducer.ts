import type { AppData, Habit, Priority, Todo } from '../types'

export type AppAction =
  | { type: 'todo/add'; todo: Todo }
  | { type: 'todo/toggle'; id: string }
  | { type: 'todo/rename'; id: string; title: string }
  | { type: 'todo/setPriority'; id: string; priority: Priority }
  | { type: 'todo/delete'; id: string }
  | { type: 'todo/clearCompleted' }
  | { type: 'habit/add'; habit: Habit }
  | { type: 'habit/update'; id: string; changes: Pick<Habit, 'name' | 'emoji' | 'color' | 'weeklyGoal'> }
  | { type: 'habit/toggleDate'; id: string; date: string }
  | { type: 'habit/delete'; id: string }

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'todo/add':
      return { ...state, todos: [action.todo, ...state.todos] }

    case 'todo/toggle':
      return {
        ...state,
        todos: state.todos.map((todo) => todo.id === action.id
          ? {
              ...todo,
              done: !todo.done,
              completedAt: todo.done ? undefined : new Date().toISOString(),
            }
          : todo),
      }

    case 'todo/rename':
      return {
        ...state,
        todos: state.todos.map((todo) => todo.id === action.id
          ? { ...todo, title: action.title }
          : todo),
      }

    case 'todo/setPriority':
      return {
        ...state,
        todos: state.todos.map((todo) => todo.id === action.id
          ? { ...todo, priority: action.priority }
          : todo),
      }

    case 'todo/delete':
      return { ...state, todos: state.todos.filter((todo) => todo.id !== action.id) }

    case 'todo/clearCompleted':
      return { ...state, todos: state.todos.filter((todo) => !todo.done) }

    case 'habit/add':
      return { ...state, habits: [...state.habits, action.habit] }

    case 'habit/update':
      return {
        ...state,
        habits: state.habits.map((habit) => habit.id === action.id
          ? { ...habit, ...action.changes }
          : habit),
      }

    case 'habit/toggleDate':
      return {
        ...state,
        habits: state.habits.map((habit) => {
          if (habit.id !== action.id) return habit
          const completed = habit.completedDates.includes(action.date)
          return {
            ...habit,
            completedDates: completed
              ? habit.completedDates.filter((date) => date !== action.date)
              : [...habit.completedDates, action.date],
          }
        }),
      }

    case 'habit/delete':
      return { ...state, habits: state.habits.filter((habit) => habit.id !== action.id) }
  }
}
