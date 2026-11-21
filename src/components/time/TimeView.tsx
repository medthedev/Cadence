import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { todayKey } from '../../lib/date'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import type { FocusMode } from '../../types'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'

type Durations = Record<FocusMode, number>

const DEFAULT_DURATIONS: Durations = { focus: 25, 'short-break': 5, 'long-break': 15 }
const DURATION_STORAGE_KEY = 'freetodo.focus.durations.v1'

const MODE_LABEL: Record<FocusMode, string> = {
  focus: 'Focus',
  'short-break': 'Short break',
  'long-break': 'Long break',
}

const MODE_ORDER: FocusMode[] = ['focus', 'short-break', 'long-break']
const RING_RADIUS = 84
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

function loadDurations(): Durations {
  try {
    const raw = localStorage.getItem(DURATION_STORAGE_KEY)
    if (!raw) return DEFAULT_DURATIONS
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return DEFAULT_DURATIONS
    const values = parsed as Record<string, unknown>
    return {
      focus: typeof values.focus === 'number' ? values.focus : DEFAULT_DURATIONS.focus,
      'short-break': typeof values['short-break'] === 'number'
        ? values['short-break'] : DEFAULT_DURATIONS['short-break'],
      'long-break': typeof values['long-break'] === 'number'
        ? values['long-break'] : DEFAULT_DURATIONS['long-break'],
    }
  } catch {
    return DEFAULT_DURATIONS
  }
}

