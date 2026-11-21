import type { AppData, FocusMode, FocusSession, Habit, TimeBlock, Todo } from '../types'

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

function isTimeBlock(value: unknown): value is TimeBlock {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.date === 'string'
    && typeof value.title === 'string'
    && typeof value.startTime === 'string'
    && typeof value.durationMinutes === 'number'
    && typeof value.completed === 'boolean'
}

function isFocusMode(value: unknown): value is FocusMode {
  return value === 'focus' || value === 'short-break' || value === 'long-break'
}

function isFocusSession(value: unknown): value is FocusSession {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.date === 'string'
    && typeof value.title === 'string'
    && typeof value.minutes === 'number'
    && isFocusMode(value.mode)
    && typeof value.endedAt === 'string'
}

function isAppData(value: unknown): value is AppData {
  return isRecord(value)
    && value.version === 2
    && Array.isArray(value.todos)
    && Array.isArray(value.habits)
    && Array.isArray(value.timeBlocks)
    && Array.isArray(value.focusSessions)
    && value.todos.every(isTodo)
    && value.habits.every(isHabit)
    && value.timeBlocks.every(isTimeBlock)
    && value.focusSessions.every(isFocusSession)
}

export function createEmptyData(): AppData {
  return { version: 2, todos: [], habits: [], timeBlocks: [], focusSessions: [] }
}

function migrate(value: unknown): AppData | null {
  if (!isRecord(value)) return null

  if (value.version === 1 && Array.isArray(value.todos) && Array.isArray(value.habits)) {
    return {
      ...createEmptyData(),
      todos: value.todos.filter(isTodo),
      habits: value.habits.filter(isHabit),
    }
  }

  return isAppData(value) ? value : null
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyData()

    const parsed: unknown = JSON.parse(raw)
    return migrate(parsed) ?? createEmptyData()
  } catch {
    return createEmptyData()
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage can be unavailable (private mode / quota). The app still works in memory.
  }
}
