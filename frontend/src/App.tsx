import { useState } from 'react'
import { sendRequest } from './api/client'
import { ErrorPanel } from './components/ErrorPanel'
import { RequestForm } from './components/RequestForm'
import { ResponseViewer } from './components/ResponseViewer'
import type { ProxyRequest, ProxyResult } from './types'

export default function App() {
  const [result, setResult] = useState<ProxyResult | null>(null)
  const [inFlight, setInFlight] = useState(false)

  async function handleSend(req: ProxyRequest) {
    setInFlight(true)
    try {
      setResult(await sendRequest(req))
    } catch (err) {
      setResult({
        ok: false,
        error: {
          type: 'connection',
          message: err instanceof Error ? err.message : String(err),
        },
      })
    } finally {
      setInFlight(false)
    }
  }

  return (
    <main className="app">
      <h1>API Explorer</h1>
      <RequestForm inFlight={inFlight} onSend={handleSend} />
      {result &&
        (result.ok ? (
          <ResponseViewer response={result.response} />
        ) : (
          <ErrorPanel error={result.error} />
        ))}
    </main>
  )
}
