import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { CloudConfig } from '../lib/cloud'
import type { AppData } from '../types'
import type { AppAction } from './reducer'

export type SyncStatus = 'offline' | 'connecting' | 'syncing' | 'connected' | 'error'

export interface SyncState {
  status: SyncStatus
  config: CloudConfig | null
  lastSyncedAt: string | null
  error: string | null
}

export interface SyncActions {
  connect: (connectionUrl: string, code: string) => Promise<boolean>
  disconnect: () => void
  syncNow: () => Promise<void>
}

export interface StoreValue {
  data: AppData
  dispatch: Dispatch<AppAction>
  sync: SyncState
  syncActions: SyncActions
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useAppData(): StoreValue {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useAppData must be used inside AppStoreProvider')
  return store
}
