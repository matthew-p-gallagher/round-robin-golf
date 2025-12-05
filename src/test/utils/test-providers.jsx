/**
 * Test provider wrappers for testing components with context
 */

import { vi } from 'vitest'
import { AuthContext } from '../../context/AuthContext.jsx'

/**
 * Create a mock AuthContext value with configurable state
 * @param {Object} options - Configuration options
 * @param {Object} options.user - Mock user object (null for unauthenticated)
 * @param {boolean} options.loading - Loading state
 * @param {Function} options.signUp - Mock signUp function
 * @param {Function} options.signIn - Mock signIn function
 * @param {Function} options.signOut - Mock signOut function
 * @param {Function} options.resetPassword - Mock resetPassword function
 * @param {Function} options.updatePassword - Mock updatePassword function
 * @returns {Object} Mock auth context value
 */
export function createMockAuthContext(options = {}) {
  const {
    user = null,
    loading = false,
    signUp = vi.fn().mockResolvedValue({ user: null, session: null }),
    signIn = vi.fn().mockResolvedValue({ user: null, session: null }),
    signOut = vi.fn().mockResolvedValue(undefined),
    resetPassword = vi.fn().mockResolvedValue(undefined),
    updatePassword = vi.fn().mockResolvedValue({ user: null })
  } = options

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword
  }
}

/**
 * AuthProvider wrapper for testing
 * Provides a mock AuthContext with configurable values
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.value - Mock auth context value (created via createMockAuthContext)
 * @returns {React.ReactElement} Provider wrapper
 */
export function MockAuthProvider({ children, value }) {
  const mockValue = value || createMockAuthContext()

  return (
    <AuthContext.Provider value={mockValue}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Create a wrapper component for testing with AuthContext
 * @param {Object} authValue - Mock auth context value
 * @returns {Function} Wrapper component function
 */
export function createAuthWrapper(authValue) {
  return function AuthWrapper({ children }) {
    return (
      <MockAuthProvider value={authValue}>
        {children}
      </MockAuthProvider>
    )
  }
}

/**
 * Common auth state presets for testing
 */
export const AUTH_STATES = {
  // Unauthenticated state
  UNAUTHENTICATED: {
    user: null,
    loading: false
  },

  // Loading state (initial auth check)
  LOADING: {
    user: null,
    loading: true
  },

  // Authenticated with verified user
  AUTHENTICATED: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString()
    },
    loading: false
  },

  // Authenticated with unverified user
  UNVERIFIED: {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      email_confirmed_at: null
    },
    loading: false
  }
}

/**
 * Helper to render component with mock auth context
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} authOptions - Auth context options
 * @returns {Object} Render result with auth value
 */
export function renderWithAuth(ui, authOptions = {}) {
  // This is a helper that can be used directly or extended
  // The actual render integration will be in test-utils.jsx
  const authValue = createMockAuthContext(authOptions)

  return {
    authValue,
    wrapper: createAuthWrapper(authValue)
  }
}
