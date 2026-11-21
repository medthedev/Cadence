import { formatLongDate, todayKey } from '../../lib/date'
import { dailySpend, EVENT_META, EXPENSE_META, formatMoney } from '../../lib/finance'
import { useAppData } from '../../store/context'
import type { View } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'

interface TodayViewProps {
  onNavigate: (view: View) => void
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function TodayView({ onNavigate }: TodayViewProps) {
  const { data, dispatch } = useAppData()
  const today = todayKey()

  const completedTodos = data.todos.filter((todo) => todo.done).length
  const habitsDone = data.habits.filter((habit) => habit.completedDates.includes(today)).length
  const focusMinutes = data.focusSessions
    .filter((session) => session.date === today && session.mode === 'focus')
    .reduce((total, session) => total + session.minutes, 0)
  const spent = dailySpend(data.transactions, today)
  const todayEvents = data.events
    .filter((event) => event.date === today)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  const activeTodos = data.todos.filter((todo) => !todo.done).slice(0, 5)
  const todayBlocks = data.timeBlocks
    .filter((block) => block.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 4)
  const recent = data.transactions.slice(0, 4)
  const rhythm = data.habits.length ? Math.round((habitsDone / data.habits.length) * 100) : 0

  return (
    <div className="view-stack today-view">
      <section className="hero-card">
        <div className="hero-card__content">
          <p className="hero-card__eyebrow">{formatLongDate(new Date())}</p>
          <h2 className="hero-card__title">{greeting()}.</h2>
          <p className="hero-card__text">
            Here is your day. {habitsDone} of {data.habits.length} habits checked off,
            {' '}{completedTodos} tasks done, and {focusMinutes} minutes of deep work.
          </p>
          <div className="hero-card__actions">
            <button type="button" className="button button--primary" onClick={() => onNavigate('todos')}>
              <Icon name="plus" size={16} />
              Add a task
            </button>
            <button type="button" className="button button--ghost" onClick={() => onNavigate('calendar')}>
              <Icon name="calendar" size={16} />
              Plan the day
            </button>
            <button type="button" className="button button--ghost" onClick={() => onNavigate('expenses')}>
              <Icon name="wallet" size={16} />
              Log spending
            </button>
          </div>
        </div>
        <div className="hero-card__ring" aria-label={`${rhythm}% of today's habits complete`}>
          <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
            <circle className="hero-ring-track" cx="60" cy="60" r="52" />
            <circle
              className="hero-ring-value"
              cx="60"
              cy="60"
              r="52"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={2 * Math.PI * 52 * (1 - rhythm / 100)}
            />
          </svg>
          <div><strong>{rhythm}%</strong><span>today</span></div>
        </div>
      </section>

      <div className="stat-grid stat-grid--today">
        <StatCard icon={<Icon name="check" size={18} />} label="Tasks done" value={completedTodos} suffix={` / ${data.todos.length}`} tone="accent" />
        <StatCard icon={<Icon name="target" size={18} />} label="Habits today" value={habitsDone} suffix={` / ${data.habits.length}`} />
        <StatCard icon={<Icon name="timer" size={18} />} label="Focus time" value={focusMinutes} suffix=" min" />
        <StatCard icon={<Icon name="wallet" size={18} />} label="Spent today" value={formatMoney(spent, data.currency)} />
      </div>

      <div className="today-grid">
        <section className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Up next</h3>
              <p className="card__description">Your open tasks and time blocks.</p>
            </div>
            <button type="button" className="text-button" onClick={() => onNavigate('todos')}>All tasks →</button>
          </div>
          {activeTodos.length > 0 ? (
            <ul className="today-list">
              {activeTodos.map((todo) => (
                <li key={todo.id} className="today-list__item">
                  <button
                    type="button"
                    className="habit-check"
                    onClick={() => dispatch({ type: 'todo/toggle', id: todo.id })}
                    aria-label={`Complete ${todo.title}`}
                  >
                    <Icon name="check" size={14} strokeWidth={2.6} />
                  </button>
                  <span>{todo.title}</span>
                  <span className={`priority-dot priority-dot--${todo.priority}`} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="check" title="All clear" description="No open tasks. Enjoy the breathing room." />
          )}
          {todayBlocks.length > 0 && (
            <div className="today-blocks">
              <p className="card__eyebrow">Planned blocks</p>
              {todayBlocks.map((block) => (
                <div key={block.id} className="today-block">
                  <strong>{block.startTime}</strong>
                  <span>{block.title}</span>
                  <small>{block.durationMinutes}m</small>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="today-side">
          <section className="card">
            <div className="card__header">
              <div>
                <h3 className="card__title">Today's schedule</h3>
                <p className="card__description">Events on your calendar.</p>
              </div>
              <Icon name="calendar" size={18} />
            </div>
            {todayEvents.length > 0 ? (
              <ul className="today-events">
                {todayEvents.map((event) => (
                  <li key={event.id}>
                    <span className={`upcoming-dot upcoming-dot--${EVENT_META[event.category].tone}`} />
                    <div>
                      <strong>{event.title}</strong>
                      <small>{event.time || 'All day'} · {EVENT_META[event.category].label}</small>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sessions-empty">Nothing scheduled today.</p>
            )}
          </section>

          <section className="card">
            <div className="card__header">
              <div>
                <h3 className="card__title">Habit check-in</h3>
                <p className="card__description">Tap to mark today done.</p>
              </div>
              <button type="button" className="text-button" onClick={() => onNavigate('habits')}>All habits →</button>
            </div>
            {data.habits.length > 0 ? (
              <div className="today-habits">
                {data.habits.slice(0, 6).map((habit) => {
                  const done = habit.completedDates.includes(today)
                  return (
                    <button
                      key={habit.id}
                      type="button"
                      className={`today-habit ${done ? 'today-habit--done' : ''}`}
                      onClick={() => dispatch({ type: 'habit/toggleDate', id: habit.id, date: today })}
                    >
                      <span>{habit.emoji}</span>
                      <strong>{habit.name}</strong>
                      <Icon name="check" size={13} strokeWidth={2.6} />
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="sessions-empty">Add a habit to start a streak.</p>
            )}
          </section>

          <section className="card">
            <div className="card__header">
              <div>
                <h3 className="card__title">Recent money</h3>
                <p className="card__description">Your last few entries.</p>
              </div>
              <button type="button" className="text-button" onClick={() => onNavigate('expenses')}>All →</button>
            </div>
            {recent.length > 0 ? (
              <ul className="today-events">
                {recent.map((item) => (
                  <li key={item.id}>
                    <span className={`upcoming-dot upcoming-dot--${EXPENSE_META[item.category].tone}`} />
                    <div>
                      <strong>{item.title}</strong>
                      <small>{EXPENSE_META[item.category].label}</small>
                    </div>
                    <span className={`today-money ${item.type === 'income' ? 'today-money--income' : ''}`}>
                      {item.type === 'income' ? '+' : '−'}{formatMoney(item.amount, data.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sessions-empty">No transactions recorded yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
