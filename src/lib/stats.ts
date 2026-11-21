import {
  addDays,
  fromDateKey,
  startOfWeek,
  toDateKey,
} from './date'

export function normalizeDates(dates: string[]): string[] {
  return [...new Set(dates)].sort()
}

/** Consecutive days ending today, with yesterday allowed as a grace day. */
export function currentStreak(dates: string[]): number {
  const completed = new Set(dates)
  const today = new Date()
  let cursor = completed.has(toDateKey(today)) ? today : addDays(today, -1)

  if (!completed.has(toDateKey(cursor))) return 0

  let streak = 0
  while (completed.has(toDateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function longestStreak(dates: string[]): number {
  let best = 0
  let running = 0
  let previous: string | null = null

  for (const key of normalizeDates(dates)) {
    running = previous && toDateKey(addDays(fromDateKey(previous), 1)) === key
      ? running + 1
      : 1
    best = Math.max(best, running)
    previous = key
  }

  return best
}

export function completionsThisWeek(dates: string[]): number {
  const start = toDateKey(startOfWeek(new Date()))
  const end = toDateKey(new Date())
  return dates.filter((key) => key >= start && key <= end).length
}

/** Percentage of days completed over the trailing window, since the habit began. */
export function completionRate(dates: string[], sinceKey: string, windowDays = 90): number {
  const windowStart = addDays(new Date(), -(windowDays - 1))
  const habitStart = fromDateKey(sinceKey)
  const start = habitStart > windowStart ? habitStart : windowStart
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalDays = Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1
  if (totalDays <= 0) return 0

  const completed = normalizeDates(dates).filter((key) => key >= toDateKey(start)).length
  return Math.min(100, Math.round((completed / totalDays) * 100))
}

/** Maps a count out of a total to GitHub's five heatmap shades (0-4). */
export function activityLevel(count: number, total: number): number {
  if (count <= 0 || total <= 0) return 0
  return Math.min(4, Math.ceil((count / total) * 4))
}
