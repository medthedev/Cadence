import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  suffix?: string
  tone?: 'default' | 'accent' | 'warm'
}

export function StatCard({ icon, label, value, suffix, tone = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <div className="stat-card__icon">{icon}</div>
      <div>
        <p className="stat-card__value">{value}{suffix && <small>{suffix}</small>}</p>
        <p className="stat-card__label">{label}</p>
      </div>
    </div>
  )
}
