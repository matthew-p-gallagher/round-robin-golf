/**
 * Form testing utilities
 * Helpers for testing forms, validation, and submission flows
 */

import { screen, waitFor } from '@testing-library/react'

/**
 * Fill multiple form fields at once
 * @param {Object} user - userEvent instance from renderWithUser
 * @param {Object} fields - Map of label text to values
 * @returns {Promise<void>}
 *
 * @example
 * await fillForm(user, {
 *   'Email': 'test@example.com',
 *   'Password': 'password123'
 * })
 */
export async function fillForm(user, fields) {
  for (const [label, value] of Object.entries(fields)) {
    const input = screen.getByLabelText(label, { exact: false })
    await user.clear(input)
    await user.type(input, value)
  }
}

/**
 * Fill a form by role and name
 * Useful when labels aren't present or accessible
 * @param {Object} user - userEvent instance
 * @param {Object} fields - Map of field names to values
 * @returns {Promise<void>}
 *
 * @example
 * await fillFormByRole(user, {
 *   'email': 'test@example.com',
 *   'password': 'password123'
 * })
 */
export async function fillFormByRole(user, fields) {
  for (const [name, value] of Object.entries(fields)) {
    const input = screen.getByRole('textbox', { name: new RegExp(name, 'i') })
    await user.clear(input)
    await user.type(input, value)
  }
}

/**
 * Submit a form and wait for async operations
 * @param {Object} user - userEvent instance
 * @param {string} buttonText - Submit button text or regex
 * @param {Object} options - Additional options
 * @param {number} options.timeout - Timeout for waitFor (default: 1000ms)
 * @returns {Promise<void>}
 *
 * @example
 * await submitForm(user, 'Log In')
 * await submitForm(user, /submit/i, { timeout: 2000 })
 */
export async function submitForm(user, buttonText, options = {}) {
  const { timeout = 1000 } = options

  const button = typeof buttonText === 'string'
    ? screen.getByRole('button', { name: buttonText })
    : screen.getByRole('button', { name: buttonText })

  await user.click(button)

  // Wait a tick for async operations to start
  await waitFor(() => {}, { timeout })
}

/**
 * Assert that a validation error is displayed
 * @param {string} message - Error message text or regex
 * @returns {HTMLElement} The error element
 *
 * @example
 * expectValidationError('Please enter a valid email')
 * expectValidationError(/password must be/i)
 */
export function expectValidationError(message) {
  const errorElement = typeof message === 'string'
    ? screen.getByText(message)
    : screen.getByText(message)

  expect(errorElement).toBeInTheDocument()
  return errorElement
}

/**
 * Assert that no validation errors are displayed
 * @param {string} message - Error message that should NOT be present
 *
 * @example
 * expectNoValidationError('Please enter a valid email')
 */
export function expectNoValidationError(message) {
  const errorElement = typeof message === 'string'
    ? screen.queryByText(message)
    : screen.queryByText(message)

  expect(errorElement).not.toBeInTheDocument()
}

/**
 * Assert that a form was submitted successfully
 * @param {Function} mockFn - Mock submit function
 * @param {Array} expectedArgs - Expected arguments passed to submit function
 *
 * @example
 * expectFormSubmitted(mockSignIn, ['test@example.com', 'password123'])
 */
export function expectFormSubmitted(mockFn, expectedArgs = []) {
  expect(mockFn).toHaveBeenCalledTimes(1)

  if (expectedArgs.length > 0) {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs)
  }
}

/**
 * Assert that a form was NOT submitted
 * @param {Function} mockFn - Mock submit function
 *
 * @example
 * expectFormNotSubmitted(mockSignIn)
 */
export function expectFormNotSubmitted(mockFn) {
  expect(mockFn).not.toHaveBeenCalled()
}

/**
 * Get a form input by its label
 * @param {string} labelText - Label text or regex
 * @returns {HTMLElement} The input element
 *
 * @example
 * const emailInput = getFormInput('Email')
 * const passwordInput = getFormInput(/password/i)
 */
export function getFormInput(labelText) {
  return typeof labelText === 'string'
    ? screen.getByLabelText(labelText, { exact: false })
    : screen.getByLabelText(labelText)
}

/**
 * Assert that a form input has a specific value
 * @param {string} labelText - Label text
 * @param {string} expectedValue - Expected input value
 *
 * @example
 * expectInputValue('Email', 'test@example.com')
 */
export function expectInputValue(labelText, expectedValue) {
  const input = getFormInput(labelText)
  expect(input).toHaveValue(expectedValue)
}

/**
 * Assert that a form input is empty
 * @param {string} labelText - Label text
 *
 * @example
 * expectInputEmpty('Email')
 */
export function expectInputEmpty(labelText) {
  const input = getFormInput(labelText)
  expect(input).toHaveValue('')
}

/**
 * Assert that a submit button is disabled
 * @param {string} buttonText - Button text or regex
 *
 * @example
 * expectSubmitDisabled('Log In')
 */
export function expectSubmitDisabled(buttonText) {
  const button = typeof buttonText === 'string'
    ? screen.getByRole('button', { name: buttonText })
    : screen.getByRole('button', { name: buttonText })

  expect(button).toBeDisabled()
}

/**
 * Assert that a submit button is enabled
 * @param {string} buttonText - Button text or regex
 *
 * @example
 * expectSubmitEnabled('Log In')
 */
export function expectSubmitEnabled(buttonText) {
  const button = typeof buttonText === 'string'
    ? screen.getByRole('button', { name: buttonText })
    : screen.getByRole('button', { name: buttonText })

  expect(button).toBeEnabled()
}

/**
 * Wait for a success message to appear
 * @param {string} message - Success message text or regex
 * @param {Object} options - waitFor options
 * @returns {Promise<HTMLElement>} The success message element
 *
 * @example
 * await waitForSuccessMessage('Password reset email sent!')
 */
export async function waitForSuccessMessage(message, options = {}) {
  const element = typeof message === 'string'
    ? await screen.findByText(message, undefined, options)
    : await screen.findByText(message, undefined, options)

  return element
}

/**
 * Wait for an error message to appear
 * @param {string} message - Error message text or regex
 * @param {Object} options - waitFor options
 * @returns {Promise<HTMLElement>} The error message element
 *
 * @example
 * await waitForErrorMessage('Invalid credentials')
 */
export async function waitForErrorMessage(message, options = {}) {
  return waitForSuccessMessage(message, options) // Same implementation
}

/**
 * Assert that a loading state is displayed
 * @param {string} loadingText - Loading text to look for (default: 'Loading')
 *
 * @example
 * expectLoadingState()
 * expectLoadingState('Signing in...')
 */
export function expectLoadingState(loadingText = 'Loading') {
  const loadingElement = screen.getByText(loadingText, { exact: false })
  expect(loadingElement).toBeInTheDocument()
}

/**
 * Assert that no loading state is displayed
 * @param {string} loadingText - Loading text that should NOT be present
 *
 * @example
 * expectNoLoadingState('Signing in...')
 */
export function expectNoLoadingState(loadingText = 'Loading') {
  const loadingElement = screen.queryByText(loadingText, { exact: false })
  expect(loadingElement).not.toBeInTheDocument()
}
