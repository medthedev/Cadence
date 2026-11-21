import type { AppData } from '../types'
import { migrateData } from './storage'

export interface CloudConfig {
  connectionUrl: string
  code: string
  revision: number
}

export interface CloudRecord {
  data: AppData
  revision: number
  updatedAt: string
}

const STORAGE_KEY = 'cadence.cloud.v1'
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

function normalizeRecord(value: unknown): CloudRecord | null {
  if (!isRecord(value) || typeof value.revision !== 'number' || typeof value.updatedAt !== 'string') {
    return null
  }
  const data = migrateData(value.data)
  return data ? { data, revision: value.revision, updatedAt: value.updatedAt } : null
}

export function generateSyncCode(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('')
}

function isAllowedUrl(url: URL): boolean {
  if (url.protocol === 'https:') return true
  return url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
}

/** Accepts `https://project.supabase.co?key=PUBLISHABLE_KEY` as one connection string. */
export function parseConnectionUrl(value: string): { origin: string; apiKey: string } {
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error('Enter a valid Supabase connection URL')
  }
  if (!isAllowedUrl(url)) {
    throw new Error('Use an https Supabase URL (or http://localhost for local Supabase)')
  }

  const apiKey = url.searchParams.get('key')?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!apiKey) throw new Error('Add your publishable key to the URL as ?key=...')

  return { origin: url.origin, apiKey }
}

/** Hide the key when showing the connection in the UI. */
export function describeConnectionUrl(value: string): string {
  try {
    const url = new URL(value.trim())
    return url.searchParams.has('key') ? `${url.origin}?key=••••••` : url.origin
  } catch {
    return value
  }
}

export function loadCloudConfig(): CloudConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null

    // Older builds stored the self-hosted server URL under `serverUrl`.
    const connectionUrl = typeof parsed.connectionUrl === 'string'
      ? parsed.connectionUrl
      : typeof parsed.serverUrl === 'string' ? parsed.serverUrl : ''
    if (!connectionUrl || typeof parsed.code !== 'string') return null

    return {
      connectionUrl,
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

async function rpc<T>(connectionUrl: string, functionName: string, args: Record<string, unknown>): Promise<T> {
  const { origin, apiKey } = parseConnectionUrl(connectionUrl)
  const response = await fetch(`${origin}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(args),
  })

  if (!response.ok) throw new Error(`Supabase responded with ${response.status}`)
  return await response.json() as T
}

export async function cloudPull(config: CloudConfig): Promise<CloudRecord | null> {
  const body = await rpc<unknown>(config.connectionUrl, 'sync_pull', { p_code: config.code })
  if (body === null) return null
  const record = normalizeRecord(body)
  if (!record) throw new Error('Unexpected response from Supabase')
  return record
}

export async function cloudPush(config: CloudConfig, data: AppData): Promise<number> {
  const body = await rpc<unknown>(config.connectionUrl, 'sync_push', {
    p_code: config.code,
    p_data: data,
    p_revision: config.revision,
  })

  if (!isRecord(body)) throw new Error('Unexpected response from Supabase')
  if (body.conflict === true) {
    const remote = normalizeRecord(body.remote)
    if (remote) throw new CloudConflictError(remote)
    throw new Error('Supabase data is out of sync')
  }
  if (typeof body.revision !== 'number') throw new Error('Unexpected response from Supabase')
  return body.revision
}
