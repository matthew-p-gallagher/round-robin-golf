/**
 * Tests for Supabase share persistence utility functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createShareCode,
  getShareCode,
  deactivateShareCodes,
  validateShareCode,
  getMatchByShareCode
} from './supabase-share-persistence.js'

// Mock the supabase module
vi.mock('../lib/supabase.js')

// Mock share-code module
vi.mock('./share-code.js', () => ({
  generateShareCode: vi.fn(() => '1234'),
  validateShareCodeFormat: vi.fn((code) => /^\d{4}$/.test(code))
}))

// Import the mocked modules
import { supabase as mockSupabase } from '../lib/supabase.js'
import { generateShareCode } from './share-code.js'

// Test user ID
const TEST_USER_ID = 'test-user-123'

describe('createShareCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new share code successfully', async () => {
    // Mock deactivate (update) to succeed
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })

    // Mock insert to succeed
    const mockInsert = vi.fn().mockResolvedValue({ error: null })

    mockSupabase.from = vi.fn().mockImplementation((table) => {
      if (table === 'match_shares') {
        return {
          update: mockUpdate,
          insert: mockInsert
        }
      }
    })

    const result = await createShareCode(TEST_USER_ID)

    expect(result).toBe('1234')
    expect(generateShareCode).toHaveBeenCalled()
  })

  it('should throw error when userId is missing', async () => {
    await expect(createShareCode(null)).rejects.toThrow('User ID is required')
    await expect(createShareCode(undefined)).rejects.toThrow('User ID is required')
  })

  it('should retry on duplicate code collision', async () => {
    generateShareCode
      .mockReturnValueOnce('1111')
      .mockReturnValueOnce('2222')

    // First insert fails with unique constraint, second succeeds
    const mockInsert = vi.fn()
      .mockResolvedValueOnce({ error: { code: '23505' } })
      .mockResolvedValueOnce({ error: null })

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      update: mockUpdate,
      insert: mockInsert
    })

    const result = await createShareCode(TEST_USER_ID)

    expect(result).toBe('2222')
    expect(mockInsert).toHaveBeenCalledTimes(2)
  })

  it('should return null on non-collision error', async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    })

    const mockInsert = vi.fn().mockResolvedValue({
      error: { code: 'OTHER_ERROR', message: 'Database error' }
    })

    mockSupabase.from = vi.fn().mockReturnValue({
      update: mockUpdate,
      insert: mockInsert
    })

    const result = await createShareCode(TEST_USER_ID)

    expect(result).toBe(null)
  })
})

describe('getShareCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return existing share code', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { share_code: '5678' },
              error: null
            })
          })
        })
      })
    })

    const result = await getShareCode(TEST_USER_ID)

    expect(result).toBe('5678')
  })

  it('should return null when no code exists', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })
    })

    const result = await getShareCode(TEST_USER_ID)

    expect(result).toBe(null)
  })

  it('should return null when userId is missing', async () => {
    const result = await getShareCode(null)
    expect(result).toBe(null)
  })
})

describe('deactivateShareCodes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should deactivate all share codes for user', async () => {
    const mockEq2 = vi.fn().mockResolvedValue({ error: null })
    const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq1 })

    mockSupabase.from = vi.fn().mockReturnValue({
      update: mockUpdate
    })

    const result = await deactivateShareCodes(TEST_USER_ID)

    expect(result).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('match_shares')
    expect(mockUpdate).toHaveBeenCalledWith({ is_active: false })
  })

  it('should return true when userId is missing (nothing to deactivate)', async () => {
    const result = await deactivateShareCodes(null)
    expect(result).toBe(true)
  })

  it('should return false on error', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: { message: 'DB error' } })
        })
      })
    })

    const result = await deactivateShareCodes(TEST_USER_ID)

    expect(result).toBe(false)
  })
})

describe('validateShareCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return valid=true and userId for valid code', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: TEST_USER_ID },
              error: null
            })
          })
        })
      })
    })

    const result = await validateShareCode('1234')

    expect(result).toEqual({ valid: true, userId: TEST_USER_ID })
  })

  it('should return valid=false for non-existent code', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })
    })

    const result = await validateShareCode('9999')

    expect(result).toEqual({ valid: false, userId: null })
  })

  it('should return valid=false for invalid format', async () => {
    const result = await validateShareCode('abc')

    expect(result).toEqual({ valid: false, userId: null })
  })
})

describe('getMatchByShareCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return match data for valid code', async () => {
    const mockMatchData = {
      players: [{ name: 'Alice', points: 3 }],
      currentHole: 5,
      phase: 'scoring'
    }

    // Mock validateShareCode lookup
    const mockShareSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { user_id: TEST_USER_ID },
            error: null
          })
        })
      })
    })

    // Mock match data lookup
    const mockMatchSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { match_data: mockMatchData },
          error: null
        })
      })
    })

    mockSupabase.from = vi.fn().mockImplementation((table) => {
      if (table === 'match_shares') {
        return { select: mockShareSelect }
      }
      if (table === 'user_current_match') {
        return { select: mockMatchSelect }
      }
    })

    const result = await getMatchByShareCode('1234')

    expect(result).toEqual({ matchData: mockMatchData, error: null })
  })

  it('should return error for invalid code', async () => {
    const result = await getMatchByShareCode('abc')

    expect(result).toEqual({ matchData: null, error: 'Invalid code format' })
  })

  it('should return error when code not found', async () => {
    mockSupabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })
    })

    const result = await getMatchByShareCode('9999')

    expect(result).toEqual({ matchData: null, error: 'Invalid or expired code' })
  })
})
