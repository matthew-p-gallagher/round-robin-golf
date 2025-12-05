import React from 'react'
import { render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { MockAuthProvider, createMockAuthContext } from './utils/test-providers.jsx'

/**
 * Custom render function that includes providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.authContext - Mock auth context value (optional)
 * @param {Function} options.wrapper - Custom wrapper component (optional)
 * @param {string[]} options.initialEntries - Initial router entries (optional)
 * @returns {Object} Render result
 */
const customRender = (ui, options = {}) => {
  const { authContext, wrapper, initialEntries = ['/'], ...renderOptions } = options

  // Create wrapper with auth context and router if provided
  let Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  )

  if (authContext) {
    Wrapper = ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>
        <MockAuthProvider value={authContext}>
          {wrapper ? wrapper({ children }) : children}
        </MockAuthProvider>
      </MemoryRouter>
    )
  } else if (wrapper) {
    const CustomWrapper = wrapper
    Wrapper = ({ children }) => (
      <MemoryRouter initialEntries={initialEntries}>
        <CustomWrapper>{children}</CustomWrapper>
      </MemoryRouter>
    )
  }

  return render(ui, {
    wrapper: Wrapper,
    ...renderOptions,
  })
}

/**
 * Render with authenticated user context
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Additional options
 * @param {Object} options.user - Mock user object (defaults to authenticated user)
 * @param {boolean} options.loading - Loading state (defaults to false)
 * @param {string[]} options.initialEntries - Initial router entries (optional)
 * @returns {Object} Render result with auth context
 */
export const renderWithAuth = (ui, options = {}) => {
  const authContext = createMockAuthContext(options)

  return customRender(ui, {
    ...options,
    authContext
  })
}

/**
 * Render with userEvent setup
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options (same as customRender)
 * @returns {Promise<Object>} Render result with user object
 */
export const renderWithUser = async (ui, options = {}) => {
  return {
    user: userEvent.setup(),
    ...customRender(ui, options)
  }
}

/**
 * Render with both auth context and userEvent
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Combined options for auth and render
 * @returns {Promise<Object>} Render result with user and auth
 */
export const renderWithAuthAndUser = async (ui, options = {}) => {
  const authContext = createMockAuthContext(options)

  return {
    user: userEvent.setup(),
    authContext,
    ...customRender(ui, {
      ...options,
      authContext
    })
  }
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }

// Re-export test providers for convenience
export {
  MockAuthProvider,
  createMockAuthContext,
  createAuthWrapper,
  AUTH_STATES
} from './utils/test-providers.jsx'