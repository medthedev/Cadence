import { useState } from 'react'
import type { FormEvent } from 'react'
import { todayKey } from '../../lib/date'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import type { Priority } from '../../types'
import { Icon } from '../common/Icon'

const PRIORITIES: Array<{ value: Priority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function TodoComposer() {
  const { dispatch } = useAppData()
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [estimate, setEstimate] = useState('')
  const [dueDate, setDueDate] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    const minutes = Number.parseInt(estimate, 10)
    dispatch({
      type: 'todo/add',
      todo: {
        id: createId(),
        title: trimmed,
        done: false,
        priority,
        createdAt: todayKey(),
        estimatedMinutes: Number.isFinite(minutes) && minutes > 0 ? minutes : undefined,
        dueDate: dueDate || undefined,
      },
    })
    setTitle('')
    setEstimate('')
    setDueDate('')
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer__main">
        <span className="composer__plus"><Icon name="plus" size={20} /></span>
        <input
          className="composer__input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          aria-label="New task title"
          maxLength={140}
        />
        <button type="submit" className="button button--primary" disabled={!title.trim()}>
          Add task
        </button>
      </div>

      <div className="composer__options">
        <span className="composer__hint">Priority</span>
        <div className="priority-picker" role="group" aria-label="Task priority">
          {PRIORITIES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`priority-chip priority-chip--${option.value} ${
                priority === option.value ? 'priority-chip--selected' : ''
              }`}
              onClick={() => setPriority(option.value)}
              aria-pressed={priority === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="estimate-field">
          <Icon name="clock" size={14} />
          <input
            type="number"
            min={1}
            max={600}
            value={estimate}
            onChange={(event) => setEstimate(event.target.value)}
            placeholder="Est. minutes"
            aria-label="Estimated minutes (optional)"
          />
        </label>

        <label className="estimate-field estimate-field--date">
          <Icon name="calendar" size={14} />
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            aria-label="Due date (optional)"
          />
        </label>
      </div>
    </form>
  )
}
