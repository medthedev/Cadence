import type { ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface EmptyStateProps {
  icon: IconName
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon"><Icon name={icon} size={24} /></div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {action}
    </div>
  )
}
