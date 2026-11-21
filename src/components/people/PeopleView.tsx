import { useState } from 'react'
import type { FormEvent } from 'react'
import { addDays, formatDate, fromDateKey, toDateKey, todayKey } from '../../lib/date'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import type { Person } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'

interface Draft {
  name: string
  relationship: string
  birthday: string
  nextContact: string
  cadenceDays: string
  notes: string
}

function emptyDraft(): Draft {
  return { name: '', relationship: '', birthday: '', nextContact: '', cadenceDays: '30', notes: '' }
}

function daysUntil(key?: string): number | null {
  if (!key) return null
  const target = fromDateKey(key).getTime()
  const today = new Date().setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86_400_000)
}

function followUp(person: Person): { label: string; tone: 'muted' | 'warm' | 'danger' } {
  const days = daysUntil(person.nextContact)
  if (days === null) return { label: 'No follow-up set', tone: 'muted' }
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, tone: 'danger' }
  if (days === 0) return { label: 'Follow up today', tone: 'warm' }
  if (days <= 7) return { label: `In ${days}d`, tone: 'warm' }
  return { label: `In ${days}d`, tone: 'muted' }
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
}

export function PeopleView() {
  const { data, dispatch } = useAppData()
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [query, setQuery] = useState('')

  const today = todayKey()
  const month = today.slice(0, 7)
  const due = data.people.filter((person) => {
    const days = daysUntil(person.nextContact)
    return days !== null && days <= 0
  }).length
  const overdue = data.people.filter((person) => {
    const days = daysUntil(person.nextContact)
    return days !== null && days < 0
  }).length
  const contactedThisMonth = data.people.filter((person) => person.lastContact?.startsWith(month)).length

  const visible = data.people
    .filter((person) => !query.trim()
      || person.name.toLowerCase().includes(query.trim().toLowerCase())
      || person.relationship?.toLowerCase().includes(query.trim().toLowerCase()))
    .slice()
    .sort((a, b) => (a.nextContact ?? '9999').localeCompare(b.nextContact ?? '9999'))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = draft.name.trim()
    if (!name) return
    const cadence = Math.max(1, Math.min(365, Number(draft.cadenceDays) || 30))

    dispatch({
      type: 'person/add',
      person: {
        id: createId(),
        name,
        relationship: draft.relationship.trim() || undefined,
        birthday: draft.birthday || undefined,
        nextContact: draft.nextContact || undefined,
        cadenceDays: cadence,
        notes: draft.notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
    })
    setDraft(emptyDraft())
  }

  function markContacted(person: Person) {
    const next = toDateKey(addDays(new Date(), person.cadenceDays))
    dispatch({
      type: 'person/contact',
      id: person.id,
      lastContact: today,
      nextContact: next,
    })
  }

  return (
    <div className="view-stack people-view">
      <div className="stat-grid">
        <StatCard icon={<Icon name="users" size={18} />} tone="accent" label="People" value={data.people.length} />
        <StatCard icon={<Icon name="bell" size={18} />} tone="warm" label="Due now" value={due} />
        <StatCard icon={<Icon name="clock" size={18} />} label="Overdue" value={overdue} />
        <StatCard icon={<Icon name="check" size={18} />} label="Contacted this month" value={contactedThisMonth} />
      </div>

      <section className="panel life-composer">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">Add someone you care about</h3>
            <p className="card__description">Set a rhythm and Cadence will nudge you when it’s time.</p>
          </div>
        </div>
        <form className="life-form" onSubmit={handleSubmit}>
          <input
            className="field__input"
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            placeholder="Name"
            aria-label="Person name"
            maxLength={80}
          />
          <input
            className="field__input"
            value={draft.relationship}
            onChange={(event) => setDraft({ ...draft, relationship: event.target.value })}
            placeholder="Relationship (friend, family…)"
            aria-label="Relationship"
            maxLength={60}
          />
          <input
            className="field__input"
            type="date"
            value={draft.birthday}
            onChange={(event) => setDraft({ ...draft, birthday: event.target.value })}
            aria-label="Birthday"
          />
          <input
            className="field__input"
            type="date"
            value={draft.nextContact}
            onChange={(event) => setDraft({ ...draft, nextContact: event.target.value })}
            aria-label="Next follow-up"
          />
          <label className="mini-field">
            <span>Every</span>
            <input
              className="field__input field__input--number"
              type="number"
              min={1}
              max={365}
              value={draft.cadenceDays}
              onChange={(event) => setDraft({ ...draft, cadenceDays: event.target.value })}
              aria-label="Follow-up cadence in days"
            />
          </label>
          <button type="submit" className="button button--primary" disabled={!draft.name.trim()}>
            <Icon name="plus" size={16} /> Add person
          </button>
        </form>
        <input
          className="field__input life-form__note"
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          placeholder="Optional note — interests, last conversation, anything worth remembering."
          aria-label="Person notes"
          maxLength={300}
        />
      </section>

      <section className="panel">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">Your people</h3>
            <p className="card__description">Small check-ins, kept gentle and deliberate.</p>
          </div>
          <label className="search-field">
            <Icon name="search" size={15} />
            <input
              className="field__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people"
              aria-label="Search people"
            />
          </label>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon="users"
            title={query ? 'No one matches' : 'No people yet'}
            description={query ? 'Try another name or relationship.' : 'Add someone and choose when you’d like to check in.'}
          />
        ) : (
          <div className="people-grid">
            {visible.map((person) => {
              const status = followUp(person)
              return (
                <article key={person.id} className="life-card person-card">
                  <div className="life-card__head">
                    <div className="person-identity">
                      <div className="person-avatar">{initials(person.name)}</div>
                      <div>
                        <h3 className="life-card__title">{person.name}</h3>
                        {person.relationship && <p className="life-card__meta">{person.relationship}</p>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-button icon-button--danger"
                      onClick={() => dispatch({ type: 'person/delete', id: person.id })}
                      aria-label={`Delete ${person.name}`}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>

                  <span className={`life-badge life-badge--${status.tone}`}>
                    <Icon name="bell" size={12} /> {status.label}
                  </span>

                  {person.notes && <p className="life-card__text">{person.notes}</p>}

                  <div className="person-details">
                    {person.birthday && (
                      <p className="life-card__meta">
                        <Icon name="sparkles" size={13} /> Birthday {formatDate(person.birthday)}
                      </p>
                    )}
                    {person.lastContact && (
                      <p className="life-card__meta">
                        <Icon name="check" size={13} /> Last contact {formatDate(person.lastContact)}
                      </p>
                    )}
                  </div>

                  <label className="mini-field">
                    <span>Next follow-up</span>
                    <input
                      type="date"
                      className="field__input"
                      value={person.nextContact ?? ''}
                      onChange={(event) => dispatch({
                        type: 'person/update',
                        id: person.id,
                        changes: { nextContact: event.target.value || undefined },
                      })}
                      aria-label={`Next follow-up for ${person.name}`}
                    />
                  </label>

                  <button type="button" className="button button--success person-contact" onClick={() => markContacted(person)}>
                    <Icon name="check" size={15} /> Mark contacted
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
