import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorPanel } from './ErrorPanel'

describe('ErrorPanel', () => {
  it('shows the error type and message', () => {
    render(
      <ErrorPanel error={{ type: 'timeout', message: 'timed out after 30s' }} />,
    )
    expect(screen.getByText('Request failed (timeout)')).toBeInTheDocument()
    expect(screen.getByText('timed out after 30s')).toBeInTheDocument()
  })
})
