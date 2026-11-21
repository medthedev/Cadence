export type Priority = 'low' | 'medium' | 'high'

export type HabitColor = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose'

export const EVENT_CATEGORIES = ['personal', 'work', 'health', 'social', 'other'] as const
export type EventCategory = typeof EVENT_CATEGORIES[number]

export const EXPENSE_CATEGORIES = [
  'food', 'transport', 'bills', 'shopping', 'health', 'entertainment', 'income', 'other',
] as const
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]

export const GOAL_CATEGORIES = ['personal', 'career', 'health', 'learning', 'finance', 'other'] as const
export type GoalCategory = typeof GOAL_CATEGORIES[number]

export const MOODS = [
  { value: 'great', emoji: '🤩', label: 'Great' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'low', emoji: '😔', label: 'Low' },
  { value: 'rough', emoji: '😣', label: 'Rough' },
] as const
export type Mood = typeof MOODS[number]['value']

export interface Todo {
  id: string
  title: string
  done: boolean
  priority: Priority
  createdAt: string
  completedAt?: string
  estimatedMinutes?: number
  loggedMinutes?: number
  dueDate?: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
  color: HabitColor
  weeklyGoal: number
  createdAt: string
  completedDates: string[]
  source?: string
}

export interface TimeBlock {
  id: string
  date: string
  title: string
  todoId?: string
  startTime: string
  durationMinutes: number
  completed: boolean
}

export interface FocusSession {
  id: string
  date: string
  title: string
  todoId?: string
  minutes: number
  mode: FocusMode
  endedAt: string
}

export interface CalendarEvent {
  id: string
  date: string
  title: string
  time?: string
  category: EventCategory
  notes?: string
  createdAt: string
}

export interface Transaction {
  id: string
  date: string
  title: string
  amount: number
  category: ExpenseCategory
  type: 'expense' | 'income'
  note?: string
  createdAt: string
}

export interface GoalMilestone {
  id: string
  title: string
  done: boolean
}

export interface Goal {
  id: string
  title: string
  note?: string
  category: GoalCategory
  targetDate?: string
  createdAt: string
  completedAt?: string
  milestones: GoalMilestone[]
}

export interface JournalEntry {
  id: string
  date: string
  mood: Mood
  content: string
  createdAt: string
  updatedAt: string
}

export interface Person {
  id: string
  name: string
  relationship?: string
  birthday?: string
  nextContact?: string
  cadenceDays: number
  notes?: string
  createdAt: string
  lastContact?: string
}

export interface ListItem {
  id: string
  text: string
  done: boolean
  createdAt: string
}

export interface LifeList {
  id: string
  title: string
  description?: string
  items: ListItem[]
  createdAt: string
}

export type FocusMode = 'focus' | 'short-break' | 'long-break'

export interface AppData {
  version: 5
  todos: Todo[]
  habits: Habit[]
  timeBlocks: TimeBlock[]
  focusSessions: FocusSession[]
  events: CalendarEvent[]
  transactions: Transaction[]
  goals: Goal[]
  journal: JournalEntry[]
  people: Person[]
  lists: LifeList[]
  currency: string
  monthlyBudget: number
  dailyFocusGoal: number
}

export type View =
  | 'today'
  | 'insights'
  | 'todos'
  | 'habits'
  | 'time'
  | 'goals'
  | 'calendar'
  | 'expenses'
  | 'journal'
  | 'people'
  | 'lists'

export type Theme = 'github-light' | 'github-dark' | 'equicord' | 'mono'
