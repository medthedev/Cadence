import { useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { loadData, saveData } from '../lib/storage'
import { StoreContext } from './context'
import { appReducer } from './reducer'

interface AppStoreProviderProps {
  children: ReactNode
}

export function AppStoreProvider({ children }: AppStoreProviderProps) {
  const [data, dispatch] = useReducer(appReducer, undefined, loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const value = useMemo(() => ({ data, dispatch }), [data])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
