import { useEffect, useState } from 'react'
import type { Theme } from '../types'

const STORAGE_KEY = 'freetodo.theme.v1'

function isTheme(value: unknown): value is Theme {
  return value === 'github-light' || value === 'github-dark' || value === 'equicord'
}

function getInitialTheme(): Theme {
  try {
    const saved: unknown = localStorage.getItem(STORAGE_KEY)
    if (isTheme(saved)) return saved
  } catch {
    // Fall through to the system preference.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'github-dark' : 'github-light'
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
