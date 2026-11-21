import type { AppData, Habit } from '../types'
import { toDateKey } from './date'
import { longestStreak } from './stats'

export interface Activity {
  tasksDone: number
  habitsDone: number
  focusMinutes: number
  spend: number
  income: number
  events: number
  blocksDone: number
  score: number
}

function matchesIso(iso: string | undefined, match: (key: string) => boolean): boolean {
  if (!iso) return false
  const date = new Date(iso)
  return !Number.isNaN(date.getTime()) && match(toDateKey(date))
}

export function activityWhere(data: AppData, match: (key: string) => boolean): Activity {
  const tasksDone = data.todos.filter((todo) => todo.done && matchesIso(todo.completedAt, match)).length
  const habitsDone = data.habits.reduce(
    (total, habit) => total + habit.completedDates.filter(match).length, 0,
  )
  const focusMinutes = data.focusSessions
    .filter((session) => session.mode === 'focus' && match(session.date))
    .reduce((total, session) => total + session.minutes, 0)
  const money = data.transactions.filter((item) => match(item.date))
  const spend = money.filter((item) => item.type === 'expense').reduce((total, item) => total + item.amount, 0)
  const income = money.filter((item) => item.type === 'income').reduce((total, item) => total + item.amount, 0)
  const events = data.events.filter((event) => match(event.date)).length
  const blocksDone = data.timeBlocks.filter((block) => block.completed && match(block.date)).length

  return {
    tasksDone,
    habitsDone,
    focusMinutes,
    spend,
    income,
    events,
    blocksDone,
    score: Math.round(tasksDone * 4 + habitsDone * 3 + focusMinutes / 8 + blocksDone * 2 + events),
  }
}

export function dayActivity(data: AppData, key: string): Activity {
  return activityWhere(data, (date) => date === key)
}

export function monthActivity(data: AppData, key: string): Activity {
  return activityWhere(data, (date) => date.startsWith(key))
}

export function yearActivity(data: AppData, year: number): Activity {
  return activityWhere(data, (date) => date.startsWith(String(year)))
}

export function dailySeries(data: AppData, key: string) {
  const [year, month] = key.split('-').map(Number)
  const days = new Date(year, month, 0).getDate()
  return Array.from({ length: days }, (_, index) => {
    const date = `${key}-${String(index + 1).padStart(2, '0')}`
    return { key: date, label: String(index + 1), activity: dayActivity(data, date) }
  })
}

export function hourlySeries(data: AppData, key: string) {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    minutes: 0,
    count: 0,
  }))

  for (const session of data.focusSessions) {
    if (session.date !== key) continue
    const hour = new Date(session.endedAt).getHours()
    if (Number.isNaN(hour)) continue
    buckets[hour].minutes += session.minutes
    buckets[hour].count += 1
  }
  for (const block of data.timeBlocks) {
    if (block.date !== key) continue
    const hour = Number(block.startTime.split(':')[0])
    if (!Number.isFinite(hour) || hour < 0 || hour > 23) continue
    buckets[hour].minutes += block.durationMinutes
    buckets[hour].count += 1
  }
  return buckets
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function monthlySeries(data: AppData, year: number) {
  return Array.from({ length: 12 }, (_, index) => {
    const key = `${year}-${String(index + 1).padStart(2, '0')}`
    return { key, label: MONTH_LABELS[index], activity: monthActivity(data, key) }
  })
}

export function heatmapCounts(data: AppData, year: number): Record<string, number> {
  const counts: Record<string, number> = {}
  for (let month = 1; month <= 12; month += 1) {
    const days = new Date(year, month, 0).getDate()
    for (let day = 1; day <= days; day += 1) {
      const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      counts[key] = dayActivity(data, key).score
    }
  }
  return counts
}

export function activeStreak(data: AppData): number {
  const dates = new Set<string>()
  for (const habit of data.habits) habit.completedDates.forEach((date) => dates.add(date))
  for (const todo of data.todos) {
    if (todo.done && todo.completedAt) dates.add(toDateKey(new Date(todo.completedAt)))
  }
  data.focusSessions.forEach((session) => dates.add(session.date))
  data.events.forEach((event) => dates.add(event.date))
  data.transactions.forEach((item) => dates.add(item.date))
  data.timeBlocks.filter((block) => block.completed).forEach((block) => dates.add(block.date))
  return longestStreak([...dates])
}

export function habitMonthDays(habit: Habit, key: string): boolean[] {
  const [year, month] = key.split('-').map(Number)
  const days = new Date(year, month, 0).getDate()
  const done = new Set(habit.completedDates)
  return Array.from({ length: days }, (_, index) => done.has(`${key}-${String(index + 1).padStart(2, '0')}`))
}
