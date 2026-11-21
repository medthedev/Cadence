import { useState } from 'react'
import type { FormEvent } from 'react'
import { createId } from '../../lib/id'
import { useAppData } from '../../store/context'
import { EmptyState } from '../common/EmptyState'
import { Icon } from '../common/Icon'
import { StatCard } from '../common/StatCard'

const TEMPLATES = ['Shopping', 'Packing', 'Reading', 'Wishlist']

export function ListsView() {
  const { data, dispatch } = useAppData()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all')
  const [itemDrafts, setItemDrafts] = useState<Record<string, string>>({})

  const allItems = data.lists.flatMap((list) => list.items)
  const doneItems = allItems.filter((item) => item.done).length
  const openItems = allItems.length - doneItems
  const completion = allItems.length ? Math.round((doneItems / allItems.length) * 100) : 0
  const doneLists = data.lists.filter((list) => list.items.length > 0 && list.items.every((item) => item.done)).length

  const visible = data.lists.filter((list) => {
    if (filter === 'open') return !list.items.length || list.items.some((item) => !item.done)
    if (filter === 'done') return list.items.length > 0 && list.items.every((item) => item.done)
    return true
  })

  function createList(name: string, details = '') {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch({
      type: 'list/add',
      list: {
        id: createId(),
        title: trimmed,
        description: details.trim() || undefined,
        items: [],
        createdAt: new Date().toISOString(),
      },
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    createList(title, description)
    setTitle('')
    setDescription('')
  }

  function addItem(event: FormEvent<HTMLFormElement>, listId: string) {
    event.preventDefault()
    const text = (itemDrafts[listId] ?? '').trim()
    if (!text) return
    dispatch({
      type: 'list/itemAdd',
      listId,
      item: { id: createId(), text, done: false, createdAt: new Date().toISOString() },
    })
    setItemDrafts((current) => ({ ...current, [listId]: '' }))
  }

  return (
    <div className="view-stack lists-view">
      <div className="stat-grid">
        <StatCard icon={<Icon name="checklist" size={18} />} tone="accent" label="Lists" value={data.lists.length} />
        <StatCard icon={<Icon name="list" size={18} />} label="Open items" value={openItems} />
        <StatCard icon={<Icon name="check" size={18} />} label="Done items" value={doneItems} />
        <StatCard icon={<Icon name="chart" size={18} />} tone="warm" label="Completion" value={completion} suffix="%" />
      </div>

      <section className="panel life-composer">
        <div className="panel__toolbar">
          <div>
            <h3 className="card__title">Make a new list</h3>
            <p className="card__description">One place for everything you don’t want to forget.</p>
          </div>
        </div>
        <form className="life-form" onSubmit={handleSubmit}>
          <input
            className="field__input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="List name — e.g. Weekly shop"
            aria-label="List name"
            maxLength={80}
          />
          <input
            className="field__input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional description"
            aria-label="List description"
            maxLength={140}
          />
          <button type="submit" className="button button--primary" disabled={!title.trim()}>
            <Icon name="plus" size={16} /> Create list
          </button>
        </form>
        <div className="template-row">
          <span className="template-row__label">Quick start</span>
          {TEMPLATES.map((template) => (
            <button key={template} type="button" className="prompt-chip" onClick={() => createList(template)}>
              + {template}
            </button>
          ))}
        </div>
      </section>

      <div className="panel__toolbar life-toolbar">
        <div className="segmented" role="tablist" aria-label="Filter lists">
          {(['all', 'open', 'done'] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={`segmented__button ${filter === value ? 'segmented__button--active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {value === 'all' ? 'All' : value === 'open' ? 'Open' : `Done (${doneLists})`}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon="checklist"
            title="Nothing on this list"
            description={filter === 'all' ? 'Create a list or pick a quick-start template above.' : 'Try a different filter.'}
          />
        </div>
      ) : (
        <div className="life-grid">
          {visible.map((list) => {
            const total = list.items.length
            const done = list.items.filter((item) => item.done).length
            const progress = total ? Math.round((done / total) * 100) : 0

            return (
              <article key={list.id} className="life-card list-card">
                <div className="life-card__head">
                  <div>
                    <h3 className="life-card__title">{list.title}</h3>
                    {list.description && <p className="life-card__text">{list.description}</p>}
                  </div>
                  <div className="life-card__actions">
                    {done > 0 && (
                      <button
                        type="button"
                        className="icon-button icon-button--bordered"
                        onClick={() => dispatch({ type: 'list/clearDone', listId: list.id })}
                        title="Clear checked items"
                        aria-label={`Clear checked items in ${list.title}`}
                      >
                        <Icon name="check" size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="icon-button icon-button--bordered icon-button--danger"
                      onClick={() => dispatch({ type: 'list/delete', id: list.id })}
                      title="Delete list"
                      aria-label={`Delete ${list.title}`}
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>

                <div className="progress-track" aria-hidden="true">
                  <span className="progress-track__fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="life-card__meta">{done} of {total} done · {progress}%</p>

                <div className="list-items">
                  {list.items.map((item) => (
                    <div key={item.id} className={`list-item ${item.done ? 'list-item--done' : ''}`}>
                      <button
                        type="button"
                        className={`milestone-check ${item.done ? 'milestone-check--done' : ''}`}
                        onClick={() => dispatch({
                          type: 'list/itemToggle', listId: list.id, itemId: item.id,
                        })}
                        aria-label={item.done ? `Uncheck ${item.text}` : `Check ${item.text}`}
                      >
                        {item.done && <Icon name="check" size={12} />}
                      </button>
                      <span>{item.text}</span>
                      <button
                        type="button"
                        className="icon-button icon-button--danger"
                        onClick={() => dispatch({
                          type: 'list/itemDelete', listId: list.id, itemId: item.id,
                        })}
                        aria-label={`Delete ${item.text}`}
                      >
                        <Icon name="close" size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <form className="milestone-add" onSubmit={(event) => addItem(event, list.id)}>
                  <input
                    className="field__input"
                    value={itemDrafts[list.id] ?? ''}
                    onChange={(event) => setItemDrafts((current) => ({ ...current, [list.id]: event.target.value }))}
                    placeholder="Add an item"
                    aria-label={`Add an item to ${list.title}`}
                    maxLength={120}
                  />
                  <button
                    type="submit"
                    className="icon-button icon-button--bordered"
                    aria-label="Add item"
                    disabled={!(itemDrafts[list.id] ?? '').trim()}
                  >
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
