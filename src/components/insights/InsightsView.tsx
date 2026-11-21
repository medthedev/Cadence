import { useMemo, useState } from 'react'
import {
  activeStreak, dailySeries, dayActivity, heatmapCounts, habitMonthDays,
  hourlySeries, monthActivity, monthlySeries, yearActivity,
} from '../../lib/analytics'
import { addDays, addMonths, formatLongDate, formatMonth, fromDateKey, monthKey, toDateKey, todayKey } from '../../lib/date'
import { categoryTotals, EXPENSE_META, formatMoney } from '../../lib/finance'
import { useAppData } from '../../store/context'
import type { View } from '../../types'
import { BarChart, DonutChart, TrendChart, YearHeatmap } from '../common/Charts'
import type { ChartPoint, DonutSegment } from '../common/Charts'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'

type Tab = 'day' | 'month' | 'year'

interface InsightsViewProps {
  onNavigate: (view: View) => void
}

interface PeriodNavProps {
  label: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
}

function PeriodNav({ label, onPrev, onNext, onToday }: PeriodNavProps) {
  return (
    <div className="insights-nav">
      <div className="calendar-nav">
        <button type="button" className="icon-button icon-button--bordered" onClick={onPrev} aria-label="Previous period">
          <Icon name="chevronLeft" size={16} />
        </button>
        <button type="button" className="button button--ghost" onClick={onToday}>Today</button>
        <button type="button" className="icon-button icon-button--bordered" onClick={onNext} aria-label="Next period">
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
      <strong className="insights-nav__label">{label}</strong>
    </div>
  )
}

const numberFormat = (value: number) => String(Math.round(value))

