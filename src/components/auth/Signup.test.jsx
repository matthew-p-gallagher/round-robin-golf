/**
 * Tests for Signup component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Signup from './Signup.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Mock useAuth hook
vi.mock('../../context/AuthContext.jsx')

describe('Signup', () => {
  let mockSignUp
  let mockOnShowLogin

  beforeEach(() => {
    mockSignUp = vi.fn()
    mockOnShowLogin = vi.fn()

    useAuth.mockReturnValue({
      signUp: mockSignUp
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render signup form with all elements', () => {
      render(<Signup onShowLogin={mockOnShowLogin} />)

      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument()
      expect(screen.getByText('Sign up to start tracking your golf matches')).toBeInTheDocument()
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('should render sign in link', () => {
      render(<Signup onShowLogin={mockOnShowLogin} />)

      expect(screen.getByText('Sign in')).toBeInTheDocument()
    })

    it('should show success message after successful signup', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue({})

      render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/account created/i)).toBeInTheDocument()
        expect(screen.getByText(/check your email to verify/i)).toBeInTheDocument()
      })

      // Form should be hidden
      expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('should show error when submitting with empty fields', async () => {
      const { container } = render(<Signup onShowLogin={mockOnShowLogin} />)

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should show error when submitting with empty email', async () => {
      const user = userEvent.setup()
      const { container } = render(<Signup onShowLogin={mockOnShowLogin} />)

      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should show error when submitting with empty password', async () => {
      const user = userEvent.setup()
      const { container } = render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(confirmPasswordInput, 'password123')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should show error when submitting with empty confirm password', async () => {
      const user = userEvent.setup()
      const { container } = render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup()
      const { container } = render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
      expect(mockSignUp).not.toHaveBeenCalled()
    })

    it('should show error when password is too short', async () => {
      const user = userEvent.setup()
      const { container } = render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, '12345')
      await user.type(confirmPasswordInput, '12345')

      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      })
      expect(mockSignUp).not.toHaveBeenCalled()
    })
  })

  describe('Submit flow', () => {
    it('should call signUp with email and password', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue({})

      render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should show loading state during signup', async () => {
      const user = userEvent.setup()
      let resolveSignUp
      mockSignUp.mockReturnValue(new Promise(resolve => { resolveSignUp = resolve }))

      render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Should show loading text
      expect(screen.getByText('Creating account...')).toBeInTheDocument()

      // Resolve the promise
      resolveSignUp({})

      // Loading should disappear
      await waitFor(() => {
        expect(screen.queryByText('Creating account...')).not.toBeInTheDocument()
      })
    })

    it('should disable inputs and buttons during loading', async () => {
      const user = userEvent.setup()
      let resolveSignUp
      mockSignUp.mockReturnValue(new Promise(resolve => { resolveSignUp = resolve }))

      render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Check disabled state
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(confirmPasswordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText('Sign in')).toBeDisabled()

      // Resolve the promise
      resolveSignUp({})

      // Form should be replaced with success message
      await waitFor(() => {
        expect(screen.getByText(/account created/i)).toBeInTheDocument()
      })
    })

    it('should clear error and success on new submit attempt', async () => {
      const user = userEvent.setup()
      const { container } = render(<Signup onShowLogin={mockOnShowLogin} />)

      // Submit with empty fields to trigger error
      const form = container.querySelector('form')
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeInTheDocument()
      })

      // Fill in fields and submit again
      mockSignUp.mockResolvedValue({})
      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Please fill in all fields')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error handling', () => {
    it('should show error message on signup failure', async () => {
      const user = userEvent.setup()
      mockSignUp.mockRejectedValue(new Error('Email already in use'))

      render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email already in use')).toBeInTheDocument()
      })
    })

    it('should show default error message when error has no message', async () => {
      const user = userEvent.setup()
      mockSignUp.mockRejectedValue({})

      render(<Signup onShowLogin={mockOnShowLogin} />)

      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to create account')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should call onShowLogin when sign in link clicked', async () => {
      const user = userEvent.setup()
      render(<Signup onShowLogin={mockOnShowLogin} />)

      const signInLink = screen.getByText('Sign in')
      await user.click(signInLink)

      expect(mockOnShowLogin).toHaveBeenCalledTimes(1)
    })

    it('should call onShowLogin when success action button clicked', async () => {
      const user = userEvent.setup()
      mockSignUp.mockResolvedValue({})

      render(<Signup onShowLogin={mockOnShowLogin} />)

      // First, successfully sign up
      const emailInput = screen.getByLabelText(/^email$/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText('Back to Log In')).toBeInTheDocument()
      })

      // Click the Back to Log In button
      const backButton = screen.getByText('Back to Log In')
      await user.click(backButton)

      expect(mockOnShowLogin).toHaveBeenCalledTimes(1)
    })
  })
})
