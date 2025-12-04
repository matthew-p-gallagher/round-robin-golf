/**
 * Tests for SuccessMessage component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SuccessMessage from './SuccessMessage.jsx'

describe('SuccessMessage', () => {
  it('should return null when no message provided', () => {
    const { container } = render(<SuccessMessage />)
    expect(container.firstChild).toBeNull()
  })

  it('should render success message', () => {
    render(<SuccessMessage message="Operation successful!" />)
    expect(screen.getByText('Operation successful!')).toBeInTheDocument()
  })

  it('should show action button when action and onAction provided', () => {
    const mockOnAction = vi.fn()
    render(<SuccessMessage message="Success!" action="Continue" onAction={mockOnAction} />)

    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('should not show action button when action is missing', () => {
    const mockOnAction = vi.fn()
    render(<SuccessMessage message="Success!" onAction={mockOnAction} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should not show action button when onAction is missing', () => {
    render(<SuccessMessage message="Success!" action="Continue" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should call onAction when button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnAction = vi.fn()
    render(<SuccessMessage message="Success!" action="Continue" onAction={mockOnAction} />)

    const button = screen.getByRole('button', { name: 'Continue' })
    await user.click(button)

    expect(mockOnAction).toHaveBeenCalledTimes(1)
  })

  it('should apply custom className', () => {
    const { container } = render(<SuccessMessage message="Success!" className="custom-success" />)
    expect(container.querySelector('.custom-success')).toBeInTheDocument()
  })

  it('should use default className when not provided', () => {
    const { container } = render(<SuccessMessage message="Success!" />)
    expect(container.querySelector('.auth-success')).toBeInTheDocument()
  })
})
