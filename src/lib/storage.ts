import type {
  AppData, CalendarEvent, ExpenseCategory, EventCategory, FocusMode, FocusSession,
  Habit, TimeBlock, Todo, Transaction,
} from '../types'
import { EXPENSE_CATEGORIES, EVENT_CATEGORIES } from '../types'

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
    && (value.dueDate === undefined || typeof value.dueDate === 'string')
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

function isEventCategory(value: unknown): value is EventCategory {
  return EVENT_CATEGORIES.some((category) => category === value)
}

function isCalendarEvent(value: unknown): value is CalendarEvent {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.date === 'string'
    && typeof value.title === 'string'
    && isEventCategory(value.category)
    && typeof value.createdAt === 'string'
}

function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.some((category) => category === value)
}

function isTransaction(value: unknown): value is Transaction {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.date === 'string'
    && typeof value.title === 'string'
    && typeof value.amount === 'number'
    && isExpenseCategory(value.category)
    && (value.type === 'expense' || value.type === 'income')
    && typeof value.createdAt === 'string'
}

export function isAppData(value: unknown): value is AppData {
  return isRecord(value)
    && value.version === 4
    && Array.isArray(value.todos)
    && Array.isArray(value.habits)
    && Array.isArray(value.timeBlocks)
    && Array.isArray(value.focusSessions)
    && Array.isArray(value.events)
    && Array.isArray(value.transactions)
    && typeof value.currency === 'string'
    && typeof value.monthlyBudget === 'number'
    && typeof value.dailyFocusGoal === 'number'
    && value.todos.every(isTodo)
    && value.habits.every(isHabit)
    && value.timeBlocks.every(isTimeBlock)
    && value.focusSessions.every(isFocusSession)
    && value.events.every(isCalendarEvent)
    && value.transactions.every(isTransaction)
}

export function createEmptyData(): AppData {
  return {
    version: 4,
    todos: [],
    habits: [],
    timeBlocks: [],
    focusSessions: [],
    events: [],
    transactions: [],
    currency: 'USD',
    monthlyBudget: 0,
    dailyFocusGoal: 60,
  }
}

/** Accepts every historical shape and returns a current workspace. */
export function migrateData(value: unknown): AppData | null {
  if (!isRecord(value)) return null
  if (value.version === 4) return isAppData(value) ? value : null

  if (value.version === 1 || value.version === 2 || value.version === 3) {
    return {
      ...createEmptyData(),
      todos: Array.isArray(value.todos) ? value.todos.filter(isTodo) : [],
      habits: Array.isArray(value.habits) ? value.habits.filter(isHabit) : [],
      timeBlocks: Array.isArray(value.timeBlocks) ? value.timeBlocks.filter(isTimeBlock) : [],
      focusSessions: Array.isArray(value.focusSessions)
        ? value.focusSessions.filter(isFocusSession)
        : [],
      events: Array.isArray(value.events) ? value.events.filter(isCalendarEvent) : [],
      transactions: Array.isArray(value.transactions)
        ? value.transactions.filter(isTransaction)
        : [],
      currency: typeof value.currency === 'string' ? value.currency : 'USD',
      monthlyBudget: typeof value.monthlyBudget === 'number' ? value.monthlyBudget : 0,
    }
  }

  return null
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyData()
    const parsed: unknown = JSON.parse(raw)
    return migrateData(parsed) ?? createEmptyData()
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
