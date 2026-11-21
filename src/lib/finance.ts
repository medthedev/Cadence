import type { EventCategory, ExpenseCategory, Transaction } from '../types'

export interface CategoryMeta {
  label: string
  emoji: string
  tone: string
}

export const EXPENSE_META: Record<ExpenseCategory, CategoryMeta> = {
  food: { label: 'Food & drink', emoji: '🍜', tone: 'food' },
  transport: { label: 'Transport', emoji: '🚗', tone: 'transport' },
  bills: { label: 'Bills', emoji: '🧾', tone: 'bills' },
  shopping: { label: 'Shopping', emoji: '🛍️', tone: 'shopping' },
  health: { label: 'Health', emoji: '💊', tone: 'health' },
  entertainment: { label: 'Fun', emoji: '🎬', tone: 'entertainment' },
  income: { label: 'Income', emoji: '💰', tone: 'income' },
  other: { label: 'Other', emoji: '📦', tone: 'other' },
}

export const EVENT_META: Record<EventCategory, { label: string; tone: string }> = {
  personal: { label: 'Personal', tone: 'personal' },
  work: { label: 'Work', tone: 'work' },
  health: { label: 'Health', tone: 'health' },
  social: { label: 'Social', tone: 'social' },
  other: { label: 'Other', tone: 'other' },
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function monthlyTotal(transactions: Transaction[], key: string, type: Transaction['type']): number {
  return transactions
    .filter((item) => item.type === type && item.date.startsWith(key))
    .reduce((total, item) => total + item.amount, 0)
}

export function dailySpend(transactions: Transaction[], date: string): number {
  return transactions
    .filter((item) => item.type === 'expense' && item.date === date)
    .reduce((total, item) => total + item.amount, 0)
}

export interface CategoryTotal {
  category: ExpenseCategory
  amount: number
  share: number
}

export function categoryTotals(transactions: Transaction[], key: string): CategoryTotal[] {
  const map = new Map<ExpenseCategory, number>()
  for (const item of transactions) {
    if (item.type !== 'expense' || !item.date.startsWith(key)) continue
    map.set(item.category, (map.get(item.category) ?? 0) + item.amount)
  }
  const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0)
  return Array.from(map, ([category, amount]) => ({
    category,
    amount,
    share: total > 0 ? amount / total : 0,
  })).sort((a, b) => b.amount - a.amount)
}
