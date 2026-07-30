import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HeadersEditor } from './HeadersEditor'

describe('HeadersEditor', () => {
  it('edits a row key and reports the new rows', () => {
    const onChange = vi.fn()
    render(
      <HeadersEditor rows={[{ key: '', value: '' }]} onChange={onChange} />,
    )
    fireEvent.change(screen.getByPlaceholderText('Header name'), {
      target: { value: 'Accept' },
    })
    expect(onChange).toHaveBeenCalledWith([{ key: 'Accept', value: '' }])
  })

  it('adds a row', () => {
    const onChange = vi.fn()
    render(
      <HeadersEditor rows={[{ key: 'A', value: '1' }]} onChange={onChange} />,
    )
    fireEvent.click(screen.getByText('+ Add header'))
    expect(onChange).toHaveBeenCalledWith([
      { key: 'A', value: '1' },
      { key: '', value: '' },
    ])
  })

  it('removes a row', () => {
    const onChange = vi.fn()
    render(
      <HeadersEditor
        rows={[
          { key: 'A', value: '1' },
          { key: 'B', value: '2' },
        ]}
        onChange={onChange}
      />,
    )
    fireEvent.click(screen.getAllByText('✕')[0])
    expect(onChange).toHaveBeenCalledWith([{ key: 'B', value: '2' }])
  })
})
