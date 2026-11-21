import type { AppData } from '../types'
import { isAppData } from './storage'

export interface CloudConfig {
  serverUrl: string
  code: string
  revision: number
}

export interface CloudRecord {
  data: AppData
  revision: number
  updatedAt: string
}

const STORAGE_KEY = 'freetodo.cloud.v1'
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export class CloudConflictError extends Error {
  readonly remote: CloudRecord

  constructor(remote: CloudRecord) {
    super('The cloud has newer data')
    this.name = 'CloudConflictError'
    this.remote = remote
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isCloudRecord(value: unknown): value is CloudRecord {
  return isRecord(value)
    && isAppData(value.data)
    && typeof value.revision === 'number'
    && typeof value.updatedAt === 'string'
}

export function generateSyncCode(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('')
}

export function loadCloudConfig(): CloudConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    if (typeof parsed.serverUrl !== 'string' || typeof parsed.code !== 'string') return null
    return {
      serverUrl: parsed.serverUrl,
      code: parsed.code,
      revision: typeof parsed.revision === 'number' ? parsed.revision : 0,
    }
  } catch {
    return null
  }
}

export function saveCloudConfig(config: CloudConfig | null): void {
  try {
    if (config) localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Connection state stays in memory if storage is unavailable.
  }
}

function endpoint(config: CloudConfig): string {
  const base = config.serverUrl.trim().replace(/\/$/, '')
  return `${base}/api/v1/state/${encodeURIComponent(config.code)}`
}

export async function cloudPull(config: CloudConfig): Promise<CloudRecord | null> {
  const response = await fetch(endpoint(config), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Cloud server responded with ${response.status}`)

  const body: unknown = await response.json()
  if (!isCloudRecord(body)) throw new Error('Unexpected response from cloud server')
  return body
}

export async function cloudPush(config: CloudConfig, data: AppData): Promise<number> {
  const response = await fetch(endpoint(config), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, revision: config.revision }),
  })

  if (response.status === 409) {
    const body: unknown = await response.json()
    if (isRecord(body) && isCloudRecord(body.remote)) throw new CloudConflictError(body.remote)
    throw new Error('Cloud data is out of sync')
  }
  if (!response.ok) throw new Error(`Cloud server responded with ${response.status}`)

  const body: unknown = await response.json()
  if (!isRecord(body) || typeof body.revision !== 'number') {
    throw new Error('Unexpected response from cloud server')
  }
  return body.revision
}
