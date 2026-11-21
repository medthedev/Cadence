import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { formatDate, todayKey } from '../../lib/date'
import { useAppData } from '../../store/context'
import type { Todo } from '../../types'
import { Icon } from '../common/Icon'

interface TodoItemProps {
  todo: Todo
}

const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' } as const

export function TodoItem({ todo }: TodoItemProps) {
  const { dispatch } = useAppData()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  function save() {
    const trimmed = draft.trim()
    if (trimmed) dispatch({ type: 'todo/rename', id: todo.id, title: trimmed })
    else setDraft(todo.title)
    setIsEditing(false)
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') save()
    if (event.key === 'Escape') {
      setDraft(todo.title)
      setIsEditing(false)
    }
  }

  return (
    <li className={`todo-item ${todo.done ? 'todo-item--done' : ''}`}>
      <button
        type="button"
        className="todo-checkbox"
        onClick={() => dispatch({ type: 'todo/toggle', id: todo.id })}
        aria-label={todo.done ? `Mark "${todo.title}" as active` : `Complete "${todo.title}"`}
        aria-pressed={todo.done}
      >
        {todo.done && <Icon name="check" size={14} strokeWidth={2.6} />}
      </button>

      <div className="todo-item__body">
        {isEditing ? (
          <input
            className="todo-item__edit"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={save}
            onKeyDown={handleEditKeyDown}
            autoFocus
            maxLength={140}
            aria-label="Edit task title"
          />
        ) : (
          <p className="todo-item__title">{todo.title}</p>
        )}
        <div className="todo-item__meta">
          <span className={`priority-badge priority-badge--${todo.priority}`}>
            {PRIORITY_LABEL[todo.priority]}
          </span>
          <span className="todo-item__date">
            {todo.createdAt === todayKey() ? 'Added today' : `Added ${formatDate(todo.createdAt)}`}
          </span>
        </div>
      </div>

      <div className="todo-item__actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => {
            setDraft(todo.title)
            setIsEditing(true)
          }}
          aria-label={`Edit "${todo.title}"`}
          title="Edit task"
        >
          <Icon name="pencil" size={16} />
        </button>
        <button
          type="button"
          className="icon-button icon-button--danger"
          onClick={() => dispatch({ type: 'todo/delete', id: todo.id })}
          aria-label={`Delete "${todo.title}"`}
          title="Delete task"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </li>
  )
}
