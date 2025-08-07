import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Helper to render components with user event setup
export const renderWithUser = (ui, options = {}) => {
  const user = userEvent.setup()
  return {
    user,
    ...render(ui, options)
  }
}

// Helper to find elements by test id
export const getByTestId = (testId) => screen.getByTestId(testId)
export const queryByTestId = (testId) => screen.queryByTestId(testId)
export const findByTestId = (testId) => screen.findByTestId(testId)

// Helper to check if element has specific class
export const hasClass = (element, className) => {
  return element.classList.contains(className)
}

// Helper to simulate mobile touch events
export const simulateTouch = async (user, element) => {
  await user.pointer([
    { keys: '[TouchA>]', target: element },
    { keys: '[/TouchA]' }
  ])
}

// Helper to wait for async operations
export const waitFor = async (callback, options = {}) => {
  const { waitFor: rtlWaitFor } = await import('@testing-library/react')
  return rtlWaitFor(callback, options)
}

// Helper to create mock functions
export const createMockFn = () => vi.fn()

// Helper to assert button states
export const assertButtonEnabled = (button) => {
  expect(button).toBeEnabled()
  expect(button).not.toHaveAttribute('disabled')
}

export const assertButtonDisabled = (button) => {
  expect(button).toBeDisabled()
  expect(button).toHaveAttribute('disabled')
}

// Helper to assert form validation
export const assertFormValid = (form) => {
  expect(form).toBeValid()
}

export const assertFormInvalid = (form) => {
  expect(form).toBeInvalid()
}