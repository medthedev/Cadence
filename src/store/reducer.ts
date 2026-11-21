import type {
  AppData, CalendarEvent, FocusSession, Habit, Priority, TimeBlock, Todo, Transaction,
} from '../types'

export type AppAction =
  | { type: 'data/replace'; data: AppData }
  | { type: 'todo/add'; todo: Todo }
  | { type: 'todo/toggle'; id: string }
  | { type: 'todo/rename'; id: string; title: string }
  | { type: 'todo/setPriority'; id: string; priority: Priority }
  | { type: 'todo/setEstimate'; id: string; minutes?: number }
  | { type: 'todo/setDueDate'; id: string; date?: string }
  | { type: 'todo/delete'; id: string }
  | { type: 'todo/clearCompleted' }
  | { type: 'timeBlock/add'; block: TimeBlock }
  | { type: 'timeBlock/toggle'; id: string }
  | { type: 'timeBlock/delete'; id: string }
  | { type: 'focus/session'; session: FocusSession }
  | { type: 'habit/add'; habit: Habit }
  | { type: 'habit/update'; id: string; changes: Pick<Habit, 'name' | 'emoji' | 'color' | 'weeklyGoal'> }
  | { type: 'habit/toggleDate'; id: string; date: string }
  | { type: 'habit/delete'; id: string }
  | { type: 'event/add'; event: CalendarEvent }
  | { type: 'event/update'; id: string; changes: Pick<CalendarEvent, 'title' | 'date' | 'time' | 'category' | 'notes'> }
  | { type: 'event/delete'; id: string }
  | { type: 'transaction/add'; transaction: Transaction }
  | { type: 'transaction/delete'; id: string }
  | { type: 'finance/currency'; currency: string }
  | { type: 'finance/budget'; amount: number }
  | { type: 'finance/focusGoal'; minutes: number }

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'data/replace':
      return action.data

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

    case 'todo/setEstimate':
      return {
        ...state,
        todos: state.todos.map((todo) => todo.id === action.id
          ? { ...todo, estimatedMinutes: action.minutes }
          : todo),
      }

    case 'todo/setDueDate':
      return {
        ...state,
        todos: state.todos.map((todo) => todo.id === action.id
          ? { ...todo, dueDate: action.date }
          : todo),
      }

    case 'todo/delete':
      return { ...state, todos: state.todos.filter((todo) => todo.id !== action.id) }

    case 'todo/clearCompleted':
      return { ...state, todos: state.todos.filter((todo) => !todo.done) }

    case 'timeBlock/add':
      return { ...state, timeBlocks: [...state.timeBlocks, action.block] }

    case 'timeBlock/toggle':
      return {
        ...state,
        timeBlocks: state.timeBlocks.map((block) => block.id === action.id
          ? { ...block, completed: !block.completed }
          : block),
      }

    case 'timeBlock/delete':
      return { ...state, timeBlocks: state.timeBlocks.filter((block) => block.id !== action.id) }

    case 'focus/session':
      return {
        ...state,
        focusSessions: [action.session, ...state.focusSessions],
        todos: action.session.todoId
          ? state.todos.map((todo) => todo.id === action.session.todoId
            ? { ...todo, loggedMinutes: (todo.loggedMinutes ?? 0) + action.session.minutes }
            : todo)
          : state.todos,
      }

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

    case 'event/add':
      return { ...state, events: [...state.events, action.event] }

    case 'event/update':
      return {
        ...state,
        events: state.events.map((event) => event.id === action.id
          ? { ...event, ...action.changes }
          : event),
      }

    case 'event/delete':
      return { ...state, events: state.events.filter((event) => event.id !== action.id) }

    case 'transaction/add':
      return { ...state, transactions: [action.transaction, ...state.transactions] }

    case 'transaction/delete':
      return { ...state, transactions: state.transactions.filter((item) => item.id !== action.id) }

    case 'finance/currency':
      return { ...state, currency: action.currency }

    case 'finance/budget':
      return { ...state, monthlyBudget: action.amount }

    case 'finance/focusGoal':
      return { ...state, dailyFocusGoal: action.minutes }
  }
}