function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const rest = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${rest}`
}

function endTime(start: string, durationMinutes: number): string {
  const [hours, minutes] = start.split(':').map(Number)
  const total = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(total / 60) % 24
  return `${endHours.toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`
}

export function TimeView() {
  const { data, dispatch } = useAppData()
  const [durations, setDurations] = useState<Durations>(loadDurations)
  const [mode, setMode] = useState<FocusMode>('focus')
  const [remaining, setRemaining] = useState(() => loadDurations().focus * 60)
  const [running, setRunning] = useState(false)
  const [selectedTodoId, setSelectedTodoId] = useState('')
  const [blockTitle, setBlockTitle] = useState('')
  const [blockTodoId, setBlockTodoId] = useState('')
  const [blockTime, setBlockTime] = useState(() => new Date().toTimeString().slice(0, 5))
  const [blockDuration, setBlockDuration] = useState('25')

  const today = todayKey()
  const activeTodos = data.todos.filter((todo) => !todo.done)
  const todaySessions = data.focusSessions.filter((session) => session.date === today)
  const focusMinutes = todaySessions
    .filter((session) => session.mode === 'focus')
    .reduce((total, session) => total + session.minutes, 0)

  const dayBlocks = data.timeBlocks
    .filter((block) => block.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const plannedMinutes = dayBlocks.reduce((total, block) => total + block.durationMinutes, 0)
  const completedBlocks = dayBlocks.filter((block) => block.completed).length

  useEffect(() => {
    try {
      localStorage.setItem(DURATION_STORAGE_KEY, JSON.stringify(durations))
    } catch {
      // Timer settings stay in memory if storage is unavailable.
    }
  }, [durations])

  useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [running])

  const completeSession = useCallback(() => {
    setRunning(false)
    const minutes = durations[mode]

    if (mode === 'focus') {
      const todo = data.todos.find((item) => item.id === selectedTodoId)
      dispatch({
        type: 'focus/session',
        session: {
          id: createId(),
          date: today,
          title: todo?.title ?? 'Unassigned focus',
          todoId: todo?.id,
          minutes,
          mode,
          endedAt: new Date().toISOString(),
        },
      })
    }

    const focusCount = data.focusSessions.filter(
      (session) => session.date === today && session.mode === 'focus',
    ).length + (mode === 'focus' ? 1 : 0)
    const next: FocusMode = mode === 'focus'
      ? focusCount % 4 === 0 ? 'long-break' : 'short-break'
      : 'focus'

    setMode(next)
    setRemaining(durations[next] * 60)
  }, [durations, mode, data.todos, data.focusSessions, selectedTodoId, dispatch, today])

  useEffect(() => {
    if (!running || remaining !== 0) return
    const timeout = window.setTimeout(() => completeSession(), 0)
    return () => window.clearTimeout(timeout)
  }, [running, remaining, completeSession])

  function switchMode(next: FocusMode) {
    setRunning(false)
    setMode(next)
    setRemaining(durations[next] * 60)
  }

  function updateDuration(target: FocusMode, value: number) {
    const minutes = Math.min(180, Math.max(1, value))
    setDurations((current) => ({ ...current, [target]: minutes }))
    if (!running && mode === target) setRemaining(minutes * 60)
  }

  function handleAddBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const linked = data.todos.find((todo) => todo.id === blockTodoId)
    const title = blockTitle.trim() || linked?.title || 'Focus block'
    const minutes = Math.min(480, Math.max(5, Number(blockDuration) || 25))

    dispatch({
      type: 'timeBlock/add',
      block: {
        id: createId(),
        date: today,
        title,
        todoId: linked?.id,
        startTime: blockTime,
        durationMinutes: minutes,
        completed: false,
      },
    })
    setBlockTitle('')
  }

  const totalSeconds = durations[mode] * 60
  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0

  return (
    <div className="view-stack time-view">
      <div className="time-top">
        <section className="card timer-card">
          <div className="card__header">
            <div>
              <h3 className="card__title">Focus timer</h3>
              <p className="card__description">Work in blocks, rest on purpose.</p>
            </div>
            <span className={`timer-mode timer-mode--${mode}`}>{MODE_LABEL[mode]}</span>
          </div>

          <div className="timer-dial">
            <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
              <circle className="timer-dial__track" cx="100" cy="100" r={RING_RADIUS} />
              <circle
                className="timer-dial__value"
                cx="100"
                cy="100"
                r={RING_RADIUS}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
              />
            </svg>
            <div className="timer-dial__center">
              <strong>{formatClock(remaining)}</strong>
              <span>{MODE_LABEL[mode]}</span>
            </div>
          </div>

          <div className="timer-controls">
            <button
              type="button"
              className="button button--primary"
              onClick={() => setRunning((current) => !current)}
            >
              <Icon name={running ? 'pause' : 'play'} size={16} />
              {running ? 'Pause' : 'Start'}
            </button>
            <button
              type="button"
              className="icon-button icon-button--bordered"
              onClick={() => {
                setRunning(false)
                setRemaining(totalSeconds)
              }}
              aria-label="Reset timer"
              title="Reset timer"
            >
              <Icon name="rotate" size={17} />
            </button>
            <button
              type="button"
              className="icon-button icon-button--bordered"
              onClick={() => {
                const index = MODE_ORDER.indexOf(mode)
                switchMode(MODE_ORDER[(index + 1) % MODE_ORDER.length])
              }}
              aria-label="Skip to next mode"
              title="Skip to next mode"
            >
              <Icon name="skip" size={17} />
            </button>
          </div>

          <div className="timer-settings">
            <p className="timer-settings__title">Session lengths (minutes)</p>
            <div className="timer-settings__fields">
              {MODE_ORDER.map((option) => (
                <label key={option} className="timer-setting">
                  <span>{MODE_LABEL[option]}</span>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={durations[option]}
                    onChange={(event) => updateDuration(option, Number(event.target.value))}
                    aria-label={`${MODE_LABEL[option]} length in minutes`}
                  />
                </label>
              ))}
            </div>
          </div>

          <label className="timer-task">
            <span className="field__label">Focus on a task (optional)</span>
            <select
              className="field__input"
              value={selectedTodoId}
              onChange={(event) => setSelectedTodoId(event.target.value)}
            >
              <option value="">Unassigned focus</option>
              {activeTodos.map((todo) => (
                <option key={todo.id} value={todo.id}>{todo.title}</option>
              ))}
            </select>
          </label>
        </section>

        <div className="time-side">
          <div className="stat-grid stat-grid--time">
            <StatCard icon={<Icon name="timer" size={18} />} label="Focused today" value={focusMinutes} suffix=" min" tone="accent" />
            <StatCard icon={<Icon name="calendar" size={18} />} label="Planned today" value={plannedMinutes} suffix=" min" />
            <StatCard icon={<Icon name="check" size={18} />} label="Blocks done" value={`${completedBlocks}/${dayBlocks.length}`} />
          </div>

          <div className="card sessions-card">
            <div className="card__header">
              <div>
                <h3 className="card__title">Recent focus</h3>
                <p className="card__description">Sessions completed today.</p>
              </div>
            </div>
            {todaySessions.length > 0 ? (
              <ul className="session-list">
                {todaySessions.slice(0, 5).map((session) => (
                  <li key={session.id} className="session-item">
                    <span className="session-item__icon"><Icon name="timer" size={15} /></span>
                    <span className="session-item__title">{session.title}</span>
                    <span className="session-item__minutes">{session.minutes}m</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sessions-empty">Finish a focus session and it will show up here.</p>
            )}
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">Today's plan</h3>
            <p className="card__description">Give your hours a job before they disappear.</p>
          </div>
          <span className="plan-count">{dayBlocks.length} block{dayBlocks.length === 1 ? '' : 's'}</span>
        </div>

        <form className="time-form" onSubmit={handleAddBlock}>
          <select
            className="field__input"
            value={blockTodoId}
            onChange={(event) => setBlockTodoId(event.target.value)}
            aria-label="Link a task to this block (optional)"
          >
            <option value="">No linked task</option>
            {data.todos.map((todo) => (
              <option key={todo.id} value={todo.id}>{todo.title}</option>
            ))}
          </select>
          <input
            className="field__input"
            value={blockTitle}
            onChange={(event) => setBlockTitle(event.target.value)}
            placeholder="Or name the block"
            aria-label="Time block title"
            maxLength={80}
          />
          <input
            className="field__input field__input--time"
            type="time"
            value={blockTime}
            onChange={(event) => setBlockTime(event.target.value)}
            aria-label="Start time"
          />
          <input
            className="field__input field__input--number"
            type="number"
            min={5}
            max={480}
            value={blockDuration}
            onChange={(event) => setBlockDuration(event.target.value)}
            aria-label="Duration in minutes"
          />
          <button type="submit" className="button button--primary">
            <Icon name="plus" size={16} />
            Add block
          </button>
        </form>

        {dayBlocks.length > 0 ? (
          <ul className="timeline">
            {dayBlocks.map((block) => (
              <li key={block.id} className={`timeline__item ${block.completed ? 'timeline__item--done' : ''}`}>
                <div className="timeline__time">
                  <strong>{block.startTime}</strong>
                  <span>{endTime(block.startTime, block.durationMinutes)}</span>
                </div>
                <span className="timeline__dot" />
                <div className="timeline__body">
                  <p className="timeline__title">{block.title}</p>
                  <p className="timeline__meta">
                    <Icon name="clock" size={12} /> {block.durationMinutes} min
                    {block.todoId && ' · linked task'}
                  </p>
                </div>
                <div className="timeline__actions">
                  <button
                    type="button"
                    className={`habit-check ${block.completed ? 'habit-check--done' : ''}`}
                    onClick={() => dispatch({ type: 'timeBlock/toggle', id: block.id })}
                    aria-label={block.completed ? `Mark ${block.title} as not done` : `Complete ${block.title}`}
                  >
                    <Icon name="check" size={14} strokeWidth={2.6} />
                  </button>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => dispatch({ type: 'timeBlock/delete', id: block.id })}
                    aria-label={`Delete ${block.title}`}
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
            title="No blocks planned yet"
            description="Add a time block above to sketch out your day."
          />
        )}
      </section>
    </div>
  )
}
