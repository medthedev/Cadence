import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  CloudConflictError,
  cloudPull,
  cloudPush,
  loadCloudConfig,
  saveCloudConfig,
} from '../lib/cloud'
import type { CloudConfig, CloudRecord } from '../lib/cloud'
import { loadData, saveData } from '../lib/storage'
import { StoreContext } from './context'
import type { SyncActions, SyncState } from './context'
import { appReducer } from './reducer'

interface AppStoreProviderProps {
  children: ReactNode
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown cloud error'
}

export function AppStoreProvider({ children }: AppStoreProviderProps) {
  const [data, dispatch] = useReducer(appReducer, undefined, loadData)
  const [sync, setSync] = useState<SyncState>(() => {
    const config = loadCloudConfig()
    return {
      status: config ? 'connecting' : 'offline',
      config,
      lastSyncedAt: null,
      error: null,
    }
  })
  const [ready, setReady] = useState(() => !loadCloudConfig())

  const initialConfigRef = useRef(sync.config).current
  const configRef = useRef(sync.config)
  const dataRef = useRef(data)
  const skipPushRef = useRef(false)
  configRef.current = sync.config
  dataRef.current = data

  // Keep the local workspace persisted whether or not cloud sync is enabled.
  useEffect(() => {
    saveData(data)
  }, [data])

  const applyRemote = useCallback((record: CloudRecord | null, config: CloudConfig) => {
    if (record) {
      skipPushRef.current = true
      dispatch({ type: 'data/replace', data: record.data })
    }
    const updated = { ...config, revision: record?.revision ?? config.revision }
    saveCloudConfig(updated)
    configRef.current = updated
    setSync({
      status: 'connected',
      config: updated,
      lastSyncedAt: new Date().toISOString(),
      error: null,
    })
  }, [])

  const pullAndApply = useCallback(async (config: CloudConfig) => {
    setSync((current) => ({ ...current, status: 'connecting', error: null }))
    try {
      const remote = await cloudPull(config)
      applyRemote(remote, config)
      return true
    } catch (error) {
      setSync((current) => ({
        ...current,
        status: 'error',
        config,
        error: errorMessage(error),
      }))
      return false
    }
  }, [applyRemote])

  // Download the remote snapshot once on startup, before any local push.
  useEffect(() => {
    if (!initialConfigRef) return
    let cancelled = false
    void pullAndApply(initialConfigRef).then(() => {
      if (!cancelled) setReady(true)
    })
    return () => { cancelled = true }
  }, [initialConfigRef, pullAndApply])

  // Push local changes after a short debounce.
  useEffect(() => {
    if (!ready || sync.status !== 'connected' || !configRef.current) return
    if (skipPushRef.current) {
      skipPushRef.current = false
      return
    }

    const config = configRef.current
    const timeout = window.setTimeout(() => {
      void cloudPush(config, data)
        .then((revision) => {
          const updated = { ...config, revision }
          saveCloudConfig(updated)
          configRef.current = updated
          setSync((current) => ({
            ...current,
            config: updated,
            lastSyncedAt: new Date().toISOString(),
            error: null,
          }))
        })
        .catch((error: unknown) => {
          if (error instanceof CloudConflictError) {
            applyRemote(error.remote, config)
            return
          }
          setSync((current) => ({ ...current, status: 'error', error: errorMessage(error) }))
        })
    }, 800)

    return () => window.clearTimeout(timeout)
  }, [data, ready, sync.status, applyRemote])

  const connect = useCallback(async (connectionUrl: string, code: string) => {
    const config: CloudConfig = {
      connectionUrl: connectionUrl.trim(),
      code: code.trim().toUpperCase(),
      revision: 0,
    }
    saveCloudConfig(config)
    configRef.current = config
    setSync({ status: 'connecting', config, lastSyncedAt: null, error: null })
    setReady(false)
    const connected = await pullAndApply(config)
    setReady(true)
    return connected
  }, [pullAndApply])

  const disconnect = useCallback(() => {
    saveCloudConfig(null)
    configRef.current = null
    setReady(true)
    setSync({ status: 'offline', config: null, lastSyncedAt: null, error: null })
  }, [])

  const syncNow = useCallback(async () => {
    const config = configRef.current
    if (!config) return
    setSync((current) => ({ ...current, status: 'syncing', error: null }))
    try {
      const revision = await cloudPush(config, dataRef.current)
      const updated = { ...config, revision }
      saveCloudConfig(updated)
      configRef.current = updated
      applyRemote(await cloudPull(updated), updated)
    } catch (error) {
      if (error instanceof CloudConflictError) applyRemote(error.remote, config)
      else setSync((current) => ({ ...current, status: 'error', error: errorMessage(error) }))
    }
  }, [applyRemote])

  const syncActions = useMemo<SyncActions>(
    () => ({ connect, disconnect, syncNow }),
    [connect, disconnect, syncNow],
  )
  const value = useMemo(() => ({ data, dispatch, sync, syncActions }), [data, sync, syncActions])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
