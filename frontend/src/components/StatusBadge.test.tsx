import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge, statusColor } from './StatusBadge'

describe('statusColor', () => {
  it.each([
    [200, 'green'],
    [204, 'green'],
    [301, 'blue'],
    [404, 'orange'],
    [500, 'red'],
  ])('maps %i to %s', (status, color) => {
    expect(statusColor(status)).toBe(color)
  })
})

describe('StatusBadge', () => {
  it('renders code, text, and color class', () => {
    render(<StatusBadge status={404} statusText="Not Found" />)
    const badge = screen.getByText('404 Not Found')
    expect(badge).toHaveClass('status-orange')
  })
})
