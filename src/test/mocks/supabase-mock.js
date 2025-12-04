/**
 * Supabase mock factory for testing
 * Provides comprehensive mocking of Supabase auth and database operations
 */

import { vi } from 'vitest'

/**
 * Create a mock Supabase client with configurable behavior
 * @param {Object} config - Configuration options
 * @param {Object} config.auth - Auth configuration
 * @param {Object} config.auth.session - Initial session state
 * @param {Object} config.auth.user - Initial user state
 * @param {Object} config.database - Database configuration
 * @param {Object} config.database.responses - Pre-configured database responses by table
 * @returns {Object} Mock Supabase client
 */
export function createSupabaseMock(config = {}) {
  const {
    auth: authConfig = {},
    database: databaseConfig = {}
  } = config

  // Auth state management
  let currentSession = authConfig.session || null
  let currentUser = authConfig.user || null
  let authListeners = []

  // Helper to trigger auth state change
  const triggerAuthStateChange = (event, session) => {
    authListeners.forEach(callback => {
      callback(event, session)
    })
  }

  // Mock auth methods
  const authMock = {
    getSession: vi.fn().mockResolvedValue({
      data: { session: currentSession },
      error: null
    }),

    signUp: vi.fn().mockImplementation(async ({ email, password }) => {
      const newUser = {
        id: 'mock-user-id',
        email,
        email_confirmed_at: null,
        created_at: new Date().toISOString()
      }
      const newSession = {
        user: newUser,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      }

      currentUser = newUser
      currentSession = newSession

      return {
        data: {
          user: newUser,
          session: newSession
        },
        error: null
      }
    }),

    signInWithPassword: vi.fn().mockImplementation(async ({ email, password }) => {
      const user = {
        id: 'mock-user-id',
        email,
        email_confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      const session = {
        user,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token'
      }

      currentUser = user
      currentSession = session
      triggerAuthStateChange('SIGNED_IN', session)

      return {
        data: {
          user,
          session
        },
        error: null
      }
    }),

    signOut: vi.fn().mockImplementation(async () => {
      currentUser = null
      currentSession = null
      triggerAuthStateChange('SIGNED_OUT', null)

      return { error: null }
    }),

    resetPasswordForEmail: vi.fn().mockResolvedValue({
      error: null
    }),

    updateUser: vi.fn().mockImplementation(async (updates) => {
      if (currentUser) {
        currentUser = { ...currentUser, ...updates }
      }

      return {
        data: {
          user: currentUser
        },
        error: null
      }
    }),

    onAuthStateChange: vi.fn().mockImplementation((callback) => {
      authListeners.push(callback)

      // Return subscription object
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn().mockImplementation(() => {
              authListeners = authListeners.filter(cb => cb !== callback)
            })
          }
        }
      }
    }),

    // Helper methods for testing
    _setSession: (session) => {
      currentSession = session
      currentUser = session?.user || null
    },

    _setUser: (user) => {
      currentUser = user
      if (currentSession) {
        currentSession.user = user
      }
    },

    _triggerAuthStateChange: triggerAuthStateChange,

    _reset: () => {
      currentSession = null
      currentUser = null
      authListeners = []
    }
  }

  // Database query builder mock
  const createQueryBuilder = (tableName) => {
    let query = {
      _table: tableName,
      _select: '*',
      _filters: [],
      _single: false,
      _data: null,
      _operation: null
    }

    const builder = {
      select: vi.fn().mockImplementation((columns = '*') => {
        query._select = columns
        query._operation = 'select'
        return builder
      }),

      insert: vi.fn().mockImplementation((data) => {
        query._data = data
        query._operation = 'insert'
        return builder
      }),

      upsert: vi.fn().mockImplementation((data) => {
        query._data = data
        query._operation = 'upsert'
        return builder
      }),

      update: vi.fn().mockImplementation((data) => {
        query._data = data
        query._operation = 'update'
        return builder
      }),

      delete: vi.fn().mockImplementation(() => {
        query._operation = 'delete'
        return builder
      }),

      eq: vi.fn().mockImplementation((column, value) => {
        query._filters.push({ column, operator: 'eq', value })
        return builder
      }),

      neq: vi.fn().mockImplementation((column, value) => {
        query._filters.push({ column, operator: 'neq', value })
        return builder
      }),

      gt: vi.fn().mockImplementation((column, value) => {
        query._filters.push({ column, operator: 'gt', value })
        return builder
      }),

      lt: vi.fn().mockImplementation((column, value) => {
        query._filters.push({ column, operator: 'lt', value })
        return builder
      }),

      single: vi.fn().mockImplementation(() => {
        query._single = true
        return builder
      }),

      // Execute the query and return mock response
      then: vi.fn().mockImplementation((resolve) => {
        // Check for pre-configured responses
        const tableConfig = databaseConfig.responses?.[tableName]

        if (tableConfig && query._operation) {
          const operationConfig = tableConfig[query._operation]

          if (operationConfig) {
            // Return configured response
            const result = typeof operationConfig === 'function'
              ? operationConfig(query)
              : operationConfig

            return Promise.resolve(result).then(resolve)
          }
        }

        // Default successful responses based on operation
        let response = { error: null }

        if (query._operation === 'select') {
          response.data = query._single ? null : []

          // Handle PGRST116 error for single queries with no data
          if (query._single) {
            response.error = {
              code: 'PGRST116',
              message: 'No rows found',
              details: null,
              hint: null
            }
          }
        } else if (query._operation === 'insert' || query._operation === 'upsert') {
          response.data = query._data
        }

        return Promise.resolve(response).then(resolve)
      })
    }

    return builder
  }

  // Mock database operations
  const databaseMock = {
    from: vi.fn().mockImplementation((tableName) => {
      return createQueryBuilder(tableName)
    })
  }

  // Return complete mock client
  return {
    auth: authMock,
    from: databaseMock.from,

    // Helper methods for testing
    _reset: () => {
      authMock._reset()
      vi.clearAllMocks()
    }
  }
}

