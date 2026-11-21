import type { HabitColor, HabitKind } from '../types'

export const HABIT_CATEGORIES = [
  'Islamic',
  'Health',
  'Fitness',
  'Mind',
  'Learning',
  'Productivity',
  'Life',
] as const

export type HabitCategory = (typeof HABIT_CATEGORIES)[number]

export interface HabitTemplate {
  id: string
  name: string
  emoji: string
  color: HabitColor
  weeklyGoal: number
  category: HabitCategory
  description: string
  kind: HabitKind
  waterTarget?: number
}

type HabitTemplateSeed = Omit<HabitTemplate, 'id'>

const TEMPLATE_SEEDS: HabitTemplateSeed[] = [
  // Islamic
  { name: 'Pray five daily prayers', emoji: '🕌', color: 'emerald', weeklyGoal: 7, category: 'Islamic', description: 'Track Fajr, Dhuhr, Asr, Maghrib and Isha each day.', kind: 'prayer' },
  { name: 'Read Quran', emoji: '📖', color: 'emerald', weeklyGoal: 7, category: 'Islamic', description: 'Read or recite a portion daily.', kind: 'check' },
  { name: 'Morning adhkar', emoji: '☀️', color: 'amber', weeklyGoal: 7, category: 'Islamic', description: 'Start the morning with remembrance.', kind: 'check' },
  { name: 'Evening adhkar', emoji: '🌙', color: 'violet', weeklyGoal: 7, category: 'Islamic', description: 'End the day with remembrance.', kind: 'check' },
  { name: 'Make du\'a', emoji: '🤲', color: 'violet', weeklyGoal: 7, category: 'Islamic', description: 'Take a moment for personal supplication.', kind: 'check' },
  { name: 'Give sadaqah', emoji: '💛', color: 'amber', weeklyGoal: 1, category: 'Islamic', description: 'Give charity, even if small.', kind: 'check' },

  // Health
  { name: 'Drink water', emoji: '💧', color: 'sky', weeklyGoal: 7, category: 'Health', description: 'Track your daily water intake in liters.', kind: 'water', waterTarget: 2 },
  { name: 'Sleep 8 hours', emoji: '😴', color: 'violet', weeklyGoal: 7, category: 'Health', description: 'Get a full night of rest.', kind: 'check' },
  { name: 'Eat a healthy meal', emoji: '🥗', color: 'emerald', weeklyGoal: 7, category: 'Health', description: 'Choose something nourishing.', kind: 'check' },
  { name: 'Take vitamins', emoji: '💊', color: 'sky', weeklyGoal: 7, category: 'Health', description: 'Keep up with your supplements.', kind: 'check' },
  { name: 'No screens before bed', emoji: '📵', color: 'rose', weeklyGoal: 7, category: 'Health', description: 'Wind down without your phone.', kind: 'check' },

  // Fitness
  { name: 'Walk 10,000 steps', emoji: '👟', color: 'emerald', weeklyGoal: 7, category: 'Fitness', description: 'Move throughout the day.', kind: 'check' },
  { name: 'Workout', emoji: '💪', color: 'amber', weeklyGoal: 3, category: 'Fitness', description: 'Any workout counts.', kind: 'check' },
  { name: 'Stretch', emoji: '🤸', color: 'amber', weeklyGoal: 7, category: 'Fitness', description: 'Loosen up your body.', kind: 'check' },
  { name: 'Run', emoji: '🏃', color: 'amber', weeklyGoal: 3, category: 'Fitness', description: 'Get a run in.', kind: 'check' },

  // Mind
  { name: 'Meditate', emoji: '🧘', color: 'violet', weeklyGoal: 7, category: 'Mind', description: 'A few quiet minutes.', kind: 'check' },
  { name: 'Journal', emoji: '📔', color: 'rose', weeklyGoal: 7, category: 'Mind', description: 'Write your thoughts down.', kind: 'check' },
  { name: 'Gratitude', emoji: '💛', color: 'rose', weeklyGoal: 7, category: 'Mind', description: 'Note something you\'re grateful for.', kind: 'check' },
  { name: 'Deep breathing', emoji: '🌬️', color: 'sky', weeklyGoal: 7, category: 'Mind', description: 'Pause and breathe.', kind: 'check' },

  // Learning
  { name: 'Read', emoji: '📚', color: 'violet', weeklyGoal: 7, category: 'Learning', description: 'Read at least 20 minutes.', kind: 'check' },
  { name: 'Learn a language', emoji: '🗣️', color: 'sky', weeklyGoal: 5, category: 'Learning', description: 'Practice a few minutes daily.', kind: 'check' },
  { name: 'Study', emoji: '✍️', color: 'violet', weeklyGoal: 5, category: 'Learning', description: 'Focused learning time.', kind: 'check' },
  { name: 'Practice a skill', emoji: '🎯', color: 'amber', weeklyGoal: 5, category: 'Learning', description: 'Deliberate practice.', kind: 'check' },

  // Productivity
  { name: 'Plan your day', emoji: '🗓️', color: 'amber', weeklyGoal: 7, category: 'Productivity', description: 'Set your priorities.', kind: 'check' },
  { name: 'Deep work', emoji: '🎯', color: 'amber', weeklyGoal: 5, category: 'Productivity', description: 'One focused work block.', kind: 'check' },
  { name: 'Inbox zero', emoji: '📥', color: 'sky', weeklyGoal: 5, category: 'Productivity', description: 'Clear your inbox.', kind: 'check' },
  { name: 'Weekly review', emoji: '📊', color: 'violet', weeklyGoal: 1, category: 'Productivity', description: 'Reflect and plan ahead.', kind: 'check' },

  // Life
  { name: 'Make the bed', emoji: '🛏️', color: 'amber', weeklyGoal: 7, category: 'Life', description: 'A small win to start the day.', kind: 'check' },
  { name: 'Tidy up', emoji: '🧹', color: 'sky', weeklyGoal: 5, category: 'Life', description: 'Keep your space clean.', kind: 'check' },
  { name: 'Call family', emoji: '📞', color: 'rose', weeklyGoal: 2, category: 'Life', description: 'Check in with someone you love.', kind: 'check' },
  { name: 'Save money', emoji: '🪙', color: 'emerald', weeklyGoal: 7, category: 'Life', description: 'Put something aside.', kind: 'check' },
  { name: 'Go outside', emoji: '🌳', color: 'emerald', weeklyGoal: 7, category: 'Life', description: 'Get some fresh air.', kind: 'check' },
]

export const HABIT_LIBRARY: HabitTemplate[] = TEMPLATE_SEEDS.map((template, index) => ({
  ...template,
  id: `habit-template-${index + 1}`,
}))
