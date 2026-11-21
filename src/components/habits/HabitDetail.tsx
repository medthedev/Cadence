import type { CalendarWeek, MonthLabel } from '../../lib/date'
import { formatDate } from '../../lib/date'
import { completionRate, completionsThisWeek, currentStreak, longestStreak } from '../../lib/stats'
import type { Habit } from '../../types'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'
import { ContributionGrid } from './ContributionGrid'

interface HabitDetailProps {
  habit: Habit
  today: string
  weeks: CalendarWeek[]
  monthLabels: MonthLabel[]
  onToggleDate: (date: string) => void
  onEdit: () => void
  onDelete: () => void
}

export function HabitDetail({
  habit,
  today,
  weeks,
  monthLabels,
  onToggleDate,
  onEdit,
  onDelete,
}: HabitDetailProps) {
  const doneToday = habit.completedDates.includes(today)
  const weekCount = completionsThisWeek(habit.completedDates)
  const rate = completionRate(habit.completedDates, habit.createdAt)

  const cellInfo = new Map<string, { level: number; description: string }>()
  weeks.forEach((week) => {
    const countInWeek = week.days.filter((day) => habit.completedDates.includes(day.key)).length
    const goalMet = countInWeek >= habit.weeklyGoal
    week.days.forEach((day) => {
      if (day.isFuture) return
      const done = habit.completedDates.includes(day.key)
      cellInfo.set(day.key, {
        level: done ? (goalMet ? 4 : 2) : 0,
        description: done
          ? goalMet ? 'Completed · weekly goal met' : 'Completed'
          : 'Not completed',
      })
    })
  })

  function handleDelete() {
    if (window.confirm(`Delete "${habit.name}"? Its full history will be removed.`)) onDelete()
  }

  return (
    <section className="habit-detail">
      <div className="habit-detail__header">
        <div className="habit-detail__heading">
          <span className={`habit-avatar habit-avatar--${habit.color} habit-avatar--large`}>{habit.emoji}</span>
          <div>
            <h2>{habit.name}</h2>
            <p>{habit.weeklyGoal} days per week · started {formatDate(habit.createdAt)}</p>
          </div>
        </div>
        <div className="habit-detail__actions">
          <button type="button" className="button button--ghost" onClick={onEdit}>
            <Icon name="pencil" size={15} /> Edit
          </button>
          <button type="button" className="icon-button icon-button--bordered icon-button--danger" onClick={handleDelete} aria-label={`Delete ${habit.name}`} title="Delete habit">
            <Icon name="trash" size={17} />
          </button>
          <button
            type="button"
            className={`button ${doneToday ? 'button--success' : 'button--primary'}`}
            onClick={() => onToggleDate(today)}
          >
            <Icon name="check" size={16} />
            {doneToday ? 'Done today' : 'Mark today'}
          </button>
        </div>
      </div>

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
              Click any square to mark or unmark that day. Darker green means you also hit your weekly goal.
            </p>
          </div>
        </div>
        <ContributionGrid
          weeks={weeks}
          monthLabels={monthLabels}
          getLevel={(key) => cellInfo.get(key)?.level ?? 0}
          getDescription={(key) => cellInfo.get(key)?.description ?? 'Not completed'}
          onDayClick={onToggleDate}
        />
      </div>
    </section>
  )
}
