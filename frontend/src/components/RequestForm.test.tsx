import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { RequestForm, buildHeaders } from './RequestForm'

describe('buildHeaders', () => {
  it('drops rows with empty keys and trims keys', () => {
    expect(
      buildHeaders([
        { key: ' Accept ', value: 'application/json' },
        { key: '', value: 'ignored' },
      ]),
    ).toEqual({ Accept: 'application/json' })
  })
})

describe('RequestForm', () => {
  const url = () =>
    screen.getByPlaceholderText('https://api.example.com/endpoint')

  it('sends the composed request', () => {
    const onSend = vi.fn()
    render(<RequestForm inFlight={false} onSend={onSend} />)
    fireEvent.change(url(), { target: { value: 'https://api.test/x' } })
    fireEvent.click(screen.getByText('Send'))
    expect(onSend).toHaveBeenCalledWith({
      method: 'GET',
      url: 'https://api.test/x',
      headers: {},
      body: null,
    })
  })

  it('includes the body only for body-carrying methods', () => {
    const onSend = vi.fn()
    render(<RequestForm inFlight={false} onSend={onSend} />)
    fireEvent.change(screen.getByLabelText('Method'), {
      target: { value: 'POST' },
    })
    fireEvent.change(screen.getByPlaceholderText('Request body (JSON)'), {
      target: { value: '{"a":1}' },
    })
    fireEvent.change(url(), { target: { value: 'https://api.test/x' } })
    fireEvent.click(screen.getByText('Send'))
    expect(onSend).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', body: '{"a":1}' }),
    )
  })

  it('shows an inline error and does not send when the URL has no http scheme', () => {
    const onSend = vi.fn()
    render(<RequestForm inFlight={false} onSend={onSend} />)
    fireEvent.change(url(), { target: { value: 'foo' } })
    fireEvent.click(screen.getByText('Send'))
    expect(onSend).not.toHaveBeenCalled()
    expect(
      screen.getByText('URL must start with http:// or https://'),
    ).toBeInTheDocument()
  })

  it('clears the URL error once the user edits the URL', () => {
    render(<RequestForm inFlight={false} onSend={() => {}} />)
    fireEvent.change(url(), { target: { value: 'foo' } })
    fireEvent.click(screen.getByText('Send'))
    fireEvent.change(url(), { target: { value: 'https://api.test/x' } })
    expect(screen.queryByText(/URL must start/)).not.toBeInTheDocument()
  })

  it('hides the body editor for GET', () => {
    render(<RequestForm inFlight={false} onSend={() => {}} />)
    expect(
      screen.queryByPlaceholderText('Request body (JSON)'),
    ).not.toBeInTheDocument()
  })

  it('disables Send while in flight or when URL is empty', () => {
    const { rerender } = render(
      <RequestForm inFlight={false} onSend={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    fireEvent.change(url(), { target: { value: 'https://api.test/x' } })
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled()
    rerender(<RequestForm inFlight={true} onSend={() => {}} />)
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled()
  })
})
