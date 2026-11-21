import { useState } from 'react'
import type { FormEvent } from 'react'
import { addMonths, buildMonthGrid, formatLongDate, formatMonth, fromDateKey, todayKey } from '../../lib/date'
import { dailySpend, EVENT_META, formatMoney } from '../../lib/finance'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import { EVENT_CATEGORIES } from '../../types'
import type { CalendarEvent, EventCategory } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'

interface Draft {
  title: string
  date: string
  time: string
  category: EventCategory
  notes: string
}

function emptyDraft(date: string): Draft {
  return { title: '', date, time: '', category: 'personal', notes: '' }
}

export function CalendarView() {
  const { data, dispatch } = useAppData()
  const [month, setMonth] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(todayKey()))

  const weeks = buildMonthGrid(month)
  const today = todayKey()
  const selectedEvents = data.events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
  const upcoming = data.events
    .filter((event) => event.date >= today)
    .sort((a, b) => `${a.date}${a.time ?? ''}`.localeCompare(`${b.date}${b.time ?? ''}`))
    .slice(0, 5)
  const selectedHabits = data.habits.filter((habit) => habit.completedDates.includes(selectedDate)).length
  const selectedFocus = data.focusSessions
    .filter((session) => session.date === selectedDate && session.mode === 'focus')
    .reduce((total, session) => total + session.minutes, 0)

  function openCreate(date = selectedDate) {
    setEditingId(null)
    setDraft(emptyDraft(date))
    setFormOpen(true)
  }

  function openEdit(event: CalendarEvent) {
    setEditingId(event.id)
    setDraft({
      title: event.title,
      date: event.date,
      time: event.time ?? '',
      category: event.category,
      notes: event.notes ?? '',
    })
    setFormOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = draft.title.trim()
    if (!title) return

    if (editingId) {
      dispatch({
        type: 'event/update',
        id: editingId,
        changes: {
          title,
          date: draft.date,
          time: draft.time || undefined,
          category: draft.category,
          notes: draft.notes.trim() || undefined,
        },
      })
    } else {
      dispatch({
        type: 'event/add',
        event: {
          id: createId(),
          title,
          date: draft.date,
          time: draft.time || undefined,
          category: draft.category,
          notes: draft.notes.trim() || undefined,
          createdAt: new Date().toISOString(),
        },
      })
    }

    setMonth(fromDateKey(draft.date))
    setSelectedDate(draft.date)
    setFormOpen(false)
  }

  return (
    <div className="view-stack calendar-view">
      <section className="panel calendar-panel">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">{formatMonth(month)}</h3>
            <p className="card__description">Everything coming up, at a glance.</p>
          </div>
          <div className="calendar-toolbar">
            <div className="calendar-nav">
              <button
                type="button"
                className="icon-button icon-button--bordered"
                onClick={() => setMonth((current) => addMonths(current, -1))}
                aria-label="Previous month"
              >
                <Icon name="chevronLeft" size={16} />
              </button>
              <button type="button" className="button button--ghost" onClick={() => setMonth(new Date())}>
                Today
              </button>
              <button
                type="button"
                className="icon-button icon-button--bordered"
                onClick={() => setMonth((current) => addMonths(current, 1))}
                aria-label="Next month"
              >
                <Icon name="chevronRight" size={16} />
              </button>
            </div>
            <button type="button" className="button button--primary" onClick={() => openCreate()}>
              <Icon name="plus" size={16} />
              Add event
            </button>
          </div>
        </div>

        <div className="calendar-grid" role="grid" aria-label={`${formatMonth(month)} calendar`}>
          {WEEKDAYS.map((day) => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
          {weeks.flat().map((day) => {
            const events = data.events.filter((event) => event.date === day.key)
            return (
              <button
                key={day.key}
                type="button"
                role="gridcell"
                className={[
                  'calendar-cell',
                  day.inMonth ? '' : 'calendar-cell--outside',
                  day.isToday ? 'calendar-cell--today' : '',
                  day.key === selectedDate ? 'calendar-cell--selected' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => {
                  setSelectedDate(day.key)
                  if (!day.inMonth) setMonth(day.date)
                }}
              >
                <span className="calendar-cell__number">{day.date.getDate()}</span>
                <span className="calendar-cell__events">
                  {events.slice(0, 2).map((event) => (
                    <span key={event.id} className={`calendar-pill calendar-pill--${EVENT_META[event.category].tone}`}>
                      {event.time && <small>{event.time}</small>}
                      {event.title}
                    </span>
                  ))}
                  {events.length > 2 && <span className="calendar-cell__more">+{events.length - 2} more</span>}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="calendar-bottom">
        <section className="card day-card">
          <div className="card__header">
            <div>
              <p className="card__eyebrow">Selected day</p>
              <h3 className="card__title">{formatLongDate(fromDateKey(selectedDate))}</h3>
            </div>
            <button type="button" className="button button--ghost" onClick={() => openCreate(selectedDate)}>
              <Icon name="plus" size={15} />
              Add
            </button>
          </div>

          {selectedEvents.length > 0 ? (
            <ul className="event-list">
              {selectedEvents.map((event) => (
                <li key={event.id} className="event-item">
                  <span className={`event-item__bar event-item__bar--${EVENT_META[event.category].tone}`} />
                  <div className="event-item__body">
                    <div className="event-item__title">
                      <strong>{event.title}</strong>
                      <span className={`event-tag event-tag--${EVENT_META[event.category].tone}`}>
                        {EVENT_META[event.category].label}
                      </span>
                    </div>
                    <p className="event-item__meta">
                      {event.time && <><Icon name="clock" size={12} /> {event.time} · </>}
                      {event.notes || 'No notes'}
                    </p>
                  </div>
                  <div className="event-item__actions">
                    <button type="button" className="icon-button" onClick={() => openEdit(event)} aria-label={`Edit ${event.title}`}>
                      <Icon name="pencil" size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button--danger"
                      onClick={() => dispatch({ type: 'event/delete', id: event.id })}
                      aria-label={`Delete ${event.title}`}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="calendar"
              title="Nothing scheduled"
              description="Add an event to put something on this day."
            />
          )}

          <div className="day-summary">
            <div><Icon name="check" size={14} /> <strong>{selectedHabits}</strong> habits</div>
            <div><Icon name="timer" size={14} /> <strong>{selectedFocus}m</strong> focus</div>
            <div><Icon name="wallet" size={14} /> <strong>{formatMoney(dailySpend(data.transactions, selectedDate), data.currency)}</strong> spent</div>
          </div>
        </section>

        <section className="card upcoming-card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Coming up</h3>
              <p className="card__description">The next five things on your calendar.</p>
            </div>
            <Icon name="bell" size={18} />
          </div>
          {upcoming.length > 0 ? (
            <ul className="upcoming-list">
              {upcoming.map((event) => (
                <li key={event.id}>
                  <span className={`upcoming-dot upcoming-dot--${EVENT_META[event.category].tone}`} />
                  <div>
                    <strong>{event.title}</strong>
                    <small>{event.date === today ? 'Today' : event.date}{event.time ? ` · ${event.time}` : ''}</small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="sessions-empty">Your calendar is clear. Enjoy the space.</p>
          )}
        </section>
      </div>

      {formOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(mouseEvent) => { if (mouseEvent.target === mouseEvent.currentTarget) setFormOpen(false) }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="event-dialog-title">
            <div className="modal__header">
              <div>
                <h2 id="event-dialog-title">{editingId ? 'Edit event' : 'New event'}</h2>
                <p>Give the day something to look forward to.</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setFormOpen(false)} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            </div>
            <form className="modal__form" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field__label">Title</span>
                <input
                  className="field__input"
                  value={draft.title}
                  onChange={(inputEvent) => setDraft({ ...draft, title: inputEvent.target.value })}
                  placeholder="Dentist, birthday, call Mum…"
                  maxLength={80}
                  autoFocus
                />
              </label>
              <div className="form-row">
                <label className="field">
                  <span className="field__label">Date</span>
                  <input
                    className="field__input"
                    type="date"
                    value={draft.date}
                    onChange={(inputEvent) => setDraft({ ...draft, date: inputEvent.target.value })}
                  />
                </label>
                <label className="field">
                  <span className="field__label">Time (optional)</span>
                  <input
                    className="field__input"
                    type="time"
                    value={draft.time}
                    onChange={(inputEvent) => setDraft({ ...draft, time: inputEvent.target.value })}
                  />
                </label>
              </div>
              <label className="field">
                <span className="field__label">Category</span>
                <select
                  className="field__input"
                  value={draft.category}
                  onChange={(inputEvent) => setDraft({ ...draft, category: inputEvent.target.value as EventCategory })}
                >
                  {EVENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{EVENT_META[category].label}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Notes (optional)</span>
                <textarea
                  className="field__input"
                  rows={3}
                  value={draft.notes}
                  onChange={(inputEvent) => setDraft({ ...draft, notes: inputEvent.target.value })}
                  placeholder="Address, who to bring, anything to remember…"
                />
              </label>
              <div className="modal__footer">
                <button type="button" className="button button--ghost" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" className="button button--primary" disabled={!draft.title.trim()}>
                  <Icon name="check" size={15} />
                  {editingId ? 'Save changes' : 'Add event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
