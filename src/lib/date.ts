export interface CalendarDay {
  key: string
  date: Date
  isToday: boolean
  isFuture: boolean
}

export interface CalendarWeek {
  days: CalendarDay[]
}

export interface MonthLabel {
  label: string
  weekIndex: number
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -date.getDay())
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function getWeekdayName(dayIndex: number): string {
  return WEEKDAY_NAMES[dayIndex]
}

export interface MonthDay {
  key: string
  date: Date
  inMonth: boolean
  isToday: boolean
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

/** Six-week grid so every month renders without layout jumps. */
export function buildMonthGrid(monthDate: Date): MonthDay[][] {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  let cursor = startOfWeek(first)
  const today = todayKey()

  return Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => {
    const day: MonthDay = {
      key: toDateKey(cursor),
      date: new Date(cursor),
      inMonth: cursor.getMonth() === monthDate.getMonth(),
      isToday: toDateKey(cursor) === today,
    }
    cursor = addDays(cursor, 1)
    return day
  }))
}

export function formatDate(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Builds the 53 week / 7 day calendar used by the contribution grid.
 * The final column is the current week, so days later in that week are
 * flagged as future and rendered without interaction.
 */
export function buildCalendar(weekCount = 53): {
  weeks: CalendarWeek[]
  monthLabels: MonthLabel[]
} {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentKey = toDateKey(today)
  const firstDay = addDays(startOfWeek(today), -(weekCount - 1) * 7)

  const weeks: CalendarWeek[] = Array.from({ length: weekCount }, (_, weekIndex) => ({
    days: Array.from({ length: 7 }, (_, dayIndex) => {
      const date = addDays(firstDay, weekIndex * 7 + dayIndex)
      const key = toDateKey(date)
      return {
        key,
        date,
        isToday: key === currentKey,
        isFuture: key > currentKey,
      }
    }),
  }))

  const monthLabels: MonthLabel[] = []
  let previousMonth = -1

  weeks.forEach((week, weekIndex) => {
    const month = week.days[6].date.getMonth()
    if (month === previousMonth) return

    const lastLabel = monthLabels[monthLabels.length - 1]
    if (!lastLabel || weekIndex - lastLabel.weekIndex >= 3) {
      monthLabels.push({ label: MONTH_NAMES[month], weekIndex })
    }
    previousMonth = month
  })

  return { weeks, monthLabels }
}
