import { useState } from 'react'
import type { FormEvent } from 'react'
import { addMonths, formatMonth, monthKey, todayKey } from '../../lib/date'
import { categoryTotals, EXPENSE_META, formatMoney, monthlyTotal } from '../../lib/finance'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import { EXPENSE_CATEGORIES } from '../../types'
import type { ExpenseCategory, Transaction } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'SAR', 'AED', 'EGP', 'MAD', 'TRY', 'JPY']
const SPEND_CATEGORIES = EXPENSE_CATEGORIES.filter((category) => category !== 'income')

interface Draft {
  title: string
  amount: string
  category: ExpenseCategory
  date: string
  note: string
}

function emptyDraft(): Draft {
  return { title: '', amount: '', category: 'food', date: todayKey(), note: '' }
}

export function ExpenseView() {
  const { data, dispatch } = useAppData()
  const [month, setMonth] = useState(() => new Date())
  const [filter, setFilter] = useState<'all' | Transaction['type']>('all')
  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const key = monthKey(month)
  const monthTransactions = data.transactions.filter((item) => item.date.startsWith(key))
  const spent = monthlyTotal(data.transactions, key, 'expense')
  const income = monthlyTotal(data.transactions, key, 'income')
  const net = income - spent
  const budget = data.monthlyBudget
  const remaining = budget - spent
  const progress = budget > 0 ? Math.min(1, spent / budget) : 0
  const categories = categoryTotals(data.transactions, key)
  const visible = monthTransactions
    .filter((item) => filter === 'all' || item.type === filter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))

  const grouped = visible.reduce<Record<string, Transaction[]>>((groups, item) => {
    groups[item.date] = [...(groups[item.date] ?? []), item]
    return groups
  }, {})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Math.abs(Number(draft.amount))
    if (!draft.title.trim() || !Number.isFinite(amount) || amount <= 0) return

    const type: Transaction['type'] = draft.category === 'income' ? 'income' : 'expense'
    dispatch({
      type: 'transaction/add',
      transaction: {
        id: createId(),
        title: draft.title.trim(),
        amount: Math.round(amount * 100) / 100,
        category: draft.category,
        type,
        date: draft.date,
        note: draft.note.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
    })
    setDraft(emptyDraft())
  }

  return (
    <div className="view-stack expense-view">
      <section className="panel expense-composer">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">Add a transaction</h3>
            <p className="card__description">Small entries, clear picture.</p>
          </div>
          <div className="expense-settings">
            <label className="mini-field">
              <span>Currency</span>
              <select
                value={data.currency}
                onChange={(event) => dispatch({ type: 'finance/currency', currency: event.target.value })}
                aria-label="Currency"
              >
                {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </label>
            <label className="mini-field">
              <span>Monthly budget</span>
              <input
                type="number"
                min={0}
                step={10}
                value={data.monthlyBudget}
                onChange={(event) => dispatch({ type: 'finance/budget', amount: Math.max(0, Number(event.target.value) || 0) })}
                aria-label="Monthly budget"
              />
            </label>
          </div>
        </div>

        <form className="expense-form" onSubmit={handleSubmit}>
          <input
            className="field__input"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="What was it for?"
            aria-label="Transaction title"
            maxLength={80}
          />
          <select
            className="field__input"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value as ExpenseCategory })}
            aria-label="Category"
          >
            <option value="income">💰 Income</option>
            {SPEND_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {EXPENSE_META[category].emoji} {EXPENSE_META[category].label}
              </option>
            ))}
          </select>
          <input
            className="field__input field__input--number"
            type="number"
            min={0.01}
            step={0.01}
            value={draft.amount}
            onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
            placeholder="0.00"
            aria-label="Amount"
          />
          <input
            className="field__input"
            type="date"
            value={draft.date}
            onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            aria-label="Date"
          />
          <button type="submit" className="button button--primary" disabled={!draft.title.trim() || !draft.amount}>
            <Icon name="plus" size={16} />
            Add
          </button>
        </form>
      </section>

      <div className="expense-top">
        <div className="stat-grid stat-grid--expense">
          <StatCard icon={<Icon name="receipt" size={18} />} label="Spent this month" value={formatMoney(spent, data.currency)} tone="accent" />
          <StatCard icon={<Icon name="wallet" size={18} />} label="Income" value={formatMoney(income, data.currency)} />
          <StatCard icon={<Icon name="chart" size={18} />} label="Net" value={formatMoney(net, data.currency)} tone={net >= 0 ? 'accent' : 'warm'} />
        </div>

        <section className="card budget-card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Monthly budget</h3>
              <p className="card__description">
                {budget > 0
                  ? `${formatMoney(Math.abs(remaining), data.currency)} ${remaining >= 0 ? 'left to spend' : 'over budget'}`
                  : 'Set a budget above to track your pace.'}
              </p>
            </div>
            <span className="budget-percent">{budget > 0 ? `${Math.round(progress * 100)}%` : '—'}</span>
          </div>
          <div className="budget-track">
            <div className={`budget-fill ${remaining < 0 ? 'budget-fill--over' : ''}`} style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="budget-caption">{formatMoney(spent, data.currency)} of {budget > 0 ? formatMoney(budget, data.currency) : '—'}</p>
        </section>
      </div>

      <div className="expense-bottom">
        <section className="panel transactions-panel">
          <div className="panel__toolbar">
            <div>
              <h3 className="card__title">Transactions</h3>
              <p className="card__description">{formatMonth(month)} · {monthTransactions.length} entries</p>
            </div>
            <div className="expense-nav">
              <div className="calendar-nav">
                <button
                  type="button"
                  className="icon-button icon-button--bordered"
                  onClick={() => setMonth((current) => addMonths(current, -1))}
                  aria-label="Previous month"
                >
                  <Icon name="chevronLeft" size={16} />
                </button>
                <button type="button" className="button button--ghost" onClick={() => setMonth(new Date())}>Today</button>
                <button
                  type="button"
                  className="icon-button icon-button--bordered"
                  onClick={() => setMonth((current) => addMonths(current, 1))}
                  aria-label="Next month"
                >
                  <Icon name="chevronRight" size={16} />
                </button>
              </div>
              <select
                className="field__input filter-select"
                value={filter}
                onChange={(event) => setFilter(event.target.value as typeof filter)}
                aria-label="Filter transactions"
              >
                <option value="all">All</option>
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          {visible.length > 0 ? (
            Object.entries(grouped).map(([date, items]) => (
              <div key={date} className="transaction-group">
                <p className="transaction-group__date">{date}</p>
                <ul className="transaction-list">
                  {items.map((item) => (
                    <li key={item.id} className="transaction-item">
                      <span className={`transaction-icon transaction-icon--${EXPENSE_META[item.category].tone}`}>
                        {EXPENSE_META[item.category].emoji}
                      </span>
                      <div className="transaction-item__body">
                        <strong>{item.title}</strong>
                        <small>
                          {EXPENSE_META[item.category].label}
                          {item.note ? ` · ${item.note}` : ''}
                        </small>
                      </div>
                      <span className={`transaction-amount ${item.type === 'income' ? 'transaction-amount--income' : ''}`}>
                        {item.type === 'income' ? '+' : '−'}{formatMoney(item.amount, data.currency)}
                      </span>
                      <button
                        type="button"
                        className="icon-button icon-button--danger"
                        onClick={() => dispatch({ type: 'transaction/delete', id: item.id })}
                        aria-label={`Delete ${item.title}`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <EmptyState
              icon="receipt"
              title="No transactions yet"
              description="Add your first expense or income entry above."
            />
          )}
        </section>

        <section className="card category-card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Where it went</h3>
              <p className="card__description">Your spending split this month.</p>
            </div>
            <Icon name="pie" size={18} />
          </div>
          {categories.length > 0 ? (
            <ul className="category-list">
              {categories.map(({ category, amount, share }) => (
                <li key={category} className="category-row">
                  <div className="category-row__head">
                    <span>{EXPENSE_META[category].emoji} {EXPENSE_META[category].label}</span>
                    <strong>{formatMoney(amount, data.currency)}</strong>
                  </div>
                  <div className="category-track">
                    <div className={`category-fill category-fill--${EXPENSE_META[category].tone}`} style={{ width: `${share * 100}%` }} />
                  </div>
                  <small>{Math.round(share * 100)}% of spending</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sessions-empty">Add an expense to see your breakdown.</p>
          )}
        </section>
      </div>
    </div>
  )
}
