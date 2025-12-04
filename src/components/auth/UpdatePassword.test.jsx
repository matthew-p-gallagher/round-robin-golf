/**
 * Tests for UpdatePassword component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UpdatePassword from './UpdatePassword.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Mock useAuth hook
vi.mock('../../context/AuthContext.jsx')

describe('UpdatePassword', () => {
  let mockUpdatePassword
  let mockOnPasswordUpdated

  beforeEach(() => {
    mockUpdatePassword = vi.fn()
    mockOnPasswordUpdated = vi.fn()

    useAuth.mockReturnValue({
      updatePassword: mockUpdatePassword
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render update password form with all elements', () => {
      render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      expect(screen.getByRole('heading', { name: 'Update Password' })).toBeInTheDocument()
      expect(screen.getByText('Choose a new password for your account')).toBeInTheDocument()
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
    })

    it('should show success message after successful password update', async () => {
      const user = userEvent.setup({ delay: null })
      mockUpdatePassword.mockResolvedValue({})

      render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')

      await user.type(passwordInput, 'newpassword123')
      await user.type(confirmPasswordInput, 'newpassword123')

      const submitButton = screen.getByRole('button', { name: /update password/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument()
        expect(screen.getByText(/redirecting to your matches/i)).toBeInTheDocument()
      })

      // Form should be hidden
      expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should show error when submitting with empty fields', async () => {
      const { container } = render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockUpdatePassword).not.toHaveBeenCalled()
    })

    it('should show error when submitting with empty password', async () => {
      const user = userEvent.setup({ delay: null })
      const { container } = render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(confirmPasswordInput, 'password123')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockUpdatePassword).not.toHaveBeenCalled()
    })

    it('should show error when submitting with empty confirm password', async () => {
      const user = userEvent.setup({ delay: null })
      const { container } = render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      await user.type(passwordInput, 'password123')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockUpdatePassword).not.toHaveBeenCalled()
    })

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup({ delay: null })
      const { container } = render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
      expect(mockUpdatePassword).not.toHaveBeenCalled()
    })

    it('should show error when password is too short', async () => {
      const user = userEvent.setup({ delay: null })
      const { container } = render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(passwordInput, '12345')
      await user.type(confirmPasswordInput, '12345')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
      expect(mockUpdatePassword).not.toHaveBeenCalled()
    })
  })

  describe('Submit flow', () => {
    it('should call updatePassword with new password', async () => {
      const user = userEvent.setup({ delay: null })
      mockUpdatePassword.mockResolvedValue({})

      render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(passwordInput, 'newpassword123')
      await user.type(confirmPasswordInput, 'newpassword123')

      const submitButton = screen.getByRole('button', { name: /update password/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockUpdatePassword).toHaveBeenCalledWith('newpassword123')
      })
    })

    it('should show loading state during password update', async () => {
      const user = userEvent.setup({ delay: null })
      let resolveUpdate
      mockUpdatePassword.mockReturnValue(new Promise(resolve => { resolveUpdate = resolve }))

      render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(passwordInput, 'newpassword123')
      await user.type(confirmPasswordInput, 'newpassword123')

      const submitButton = screen.getByRole('button', { name: /update password/i })
      await user.click(submitButton)

      // Should show loading text
      expect(screen.getByText('Updating password...')).toBeInTheDocument()

      // Resolve the promise
      resolveUpdate({})

      // Loading should disappear
      await waitFor(() => {
        expect(screen.queryByText('Updating password...')).not.toBeInTheDocument()
      })
    })

    it('should disable inputs and button during loading', async () => {
      const user = userEvent.setup({ delay: null })
      let resolveUpdate
      mockUpdatePassword.mockReturnValue(new Promise(resolve => { resolveUpdate = resolve }))

      render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(passwordInput, 'newpassword123')
      await user.type(confirmPasswordInput, 'newpassword123')

      const submitButton = screen.getByRole('button', { name: /update password/i })
      await user.click(submitButton)

      // Check disabled state
      expect(passwordInput).toBeDisabled()
      expect(confirmPasswordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()

      // Resolve the promise
      resolveUpdate({})

      // Form should be replaced with success message
      await waitFor(() => {
        expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument()
      })
    })


    it('should clear error on new submit attempt', async () => {
      const user = userEvent.setup({ delay: null })
      const { container } = render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      // Submit with empty fields to trigger error
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })

      // Fill in fields and submit again
      mockUpdatePassword.mockResolvedValue({})
      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(passwordInput, 'newpassword123')
      await user.type(confirmPasswordInput, 'newpassword123')

      // Manually dispatch submit to bypass HTML5 validation
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      // Error should be cleared and success message shown
      await waitFor(() => {
        expect(screen.queryByText('Please fill in all fields')).not.toBeInTheDocument()
        expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should show error message on password update failure', async () => {
      const user = userEvent.setup({ delay: null })
      mockUpdatePassword.mockRejectedValue(new Error('Password update failed'))

      const { container } = render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(passwordInput, 'newpassword123')
      await user.type(confirmPasswordInput, 'newpassword123')

      // Manually dispatch submit to bypass HTML5 validation
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Password update failed')).toBeInTheDocument()
      })
    })

    it('should show default error message when error has no message', async () => {
      const user = userEvent.setup({ delay: null })
      mockUpdatePassword.mockRejectedValue({})

      const { container } = render(<UpdatePassword onPasswordUpdated={mockOnPasswordUpdated} />)

      const passwordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      await user.type(passwordInput, 'newpassword123')
      await user.type(confirmPasswordInput, 'newpassword123')

      // Manually dispatch submit to bypass HTML5 validation
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Failed to update password')).toBeInTheDocument()
      })
    })
  })
})
