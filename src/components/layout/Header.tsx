import { formatLongDate } from '../../lib/date'
import { useAppData } from '../../store/context'
import type { SyncStatus } from '../../store/context'
import type { Theme, View } from '../../types'
import { Icon } from '../common/Icon'
import { ThemePicker } from './ThemePicker'

interface HeaderProps {
  view: View
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onCloudClick: () => void
}

const VIEW_COPY: Record<View, { eyebrow: string; title: string; subtitle: string }> = {
  today: {
    eyebrow: 'Overview / Today',
    title: 'Today',
    subtitle: 'A clear view of what matters right now.',
  },
  insights: {
    eyebrow: 'Overview / Insights',
    title: 'Insights',
    subtitle: 'Your progress, day by day, month by month, year by year.',
  },
  todos: {
    eyebrow: 'Workspace / Tasks',
    title: 'Tasks',
    subtitle: 'A clear mind starts with a clear list.',
  },
  habits: {
    eyebrow: 'Workspace / Habits',
    title: 'Habits',
    subtitle: 'Small steps, repeated often, become who you are.',
  },
  time: {
    eyebrow: 'Workspace / Time',
    title: 'Time',
    subtitle: 'Plan your day, then protect your focus.',
  },
  goals: {
    eyebrow: 'Workspace / Goals',
    title: 'Goals',
    subtitle: 'Turn the big things into small, steady steps.',
  },
  calendar: {
    eyebrow: 'Life / Calendar',
    title: 'Calendar',
    subtitle: 'Make room for the people and plans that matter.',
  },
  expenses: {
    eyebrow: 'Life / Expenses',
    title: 'Expenses',
    subtitle: 'Know where your money goes, without the spreadsheet.',
  },
  journal: {
    eyebrow: 'Life / Journal',
    title: 'Journal',
    subtitle: 'A quiet place to notice the day.',
  },
  people: {
    eyebrow: 'Life / People',
    title: 'People',
    subtitle: 'Keep the relationships you care about alive.',
  },
  lists: {
    eyebrow: 'Life / Lists',
    title: 'Lists',
    subtitle: 'Shopping, packing, reading — whatever needs remembering.',
  },
}

const CLOUD_LABEL: Record<SyncStatus, string> = {
  offline: 'Cloud',
  connecting: 'Connecting',
  syncing: 'Syncing',
  connected: 'Synced',
  error: 'Cloud error',
}

export function Header({ view, theme, onThemeChange, onCloudClick }: HeaderProps) {
  const copy = VIEW_COPY[view]
  const { sync } = useAppData()
  const offline = sync.status === 'offline' || sync.status === 'error'

  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">{copy.eyebrow}</p>
        <h1 className="app-header__title">{copy.title}</h1>
        <p className="app-header__subtitle">{copy.subtitle}</p>
      </div>

      <div className="app-header__actions">
        <button
          type="button"
          className={`cloud-button cloud-button--${sync.status}`}
          onClick={onCloudClick}
          title="Cloud sync settings"
        >
          <span className="cloud-button__dot" />
          <Icon name={offline ? 'cloudOff' : 'cloud'} size={15} />
          <span>{CLOUD_LABEL[sync.status]}</span>
        </button>
        <div className="date-chip">
          <Icon name="sparkles" size={15} />
          <span>{formatLongDate(new Date())}</span>
        </div>
        <ThemePicker theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  )
}
