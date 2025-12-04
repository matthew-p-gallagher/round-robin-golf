/**
 * Tests for ErrorMessage component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorMessage from './ErrorMessage.jsx'

describe('ErrorMessage', () => {
  it('should return null when no error or errors provided', () => {
    const { container } = render(<ErrorMessage />)
    expect(container.firstChild).toBeNull()
  })

  it('should return null when errors array is empty', () => {
    const { container } = render(<ErrorMessage errors={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render single error message', () => {
    render(<ErrorMessage error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should render multiple error messages', () => {
    const errors = ['Error 1', 'Error 2', 'Error 3']
    render(<ErrorMessage errors={errors} />)

    expect(screen.getByText('Error 1')).toBeInTheDocument()
    expect(screen.getByText('Error 2')).toBeInTheDocument()
    expect(screen.getByText('Error 3')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<ErrorMessage error="Test error" className="custom-error" />)
    expect(container.querySelector('.custom-error')).toBeInTheDocument()
  })

  it('should use default className when not provided', () => {
    const { container } = render(<ErrorMessage error="Test error" />)
    expect(container.querySelector('.error-message')).toBeInTheDocument()
  })

  it('should prioritize single error over errors array', () => {
    render(<ErrorMessage error="Single error" errors={['Error 1', 'Error 2']} />)

    expect(screen.getByText('Single error')).toBeInTheDocument()
    expect(screen.queryByText('Error 1')).not.toBeInTheDocument()
  })
})
