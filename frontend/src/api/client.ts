import type { ProxyRequest, ProxyResult } from '../types'

export async function sendRequest(req: ProxyRequest): Promise<ProxyResult> {
  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    throw new Error(`Proxy request failed: ${res.status}`)
  }
  return res.json() as Promise<ProxyResult>
}
