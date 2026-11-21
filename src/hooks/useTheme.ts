import { useEffect, useState } from 'react'
import { getDefaultTheme, isTheme } from '../lib/themes'
import type { Theme } from '../types'

const STORAGE_KEY = 'cadence.theme.v2'

function getInitialTheme(): Theme {
  try {
    const saved: unknown = localStorage.getItem(STORAGE_KEY)
    if (isTheme(saved)) return saved
    // Migrate v1 key if it matches a still-valid theme.
    const legacy: unknown = localStorage.getItem('cadence.theme.v1')
    if (isTheme(legacy)) return legacy
  } catch {
    // Fall through to the system preference.
  }

  return getDefaultTheme()
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Theme still applies for this session.
    }
  }, [theme])

  return { theme, setTheme }
}
