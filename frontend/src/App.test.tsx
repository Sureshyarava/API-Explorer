import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'
import { sendRequest } from './api/client'

vi.mock('./api/client', () => ({ sendRequest: vi.fn() }))
const sendRequestMock = vi.mocked(sendRequest)

beforeEach(() => {
  sendRequestMock.mockReset()
})

function fireSend() {
  fireEvent.change(
    screen.getByPlaceholderText('https://api.example.com/endpoint'),
    { target: { value: 'https://api.test/x' } },
  )
  fireEvent.click(screen.getByText('Send'))
}

describe('App', () => {
  it('renders the response viewer on success', async () => {
    sendRequestMock.mockResolvedValue({
      ok: true,
      response: {
        status: 200,
        statusText: 'OK',
        headers: {},
        body: '{"done":true}',
        contentType: 'application/json',
        elapsedMs: 10,
        sizeBytes: 13,
      },
    })
    render(<App />)
    fireSend()
    expect(await screen.findByText('200 OK')).toBeInTheDocument()
  })

  it('renders the error panel on proxy failure', async () => {
    sendRequestMock.mockResolvedValue({
      ok: false,
      error: { type: 'connection', message: 'refused' },
    })
    render(<App />)
    fireSend()
    expect(
      await screen.findByText('Request failed (connection)'),
    ).toBeInTheDocument()
  })

  it('renders the error panel when sendRequest throws', async () => {
    sendRequestMock.mockRejectedValue(new Error('Proxy request failed: 422'))
    render(<App />)
    fireSend()
    expect(
      await screen.findByText('Request failed (connection)'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Proxy request failed: 422'),
    ).toBeInTheDocument()
  })
})
