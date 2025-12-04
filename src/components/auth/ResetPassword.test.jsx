/**
 * Tests for ResetPassword component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetPassword from './ResetPassword.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Mock useAuth hook
vi.mock('../../context/AuthContext.jsx')

describe('ResetPassword', () => {
  let mockResetPassword
  let mockOnShowLogin

  beforeEach(() => {
    mockResetPassword = vi.fn()
    mockOnShowLogin = vi.fn()

    useAuth.mockReturnValue({
      resetPassword: mockResetPassword
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render reset password form with all elements', () => {
      render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      expect(screen.getByRole('heading', { name: 'Reset Password' })).toBeInTheDocument()
      expect(screen.getByText('Enter your email to receive a password reset link')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    })

    it('should render back to sign in link', () => {
      render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      expect(screen.getByText('Back to Sign In')).toBeInTheDocument()
    })

    it('should show success message after successful reset', async () => {
      const user = userEvent.setup({ delay: null })
      mockResetPassword.mockResolvedValue({})

      render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument()
        expect(screen.getByText(/check your inbox/i)).toBeInTheDocument()
      })

      // Form should be hidden
      expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should show error when submitting with empty email', async () => {
      const { container } = render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please enter your email address')).toBeInTheDocument()
      })
      expect(mockResetPassword).not.toHaveBeenCalled()
    })
  })

  describe('Submit flow', () => {
    it('should call resetPassword with email', async () => {
      const user = userEvent.setup({ delay: null })
      mockResetPassword.mockResolvedValue({})

      render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com')
      })
    })

    it('should show loading state during password reset', async () => {
      const user = userEvent.setup({ delay: null })
      let resolveReset
      mockResetPassword.mockReturnValue(new Promise(resolve => { resolveReset = resolve }))

      render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      // Should show loading text
      expect(screen.getByText('Sending...')).toBeInTheDocument()

      // Resolve the promise
      resolveReset({})

      // Loading should disappear
      await waitFor(() => {
        expect(screen.queryByText('Sending...')).not.toBeInTheDocument()
      })
    })

    it('should disable input and buttons during loading', async () => {
      const user = userEvent.setup({ delay: null })
      let resolveReset
      mockResetPassword.mockReturnValue(new Promise(resolve => { resolveReset = resolve }))

      render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      // Check disabled state
      expect(emailInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Back to Sign In')).toBeDisabled()

      // Resolve the promise
      resolveReset({})

      // Form should be replaced with success message
      await waitFor(() => {
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument()
      })
    })

    it('should clear error and success on new submit attempt', async () => {
      const user = userEvent.setup({ delay: null })
      const { container } = render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      // Submit with empty email to trigger error
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please enter your email address')).toBeInTheDocument()
      })

      // Fill in email and submit again
      mockResetPassword.mockResolvedValue({})
      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      // Error should be cleared and success message shown
      await waitFor(() => {
        expect(screen.queryByText('Please enter your email address')).not.toBeInTheDocument()
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should show error message on reset failure', async () => {
      const user = userEvent.setup({ delay: null })
      mockResetPassword.mockRejectedValue(new Error('User not found'))

      const { container } = render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      // Manually dispatch submit to bypass HTML5 validation
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument()
      })
    })

    it('should show default error message when error has no message', async () => {
      const user = userEvent.setup({ delay: null })
      mockResetPassword.mockRejectedValue({})

      const { container } = render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      // Manually dispatch submit to bypass HTML5 validation
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Failed to send reset email')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should call onShowLogin when back to sign in link clicked', async () => {
      const user = userEvent.setup({ delay: null })
      render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      const backLink = screen.getByText('Back to Sign In')
      await user.click(backLink)

      expect(mockOnShowLogin).toHaveBeenCalledTimes(1)
    })

    it('should call onShowLogin when success action button clicked', async () => {
      const user = userEvent.setup({ delay: null })
      mockResetPassword.mockResolvedValue({})

      render(<ResetPassword onShowLogin={mockOnShowLogin} />)

      // First, successfully reset password
      const emailInput = screen.getByLabelText('Email')
      await user.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      await user.click(submitButton)

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument()
      })

      // Click the Back to Sign In button from success message (primary button, first one)
      const backButtons = screen.getAllByRole('button', { name: 'Back to Sign In' })
      await user.click(backButtons[0])

      expect(mockOnShowLogin).toHaveBeenCalledTimes(1)
    })
  })
})
