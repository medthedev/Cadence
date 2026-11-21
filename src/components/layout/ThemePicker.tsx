import { useEffect, useRef, useState } from 'react'
import { THEME_OPTIONS } from '../../lib/themes'
import type { ThemeOption } from '../../lib/themes'
import type { Theme } from '../../types'
import { Icon } from '../common/Icon'

interface ThemePickerProps {
  theme: Theme
  onChange: (theme: Theme) => void
}

const FAMILIES: ThemeOption['family'][] = ['Catppuccin', 'Gruvbox', 'GitHub']

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
          <div className="theme-picker__groups">
            {FAMILIES.map((family) => (
              <div key={family} className="theme-picker__group">
                <p className="theme-picker__family">{family}</p>
                {THEME_OPTIONS.filter((o) => o.family === family).map((option) => (
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
                      {option.swatches.map((color, i) => (
                        <span key={i} style={{ background: color }} />
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
