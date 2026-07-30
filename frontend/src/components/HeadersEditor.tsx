import type { HeaderRow } from '../types'

export function HeadersEditor({
  rows,
  onChange,
}: {
  rows: HeaderRow[]
  onChange: (rows: HeaderRow[]) => void
}) {
  const update = (i: number, patch: Partial<HeaderRow>) =>
    onChange(rows.map((row, j) => (j === i ? { ...row, ...patch } : row)))

  return (
    <div className="headers-editor">
      {rows.map((row, i) => (
        <div className="header-row" key={i}>
          <input
            placeholder="Header name"
            value={row.key}
            onChange={(e) => update(i, { key: e.target.value })}
          />
          <input
            placeholder="Value"
            value={row.value}
            onChange={(e) => update(i, { value: e.target.value })}
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { key: '', value: '' }])}
      >
        + Add header
      </button>
    </div>
  )
}
