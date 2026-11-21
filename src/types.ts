export type Priority = 'low' | 'medium' | 'high'

export type HabitColor = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose'

export interface Todo {
  id: string
  title: string
  done: boolean
  priority: Priority
  createdAt: string
  completedAt?: string
  estimatedMinutes?: number
  loggedMinutes?: number
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

export type FocusMode = 'focus' | 'short-break' | 'long-break'

export interface AppData {
  version: 2
  todos: Todo[]
  habits: Habit[]
  timeBlocks: TimeBlock[]
  focusSessions: FocusSession[]
}

export type View = 'todos' | 'habits' | 'time'

export type Theme = 'github-light' | 'github-dark' | 'equicord' | 'mono'
