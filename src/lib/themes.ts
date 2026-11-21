import type { Theme } from '../types'

export interface ThemeOption {
  id: Theme
  label: string
  family: 'Catppuccin' | 'Gruvbox' | 'GitHub'
  description: string
  colorScheme: 'light' | 'dark'
  swatches: [string, string, string]
}

export const THEME_OPTIONS: ThemeOption[] = [
  // Catppuccin
  { id: 'catppuccin-latte', label: 'Latte', family: 'Catppuccin', description: 'Soft light pastel', colorScheme: 'light', swatches: ['#eff1f5', '#ffffff', '#8839ef'] },
  { id: 'catppuccin-frappe', label: 'Frappé', family: 'Catppuccin', description: 'Subdued dark pastel', colorScheme: 'dark', swatches: ['#303446', '#292c3c', '#ca9ee6'] },
  { id: 'catppuccin-macchiato', label: 'Macchiato', family: 'Catppuccin', description: 'Warm dark pastel', colorScheme: 'dark', swatches: ['#24273a', '#1e2030', '#c6a0f6'] },
  { id: 'catppuccin-mocha', label: 'Mocha', family: 'Catppuccin', description: 'Rich dark pastel', colorScheme: 'dark', swatches: ['#1e1e2e', '#181825', '#cba6f7'] },

  // Gruvbox
  { id: 'gruvbox-light-hard', label: 'Light Hard', family: 'Gruvbox', description: 'High contrast light', colorScheme: 'light', swatches: ['#f9f5d7', '#fbf1c7', '#427b58'] },
  { id: 'gruvbox-light-medium', label: 'Light Medium', family: 'Gruvbox', description: 'Balanced light', colorScheme: 'light', swatches: ['#fbf1c7', '#f2e5bc', '#427b58'] },
  { id: 'gruvbox-light-soft', label: 'Light Soft', family: 'Gruvbox', description: 'Warm light', colorScheme: 'light', swatches: ['#f2e5bc', '#ebdbb2', '#427b58'] },
  { id: 'gruvbox-dark-hard', label: 'Dark Hard', family: 'Gruvbox', description: 'High contrast dark', colorScheme: 'dark', swatches: ['#1d2021', '#282828', '#8ec07c'] },
  { id: 'gruvbox-dark-medium', label: 'Dark Medium', family: 'Gruvbox', description: 'Balanced dark', colorScheme: 'dark', swatches: ['#282828', '#3c3836', '#8ec07c'] },
  { id: 'gruvbox-dark-soft', label: 'Dark Soft', family: 'Gruvbox', description: 'Warm dark', colorScheme: 'dark', swatches: ['#32302f', '#3c3836', '#8ec07c'] },

  // GitHub
  { id: 'github-light', label: 'Light Default', family: 'GitHub', description: 'Clean and bright', colorScheme: 'light', swatches: ['#f6f8fa', '#ffffff', '#1a7f37'] },
  { id: 'github-light-hc', label: 'Light High Contrast', family: 'GitHub', description: 'Sharper light', colorScheme: 'light', swatches: ['#ffffff', '#ffffff', '#055d20'] },
  { id: 'github-dark', label: 'Dark Default', family: 'GitHub', description: 'The classic dark canvas', colorScheme: 'dark', swatches: ['#0d1117', '#161b22', '#3fb950'] },
  { id: 'github-dark-dimmed', label: 'Dark Dimmed', family: 'GitHub', description: 'Softer dark', colorScheme: 'dark', swatches: ['#22272e', '#2d333b', '#57ab5a'] },
  { id: 'github-dark-hc', label: 'Dark High Contrast', family: 'GitHub', description: 'Sharper dark', colorScheme: 'dark', swatches: ['#010409', '#0b0f14', '#4ae168'] },
]

export const THEME_IDS = THEME_OPTIONS.map((t) => t.id) as [Theme, ...Theme[]]

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEME_IDS as string[]).includes(value)
}

export function getDefaultTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'github-dark' : 'github-light'
}

export function getThemeColorScheme(theme: Theme): 'light' | 'dark' {
  return THEME_OPTIONS.find((t) => t.id === theme)?.colorScheme ?? 'light'
}