export function InsightsView({ onNavigate }: InsightsViewProps) {
  const { data, dispatch } = useAppData()
  const [tab, setTab] = useState<Tab>('day')
  const [day, setDay] = useState(todayKey)
  const [month, setMonth] = useState(() => new Date())
  const [year, setYear] = useState(() => new Date().getFullYear())

  const monthKeyValue = monthKey(month)
  const moneyFormat = (value: number) => formatMoney(value, data.currency)

  const dayStats = useMemo(() => dayActivity(data, day), [data, day])
  const hours = useMemo(() => hourlySeries(data, day), [data, day])
  const monthStats = useMemo(() => monthActivity(data, monthKeyValue), [data, monthKeyValue])
  const monthDays = useMemo(() => dailySeries(data, monthKeyValue), [data, monthKeyValue])
  const yearStats = useMemo(() => yearActivity(data, year), [data, year])
  const yearMonths = useMemo(() => monthlySeries(data, year), [data, year])
  const heat = useMemo(() => heatmapCounts(data, year), [data, year])
  const streak = useMemo(() => activeStreak(data), [data])

  const hourPoints: ChartPoint[] = hours.map((hour) => ({
    label: String(hour.hour).padStart(2, '0'),
    value: hour.minutes,
    hint: `${hour.count} entr${hour.count === 1 ? 'y' : 'ies'}`,
  }))

  const dayMix: DonutSegment[] = [
    { label: 'Tasks', value: dayStats.tasksDone * 4, color: 'var(--chart-1)' },
    { label: 'Habits', value: dayStats.habitsDone * 3, color: 'var(--chart-2)' },
    { label: 'Focus', value: Math.round(dayStats.focusMinutes / 8), color: 'var(--chart-3)' },
    { label: 'Blocks', value: dayStats.blocksDone * 2, color: 'var(--chart-4)' },
    { label: 'Events', value: dayStats.events, color: 'var(--chart-5)' },
  ]

  const dailyPoints: ChartPoint[] = monthDays.map((entry) => ({
    label: String(entry.label),
    value: entry.activity.score,
    hint: `${entry.activity.tasksDone} tasks · ${entry.activity.focusMinutes}m focus`,
  }))

  const momentumPoints: ChartPoint[] = monthDays.map((entry, index) => ({
    label: String(entry.label),
    value: monthDays.slice(0, index + 1).reduce((sum, item) => sum + item.activity.score, 0),
  }))

  const spendTotals = categoryTotals(data.transactions, monthKeyValue)
  const spendMix: DonutSegment[] = spendTotals.map((entry, index) => ({
    label: EXPENSE_META[entry.category].label,
    value: Math.round(entry.amount * 100) / 100,
    color: `var(--chart-${(index % 5) + 1})`,
  }))

  const monthPoints: ChartPoint[] = yearMonths.map((entry) => ({
    label: entry.label,
    value: entry.activity.score,
    hint: `${entry.activity.focusMinutes}m focus`,
  }))

  const yearMomentum: ChartPoint[] = yearMonths.map((entry, index) => ({
    label: entry.label,
    value: yearMonths.slice(0, index + 1).reduce((sum, item) => sum + item.activity.score, 0),
  }))

  const activeDays = Object.values(heat).filter((score) => score > 0).length
  const bestMonth = yearMonths.reduce((best, entry) => entry.activity.score > best.activity.score ? entry : best, yearMonths[0])
  const goal = data.dailyFocusGoal
  const goalPercent = goal > 0 ? Math.min(100, Math.round((dayStats.focusMinutes / goal) * 100)) : 0

  const completedTasks = data.todos.filter((todo) => todo.done && todo.completedAt?.startsWith(day))
  const daySessions = data.focusSessions.filter((session) => session.date === day && session.mode === 'focus')
  const dayEvents = data.events.filter((event) => event.date === day).sort((a, b) => (a.time || '').localeCompare(b.time || ''))

  const tabs: Array<{ id: Tab; label: string; icon: 'clock' | 'calendar' | 'chart' }> = [
    { id: 'day', label: 'Day', icon: 'clock' },
    { id: 'month', label: 'Month', icon: 'calendar' },
    { id: 'year', label: 'Year', icon: 'chart' },
  ]

  return (
    <div className="view-stack insights-view">
      <section className="panel insights-controls">
        <div className="segmented" role="group" aria-label="Insights period">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`segmented__button ${tab === item.id ? 'segmented__button--active' : ''}`}
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </div>
        <p className="insights-controls__hint">
          Activity points: tasks ×4, habits ×3, focus minutes ÷8, blocks ×2, events ×1.
        </p>
      </section>

      {tab === 'day' && (
        <div className="insights-period">
          <PeriodNav
            label={formatLongDate(fromDateKey(day))}
            onPrev={() => setDay(toDateKey(addDays(fromDateKey(day), -1)))}
            onNext={() => setDay(toDateKey(addDays(fromDateKey(day), 1)))}
            onToday={() => setDay(todayKey())}
          />

          <div className="stat-grid stat-grid--insights">
            <StatCard icon={<Icon name="sparkles" size={18} />} label="Activity score" value={dayStats.score} tone="accent" />
            <StatCard icon={<Icon name="check" size={18} />} label="Tasks done" value={dayStats.tasksDone} />
            <StatCard icon={<Icon name="target" size={18} />} label="Habits done" value={dayStats.habitsDone} />
            <StatCard icon={<Icon name="timer" size={18} />} label="Focus" value={dayStats.focusMinutes} suffix=" min" />
            <StatCard icon={<Icon name="wallet" size={18} />} label="Spent" value={moneyFormat(dayStats.spend)} />
          </div>

          <section className="card goal-card">
            <div className="goal-card__head">
              <div>
                <p className="card__eyebrow">Daily focus goal</p>
                <h3 className="card__title">
                  {dayStats.focusMinutes} of {goal} minutes
                </h3>
              </div>
              <label className="mini-field">
                <span>Goal (min)</span>
                <input
                  type="number"
                  min={5}
                  max={600}
                  step={5}
                  value={goal}
                  onChange={(event) => dispatch({
                    type: 'finance/focusGoal',
                    minutes: Math.min(600, Math.max(5, Number(event.target.value) || 5)),
                  })}
                  aria-label="Daily focus goal in minutes"
                />
              </label>
            </div>
            <div className="budget-track">
              <div className="budget-fill" style={{ width: `${goalPercent}%` }} />
            </div>
            <p className="budget-caption">{goalPercent}% of today's goal · {Math.max(0, goal - dayStats.focusMinutes)} minutes to go</p>
          </section>

          <div className="insights-grid">
            <section className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">Focus by hour</h3>
                  <p className="card__description">When you did your deepest work.</p>
                </div>
                <Icon name="timer" size={18} />
              </div>
              <BarChart points={hourPoints} format={(value) => `${Math.round(value)} min`} color="var(--chart-1)" />
            </section>

            <section className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">Activity mix</h3>
                  <p className="card__description">What made up your score.</p>
                </div>
                <Icon name="pie" size={18} />
              </div>
              <DonutChart
                segments={dayMix}
                format={numberFormat}
                centerValue={String(dayStats.score)}
                centerLabel="points"
              />
            </section>
          </div>

          <section className="card">
            <div className="card__header">
              <div>
                <h3 className="card__title">Day log</h3>
                <p className="card__description">Everything recorded on this day.</p>
              </div>
              <button type="button" className="text-button" onClick={() => onNavigate('today')}>Open today →</button>
            </div>
            {completedTasks.length + daySessions.length + dayEvents.length > 0 ? (
              <ul className="insight-log">
                {completedTasks.map((todo) => (
                  <li key={todo.id}>
                    <span className="insight-log__icon insight-log__icon--task"><Icon name="check" size={14} /></span>
                    <strong>{todo.title}</strong>
                    <small>Task completed</small>
                  </li>
                ))}
                {daySessions.map((session) => (
                  <li key={session.id}>
                    <span className="insight-log__icon insight-log__icon--focus"><Icon name="timer" size={14} /></span>
                    <strong>{session.title}</strong>
                    <small>{session.minutes} min focus</small>
                  </li>
                ))}
                {dayEvents.map((event) => (
                  <li key={event.id}>
                    <span className="insight-log__icon insight-log__icon--event"><Icon name="calendar" size={14} /></span>
                    <strong>{event.title}</strong>
                    <small>{event.time || 'All day'}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sessions-empty">No activity recorded on this day yet.</p>
            )}
          </section>
        </div>
      )}

      {tab === 'month' && (
        <div className="insights-period">
          <PeriodNav
            label={formatMonth(month)}
            onPrev={() => setMonth((current) => addMonths(current, -1))}
            onNext={() => setMonth((current) => addMonths(current, 1))}
            onToday={() => setMonth(new Date())}
          />

          <div className="stat-grid stat-grid--insights">
            <StatCard icon={<Icon name="sparkles" size={18} />} label="Activity score" value={monthStats.score} tone="accent" />
            <StatCard icon={<Icon name="check" size={18} />} label="Tasks done" value={monthStats.tasksDone} />
            <StatCard icon={<Icon name="target" size={18} />} label="Habits done" value={monthStats.habitsDone} />
            <StatCard icon={<Icon name="timer" size={18} />} label="Focus" value={monthStats.focusMinutes} suffix=" min" />
            <StatCard icon={<Icon name="wallet" size={18} />} label="Spent" value={moneyFormat(monthStats.spend)} />
          </div>

          <div className="insights-grid">
            <section className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">Daily activity</h3>
                  <p className="card__description">Your score on every day of the month.</p>
                </div>
                <Icon name="chart" size={18} />
              </div>
              <BarChart points={dailyPoints} format={numberFormat} color="var(--chart-1)" labelEvery={5} />
            </section>

            <section className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">Momentum</h3>
                  <p className="card__description">Points stacking up across the month.</p>
                </div>
                <Icon name="arrowRight" size={18} />
              </div>
              <TrendChart points={momentumPoints} format={numberFormat} color="var(--chart-2)" labelEvery={5} />
            </section>
          </div>

          <div className="insights-grid">
            <section className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">Where the money went</h3>
                  <p className="card__description">Spending by category this month.</p>
                </div>
                <button type="button" className="text-button" onClick={() => onNavigate('expenses')}>Expenses →</button>
              </div>
              <DonutChart
                segments={spendMix}
                format={moneyFormat}
                centerValue={moneyFormat(monthStats.spend)}
                centerLabel="spent"
              />
            </section>

            <section className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">Habit consistency</h3>
                  <p className="card__description">Every square is a day this month.</p>
                </div>
                <button type="button" className="text-button" onClick={() => onNavigate('habits')}>Habits →</button>
              </div>
              {data.habits.length > 0 ? (
                <div className="habit-strips">
                  {data.habits.map((habit) => {
                    const flags = habitMonthDays(habit, monthKeyValue)
                    return (
                      <div className="habit-strip" key={habit.id}>
                        <span className="habit-strip__name">{habit.emoji} {habit.name}</span>
                        <div className="habit-strip__days">
                          {flags.map((done, index) => (
                            <i
                              key={index}
                              className={`habit-strip__day ${done ? `habit-strip__day--done habit-strip__day--${habit.color}` : ''}`}
                              title={`${monthKeyValue}-${String(index + 1).padStart(2, '0')}: ${done ? 'done' : 'missed'}`}
                            />
                          ))}
                        </div>
                        <span className="habit-strip__count">{flags.filter(Boolean).length}/{flags.length}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="sessions-empty">Add a habit to see your monthly consistency.</p>
              )}
            </section>
          </div>
        </div>
      )}

      {tab === 'year' && (
        <div className="insights-period">
          <PeriodNav
            label={`${year}`}
            onPrev={() => setYear((current) => current - 1)}
            onNext={() => setYear((current) => current + 1)}
            onToday={() => setYear(new Date().getFullYear())}
          />

          <div className="stat-grid stat-grid--insights">
            <StatCard icon={<Icon name="sparkles" size={18} />} label="Activity score" value={yearStats.score} tone="accent" />
            <StatCard icon={<Icon name="check" size={18} />} label="Tasks done" value={yearStats.tasksDone} />
            <StatCard icon={<Icon name="target" size={18} />} label="Habits done" value={yearStats.habitsDone} />
            <StatCard icon={<Icon name="timer" size={18} />} label="Focus" value={yearStats.focusMinutes} suffix=" min" />
            <StatCard icon={<Icon name="wallet" size={18} />} label="Spent" value={moneyFormat(yearStats.spend)} />
          </div>

          <section className="card">
            <div className="card__header">
              <div>
                <h3 className="card__title">Year in review</h3>
                <p className="card__description">Every day at a glance. Click a square to jump to it.</p>
              </div>
              <Icon name="trophy" size={18} />
            </div>
            <YearHeatmap
              year={year}
              counts={heat}
              onSelect={(key) => { setDay(key); setTab('day') }}
            />
          </section>

          <div className="insights-grid">
            <section className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">Monthly activity</h3>
                  <p className="card__description">Your strongest and quietest months.</p>
                </div>
                <Icon name="chart" size={18} />
              </div>
              <BarChart points={monthPoints} format={numberFormat} color="var(--chart-1)" labelEvery={1} />
            </section>

            <section className="card">
              <div className="card__header">
                <div>
                  <h3 className="card__title">Yearly momentum</h3>
                  <p className="card__description">The full year, accumulating.</p>
                </div>
                <Icon name="arrowRight" size={18} />
              </div>
              <TrendChart points={yearMomentum} format={numberFormat} color="var(--chart-2)" labelEvery={1} />
            </section>
          </div>

          <div className="insight-highlights">
            <div className="insight-highlight">
              <Icon name="flame" size={18} />
              <strong>{streak} days</strong>
              <span>Current active streak</span>
            </div>
            <div className="insight-highlight">
              <Icon name="check" size={18} />
              <strong>{activeDays} days</strong>
              <span>Days with activity in {year}</span>
            </div>
            <div className="insight-highlight">
              <Icon name="trophy" size={18} />
              <strong>{bestMonth?.label ?? '—'}</strong>
              <span>Best month · {bestMonth?.activity.score ?? 0} pts</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
