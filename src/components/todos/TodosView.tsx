import { useMemo, useState } from 'react'
import { useAppData } from '../../store/context'
import type { Priority, Todo } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { TodoComposer } from './TodoComposer'
import { TodoItem } from './TodoItem'

type TodoFilter = 'all' | 'active' | 'done'

const FILTERS: Array<{ id: TodoFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'done', label: 'Completed' },
]

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.done !== b.done) return Number(a.done) - Number(b.done)
    if (a.priority !== b.priority) return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]
    return b.createdAt.localeCompare(a.createdAt)
  })
}

export function TodosView() {
  const { data, dispatch } = useAppData()
  const [filter, setFilter] = useState<TodoFilter>('all')
  const [query, setQuery] = useState('')

  const completed = data.todos.filter((todo) => todo.done).length
  const active = data.todos.length - completed
  const progress = data.todos.length ? Math.round((completed / data.todos.length) * 100) : 0

  const visibleTodos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return sortTodos(data.todos.filter((todo) => {
      const matchesFilter = filter === 'all'
        || (filter === 'active' && !todo.done)
        || (filter === 'done' && todo.done)
      const matchesQuery = !normalizedQuery || todo.title.toLowerCase().includes(normalizedQuery)
      return matchesFilter && matchesQuery
    }))
  }, [data.todos, filter, query])

  return (
    <div className="view-stack">
      <section className="progress-card" aria-label="Task progress">
        <div className="progress-card__text">
          <p className="progress-card__label">Your progress</p>
          <p className="progress-card__value">
            <strong>{completed}</strong> of {data.todos.length} tasks complete
          </p>
          <p className="progress-card__hint">
            {active === 0 && data.todos.length > 0
              ? 'Everything is done. Nice work!'
              : `${active} task${active === 1 ? '' : 's'} left to tackle.`}
          </p>
        </div>
        <div className="progress-card__stat">
          <span className="progress-card__percent">{progress}%</span>
          <div className="progress-track">
            <div className="progress-track__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      <TodoComposer />

      <section className="panel">
        <div className="panel__toolbar">
          <div className="segmented" role="group" aria-label="Filter tasks">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`segmented__button ${filter === option.id ? 'segmented__button--active' : ''}`}
                onClick={() => setFilter(option.id)}
                aria-pressed={filter === option.id}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="toolbar__right">
            <label className="search-field">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks"
                aria-label="Search tasks"
              />
            </label>
            <button
              type="button"
              className="text-button"
              onClick={() => dispatch({ type: 'todo/clearCompleted' })}
              disabled={completed === 0}
            >
              Clear completed
            </button>
          </div>
        </div>

        {visibleTodos.length > 0 ? (
          <ul className="todo-list">
            {visibleTodos.map((todo) => <TodoItem key={todo.id} todo={todo} />)}
          </ul>
        ) : (
          <EmptyState
            icon={query ? 'search' : 'check'}
            title={query ? 'No matching tasks' : filter === 'done' ? 'Nothing completed yet' : 'Your list is clear'}
            description={query
              ? 'Try a different search term.'
              : 'Add a task above and start making progress.'}
          />
        )}
      </section>
    </div>
  )
}
