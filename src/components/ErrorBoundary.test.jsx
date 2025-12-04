/**
 * Tests for ErrorBoundary component
 * Tests error catching, fallback UI, and recovery actions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from './ErrorBoundary.jsx'

// Component that throws an error when shouldThrow is true
const ThrowError = ({ shouldThrow, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage)
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Child component</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Child component')).toBeInTheDocument()
  })

  it('should catch errors thrown by child components', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(screen.queryByText('No error')).not.toBeInTheDocument()
  })

  it('should display error message in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument()
  })

  it('should display error details', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Custom error message" />
      </ErrorBoundary>
    )

    // Click to expand error details
    const detailsSummary = screen.getByText('Error details')
    expect(detailsSummary).toBeInTheDocument()

    // Error message should be visible in details
    expect(screen.getByText(/Custom error message/)).toBeInTheDocument()
  })

  it('should display component stack in error details', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Component stack should be present (added by React)
    const errorStack = screen.getByText(/Error details/).closest('details')
    expect(errorStack).toBeInTheDocument()
  })

  it('should log errors to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Logged error" />
      </ErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ErrorBoundary caught an error:',
      expect.any(Error)
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error info:',
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('should show Try Again button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should show Reload Page button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Reload Page')).toBeInTheDocument()
  })

  it('should attempt to recover when Try Again is clicked', async () => {
    const user = userEvent.setup()

    // Use a component that can toggle throwing
    let shouldThrow = true
    const ToggleError = () => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>Recovered</div>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ToggleError />
      </ErrorBoundary>
    )

    // Error boundary should be showing
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()

    // Fix the error condition
    shouldThrow = false

    // Click Try Again
    const tryAgainButton = screen.getByText('Try Again')
    await user.click(tryAgainButton)

    // Force re-render after state reset
    rerender(
      <ErrorBoundary>
        <ToggleError />
      </ErrorBoundary>
    )

    // Should show the recovered component
    expect(screen.getByText('Recovered')).toBeInTheDocument()
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
  })

  it('should call reload when Reload Page is clicked', async () => {
    const user = userEvent.setup()

    // Mock window.location.reload using Object.defineProperty
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadMock }
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByText('Reload Page')
    await user.click(reloadButton)

    expect(reloadMock).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple errors', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="First error" />
      </ErrorBoundary>
    )

    expect(screen.getByText(/First error/)).toBeInTheDocument()

    // Trigger another error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorMessage="Second error" />
      </ErrorBoundary>
    )

    // Should still show error boundary (not crash)
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
  })

  it('should handle errors without error info', () => {
    // Create a simple error without component stack
    const SimpleError = () => {
      throw new Error('Simple error')
    }

    render(
      <ErrorBoundary>
        <SimpleError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/Simple error/)).toBeInTheDocument()
  })
})
