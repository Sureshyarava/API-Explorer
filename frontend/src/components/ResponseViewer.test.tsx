import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ResponseViewer, formatBody } from './ResponseViewer'
import type { ProxyResponseData } from '../types'

const base: ProxyResponseData = {
  status: 200,
  statusText: 'OK',
  headers: { 'content-type': 'application/json', 'x-req-id': 'abc' },
  body: '{"a":1}',
  contentType: 'application/json',
  elapsedMs: 42,
  sizeBytes: 7,
}

describe('formatBody', () => {
  it('pretty-prints JSON with 2-space indent', () => {
    expect(formatBody('{"a":1}')).toEqual({
      text: '{\n  "a": 1\n}',
      isJson: true,
    })
  })
  it('falls back to raw text', () => {
    expect(formatBody('<html>')).toEqual({ text: '<html>', isJson: false })
  })
  it('returns null for binary (null) bodies', () => {
    expect(formatBody(null)).toBeNull()
  })
})

describe('ResponseViewer', () => {
  it('shows badge, meta, and pretty JSON body by default', () => {
    render(<ResponseViewer response={base} />)
    expect(screen.getByText('200 OK')).toBeInTheDocument()
    expect(screen.getByText('42 ms')).toBeInTheDocument()
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument()
  })

  it('switches to the headers tab', () => {
    render(<ResponseViewer response={base} />)
    fireEvent.click(screen.getByText('Headers'))
    expect(screen.getByText('x-req-id')).toBeInTheDocument()
    expect(screen.getByText('abc')).toBeInTheDocument()
  })

  it('shows a binary notice when body is null', () => {
    render(<ResponseViewer response={{ ...base, body: null }} />)
    expect(
      screen.getByText('Binary response (7 B) — not displayed'),
    ).toBeInTheDocument()
  })
})
