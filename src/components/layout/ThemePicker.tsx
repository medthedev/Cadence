import { useEffect, useRef, useState } from 'react'
import type { Theme } from '../../types'
import { Icon } from '../common/Icon'

interface ThemePickerProps {
  theme: Theme
  onChange: (theme: Theme) => void
}

const THEME_OPTIONS: Array<{
  id: Theme
  label: string
  description: string
  swatches: [string, string, string]
}> = [
  {
    id: 'github-light',
    label: 'GitHub Light',
    description: 'Clean and bright',
    swatches: ['#f6f8fa', '#ffffff', '#1a7f37'],
  },
  {
    id: 'github-dark',
    label: 'GitHub Dark',
    description: 'The classic dark canvas',
    swatches: ['#0d1117', '#161b22', '#3fb950'],
  },
  {
    id: 'equicord',
    label: 'Equicord',
    description: 'Dark with a violet glow',
    swatches: ['#1e1f22', '#313338', '#7c5cff'],
  },
  {
    id: 'mono',
    label: 'Mono',
    description: 'Black and white, medrinnn.dev style',
    swatches: ['#0a0a0a', '#171717', '#fafafa'],
  },
]

export function ThemePicker({ theme, onChange }: ThemePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="theme-picker" ref={containerRef}>
      <button
        type="button"
        className="icon-button icon-button--bordered"
        onClick={() => setOpen((current) => !current)}
        aria-label="Change theme"
        aria-expanded={open}
        title="Change theme"
      >
        <Icon name="palette" size={18} />
      </button>

      {open && (
        <div className="theme-picker__menu" role="menu" aria-label="Themes">
          <p className="theme-picker__heading">Appearance</p>
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={theme === option.id}
              className={`theme-option ${theme === option.id ? 'theme-option--active' : ''}`}
              onClick={() => {
                onChange(option.id)
                setOpen(false)
              }}
            >
              <span className="theme-option__swatches">
                {option.swatches.map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </span>
              <span className="theme-option__text">
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
              {theme === option.id && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
