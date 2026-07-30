import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BodyEditor } from './BodyEditor'

describe('BodyEditor', () => {
  it('reports edits', () => {
    const onChange = vi.fn()
    render(<BodyEditor value="" onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('Request body (JSON)'), {
      target: { value: '{"a":1}' },
    })
    expect(onChange).toHaveBeenCalledWith('{"a":1}')
  })

  it('warns on invalid JSON', () => {
    render(<BodyEditor value="{not json" onChange={() => {}} />)
    expect(
      screen.getByText('Invalid JSON — will be sent as-is'),
    ).toBeInTheDocument()
  })

  it('does not warn on valid JSON or empty value', () => {
    const { rerender } = render(<BodyEditor value='{"a":1}' onChange={() => {}} />)
    expect(screen.queryByText(/Invalid JSON/)).not.toBeInTheDocument()
    rerender(<BodyEditor value="" onChange={() => {}} />)
    expect(screen.queryByText(/Invalid JSON/)).not.toBeInTheDocument()
  })
})
