export type Priority = 'low' | 'medium' | 'high'

export type HabitColor = 'emerald' | 'sky' | 'violet' | 'amber' | 'rose'

export interface Todo {
  id: string
  title: string
  done: boolean
  priority: Priority
  createdAt: string
  completedAt?: string
}

export interface Habit {
  id: string
  name: string
  emoji: string
  color: HabitColor
  weeklyGoal: number
  createdAt: string
  completedDates: string[]
}

export interface AppData {
  version: 1
  todos: Todo[]
  habits: Habit[]
}

export type View = 'todos' | 'habits'

export type Theme = 'light' | 'dark'
