import type { CalendarWeek, MonthLabel } from '../../lib/date'
import { activityLevel, completionRate, currentStreak } from '../../lib/stats'
import type { Habit } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'
import { ContributionGrid } from './ContributionGrid'

interface HabitOverviewProps {
  habits: Habit[]
  today: string
  weeks: CalendarWeek[]
  monthLabels: MonthLabel[]
  onSelectHabit: (id: string) => void
  onBrowseLibrary: () => void
}

export function HabitOverview({ habits, today, weeks, monthLabels, onSelectHabit, onBrowseLibrary }: HabitOverviewProps) {
  const doneToday = habits.filter((habit) => habit.completedDates.includes(today)).length
  const bestStreak = Math.max(0, ...habits.map((habit) => currentStreak(habit.completedDates)))
  const totalCheckIns = habits.reduce((total, habit) => total + habit.completedDates.length, 0)
  const consistency = habits.length
    ? Math.round(habits.reduce((total, habit) => total + completionRate(habit.completedDates, habit.createdAt, 30), 0) / habits.length)
    : 0

  if (habits.length === 0) {
    return (
      <section className="habit-detail">
        <div className="card">
          <EmptyState
            icon="book"
            title="Start your first habit"
            description="Pick a simple habit to start - prayer, water, reading, and more."
            action={
              <button type="button" className="button button--primary" onClick={onBrowseLibrary}>
                <Icon name="book" size={16} />
                Browse habit library
              </button>
            }
          />
        </div>
      </section>
    )
  }

  return (
    <section className="habit-detail">
      <div className="habit-detail__header">
        <div className="habit-detail__heading">
          <span className="habit-avatar habit-avatar--overview habit-avatar--large"><Icon name="chart" size={22} /></span>
          <div>
            <h2>Overview</h2>
            <p>Every habit you have built, day by day.</p>
          </div>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={<Icon name="check" size={18} />} label="Done today" value={`${doneToday}/${habits.length}`} tone="accent" />
        <StatCard icon={<Icon name="flame" size={18} />} label="Best active streak" value={bestStreak} suffix=" days" tone="warm" />
        <StatCard icon={<Icon name="target" size={18} />} label="30-day consistency" value={consistency} suffix="%" />
        <StatCard icon={<Icon name="trophy" size={18} />} label="Total check-ins" value={totalCheckIns} />
      </div>

      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">Activity</h3>
            <p className="card__description">Darker squares mean more habits completed that day.</p>
          </div>
        </div>
        <ContributionGrid
          weeks={weeks}
          monthLabels={monthLabels}
          getLevel={(key) => activityLevel(
            habits.filter((habit) => habit.completedDates.includes(key)).length,
            habits.length,
          )}
          getDescription={(key) => {
            const count = habits.filter((habit) => habit.completedDates.includes(key)).length
            return `${count} of ${habits.length} habits completed`
          }}
        />
      </div>

      {habits.length > 0 && (
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Your habits</h3>
              <p className="card__description">Pick one to see its personal history.</p>
            </div>
          </div>
          <div className="habit-tiles">
            {habits.map((habit) => (
              <button key={habit.id} type="button" className="habit-tile" onClick={() => onSelectHabit(habit.id)}>
                <span className={`habit-avatar habit-avatar--${habit.color}`}>{habit.emoji}</span>
                <span className="habit-tile__name">{habit.name}</span>
                <Icon name="arrowRight" size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
