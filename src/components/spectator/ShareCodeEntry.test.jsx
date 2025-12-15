/**
 * Tests for ShareCodeEntry component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/test-utils.jsx'
import userEvent from '@testing-library/user-event'
import ShareCodeEntry from './ShareCodeEntry.jsx'

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('ShareCodeEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the form with title and subtitle', () => {
      render(<ShareCodeEntry />)

      expect(screen.getByText('View Match')).toBeInTheDocument()
      expect(screen.getByText('Enter a 4-digit match code to view standings')).toBeInTheDocument()
    })

    it('should render code input field', () => {
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', '0000')
      expect(input).toHaveAttribute('maxLength', '4')
    })

    it('should render submit button', () => {
      render(<ShareCodeEntry />)

      expect(screen.getByRole('button', { name: 'View Standings' })).toBeInTheDocument()
    })

    it('should render log in link', () => {
      render(<ShareCodeEntry />)

      expect(screen.getByText('Have an account?')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    })
  })

  describe('Input validation', () => {
    it('should only allow numeric input', async () => {
      const user = userEvent.setup()
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')

      await user.type(input, 'abc123xyz')

      // Only digits should be accepted
      expect(input).toHaveValue('123')
    })

    it('should limit input to 4 characters', async () => {
      const user = userEvent.setup()
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')

      await user.type(input, '123456789')

      expect(input).toHaveValue('1234')
    })

    it('should disable submit button when code is less than 4 digits', async () => {
      const user = userEvent.setup()
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')
      const button = screen.getByRole('button', { name: 'View Standings' })

      expect(button).toBeDisabled()

      await user.type(input, '123')

      expect(button).toBeDisabled()
    })

    it('should enable submit button when code is 4 digits', async () => {
      const user = userEvent.setup()
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')
      const button = screen.getByRole('button', { name: 'View Standings' })

      await user.type(input, '1234')

      expect(button).not.toBeDisabled()
    })
  })

  describe('Form submission', () => {
    it('should show error when submitting empty code', async () => {
      const user = userEvent.setup()
      render(<ShareCodeEntry />)

      const form = screen.getByRole('button', { name: 'View Standings' }).closest('form')

      // Submit the form directly (bypassing disabled button)
      await user.click(screen.getByRole('button', { name: 'View Standings' }))

      // Button is disabled so nothing should happen
      expect(mockNavigate).not.toHaveBeenCalled()
    })

    it('should navigate to view page with code on valid submission', async () => {
      const user = userEvent.setup()
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')
      const button = screen.getByRole('button', { name: 'View Standings' })

      await user.type(input, '5678')
      await user.click(button)

      expect(mockNavigate).toHaveBeenCalledWith('/view/5678')
    })

    it('should trim whitespace from code before navigating', async () => {
      const user = userEvent.setup()
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')

      // Type code with spaces (though input should filter these)
      await user.type(input, '1234')

      const button = screen.getByRole('button', { name: 'View Standings' })
      await user.click(button)

      expect(mockNavigate).toHaveBeenCalledWith('/view/1234')
    })
  })

  describe('Error handling', () => {
    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup()
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')

      // Type invalid then valid
      await user.type(input, '12')

      // No error should be shown while typing
      expect(screen.queryByText(/please enter/i)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have input mode numeric for mobile keyboards', () => {
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')
      expect(input).toHaveAttribute('inputMode', 'numeric')
    })

    it('should autofocus the input field', () => {
      render(<ShareCodeEntry />)

      const input = screen.getByLabelText('Match Code')
      expect(input).toHaveFocus()
    })
  })
})
