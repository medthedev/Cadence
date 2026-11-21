import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Habit, HabitColor } from '../../types'
import { Icon } from '../common/Icon'

const EMOJIS = ['💧', '📚', '💪', '🧘', '🏃', '🥗', '✍️', '🎧', '🌱', '☀️', '🧹', '🛌']

const COLORS: Array<{ value: HabitColor; label: string }> = [
  { value: 'emerald', label: 'Emerald' },
  { value: 'sky', label: 'Sky' },
  { value: 'violet', label: 'Violet' },
  { value: 'amber', label: 'Amber' },
  { value: 'rose', label: 'Rose' },
]

export type HabitChanges = Pick<Habit, 'name' | 'emoji' | 'color' | 'weeklyGoal'>

interface HabitDialogProps {
  habit?: Habit
  onClose: () => void
  onSubmit: (changes: HabitChanges) => void
}

export function HabitDialog({ habit, onClose, onSubmit }: HabitDialogProps) {
  const [name, setName] = useState(habit?.name ?? '')
  const [emoji, setEmoji] = useState(habit?.emoji ?? '🌱')
  const [color, setColor] = useState<HabitColor>(habit?.color ?? 'emerald')
  const [weeklyGoal, setWeeklyGoal] = useState(habit?.weeklyGoal ?? 7)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit({ name: trimmed, emoji, color, weeklyGoal })
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="habit-dialog-title">
        <div className="modal__header">
          <div>
            <h2 id="habit-dialog-title">{habit ? 'Edit habit' : 'New habit'}</h2>
            <p>Give it a name and a gentle goal to aim for.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={18} />
          </button>
        </div>

        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Habit name</span>
            <input
              className="field__input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Morning walk"
              maxLength={50}
              autoFocus
              required
            />
          </label>

          <fieldset className="field">
            <legend className="field__label">Icon</legend>
            <div className="emoji-picker">
              {EMOJIS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`emoji-option ${emoji === option ? 'emoji-option--selected' : ''}`}
                  onClick={() => setEmoji(option)}
                  aria-pressed={emoji === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend className="field__label">Color</legend>
            <div className="color-picker">
              {COLORS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`color-option color-option--${option.value} ${color === option.value ? 'color-option--selected' : ''}`}
                  onClick={() => setColor(option.value)}
                  aria-label={option.label}
                  aria-pressed={color === option.value}
                  title={option.label}
                />
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span className="field__label">Weekly goal</span>
            <select className="field__input" value={weeklyGoal} onChange={(event) => setWeeklyGoal(Number(event.target.value))}>
              {Array.from({ length: 7 }, (_, index) => index + 1).map((days) => (
                <option key={days} value={days}>
                  {days} {days === 1 ? 'day' : 'days'} per week
                </option>
              ))}
            </select>
          </label>

          <div className="modal__footer">
            <button type="button" className="button button--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button--primary" disabled={!name.trim()}>
              {habit ? 'Save changes' : 'Create habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
