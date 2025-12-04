/**
 * Tests for PasswordInput component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PasswordInput from './PasswordInput.jsx'

describe('PasswordInput', () => {
  let mockOnChange

  beforeEach(() => {
    mockOnChange = vi.fn()
  })

  describe('Rendering', () => {
    it('should render with label and input', () => {
      render(
        <PasswordInput
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
        />
      )

      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    })

    it('should not show toggle button when value is empty', () => {
      render(
        <PasswordInput
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
        />
      )

      expect(screen.queryByRole('button', { name: /show password/i })).not.toBeInTheDocument()
    })

    it('should show toggle button when value is not empty', () => {
      render(
        <PasswordInput
          id="password"
          label="Password"
          value="test123"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
    })

    it('should render with all props correctly applied', () => {
      render(
        <PasswordInput
          id="test-password"
          label="Test Password"
          value="test"
          onChange={mockOnChange}
          placeholder="Enter password"
          disabled={false}
          autoComplete="new-password"
          autoFocus={true}
          required={true}
        />
      )

      const input = screen.getByLabelText('Test Password')
      expect(input).toHaveAttribute('id', 'test-password')
      expect(input).toHaveAttribute('placeholder', 'Enter password')
      expect(input).toHaveAttribute('autocomplete', 'new-password')
      expect(input).toHaveAttribute('required')
    })
  })

  describe('Toggle functionality', () => {
    it('should toggle input type when show/hide button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <PasswordInput
          id="password"
          label="Password"
          value="test123"
          onChange={mockOnChange}
        />
      )

      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('type', 'password')

      // Click show button
      const toggleButton = screen.getByRole('button', { name: /show password/i })
      await user.click(toggleButton)

      expect(input).toHaveAttribute('type', 'text')

      // Click hide button
      const hideButton = screen.getByRole('button', { name: /hide password/i })
      await user.click(hideButton)

      expect(input).toHaveAttribute('type', 'password')
    })

    it('should show correct button text based on visibility state', async () => {
      const user = userEvent.setup()
      render(
        <PasswordInput
          id="password"
          label="Password"
          value="test123"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByText('Show')).toBeInTheDocument()

      const toggleButton = screen.getByRole('button', { name: /show password/i })
      await user.click(toggleButton)

      expect(screen.getByText('Hide')).toBeInTheDocument()
    })

    it('should have correct aria-label based on visibility state', async () => {
      const user = userEvent.setup()
      render(
        <PasswordInput
          id="password"
          label="Password"
          value="test123"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument()

      const toggleButton = screen.getByRole('button', { name: 'Show password' })
      await user.click(toggleButton)

      expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument()
    })
  })

  describe('Props handling', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup()
      render(
        <PasswordInput
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
        />
      )

      const input = screen.getByLabelText('Password')
      await user.type(input, 'a')

      expect(mockOnChange).toHaveBeenCalled()
    })

    it('should disable both input and toggle button when disabled', () => {
      render(
        <PasswordInput
          id="password"
          label="Password"
          value="test123"
          onChange={mockOnChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText('Password')).toBeDisabled()
      expect(screen.getByRole('button', { name: /show password/i })).toBeDisabled()
    })

    it('should apply required attribute when required is true', () => {
      render(
        <PasswordInput
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
          required={true}
        />
      )

      expect(screen.getByLabelText('Password')).toBeRequired()
    })
  })

  describe('Edge cases', () => {
    it('should hide toggle button when value becomes empty', () => {
      const { rerender } = render(
        <PasswordInput
          id="password"
          label="Password"
          value="test123"
          onChange={mockOnChange}
        />
      )

      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()

      // Re-render with empty value
      rerender(
        <PasswordInput
          id="password"
          label="Password"
          value=""
          onChange={mockOnChange}
        />
      )

      expect(screen.queryByRole('button', { name: /show password/i })).not.toBeInTheDocument()
    })
  })
})
