export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MetaBar({
  elapsedMs,
  sizeBytes,
}: {
  elapsedMs: number
  sizeBytes: number
}) {
  return (
    <div className="meta-bar">
      <span>{elapsedMs} ms</span>
      <span>{formatSize(sizeBytes)}</span>
    </div>
  )
}
