import { addDays, toDateKey } from '../lib/date'
import type { AppData, Habit, HabitColor, Todo } from '../types'

interface HabitSeed {
  name: string
  emoji: string
  color: HabitColor
  weeklyGoal: number
  frequency: number
}

const HABIT_SEEDS: HabitSeed[] = [
  { name: 'Drink water', emoji: '💧', color: 'sky', weeklyGoal: 7, frequency: 0.88 },
  { name: 'Read 20 minutes', emoji: '📚', color: 'violet', weeklyGoal: 5, frequency: 0.64 },
  { name: 'Morning workout', emoji: '💪', color: 'amber', weeklyGoal: 3, frequency: 0.46 },
  { name: 'Mindful minute', emoji: '🧘', color: 'emerald', weeklyGoal: 7, frequency: 0.72 },
]

const HISTORY_DAYS = 170

function buildHabit(seed: HabitSeed, index: number): Habit {
  const today = new Date()
  const completedDates: string[] = []

  for (let offset = 0; offset < HISTORY_DAYS; offset += 1) {
    const noise = ((offset * 37 + index * 17) % 29) / 28
    const recentBoost = offset < 14 ? 0.12 : 0
    if (noise < seed.frequency + recentBoost) {
      completedDates.push(toDateKey(addDays(today, -offset)))
    }
  }

  // A believable "in progress" state: some habits are already checked off today.
  if (index < 3 && !completedDates.includes(toDateKey(today))) {
    completedDates.push(toDateKey(today))
  }

  return {
    id: `seed-habit-${index + 1}`,
    name: seed.name,
    emoji: seed.emoji,
    color: seed.color,
    weeklyGoal: seed.weeklyGoal,
    createdAt: toDateKey(addDays(today, -(HISTORY_DAYS - 1))),
    completedDates,
  }
}

function buildTodos(): Todo[] {
  const today = new Date()
  const day = (offset: number) => toDateKey(addDays(today, -offset))

  return [
    {
      id: 'seed-todo-1',
      title: 'Ship the new landing page',
      done: false,
      priority: 'high',
      createdAt: day(2),
    },
    {
      id: 'seed-todo-2',
      title: 'Reply to design feedback',
      done: false,
      priority: 'medium',
      createdAt: day(1),
    },
    {
      id: 'seed-todo-3',
      title: 'Book a dentist appointment',
      done: false,
      priority: 'low',
      createdAt: day(0),
    },
    {
      id: 'seed-todo-4',
      title: 'Review the quarterly roadmap',
      done: true,
      priority: 'high',
      createdAt: day(3),
      completedAt: day(1),
    },
    {
      id: 'seed-todo-5',
      title: 'Water the plants',
      done: true,
      priority: 'low',
      createdAt: day(1),
      completedAt: day(0),
    },
  ]
}

/** First-run demo content so both views are useful immediately. */
export function createSeedData(): AppData {
  return {
    version: 1,
    todos: buildTodos(),
    habits: HABIT_SEEDS.map(buildHabit),
  }
}
