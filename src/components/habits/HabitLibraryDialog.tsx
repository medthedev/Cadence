import { useEffect, useMemo, useState } from 'react'
import { HABIT_CATEGORIES, HABIT_LIBRARY } from '../../data/habitLibrary'
import type { HabitCategory, HabitTemplate } from '../../data/habitLibrary'
import { Icon } from '../common/Icon'

interface HabitLibraryDialogProps {
  addedNames: string[]
  onClose: () => void
  onAdd: (template: HabitTemplate) => void
}

type CategoryFilter = HabitCategory | 'All'

export function HabitLibraryDialog({ addedNames, onClose, onAdd }: HabitLibraryDialogProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('All')
  const added = useMemo(() => new Set(addedNames.map((name) => name.trim().toLowerCase())), [addedNames])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return HABIT_LIBRARY.filter((template) => {
      const matchesCategory = category === 'All' || template.category === category
      const searchable = `${template.name} ${template.description} ${template.category}`.toLowerCase()
      return matchesCategory && (!needle || searchable.includes(needle))
    })
  }, [category, query])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="library-dialog-title">
        <div className="modal__header">
          <div>
            <h2 id="library-dialog-title">Habit library</h2>
            <p>{HABIT_LIBRARY.length} ready-made habits. Find one and make it yours.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close library">
            <Icon name="close" size={18} />
          </button>
        </div>

        <label className="library-search">
          <Icon name="search" size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search habits, e.g. prayer, water, reading"
            aria-label="Search habit library"
            autoFocus
          />
        </label>

        <div className="library-categories" role="group" aria-label="Filter by category">
          {(['All', ...HABIT_CATEGORIES] as CategoryFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              className={`library-chip ${category === option ? 'library-chip--active' : ''}`}
              onClick={() => setCategory(option)}
              aria-pressed={category === option}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="library-list">
          {filtered.map((template) => {
            const isAdded = added.has(template.name.toLowerCase())
            return (
              <div className="library-card" key={template.id}>
                <div className="library-card__main">
                  <span className={`habit-avatar habit-avatar--${template.color}`}>{template.emoji}</span>
                  <div className="library-card__info">
                    <strong>{template.name}</strong>
                    <p>{template.description}</p>
                  </div>
                </div>
                <div className="library-card__footer">
                  <span className="library-card__meta">
                    {template.category} · {template.weeklyGoal}x/week
                  </span>
                  <button
                    type="button"
                    className={`button ${isAdded ? 'button--ghost' : 'button--primary'}`}
                    onClick={() => onAdd(template)}
                    disabled={isAdded}
                    aria-label={isAdded ? `${template.name} already added` : `Add ${template.name}`}
                  >
                    <Icon name={isAdded ? 'check' : 'plus'} size={14} />
                    {isAdded ? 'Added' : 'Add'}
                  </button>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <p className="library-empty">No habits match "{query}". Try another word.</p>
          )}
        </div>

        <p className="library-count">Showing {filtered.length} of {HABIT_LIBRARY.length} habits</p>
      </div>
    </div>
  )
}
