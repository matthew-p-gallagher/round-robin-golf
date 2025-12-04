/**
 * Tests for Login component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Mock useAuth hook
vi.mock('../../context/AuthContext.jsx')

describe('Login', () => {
  let mockSignIn
  let mockOnShowSignup
  let mockOnShowResetPassword

  beforeEach(() => {
    mockSignIn = vi.fn()
    mockOnShowSignup = vi.fn()
    mockOnShowResetPassword = vi.fn()

    useAuth.mockReturnValue({
      signIn: mockSignIn
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByText('Sign in to continue your golf matches')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
    })

    it('should render sign up link', () => {
      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      expect(screen.getByText('Sign up')).toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should show error when submitting with empty fields', async () => {
      const user = userEvent.setup()
      const { container } = render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      // Find the form and trigger submit directly to bypass HTML5 validation
      const form = container.querySelector('form')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      // Manually trigger submit event
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('should show error when submitting with empty email', async () => {
      const user = userEvent.setup()
      const { container } = render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'password123')

      // Find the form and trigger submit directly to bypass HTML5 validation
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it('should show error when submitting with empty password', async () => {
      const user = userEvent.setup()
      const { container } = render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'test@example.com')

      // Find the form and trigger submit directly to bypass HTML5 validation
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockSignIn).not.toHaveBeenCalled()
    })
  })

  describe('Submit flow', () => {
    it('should call signIn with email and password', async () => {
      const user = userEvent.setup()
      mockSignIn.mockResolvedValue({})

      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should show loading state during sign in', async () => {
      const user = userEvent.setup()
      let resolveSignIn
      mockSignIn.mockReturnValue(new Promise(resolve => { resolveSignIn = resolve }))

      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Should show loading text
      expect(screen.getByText('Signing in...')).toBeInTheDocument()

      // Resolve the promise
      resolveSignIn({})

      // Loading should disappear
      await waitFor(() => {
        expect(screen.queryByText('Signing in...')).not.toBeInTheDocument()
      })
    })

    it('should disable inputs and buttons during loading', async () => {
      const user = userEvent.setup()
      let resolveSignIn
      mockSignIn.mockReturnValue(new Promise(resolve => { resolveSignIn = resolve }))

      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Check disabled state
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Forgot your password?')).toBeDisabled()
      expect(screen.getByText('Sign up')).toBeDisabled()

      // Resolve the promise
      resolveSignIn({})

      // Should be enabled again
      await waitFor(() => {
        expect(emailInput).not.toBeDisabled()
        expect(passwordInput).not.toBeDisabled()
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should clear error on new submit attempt', async () => {
      const user = userEvent.setup()
      const { container } = render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      // Submit with empty fields to trigger error
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })

      // Fill in fields and submit again
      mockSignIn.mockResolvedValue({})
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Please fill in all fields')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should show error message on sign in failure', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue(new Error('Invalid credentials'))

      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrong-password')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('should show default error message when error has no message', async () => {
      const user = userEvent.setup()
      mockSignIn.mockRejectedValue({})

      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to sign in')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should call onShowResetPassword when forgot password link clicked', async () => {
      const user = userEvent.setup()
      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const forgotPasswordLink = screen.getByText('Forgot your password?')
      await user.click(forgotPasswordLink)

      expect(mockOnShowResetPassword).toHaveBeenCalledTimes(1)
    })

    it('should call onShowSignup when sign up link clicked', async () => {
      const user = userEvent.setup()
      render(<Login onShowSignup={mockOnShowSignup} onShowResetPassword={mockOnShowResetPassword} />)

      const signUpLink = screen.getByText('Sign up')
      await user.click(signUpLink)

      expect(mockOnShowSignup).toHaveBeenCalledTimes(1)
    })
  })
})
