export function statusColor(status: number): 'green' | 'blue' | 'orange' | 'red' {
  if (status < 300) return 'green'
  if (status < 400) return 'blue'
  if (status < 500) return 'orange'
  return 'red'
}

export function StatusBadge({
  status,
  statusText,
}: {
  status: number
  statusText: string
}) {
  return (
    <span className={`status-badge status-${statusColor(status)}`}>
      {status} {statusText}
    </span>
  )
}
