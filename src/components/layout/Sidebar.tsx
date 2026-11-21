import type { View } from '../../types'
import { Icon } from '../common/Icon'
import { Logo } from '../common/Logo'
import type { IconName } from '../common/Icon'

interface SidebarProps {
  view: View
  onViewChange: (view: View) => void
  activeTodos: number
  habitCount: number
  blocksToday: number
  eventsToday: number
  transactionsThisMonth: number
  todayProgress: number
}

interface NavItem {
  id: View
  label: string
  icon: IconName
  count: number
}

const RING_RADIUS = 22
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function Sidebar({
  view, onViewChange, activeTodos, habitCount, blocksToday,
  eventsToday, transactionsThisMonth, todayProgress,
}: SidebarProps) {
  const sections: Array<{ label: string; items: NavItem[] }> = [
    {
      label: 'Overview',
      items: [
        { id: 'today', label: 'Today', icon: 'home', count: 0 },
        { id: 'insights', label: 'Insights', icon: 'chart', count: 0 },
      ],
    },
    {
      label: 'Workspace',
      items: [
        { id: 'todos', label: 'Tasks', icon: 'list', count: activeTodos },
        { id: 'habits', label: 'Habits', icon: 'grid', count: habitCount },
        { id: 'time', label: 'Time', icon: 'clock', count: blocksToday },
      ],
    },
    {
      label: 'Life',
      items: [
        { id: 'calendar', label: 'Calendar', icon: 'calendar', count: eventsToday },
        { id: 'expenses', label: 'Expenses', icon: 'wallet', count: transactionsThisMonth },
      ],
    },
  ]

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark"><Logo size={22} /></div>
        <div>
          <p className="brand__name">Cadence</p>
          <p className="brand__tagline">Life, in rhythm.</p>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {sections.map((section) => (
          <div key={section.label} className="sidebar__section">
            <p className="sidebar__label">{section.label}</p>
            {section.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${view === item.id ? 'nav-item--active' : ''}`}
                onClick={() => onViewChange(item.id)}
                aria-current={view === item.id ? 'page' : undefined}
              >
                <Icon name={item.icon} size={18} />
                <span className="nav-item__label">{item.label}</span>
                <span className="nav-item__count">{item.count}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="focus-card">
          <div className="focus-card__ring">
            <svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true">
              <circle className="focus-card__ring-track" cx="26" cy="26" r={RING_RADIUS} />
              <circle
                className="focus-card__ring-value"
                cx={26}
                cy={26}
                r={RING_RADIUS}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - todayProgress / 100)}
              />
            </svg>
            <span>{todayProgress}%</span>
          </div>
          <div>
            <p className="focus-card__title">Today's rhythm</p>
            <p className="focus-card__text">Habits checked off today</p>
          </div>
        </div>
        <p className="sidebar__note">Consistency beats intensity.</p>
      </div>
    </aside>
  )
}