/**
 * Create a mock authenticated user
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'mock-user-id',
    email: 'test@example.com',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }
}

/**
 * Create a mock unverified user
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock user object
 */
export function createMockUnverifiedUser(overrides = {}) {
  return createMockUser({
    email_confirmed_at: null,
    ...overrides
  })
}

/**
 * Create a mock session
 * @param {Object} user - User object
 * @param {Object} overrides - Properties to override
 * @returns {Object} Mock session object
 */
export function createMockSession(user = null, overrides = {}) {
  const mockUser = user || createMockUser()

  return {
    user: mockUser,
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Date.now() + 3600000, // 1 hour from now
    expires_in: 3600,
    token_type: 'bearer',
    ...overrides
  }
}

/**
 * Create a mock Supabase error
 * @param {string} message - Error message
 * @param {string} code - Error code (e.g., 'PGRST116', '23505')
 * @param {Object} overrides - Additional properties
 * @returns {Object} Mock error object
 */
export function createMockSupabaseError(message, code = null, overrides = {}) {
  return {
    message,
    code,
    details: null,
    hint: null,
    ...overrides
  }
}

/**
 * Common error responses
 */
export const MOCK_ERRORS = {
  INVALID_CREDENTIALS: createMockSupabaseError(
    'Invalid login credentials',
    'invalid_credentials'
  ),

  USER_ALREADY_EXISTS: createMockSupabaseError(
    'User already registered',
    '23505'
  ),

  WEAK_PASSWORD: createMockSupabaseError(
    'Password should be at least 6 characters',
    'weak_password'
  ),

  NETWORK_ERROR: createMockSupabaseError(
    'Network request failed',
    'network_error'
  ),

  NO_ROWS_FOUND: createMockSupabaseError(
    'No rows found',
    'PGRST116'
  ),

  DATABASE_ERROR: createMockSupabaseError(
    'Database error occurred',
    'database_error'
  )
}
