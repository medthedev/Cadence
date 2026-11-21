import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PORT = Number(process.env.PORT ?? 8787)
const HOST = process.env.HOST ?? '0.0.0.0'
const DATA_DIR = join(import.meta.dir, '.data')
const CODE_PATTERN = /^[A-Z0-9_-]{1,32}$/

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

function isValidData(data) {
  if (!data || typeof data !== 'object') return false
  if (data.version !== 2) return false
  return ['todos', 'habits', 'timeBlocks', 'focusSessions'].every(
    (key) => Array.isArray(data[key]),
  )
}

function isValidRecord(record) {
  return record
    && typeof record === 'object'
    && isValidData(record.data)
    && typeof record.revision === 'number'
    && typeof record.updatedAt === 'string'
}

// Restore existing workspaces from disk on startup.
const records = new Map()
await mkdir(DATA_DIR, { recursive: true })
for (const entry of await readdir(DATA_DIR)) {
  if (!entry.endsWith('.json')) continue
  try {
    const record = JSON.parse(await readFile(join(DATA_DIR, entry), 'utf8'))
    if (isValidRecord(record)) records.set(entry.slice(0, -5), record)
  } catch {
    // Ignore an unreadable file; the next successful push will replace it.
  }
}

// Serialize read-modify-write operations so revisions stay consistent.
let queue = Promise.resolve()
function withLock(task) {
  const result = queue.then(task, task)
  queue = result.then(() => undefined, () => undefined)
  return result
}

function putRecord(code, payload) {
  const current = records.get(code) ?? null
  if (current && payload.revision !== current.revision) {
    return Promise.resolve({ conflict: true, remote: current })
  }

  const record = {
    data: payload.data,
    revision: (current?.revision ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  }
  return writeFile(join(DATA_DIR, `${code}.json`), JSON.stringify(record, null, 2), 'utf8')
    .then(() => {
      records.set(code, record)
      return { record }
    })
}

const server = Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const path = new URL(request.url).pathname

    if (path === '/api/health' && request.method === 'GET') {
      return json({ ok: true, workspaces: records.size })
    }

    const match = path.match(/^\/api\/v1\/state\/([^/]+)$/)
    if (!match) return json({ error: 'Not found' }, 404)

    let code
    try {
      code = decodeURIComponent(match[1]).toUpperCase()
    } catch {
      return json({ error: 'Invalid sync code' }, 400)
    }
    if (!CODE_PATTERN.test(code)) return json({ error: 'Invalid sync code' }, 400)

    if (request.method === 'GET') {
      const record = await withLock(() => records.get(code) ?? null)
      return record ? json(record) : json({ error: 'Workspace not found' }, 404)
    }

    if (request.method === 'PUT') {
      let payload
      try {
        payload = await request.json()
      } catch {
        return json({ error: 'Invalid JSON body' }, 400)
      }
      if (!payload || typeof payload !== 'object'
        || !isValidData(payload.data) || typeof payload.revision !== 'number') {
        return json({ error: 'Expected a body of { data, revision }' }, 400)
      }

      const result = await withLock(() => putRecord(code, payload))
      if (result.conflict) {
        return json({ error: 'Cloud data is newer', remote: result.remote }, 409)
      }
      return json({ revision: result.record.revision, updatedAt: result.record.updatedAt })
    }

    return json({ error: 'Method not allowed' }, 405)
  },
})

console.log(`FreeTodo cloud sync listening on http://${HOST}:${server.port}`)
console.log(`Workspace files: ${DATA_DIR}`)
