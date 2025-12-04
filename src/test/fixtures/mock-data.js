// Mock data for golf match scenarios

export const mockPlayers = [
  { name: 'Alice', points: 0, wins: 0, draws: 0, losses: 0 },
  { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 0 },
  { name: 'Charlie', points: 0, wins: 0, draws: 0, losses: 0 },
  { name: 'Diana', points: 0, wins: 0, draws: 0, losses: 0 }
]

export const mockPlayersWithStats = [
  { name: 'Alice', points: 9, wins: 3, draws: 0, losses: 0 },
  { name: 'Bob', points: 4, wins: 1, draws: 1, losses: 1 },
  { name: 'Charlie', points: 3, wins: 1, draws: 0, losses: 2 },
  { name: 'Diana', points: 2, wins: 0, draws: 2, losses: 1 }
]

export const mockMatchState = {
  players: mockPlayers,
  currentHole: 1,
  phase: 'setup',
  holeResults: [],
  maxHoleReached: 1
}

export const mockMatchStateInProgress = {
  players: mockPlayersWithStats,
  currentHole: 5,
  phase: 'scoring',
  holeResults: [
    {
      holeNumber: 1,
      matchups: [
        { player1: mockPlayers[0], player2: mockPlayers[1], result: 'player1' },
        { player1: mockPlayers[2], player2: mockPlayers[3], result: 'draw' }
      ]
    },
    {
      holeNumber: 2,
      matchups: [
        { player1: mockPlayers[0], player2: mockPlayers[2], result: 'player1' },
        { player1: mockPlayers[1], player2: mockPlayers[3], result: 'player2' }
      ]
    }
  ],
  maxHoleReached: 5
}

export const mockMatchStateComplete = {
  players: mockPlayersWithStats,
  currentHole: 18,
  phase: 'complete',
  holeResults: [], // Would contain all 18 holes in real scenario
  maxHoleReached: 18
}

// Mock matchup patterns for testing rotation logic
export const expectedMatchupPatterns = [
  // Pattern 1: A vs B, C vs D
  [
    { player1Index: 0, player2Index: 1 },
    { player1Index: 2, player2Index: 3 }
  ],
  // Pattern 2: A vs C, B vs D  
  [
    { player1Index: 0, player2Index: 2 },
    { player1Index: 1, player2Index: 3 }
  ],
  // Pattern 3: A vs D, B vs C
  [
    { player1Index: 0, player2Index: 3 },
    { player1Index: 1, player2Index: 2 }
  ]
]

// Helper function to create a matchup
export const createMatchup = (player1, player2, result = undefined) => ({
  player1,
  player2,
  result
})

// Helper function to create a hole result
export const createHoleResult = (holeNumber, matchups) => ({
  holeNumber,
  matchups
})

// Mock player names for form testing
export const validPlayerNames = ['Alice', 'Bob', 'Charlie', 'Diana']
export const invalidPlayerNames = ['', 'Bob', 'Charlie', 'Diana'] // Empty name
export const duplicatePlayerNames = ['Alice', 'Bob', 'Alice', 'Diana'] // Duplicate name

// ============================================================================
// Authentication Mock Data
// ============================================================================

/**
 * Mock authenticated user
 */
export const mockAuthUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: {}
}

/**
 * Mock unverified user (email not confirmed)
 */
export const mockUnverifiedUser = {
  ...mockAuthUser,
  email_confirmed_at: null
}

/**
 * Mock user with different email
 */
export const mockAuthUser2 = {
  ...mockAuthUser,
  id: 'test-user-id-2',
  email: 'user2@example.com'
}

/**
 * Mock session object
 */
export const mockSession = {
  user: mockAuthUser,
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Date.now() + 3600000, // 1 hour from now
  expires_in: 3600,
  token_type: 'bearer'
}

/**
 * Mock session with unverified user
 */
export const mockUnverifiedSession = {
  ...mockSession,
  user: mockUnverifiedUser
}

// ============================================================================
// Supabase Response Mock Data
// ============================================================================

/**
 * Mock successful Supabase auth response
 */
export const mockAuthSuccessResponse = {
  data: {
    user: mockAuthUser,
    session: mockSession
  },
  error: null
}

/**
 * Mock Supabase sign-up response
 */
export const mockSignUpResponse = {
  data: {
    user: mockUnverifiedUser,
    session: null // No session until email verified
  },
  error: null
}

/**
 * Mock Supabase database success response
 */
export const mockDatabaseSuccessResponse = {
  data: { match_data: mockMatchState },
  error: null
}

/**
 * Mock empty database response (no saved match)
 */
export const mockDatabaseEmptyResponse = {
  data: null,
  error: {
    code: 'PGRST116',
    message: 'No rows found',
    details: null,
    hint: null
  }
}

// ============================================================================
// Error Mock Data
// ============================================================================

/**
 * Mock Supabase error for invalid credentials
 */
export const mockInvalidCredentialsError = {
  message: 'Invalid login credentials',
  status: 400,
  code: 'invalid_credentials'
}

/**
 * Mock Supabase error for user already exists
 */
export const mockUserExistsError = {
  message: 'User already registered',
  status: 400,
  code: '23505'
}

/**
 * Mock Supabase error for weak password
 */
export const mockWeakPasswordError = {
  message: 'Password should be at least 6 characters',
  status: 400,
  code: 'weak_password'
}

/**
 * Mock network error
 */
export const mockNetworkError = {
  message: 'Network request failed',
  status: 0,
  code: 'network_error'
}

/**
 * Mock database error
 */
export const mockDatabaseError = {
  message: 'Database error occurred',
  status: 500,
  code: 'database_error'
}

/**
 * Mock error response format
 */
export const mockErrorResponse = {
  data: null,
  error: mockInvalidCredentialsError
}

// ============================================================================
// Form Validation Mock Data
// ============================================================================

/**
 * Mock validation errors for forms
 */
export const mockValidationErrors = {
  emptyEmail: 'Please enter a valid email address',
  emptyPassword: 'Password must be at least 6 characters long',
  emptyFields: 'Please fill in all fields',
  passwordMismatch: 'Passwords do not match',
  invalidEmail: 'Please enter a valid email address',
  weakPassword: 'Password should be at least 6 characters'
}

/**
 * Valid auth form data
 */
export const validAuthFormData = {
  email: 'test@example.com',
  password: 'password123'
}

/**
 * Invalid auth form data (empty fields)
 */
export const invalidAuthFormData = {
  email: '',
  password: ''
}

/**
 * Invalid email form data
 */
export const invalidEmailFormData = {
  email: 'not-an-email',
  password: 'password123'
}

/**
 * Weak password form data
 */
export const weakPasswordFormData = {
  email: 'test@example.com',
  password: '12345' // Only 5 characters
}