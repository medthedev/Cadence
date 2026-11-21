import { useState } from 'react'
import { addDays, formatDate, fromDateKey, toDateKey, todayKey } from '../../lib/date'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import { MOODS } from '../../types'
import type { JournalEntry, Mood } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'

const PROMPTS = [
  'What went well today?',
  'What felt heavier than it needed to?',
  'One thing I am grateful for…',
  'What would make tomorrow easier?',
  'Something I noticed about myself…',
]

function journalStreak(entries: JournalEntry[]): number {
  const dates = new Set(entries.map((entry) => entry.date))
  if (!dates.size) return 0

  let cursor = new Date()
  if (!dates.has(toDateKey(cursor))) cursor = addDays(cursor, -1)

  let streak = 0
  while (dates.has(toDateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function JournalView() {
  const { data, dispatch } = useAppData()
  const [date, setDate] = useState(todayKey)
  const [query, setQuery] = useState('')

  const entry = data.journal.find((item) => item.date === date)
  const month = date.slice(0, 7)
  const monthLabel = fromDateKey(`${month}-01`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const monthEntries = data.journal.filter((item) => item.date.startsWith(month)).length
  const streak = journalStreak(data.journal)
  const words = data.journal.reduce((total, item) => total + item.content.trim().split(/\s+/).filter(Boolean).length, 0)

  const recent = data.journal
    .filter((item) => !query.trim()
      || item.content.toLowerCase().includes(query.trim().toLowerCase())
      || item.date.includes(query.trim()))
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12)

  function save(content: string, mood: Mood) {
    const now = new Date().toISOString()
    dispatch({
      type: 'journal/upsert',
      entry: {
        id: entry?.id ?? createId(),
        date,
        mood,
        content,
        createdAt: entry?.createdAt ?? now,
        updatedAt: now,
      },
    })
  }

  function shiftDate(days: number) {
    setDate(toDateKey(addDays(fromDateKey(date), days)))
  }

  function appendPrompt(prompt: string) {
    const current = entry?.content ?? ''
    save(current ? `${current}\n${prompt}` : prompt, entry?.mood ?? 'okay')
  }

  return (
    <div className="view-stack journal-view">
      <div className="stat-grid">
        <StatCard icon={<Icon name="note" size={18} />} tone="accent" label="Entries" value={data.journal.length} />
        <StatCard icon={<Icon name="flame" size={18} />} tone="warm" label="Day streak" value={streak} />
        <StatCard icon={<Icon name="calendar" size={18} />} label={`In ${monthLabel}`} value={monthEntries} />
        <StatCard icon={<Icon name="sparkles" size={18} />} label="Words written" value={words} />
      </div>

      <section className="panel journal-editor">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">{date === todayKey() ? 'Today’s entry' : formatDate(date)}</h3>
            <p className="card__description">Autosaved as you type. Nothing here is shared.</p>
          </div>
          <div className="date-nav">
            <button type="button" className="icon-button icon-button--bordered" onClick={() => shiftDate(-1)} aria-label="Previous day">
              <Icon name="chevronLeft" size={16} />
            </button>
            <input
              type="date"
              className="field__input date-nav__input"
              value={date}
              onChange={(event) => event.target.value && setDate(event.target.value)}
              aria-label="Journal date"
            />
            <button
              type="button"
              className="icon-button icon-button--bordered"
              onClick={() => shiftDate(1)}
              disabled={date >= todayKey()}
              aria-label="Next day"
            >
              <Icon name="chevronRight" size={16} />
            </button>
            {date !== todayKey() && (
              <button type="button" className="text-button" onClick={() => setDate(todayKey())}>Today</button>
            )}
          </div>
        </div>

        <div className="mood-row" role="group" aria-label="How was your day?">
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              type="button"
              className={`mood-button ${entry?.mood === mood.value ? 'mood-button--active' : ''}`}
              onClick={() => save(entry?.content ?? '', mood.value)}
              aria-pressed={entry?.mood === mood.value}
            >
              <span>{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>

        <textarea
          className="field__input journal-textarea"
          value={entry?.content ?? ''}
          onChange={(event) => save(event.target.value, entry?.mood ?? 'okay')}
          placeholder="Write a few lines. The small details count."
          aria-label="Journal content"
          rows={10}
        />

        <div className="journal-prompts">
          <span className="journal-prompts__label">Need a starting point?</span>
          <div className="journal-prompts__list">
            {PROMPTS.map((prompt) => (
              <button key={prompt} type="button" className="prompt-chip" onClick={() => appendPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {entry && (
          <div className="journal-editor__footer">
            <span className="life-card__meta">Last saved {new Date(entry.updatedAt).toLocaleString()}</span>
            <button
              type="button"
              className="text-button"
              onClick={() => dispatch({ type: 'journal/delete', id: entry.id })}
            >
              Delete entry
            </button>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">Past entries</h3>
            <p className="card__description">A quiet record of how things felt.</p>
          </div>
          <label className="search-field">
            <Icon name="search" size={15} />
            <input
              className="field__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search entries"
              aria-label="Search journal entries"
            />
          </label>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon="note"
            title={query ? 'No matching entries' : 'Your journal is empty'}
            description={query ? 'Try a different word or date.' : 'Start with one sentence today.'}
          />
        ) : (
          <div className="journal-timeline">
            {recent.map((item) => {
              const mood = MOODS.find((option) => option.value === item.mood)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`journal-entry ${item.date === date ? 'journal-entry--active' : ''}`}
                  onClick={() => setDate(item.date)}
                >
                  <span className="journal-entry__mood">{mood?.emoji ?? '📝'}</span>
                  <span className="journal-entry__body">
                    <span className="journal-entry__date">{formatDate(item.date)} · {mood?.label ?? 'Note'}</span>
                    <span className="journal-entry__preview">
                      {item.content.trim() || 'No words yet — just a mood check-in.'}
                    </span>
                  </span>
                  <Icon name="chevronRight" size={15} />
                </button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
