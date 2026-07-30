import { useMemo, useState } from 'react'
import type { ProxyResponseData } from '../types'
import { MetaBar, formatSize } from './MetaBar'
import { StatusBadge } from './StatusBadge'

export function formatBody(body: string | null): string | null {
  if (body === null) return null
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
}

export function ResponseViewer({ response }: { response: ProxyResponseData }) {
  const [tab, setTab] = useState<'body' | 'headers'>('body')
  const formatted = useMemo(() => formatBody(response.body), [response.body])

  return (
    <section className="response-viewer">
      <div className="response-summary">
        <StatusBadge status={response.status} statusText={response.statusText} />
        <MetaBar elapsedMs={response.elapsedMs} sizeBytes={response.sizeBytes} />
      </div>
      {response.truncated && (
        <p className="json-warning">
          Response truncated — showing the first {formatSize(response.sizeBytes)}
        </p>
      )}
      <div className="tabs">
        <button type="button" onClick={() => setTab('body')}>
          Body
        </button>
        <button type="button" onClick={() => setTab('headers')}>
          Headers
        </button>
      </div>
      {tab === 'body' &&
        (formatted === null ? (
          <p className="binary-notice">
            Binary response ({formatSize(response.sizeBytes)}) — not displayed
          </p>
        ) : (
          <pre className="response-body">{formatted}</pre>
        ))}
      {tab === 'headers' && (
        <table className="response-headers">
          <tbody>
            {response.headers.map(([k, v], i) => (
              <tr key={`${k}-${i}`}>
                <td>{k}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
