import { createSeedData } from '../data/seed'
import type { AppData, Habit, Todo } from '../types'

const STORAGE_KEY = 'freetodo.data.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTodo(value: unknown): value is Todo {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.done === 'boolean'
    && typeof value.priority === 'string'
    && typeof value.createdAt === 'string'
}

function isHabit(value: unknown): value is Habit {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.emoji === 'string'
    && typeof value.color === 'string'
    && typeof value.weeklyGoal === 'number'
    && typeof value.createdAt === 'string'
    && Array.isArray(value.completedDates)
}

function isAppData(value: unknown): value is AppData {
  return isRecord(value)
    && value.version === 1
    && Array.isArray(value.todos)
    && Array.isArray(value.habits)
    && value.todos.every(isTodo)
    && value.habits.every(isHabit)
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedData()

    const parsed: unknown = JSON.parse(raw)
    return isAppData(parsed) ? parsed : createSeedData()
  } catch {
    return createSeedData()
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage can be unavailable (private mode / quota). The app still works in memory.
  }
}
