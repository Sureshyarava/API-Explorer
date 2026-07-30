import { useState } from 'react'
import type { ProxyResponseData } from '../types'
import { MetaBar, formatSize } from './MetaBar'
import { StatusBadge } from './StatusBadge'

export function formatBody(
  body: string | null,
): { text: string; isJson: boolean } | null {
  if (body === null) return null
  try {
    return { text: JSON.stringify(JSON.parse(body), null, 2), isJson: true }
  } catch {
    return { text: body, isJson: false }
  }
}

export function ResponseViewer({ response }: { response: ProxyResponseData }) {
  const [tab, setTab] = useState<'body' | 'headers'>('body')
  const formatted = formatBody(response.body)

  return (
    <section className="response-viewer">
      <div className="response-summary">
        <StatusBadge status={response.status} statusText={response.statusText} />
        <MetaBar elapsedMs={response.elapsedMs} sizeBytes={response.sizeBytes} />
      </div>
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
          <pre className="response-body">{formatted.text}</pre>
        ))}
      {tab === 'headers' && (
        <table className="response-headers">
          <tbody>
            {Object.entries(response.headers).map(([k, v]) => (
              <tr key={k}>
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
