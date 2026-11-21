import type { Habit } from '../../types'
import { Icon } from '../common/Icon'
import { currentStreak } from '../../lib/stats'

export const OVERVIEW_ID = 'overview'

interface HabitRailProps {
  habits: Habit[]
  selectedId: string
  today: string
  onSelect: (id: string) => void
  onToggleToday: (id: string) => void
  onAdd: () => void
}

export function HabitRail({
  habits,
  selectedId,
  today,
  onSelect,
  onToggleToday,
  onAdd,
}: HabitRailProps) {
  return (
    <aside className="habit-rail">
      <div className="habit-rail__header">
        <p className="sidebar__label">Your habits</p>
        <button type="button" className="icon-button icon-button--subtle" onClick={onAdd} aria-label="Add habit" title="Add habit">
          <Icon name="plus" size={18} />
        </button>
      </div>

      <div className="habit-rail__list">
        <button
          type="button"
          className={`habit-rail__item habit-rail__item--overview ${selectedId === OVERVIEW_ID ? 'habit-rail__item--active' : ''}`}
          onClick={() => onSelect(OVERVIEW_ID)}
        >
          <span className="habit-avatar habit-avatar--overview"><Icon name="chart" size={17} /></span>
          <span className="habit-rail__info">
            <span className="habit-rail__name">Overview</span>
            <span className="habit-rail__subtitle">All habits combined</span>
          </span>
        </button>

        {habits.map((habit) => {
          const doneToday = habit.completedDates.includes(today)
          const streak = currentStreak(habit.completedDates)
          return (
            <div
              key={habit.id}
              className={`habit-rail__item ${selectedId === habit.id ? 'habit-rail__item--active' : ''}`}
            >
              <button
                type="button"
                className="habit-rail__select"
                onClick={() => onSelect(habit.id)}
                aria-current={selectedId === habit.id ? 'true' : undefined}
              >
                <span className={`habit-avatar habit-avatar--${habit.color}`}>{habit.emoji}</span>
                <span className="habit-rail__info">
                  <span className="habit-rail__name">{habit.name}</span>
                  <span className="habit-rail__subtitle">
                    {streak > 0
                      ? <><Icon name="flame" size={12} /> {streak} day streak</>
                      : `${habit.weeklyGoal}x per week`}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className={`habit-check ${doneToday ? 'habit-check--done' : ''}`}
                onClick={() => onToggleToday(habit.id)}
                aria-label={doneToday ? `Unmark ${habit.name} for today` : `Mark ${habit.name} done for today`}
                title={doneToday ? 'Completed today' : 'Mark as done today'}
              >
                <Icon name="check" size={14} strokeWidth={2.6} />
              </button>
            </div>
          )
        })}
      </div>

      <button type="button" className="button button--ghost habit-rail__add" onClick={onAdd}>
        <Icon name="plus" size={16} />
        New habit
      </button>
    </aside>
  )
}
