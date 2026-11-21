import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { describeConnectionUrl, generateSyncCode } from '../../lib/cloud'
import { useAppData } from '../../store/context'
import type { SyncStatus } from '../../store/context'
import { Icon } from '../common/Icon'

interface CloudDialogProps {
  onClose: () => void
}

const STATUS_COPY: Record<SyncStatus, { title: string; description: string }> = {
  offline: { title: 'Not connected', description: 'Your data lives only on this device.' },
  connecting: { title: 'Connecting…', description: 'Checking the cloud for your workspace.' },
  syncing: { title: 'Syncing…', description: 'Pushing the latest changes.' },
  connected: { title: 'Connected', description: 'Changes sync automatically as you work.' },
  error: { title: 'Connection problem', description: 'Check the server URL and try again.' },
}

export function CloudDialog({ onClose }: CloudDialogProps) {
  const { sync, syncActions } = useAppData()
  const [connectionUrl, setConnectionUrl] = useState(
    sync.config?.connectionUrl ?? import.meta.env.VITE_SUPABASE_URL ?? '',
  )
  const [code, setCode] = useState(sync.config?.code ?? generateSyncCode())
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(sync.status === 'error' && !!sync.config)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!code.trim()) return
    setBusy(true)
    const connected = await syncActions.connect(connectionUrl, code)
    setBusy(false)
    if (connected) setEditing(false)
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="cloud-dialog-title">
        <div className="modal__header">
          <div>
            <h2 id="cloud-dialog-title">Cloud connection</h2>
            <p>Sync your workspace across devices with a private code.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close cloud settings">
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className={`cloud-status cloud-status--${sync.status}`}>
          <span className="cloud-status__icon">
            <Icon name={sync.status === 'offline' || sync.status === 'error' ? 'cloudOff' : 'cloud'} size={20} />
          </span>
          <div>
            <strong>{STATUS_COPY[sync.status].title}</strong>
            <p>{STATUS_COPY[sync.status].description}</p>
          </div>
        </div>

        {sync.error && <p className="cloud-error">{sync.error}</p>}

        {sync.config && !editing ? (
          <div className="cloud-details">
            <dl>
              <div>
                <dt>Server</dt>
                <dd>{describeConnectionUrl(sync.config.connectionUrl)}</dd>
              </div>
              <div>
                <dt>Sync code</dt>
                <dd className="cloud-code">{sync.config.code}</dd>
              </div>
              <div>
                <dt>Last synced</dt>
                <dd>
                  {sync.lastSyncedAt
                    ? new Date(sync.lastSyncedAt).toLocaleTimeString()
                    : 'Waiting for first sync'}
                </dd>
              </div>
            </dl>
            <p className="cloud-hint">
              Enter this code on another device pointed at the same server to share the workspace.
            </p>
            <div className="modal__footer">
              <button type="button" className="button button--ghost" onClick={() => setEditing(true)}>
                <Icon name="pencil" size={15} />
                Change
              </button>
              <button type="button" className="button button--ghost" onClick={syncActions.disconnect}>
                <Icon name="unlink" size={15} />
                Disconnect
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={() => void syncActions.syncNow()}
                disabled={sync.status === 'syncing'}
              >
                <Icon name="rotate" size={15} />
                Sync now
              </button>
            </div>
          </div>
        ) : (
          <form className="modal__form cloud-form" onSubmit={(event) => void handleConnect(event)}>
            <label className="field">
              <span className="field__label">Supabase connection URL</span>
              <input
                className="field__input"
                value={connectionUrl}
                onChange={(event) => setConnectionUrl(event.target.value)}
                placeholder="https://your-project.supabase.co?key=YOUR_ANON_KEY"
                aria-label="Supabase connection URL"
              />
            </label>
            <label className="field">
              <span className="field__label">Private sync code</span>
              <div className="cloud-code-row">
                <input
                  className="field__input cloud-code-input"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  maxLength={32}
                  placeholder="ABC123"
                  aria-label="Sync code"
                />
                <button
                  type="button"
                  className="icon-button icon-button--bordered"
                  onClick={() => setCode(generateSyncCode())}
                  aria-label="Generate a new code"
                  title="Generate a new code"
                >
                  <Icon name="rotate" size={17} />
                </button>
              </div>
            </label>
            <p className="cloud-hint">
              Run <code>supabase/schema.sql</code> in your SQL editor, then paste your project URL with
              <code>?key=YOUR_ANON_KEY</code>. Same code = same workspace.
            </p>
            <div className="modal__footer">
              {editing && sync.config && (
                <button type="button" className="button button--ghost" onClick={syncActions.disconnect}>
                  <Icon name="unlink" size={15} />
                  Disconnect
                </button>
              )}
              <button
                type="button"
                className="button button--ghost"
                onClick={() => (editing ? setEditing(false) : onClose())}
              >
                Cancel
              </button>
              <button type="submit" className="button button--primary" disabled={busy || !code.trim()}>
                <Icon name="link" size={15} />
                {busy ? 'Connecting…' : 'Connect'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
