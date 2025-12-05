/**
 * Tests for LoadingSpinner component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner.jsx'

describe('LoadingSpinner', () => {
  it('should have correct structure', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.loading-container')).toBeInTheDocument()
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('should be accessible with status role and label', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })
})
