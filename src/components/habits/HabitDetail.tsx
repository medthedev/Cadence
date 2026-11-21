import type { CalendarWeek, MonthLabel } from '../../lib/date'
import { formatDate } from '../../lib/date'
import { completionRate, completionsThisWeek, currentStreak, longestStreak } from '../../lib/stats'
import type { Habit, PrayerName } from '../../types'
import { PRAYERS } from '../../types'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'
import { ContributionGrid } from './ContributionGrid'

interface HabitDetailProps {
  habit: Habit
  today: string
  weeks: CalendarWeek[]
  monthLabels: MonthLabel[]
  onToggleDate: (date: string) => void
  onLogWater: (date: string, liters: number) => void
  onTogglePrayer: (date: string, prayer: PrayerName) => void
  onEdit: () => void
  onDelete: () => void
}

export function HabitDetail({
  habit,
  today,
  weeks,
  monthLabels,
  onToggleDate,
  onLogWater,
  onTogglePrayer,
  onEdit,
  onDelete,
}: HabitDetailProps) {
  const doneToday = habit.completedDates.includes(today)
  const weekCount = completionsThisWeek(habit.completedDates)
  const rate = completionRate(habit.completedDates, habit.createdAt)
  const waterTarget = habit.waterTarget ?? 2
  const waterToday = habit.waterLog?.[today] ?? 0
  const prayersToday = habit.prayerLog?.[today] ?? []

  const cellInfo = new Map<string, { level: number; description: string }>()
  weeks.forEach((week) => {
    const countInWeek = week.days.filter((day) => habit.completedDates.includes(day.key)).length
    const goalMet = countInWeek >= habit.weeklyGoal
    week.days.forEach((day) => {
      if (day.isFuture) return
      const done = habit.completedDates.includes(day.key)
      let description = done ? 'Completed' : 'Not completed'
      if (habit.kind === 'water') {
        const l = habit.waterLog?.[day.key] ?? 0
        description = l > 0 ? `${l}L / ${waterTarget}L` : 'No water logged'
      } else if (habit.kind === 'prayer') {
        const p = habit.prayerLog?.[day.key]?.length ?? 0
        description = p > 0 ? `${p}/${PRAYERS.length} prayers` : 'No prayers marked'
      } else if (done && goalMet) {
        description = 'Completed · weekly goal met'
      }
      cellInfo.set(day.key, { level: done ? (goalMet ? 4 : 2) : 0, description })
    })
  })

  function handleGridClick(date: string) {
    if (habit.kind === 'check') {
      onToggleDate(date)
      return
    }
    if (habit.kind === 'water') {
      const current = habit.waterLog?.[date] ?? 0
      onLogWater(date, current >= waterTarget ? 0 : waterTarget)
      return
    }
    // prayer: toggle all
    const current = habit.prayerLog?.[date] ?? []
    if (current.length >= PRAYERS.length) {
      PRAYERS.forEach((p) => { if (current.includes(p)) onTogglePrayer(date, p) })
    } else {
      PRAYERS.forEach((p) => { if (!current.includes(p)) onTogglePrayer(date, p) })
    }
  }

  function handleDelete() {
    if (window.confirm(`Delete "${habit.name}"? Its full history will be removed.`)) onDelete()
  }

  const subtitle = habit.kind === 'water'
    ? `${waterTarget}L daily target · ${habit.weeklyGoal} days/week`
    : habit.kind === 'prayer'
      ? `5 daily prayers · ${habit.weeklyGoal} days/week`
      : `${habit.weeklyGoal} days per week`

  return (
    <section className="habit-detail">
      <div className="habit-detail__header">
        <div className="habit-detail__heading">
          <span className={`habit-avatar habit-avatar--${habit.color} habit-avatar--large`}>{habit.emoji}</span>
          <div>
            <h2>{habit.name}</h2>
            <p>{subtitle} · started {formatDate(habit.createdAt)}</p>
          </div>
        </div>
        <div className="habit-detail__actions">
          <button type="button" className="button button--ghost" onClick={onEdit}>
            <Icon name="pencil" size={15} /> Edit
          </button>
          <button type="button" className="icon-button icon-button--bordered icon-button--danger" onClick={handleDelete} aria-label={`Delete ${habit.name}`} title="Delete habit">
            <Icon name="trash" size={17} />
          </button>
          {habit.kind === 'check' && (
            <button
              type="button"
              className={`button ${doneToday ? 'button--success' : 'button--primary'}`}
              onClick={() => onToggleDate(today)}
            >
              <Icon name="check" size={16} />
              {doneToday ? 'Done today' : 'Mark today'}
            </button>
          )}
        </div>
      </div>

      {habit.kind === 'water' && (
        <div className="card habit-log-card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Today's water</h3>
              <p className="card__description">{waterToday}L of {waterTarget}L</p>
            </div>
            {doneToday && <span className="habit-log-card__done"><Icon name="check" size={14} /> Goal met</span>}
          </div>
          <div className="water-log">
            <button type="button" className="button button--ghost" onClick={() => onLogWater(today, Math.max(0, waterToday - 0.25))} aria-label="Remove 0.25 liters">−0.25L</button>
            <div className="water-log__value">
              <strong>{waterToday}L</strong>
              <div className="water-log__bar"><div className="water-log__fill" style={{ width: `${Math.min(100, (waterToday / waterTarget) * 100)}%` }} /></div>
            </div>
            <button type="button" className="button button--primary" onClick={() => onLogWater(today, Math.min(10, waterToday + 0.25))} aria-label="Add 0.25 liters">+0.25L</button>
          </div>
        </div>
      )}

      {habit.kind === 'prayer' && (
        <div className="card habit-log-card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Today's prayers</h3>
              <p className="card__description">{prayersToday.length} of {PRAYERS.length} completed</p>
            </div>
            {doneToday && <span className="habit-log-card__done"><Icon name="check" size={14} /> All prayed</span>}
          </div>
          <div className="prayer-log">
            {PRAYERS.map((prayer) => {
              const done = prayersToday.includes(prayer)
              return (
                <button
                  key={prayer}
                  type="button"
                  className={`prayer-log__item ${done ? 'prayer-log__item--done' : ''}`}
                  onClick={() => onTogglePrayer(today, prayer)}
                  aria-pressed={done}
                >
                  <span className="prayer-log__check"><Icon name="check" size={14} strokeWidth={2.6} /></span>
                  <span>{prayer}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="stat-grid">
        <StatCard icon={<Icon name="flame" size={18} />} label="Current streak" value={currentStreak(habit.completedDates)} suffix=" days" tone="warm" />
        <StatCard icon={<Icon name="trophy" size={18} />} label="Longest streak" value={longestStreak(habit.completedDates)} suffix=" days" />
        <StatCard icon={<Icon name="target" size={18} />} label="This week" value={`${weekCount}/${habit.weeklyGoal}`} tone="accent" />
        <StatCard icon={<Icon name="chart" size={18} />} label="90-day consistency" value={rate} suffix="%" />
      </div>

      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">Contribution grid</h3>
            <p className="card__description">
              {habit.kind === 'check'
                ? 'Click any square to mark or unmark that day. Darker green means you also hit your weekly goal.'
                : habit.kind === 'water'
                  ? 'Click a day to fill or clear the daily water target.'
                  : 'Click a day to mark or clear all prayers for that day.'}
            </p>
          </div>
        </div>
        <ContributionGrid
          weeks={weeks}
          monthLabels={monthLabels}
          getLevel={(key) => cellInfo.get(key)?.level ?? 0}
          getDescription={(key) => cellInfo.get(key)?.description ?? 'Not completed'}
          onDayClick={handleGridClick}
        />
      </div>
    </section>
  )
}
