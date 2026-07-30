import { useState } from 'react'
import type { HeaderRow, HttpMethod, ProxyRequest } from '../types'
import { BodyEditor } from './BodyEditor'
import { HeadersEditor } from './HeadersEditor'

const METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]

const BODY_METHODS: HttpMethod[] = ['POST', 'PUT', 'PATCH']

export function buildHeaders(rows: HeaderRow[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const { key, value } of rows) {
    if (key.trim()) out[key.trim()] = value
  }
  return out
}

export function RequestForm({
  inFlight,
  onSend,
}: {
  inFlight: boolean
  onSend: (req: ProxyRequest) => void
}) {
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [url, setUrl] = useState('')
  const [rows, setRows] = useState<HeaderRow[]>([{ key: '', value: '' }])
  const [body, setBody] = useState('')

  const hasBody = BODY_METHODS.includes(method)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend({
      method,
      url,
      headers: buildHeaders(rows),
      body: hasBody && body !== '' ? body : null,
    })
  }

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <div className="request-line">
        <label>
          Method
          <select
            aria-label="Method"
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
          >
            {METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <input
          placeholder="https://api.example.com/endpoint"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit" disabled={inFlight || url.trim() === ''}>
          {inFlight ? 'Sending…' : 'Send'}
        </button>
      </div>
      <HeadersEditor rows={rows} onChange={setRows} />
      {hasBody && <BodyEditor value={body} onChange={setBody} />}
    </form>
  )
}
