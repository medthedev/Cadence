import type {
  AppData, CalendarEvent, FocusSession, Goal, GoalMilestone, Habit,
  LifeList, ListItem, PrayerName, Priority, TimeBlock, Todo, Transaction,
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
  | { type: 'habit/update'; id: string; changes: Pick<Habit, 'name' | 'emoji' | 'color' | 'weeklyGoal' | 'kind' | 'waterTarget'> }
  | { type: 'habit/toggleDate'; id: string; date: string }
  | { type: 'habit/logWater'; id: string; date: string; liters: number }
  | { type: 'habit/togglePrayer'; id: string; date: string; prayer: PrayerName }
  | { type: 'habit/delete'; id: string }
  | { type: 'event/add'; event: CalendarEvent }
  | { type: 'event/update'; id: string; changes: Pick<CalendarEvent, 'title' | 'date' | 'time' | 'category' | 'notes'> }
  | { type: 'event/delete'; id: string }
  | { type: 'transaction/add'; transaction: Transaction }
  | { type: 'transaction/delete'; id: string }
  | { type: 'goal/add'; goal: Goal }
  | { type: 'goal/toggleComplete'; id: string }
  | { type: 'goal/delete'; id: string }
  | { type: 'goal/milestoneAdd'; goalId: string; milestone: GoalMilestone }
  | { type: 'goal/milestoneToggle'; goalId: string; milestoneId: string }
  | { type: 'goal/milestoneDelete'; goalId: string; milestoneId: string }
  | { type: 'list/add'; list: LifeList }
  | { type: 'list/delete'; id: string }
  | { type: 'list/itemAdd'; listId: string; item: ListItem }
  | { type: 'list/itemToggle'; listId: string; itemId: string }
  | { type: 'list/itemDelete'; listId: string; itemId: string }
  | { type: 'list/clearDone'; listId: string }
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
        habits: state.habits.map((habit) => {
          if (habit.id !== action.id) return habit
          const kind = action.changes.kind ?? habit.kind
          const kindChanged = kind !== habit.kind
          const next: Habit = { ...habit, ...action.changes, kind }
          if (kindChanged) {
            next.completedDates = []
            next.waterLog = kind === 'water' ? {} : undefined
            next.prayerLog = kind === 'prayer' ? {} : undefined
            next.waterTarget = kind === 'water' ? (action.changes.waterTarget ?? habit.waterTarget ?? 2) : undefined
          } else if (kind === 'water') {
            next.waterTarget = action.changes.waterTarget ?? habit.waterTarget ?? 2
            next.waterLog = habit.waterLog ?? {}
            next.prayerLog = undefined
          } else if (kind === 'prayer') {
            next.prayerLog = habit.prayerLog ?? {}
            next.waterLog = undefined
            next.waterTarget = undefined
          } else {
            next.waterLog = undefined
            next.prayerLog = undefined
            next.waterTarget = undefined
          }
          return next
        }),
      }

    case 'habit/toggleDate':
      return {
        ...state,
        habits: state.habits.map((habit) => {
          if (habit.id !== action.id) return habit
          if (habit.kind !== 'check') return habit
          const completed = habit.completedDates.includes(action.date)
          return {
            ...habit,
            completedDates: completed
              ? habit.completedDates.filter((date) => date !== action.date)
              : [...habit.completedDates, action.date],
          }
        }),
      }

    case 'habit/logWater': {
      return {
        ...state,
        habits: state.habits.map((habit) => {
          if (habit.id !== action.id || habit.kind !== 'water') return habit
          const target = habit.waterTarget ?? 2
          const liters = Math.max(0, Math.round(action.liters * 10) / 10)
          const waterLog = { ...(habit.waterLog ?? {}), [action.date]: liters }
          if (liters <= 0) delete waterLog[action.date]
          const met = liters >= target
          const hasDate = habit.completedDates.includes(action.date)
          const completedDates = met
            ? (hasDate ? habit.completedDates : [...habit.completedDates, action.date])
            : habit.completedDates.filter((d) => d !== action.date)
          return { ...habit, waterLog, completedDates }
        }),
      }
    }

    case 'habit/togglePrayer': {
      return {
        ...state,
        habits: state.habits.map((habit) => {
          if (habit.id !== action.id || habit.kind !== 'prayer') return habit
          const current = habit.prayerLog?.[action.date] ?? []
          const has = current.includes(action.prayer)
          const next = has ? current.filter((p) => p !== action.prayer) : [...current, action.prayer]
          const prayerLog = { ...(habit.prayerLog ?? {}) }
          if (next.length === 0) delete prayerLog[action.date]
          else prayerLog[action.date] = next
          const met = next.length >= 5
          const hasDate = habit.completedDates.includes(action.date)
          const completedDates = met
            ? (hasDate ? habit.completedDates : [...habit.completedDates, action.date])
            : habit.completedDates.filter((d) => d !== action.date)
          return { ...habit, prayerLog, completedDates }
        }),
      }
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

    case 'goal/add':
      return { ...state, goals: [action.goal, ...state.goals] }

    case 'goal/toggleComplete':
      return {
        ...state,
        goals: state.goals.map((goal) => goal.id === action.id
          ? { ...goal, completedAt: goal.completedAt ? undefined : new Date().toISOString() }
          : goal),
      }

    case 'goal/delete':
      return { ...state, goals: state.goals.filter((goal) => goal.id !== action.id) }

    case 'goal/milestoneAdd':
      return {
        ...state,
        goals: state.goals.map((goal) => goal.id === action.goalId
          ? { ...goal, milestones: [...goal.milestones, action.milestone] }
          : goal),
      }

    case 'goal/milestoneToggle':
      return {
        ...state,
        goals: state.goals.map((goal) => goal.id === action.goalId
          ? {
              ...goal,
              milestones: goal.milestones.map((milestone) => milestone.id === action.milestoneId
                ? { ...milestone, done: !milestone.done }
                : milestone),
            }
          : goal),
      }

    case 'goal/milestoneDelete':
      return {
        ...state,
        goals: state.goals.map((goal) => goal.id === action.goalId
          ? { ...goal, milestones: goal.milestones.filter((milestone) => milestone.id !== action.milestoneId) }
          : goal),
      }

    case 'list/add':
      return { ...state, lists: [action.list, ...state.lists] }

    case 'list/delete':
      return { ...state, lists: state.lists.filter((list) => list.id !== action.id) }

    case 'list/itemAdd':
      return {
        ...state,
        lists: state.lists.map((list) => list.id === action.listId
          ? { ...list, items: [...list.items, action.item] }
          : list),
      }

    case 'list/itemToggle':
      return {
        ...state,
        lists: state.lists.map((list) => list.id === action.listId
          ? {
              ...list,
              items: list.items.map((item) => item.id === action.itemId
                ? { ...item, done: !item.done }
                : item),
            }
          : list),
      }

    case 'list/itemDelete':
      return {
        ...state,
        lists: state.lists.map((list) => list.id === action.listId
          ? { ...list, items: list.items.filter((item) => item.id !== action.itemId) }
          : list),
      }

    case 'list/clearDone':
      return {
        ...state,
        lists: state.lists.map((list) => list.id === action.listId
          ? { ...list, items: list.items.filter((item) => !item.done) }
          : list),
      }

    case 'finance/currency':
      return { ...state, currency: action.currency }

    case 'finance/budget':
      return { ...state, monthlyBudget: action.amount }

    case 'finance/focusGoal':
      return { ...state, dailyFocusGoal: action.minutes }
  }
}
