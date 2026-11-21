import { formatLongDate } from '../../lib/date'
import type { Theme, View } from '../../types'
import { Icon } from '../common/Icon'
import { ThemePicker } from './ThemePicker'

interface HeaderProps {
  view: View
  theme: Theme
  onThemeChange: (theme: Theme) => void
}

const VIEW_COPY: Record<View, { eyebrow: string; title: string; subtitle: string }> = {
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
}

export function Header({ view, theme, onThemeChange }: HeaderProps) {
  const copy = VIEW_COPY[view]

  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">{copy.eyebrow}</p>
        <h1 className="app-header__title">{copy.title}</h1>
        <p className="app-header__subtitle">{copy.subtitle}</p>
      </div>

      <div className="app-header__actions">
        <div className="date-chip">
          <Icon name="sparkles" size={15} />
          <span>{formatLongDate(new Date())}</span>
        </div>
        <ThemePicker theme={theme} onChange={onThemeChange} />
      </div>
    </header>
  )
}
