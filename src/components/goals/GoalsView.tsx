import { useState } from 'react'
import type { FormEvent } from 'react'
import { addDays, formatDate, fromDateKey, toDateKey } from '../../lib/date'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import { GOAL_CATEGORIES } from '../../types'
import type { GoalCategory } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'

const CATEGORY_META: Record<GoalCategory, { emoji: string; label: string }> = {
  personal: { emoji: '🌱', label: 'Personal' },
  career: { emoji: '💼', label: 'Career' },
  health: { emoji: '💪', label: 'Health' },
  learning: { emoji: '📚', label: 'Learning' },
  finance: { emoji: '💰', label: 'Finance' },
  other: { emoji: '✨', label: 'Other' },
}

interface Draft {
  title: string
  category: GoalCategory
  targetDate: string
  note: string
}

function emptyDraft(): Draft {
  return { title: '', category: 'personal', targetDate: '', note: '' }
}

function targetLabel(date?: string): string {
  if (!date) return 'No deadline'
  const days = Math.ceil((fromDateKey(date).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  if (days < 0) return `${formatDate(date)} · ${Math.abs(days)}d overdue`
  if (days === 0) return `${formatDate(date)} · today`
  if (days === 1) return `${formatDate(date)} · tomorrow`
  return `${formatDate(date)} · ${days}d left`
}

export function GoalsView() {
  const { data, dispatch } = useAppData()
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active')
  const [milestoneDrafts, setMilestoneDrafts] = useState<Record<string, string>>({})

  const active = data.goals.filter((goal) => !goal.completedAt)
  const completed = data.goals.filter((goal) => goal.completedAt)
  const allMilestones = data.goals.flatMap((goal) => goal.milestones)
  const doneMilestones = allMilestones.filter((milestone) => milestone.done).length
  const weekAhead = toDateKey(addDays(new Date(), 7))
  const dueSoon = active.filter((goal) => goal.targetDate && goal.targetDate <= weekAhead).length

  const visible = (filter === 'active' ? active : filter === 'completed' ? completed : data.goals)
    .slice()
    .sort((a, b) => {
      if (a.completedAt !== b.completedAt) return a.completedAt ? 1 : -1
      return (a.targetDate ?? '9999').localeCompare(b.targetDate ?? '9999')
    })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = draft.title.trim()
    if (!title) return

    dispatch({
      type: 'goal/add',
      goal: {
        id: createId(),
        title,
        category: draft.category,
        targetDate: draft.targetDate || undefined,
        note: draft.note.trim() || undefined,
        createdAt: new Date().toISOString(),
        milestones: [],
      },
    })
    setDraft(emptyDraft())
  }

  function addMilestone(event: FormEvent<HTMLFormElement>, goalId: string) {
    event.preventDefault()
    const title = (milestoneDrafts[goalId] ?? '').trim()
    if (!title) return
    dispatch({
      type: 'goal/milestoneAdd',
      goalId,
      milestone: { id: createId(), title, done: false },
    })
    setMilestoneDrafts((current) => ({ ...current, [goalId]: '' }))
  }

  return (
    <div className="view-stack goals-view">
      <div className="stat-grid">
        <StatCard icon={<Icon name="target" size={18} />} tone="accent" label="Active goals" value={active.length} />
        <StatCard icon={<Icon name="trophy" size={18} />} label="Completed" value={completed.length} />
        <StatCard icon={<Icon name="check" size={18} />} label="Milestones done" value={doneMilestones} suffix={`/${allMilestones.length}`} />
        <StatCard icon={<Icon name="clock" size={18} />} tone="warm" label="Needs attention" value={dueSoon} />
      </div>

      <section className="panel life-composer">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">Start a goal</h3>
            <p className="card__description">Big outcomes become manageable as milestones.</p>
          </div>
        </div>
        <form className="life-form" onSubmit={handleSubmit}>
          <input
            className="field__input"
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="What do you want to achieve?"
            aria-label="Goal title"
            maxLength={100}
          />
          <select
            className="field__input"
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value as GoalCategory })}
            aria-label="Goal category"
          >
            {GOAL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_META[category].emoji} {CATEGORY_META[category].label}
              </option>
            ))}
          </select>
          <input
            className="field__input"
            type="date"
            value={draft.targetDate}
            onChange={(event) => setDraft({ ...draft, targetDate: event.target.value })}
            aria-label="Target date"
          />
          <button type="submit" className="button button--primary" disabled={!draft.title.trim()}>
            <Icon name="plus" size={16} /> Add goal
          </button>
        </form>
        <input
          className="field__input life-form__note"
          value={draft.note}
          onChange={(event) => setDraft({ ...draft, note: event.target.value })}
          placeholder="Optional note — why does this matter?"
          aria-label="Goal note"
          maxLength={240}
        />
      </section>

      <div className="panel__toolbar life-toolbar">
        <div className="segmented" role="tablist" aria-label="Filter goals">
          {(['active', 'completed', 'all'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={`segmented__button ${filter === value ? 'segmented__button--active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {value === 'active' ? 'Active' : value === 'completed' ? 'Done' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon="target"
            title="No goals here yet"
            description="Add one outcome and break it into a few clear milestones."
          />
        </div>
      ) : (
        <div className="life-grid">
          {visible.map((goal) => {
            const total = goal.milestones.length
            const done = goal.milestones.filter((milestone) => milestone.done).length
            const progress = total ? Math.round((done / total) * 100) : 0
            const meta = CATEGORY_META[goal.category]

            return (
              <article key={goal.id} className={`life-card goal-card ${goal.completedAt ? 'is-complete' : ''}`}>
                <div className="life-card__head">
                  <span className="life-badge">{meta.emoji} {meta.label}</span>
                  <div className="life-card__actions">
                    <button
                      type="button"
                      className="icon-button icon-button--bordered"
                      onClick={() => dispatch({ type: 'goal/toggleComplete', id: goal.id })}
                      title={goal.completedAt ? 'Reopen goal' : 'Complete goal'}
                      aria-label={goal.completedAt ? 'Reopen goal' : 'Complete goal'}
                    >
                      <Icon name="check" size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button--bordered icon-button--danger"
                      onClick={() => dispatch({ type: 'goal/delete', id: goal.id })}
                      title="Delete goal"
                      aria-label="Delete goal"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="life-card__title">{goal.title}</h3>
                {goal.note && <p className="life-card__text">{goal.note}</p>}
                <p className="life-card__meta"><Icon name="calendar" size={13} /> {targetLabel(goal.targetDate)}</p>

                <div className="progress-track" aria-hidden="true">
                  <span className="progress-track__fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="life-card__meta">{done} of {total} milestones · {progress}%</p>

                <div className="milestone-list">
                  {goal.milestones.map((milestone) => (
                    <div key={milestone.id} className="milestone-row">
                      <button
                        type="button"
                        className={`milestone-check ${milestone.done ? 'milestone-check--done' : ''}`}
                        onClick={() => dispatch({
                          type: 'goal/milestoneToggle', goalId: goal.id, milestoneId: milestone.id,
                        })}
                        aria-label={milestone.done ? `Mark ${milestone.title} incomplete` : `Complete ${milestone.title}`}
                      >
                        {milestone.done && <Icon name="check" size={12} />}
                      </button>
                      <span className={milestone.done ? 'is-done' : ''}>{milestone.title}</span>
                      <button
                        type="button"
                        className="icon-button icon-button--danger"
                        onClick={() => dispatch({
                          type: 'goal/milestoneDelete', goalId: goal.id, milestoneId: milestone.id,
                        })}
                        aria-label={`Delete ${milestone.title}`}
                      >
                        <Icon name="close" size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <form className="milestone-add" onSubmit={(event) => addMilestone(event, goal.id)}>
                  <input
                    className="field__input"
                    value={milestoneDrafts[goal.id] ?? ''}
                    onChange={(event) => setMilestoneDrafts((current) => ({ ...current, [goal.id]: event.target.value }))}
                    placeholder="Add a milestone"
                    aria-label={`Add a milestone to ${goal.title}`}
                    maxLength={100}
                  />
                  <button type="submit" className="icon-button icon-button--bordered" aria-label="Add milestone" disabled={!(milestoneDrafts[goal.id] ?? '').trim()}>
                    <Icon name="plus" size={15} />
                  </button>
                </form>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
