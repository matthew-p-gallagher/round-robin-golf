/**
 * Tests for LoadingSpinner component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner.jsx'

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Please wait..." />)
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })

  it('should have correct structure', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.loading-container')).toBeInTheDocument()
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
  })
})
