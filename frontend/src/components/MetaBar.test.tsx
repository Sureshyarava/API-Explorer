import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetaBar, formatSize } from './MetaBar'

describe('formatSize', () => {
  it.each([
    [512, '512 B'],
    [2048, '2.0 KB'],
    [1536, '1.5 KB'],
    [3145728, '3.0 MB'],
  ])('formats %i as %s', (bytes, text) => {
    expect(formatSize(bytes)).toBe(text)
  })
})

describe('MetaBar', () => {
  it('shows elapsed time and size', () => {
    render(<MetaBar elapsedMs={132} sizeBytes={512} />)
    expect(screen.getByText('132 ms')).toBeInTheDocument()
    expect(screen.getByText('512 B')).toBeInTheDocument()
  })
})
