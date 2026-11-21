import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { AppData } from '../types'
import type { AppAction } from './reducer'

export interface StoreValue {
  data: AppData
  dispatch: Dispatch<AppAction>
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useAppData(): StoreValue {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useAppData must be used inside AppStoreProvider')
  return store
}
