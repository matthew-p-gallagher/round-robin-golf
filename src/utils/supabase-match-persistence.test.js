/**
 * Tests for Supabase match persistence utility functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  saveMatchStateToSupabase,
  loadMatchStateFromSupabase,
  clearMatchStateFromSupabase,
  hasMatchStateInSupabase
} from './supabase-match-persistence.js'

// Mock the supabase module
vi.mock('../lib/supabase.js')

// Import the mocked supabase
import { supabase as mockSupabase } from '../lib/supabase.js'

// Test user ID
const TEST_USER_ID = 'test-user-123'

// Valid match state fixture
const createValidMatchState = () => ({
  players: [
    { name: 'Alice', points: 3, wins: 1, draws: 0, losses: 0 },
    { name: 'Bob', points: 1, wins: 0, draws: 1, losses: 0 },
    { name: 'Charlie', points: 0, wins: 0, draws: 0, losses: 1 },
    { name: 'Diana', points: 1, wins: 0, draws: 1, losses: 0 }
  ],
  currentHole: 2,
  phase: 'scoring',
  holeResults: [
    {
      hole: 1,
      matchups: [
        { player1: 'Alice', player2: 'Bob', result: 'player1' },
        { player1: 'Charlie', player2: 'Diana', result: 'draw' }
      ]
    }
  ],
  maxHoleReached: 2
})

describe('saveMatchStateToSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Configure mock Supabase client
    mockSupabase.from = vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null })
    })
  })

  it('should save match state successfully', async () => {
    const matchState = createValidMatchState()
    const result = await saveMatchStateToSupabase(matchState, TEST_USER_ID)

    expect(result).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('user_current_match')

    const upsertCall = mockSupabase.from().upsert
    expect(upsertCall).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: TEST_USER_ID,
        match_data: matchState,
        updated_at: expect.any(String)
      })
    )
  })

  it('should throw error when userId is missing', async () => {
    const matchState = createValidMatchState()

    await expect(async () => {
      await saveMatchStateToSupabase(matchState, null)
    }).rejects.toThrow('User ID is required to save match state')

    await expect(async () => {
      await saveMatchStateToSupabase(matchState, undefined)
    }).rejects.toThrow('User ID is required to save match state')

    await expect(async () => {
      await saveMatchStateToSupabase(matchState, '')
    }).rejects.toThrow('User ID is required to save match state')
  })

  it('should return false and log error on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const matchState = createValidMatchState()
    const mockError = { message: 'Database error', code: '500' }

    mockSupabase.from = vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: mockError })
    })

    const result = await saveMatchStateToSupabase(matchState, TEST_USER_ID)

    expect(result).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to save match state to Supabase:',
      mockError
    )

    consoleError.mockRestore()
  })

  it('should return false and log error on exception', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const matchState = createValidMatchState()
    const mockError = new Error('Network error')

    mockSupabase.from = vi.fn().mockReturnValue({
      upsert: vi.fn().mockRejectedValue(mockError)
    })

    const result = await saveMatchStateToSupabase(matchState, TEST_USER_ID)

    expect(result).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(
      'Error saving match state to Supabase:',
      mockError
    )

    consoleError.mockRestore()
  })

  it('should include updated_at timestamp', async () => {
    const matchState = createValidMatchState()
    const beforeTime = new Date().toISOString()

    await saveMatchStateToSupabase(matchState, TEST_USER_ID)

    const upsertCall = mockSupabase.from().upsert
    const callArgs = upsertCall.mock.calls[0][0]

    expect(callArgs.updated_at).toBeDefined()
    expect(typeof callArgs.updated_at).toBe('string')
    expect(new Date(callArgs.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(beforeTime).getTime())
  })

  it('should preserve match state structure when saving', async () => {
    const matchState = createValidMatchState()

    await saveMatchStateToSupabase(matchState, TEST_USER_ID)

    const upsertCall = mockSupabase.from().upsert
    const callArgs = upsertCall.mock.calls[0][0]

    expect(callArgs.match_data).toEqual(matchState)
    // Note: Implementation passes match_data by reference, not cloned
  })
})

describe('loadMatchStateFromSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load match state successfully', async () => {
    const matchState = createValidMatchState()

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { match_data: matchState },
            error: null
          })
        })
      })
    })

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)

    expect(result).toEqual(matchState)
    expect(mockSupabase.from).toHaveBeenCalledWith('user_current_match')
  })

  it('should return null when userId is missing', async () => {
    const result1 = await loadMatchStateFromSupabase(null)
    const result2 = await loadMatchStateFromSupabase(undefined)
    const result3 = await loadMatchStateFromSupabase('')

    expect(result1).toBeNull()
    expect(result2).toBeNull()
    expect(result3).toBeNull()
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should return null on PGRST116 error (no row found)', async () => {
    const mockError = { code: 'PGRST116', message: 'No rows returned' }

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      })
    })

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)

    expect(result).toBeNull()
  })

  it('should return null and log error on other Supabase errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = { code: '500', message: 'Database error' }

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      })
    })

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)

    expect(result).toBeNull()
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to load match state from Supabase:',
      mockError
    )

    consoleError.mockRestore()
  })

  it('should return null when data is missing', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })
    })

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
  })

  it('should return null when match_data is missing', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { user_id: TEST_USER_ID },
            error: null
          })
        })
      })
    })

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
  })

  it('should clear and return null for invalid match state', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const invalidState = { invalid: 'data' }

    // Mock the delete operation for clearMatchStateFromSupabase
    const mockDelete = vi.fn().mockResolvedValue({ error: null })

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { match_data: invalidState },
            error: null
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: mockDelete
      })
    })

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)

    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalledWith(
      'Invalid match state found in database, clearing it'
    )
    expect(mockDelete).toHaveBeenCalledWith('user_id', TEST_USER_ID)

    consoleWarn.mockRestore()
  })

  it('should return null and log error on exception', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = new Error('Network error')

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(mockError)
        })
      })
    })

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)

    expect(result).toBeNull()
    expect(consoleError).toHaveBeenCalledWith(
      'Error loading match state from Supabase:',
      mockError
    )

    consoleError.mockRestore()
  })
})

describe('clearMatchStateFromSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Configure mock Supabase client
    mockSupabase.from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
  })

  it('should clear match state successfully', async () => {
    const result = await clearMatchStateFromSupabase(TEST_USER_ID)

    expect(result).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('user_current_match')

    const eqCall = mockSupabase.from().delete().eq
    expect(eqCall).toHaveBeenCalledWith('user_id', TEST_USER_ID)
  })

  it('should return true when userId is missing', async () => {
    const result1 = await clearMatchStateFromSupabase(null)
    const result2 = await clearMatchStateFromSupabase(undefined)
    const result3 = await clearMatchStateFromSupabase('')

    expect(result1).toBe(true)
    expect(result2).toBe(true)
    expect(result3).toBe(true)
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should return false and log error on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = { message: 'Database error', code: '500' }

    mockSupabase.from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: mockError })
      })
    })

    const result = await clearMatchStateFromSupabase(TEST_USER_ID)

    expect(result).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to clear match state from Supabase:',
      mockError
    )

    consoleError.mockRestore()
  })

  it('should return false and log error on exception', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = new Error('Network error')

    mockSupabase.from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockRejectedValue(mockError)
      })
    })

    const result = await clearMatchStateFromSupabase(TEST_USER_ID)

    expect(result).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(
      'Error clearing match state from Supabase:',
      mockError
    )

    consoleError.mockRestore()
  })
})

describe('hasMatchStateInSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return true when match state exists', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { user_id: TEST_USER_ID },
            error: null
          })
        })
      })
    })

    const result = await hasMatchStateInSupabase(TEST_USER_ID)

    expect(result).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('user_current_match')
  })

  it('should return false when userId is missing', async () => {
    const result1 = await hasMatchStateInSupabase(null)
    const result2 = await hasMatchStateInSupabase(undefined)
    const result3 = await hasMatchStateInSupabase('')

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(false)
    expect(mockSupabase.from).not.toHaveBeenCalled()
  })

  it('should return false on PGRST116 error (no row found)', async () => {
    const mockError = { code: 'PGRST116', message: 'No rows returned' }

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      })
    })

    const result = await hasMatchStateInSupabase(TEST_USER_ID)

    expect(result).toBe(false)
  })

  it('should return false and log error on other Supabase errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = { code: '500', message: 'Database error' }

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: mockError
          })
        })
      })
    })

    const result = await hasMatchStateInSupabase(TEST_USER_ID)

    expect(result).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(
      'Error checking for saved match state:',
      mockError
    )

    consoleError.mockRestore()
  })

  it('should return false and log error on exception', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const mockError = new Error('Network error')

    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(mockError)
        })
      })
    })

    const result = await hasMatchStateInSupabase(TEST_USER_ID)

    expect(result).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(
      'Error checking for saved match state:',
      mockError
    )

    consoleError.mockRestore()
  })

  it('should return false when data is null', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: null
          })
        })
      })
    })

    const result = await hasMatchStateInSupabase(TEST_USER_ID)
    expect(result).toBe(false)
  })
})

describe('isValidMatchState (via loadMatchStateFromSupabase)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupLoadTest = (matchState) => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { match_data: matchState },
            error: null
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })
  }

  it('should accept valid match state', async () => {
    const validState = createValidMatchState()
    setupLoadTest(validState)

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toEqual(validState)
  })

  it('should return null for null match_data without validation', async () => {
    // When match_data is null, it returns early without calling isValidMatchState
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { match_data: null },
            error: null
          })
        })
      })
    })

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
  })

  it('should reject non-object state', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setupLoadTest('invalid string')

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('should reject state with missing players array', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const invalidState = {
      currentHole: 1,
      phase: 'scoring',
      holeResults: [],
      maxHoleReached: 1
    }
    setupLoadTest(invalidState)

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('should reject state with invalid phase', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const invalidState = {
      ...createValidMatchState(),
      phase: 'invalid-phase'
    }
    setupLoadTest(invalidState)

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('should reject state with currentHole out of range', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const invalidState = {
      ...createValidMatchState(),
      currentHole: 19
    }
    setupLoadTest(invalidState)

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('should reject state with maxHoleReached < currentHole', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const invalidState = {
      ...createValidMatchState(),
      currentHole: 5,
      maxHoleReached: 3
    }
    setupLoadTest(invalidState)

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('should reject scoring phase with wrong number of players', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const invalidState = {
      ...createValidMatchState(),
      players: [
        { name: 'Alice', points: 0, wins: 0, draws: 0, losses: 0 },
        { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 0 }
      ]
    }
    setupLoadTest(invalidState)

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('should reject state with invalid player structure', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const invalidState = {
      ...createValidMatchState(),
      players: [
        { name: 'Alice', points: 0, wins: 0, draws: 0, losses: 0 },
        { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 0 },
        { name: 'Charlie', points: 0, wins: 0, draws: 0, losses: 0 },
        { name: 'Diana' } // Missing required properties
      ]
    }
    setupLoadTest(invalidState)

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toBeNull()
    expect(consoleWarn).toHaveBeenCalled()
    consoleWarn.mockRestore()
  })

  it('should accept setup phase with empty players array', async () => {
    const validSetupState = {
      players: [],
      currentHole: 1,
      phase: 'setup',
      holeResults: [],
      maxHoleReached: 1
    }
    setupLoadTest(validSetupState)

    const result = await loadMatchStateFromSupabase(TEST_USER_ID)
    expect(result).toEqual(validSetupState)
  })
})
