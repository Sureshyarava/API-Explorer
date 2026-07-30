function isInvalidJson(value: string): boolean {
  if (value.trim() === '') return false
  try {
    JSON.parse(value)
    return false
  } catch {
    return true
  }
}

export function BodyEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="body-editor">
      <textarea
        placeholder="Request body (JSON)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
      />
      {isInvalidJson(value) && (
        <p className="json-warning">Invalid JSON — will be sent as-is</p>
      )}
    </div>
  )
}
