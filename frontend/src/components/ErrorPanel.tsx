import type { ProxyError } from '../types'

export function ErrorPanel({ error }: { error: ProxyError }) {
  return (
    <section className="error-panel">
      <h2>Request failed ({error.type})</h2>
      <p>{error.message}</p>
    </section>
  )
}
