/**
 * Utility functions for managing match share codes in Supabase
 * Handles creating, retrieving, and deactivating share codes for spectator access
 */

import { supabase } from '../lib/supabase.js'
import { generateShareCode, validateShareCodeFormat } from './share-code.js'

/**
 * Create a new share code for a user's match
 * Deactivates any existing codes first, then creates a new one
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<string|null>} The generated share code or null on failure
 */
export async function createShareCode(userId) {
  if (!userId) {
    throw new Error('User ID is required to create share code')
  }

  try {
    // First deactivate any existing codes for this user
    await deactivateShareCodes(userId)

    // Generate a new code and attempt to insert
    // Loop in case of collision (extremely unlikely with 10000 combinations)
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      const code = generateShareCode()

      const { error } = await supabase
        .from('match_shares')
        .insert({
          user_id: userId,
          share_code: code,
          is_active: true
        })

      if (!error) {
        return code
      }

      // Check if error is due to unique constraint violation
      if (error.code === '23505') {
        // Duplicate code, try again
        attempts++
        continue
      }

      // Other error
      console.error('Failed to create share code:', error)
      return null
    }

    console.error('Failed to generate unique share code after max attempts')
    return null
  } catch (error) {
    console.error('Error creating share code:', error)
    return null
  }
}

/**
 * Get the active share code for a user
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<string|null>} The active share code or null if none exists
 */
export async function getShareCode(userId) {
  if (!userId) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('match_shares')
      .select('share_code')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No active code found
        return null
      }
      console.error('Failed to get share code:', error)
      return null
    }

    return data?.share_code || null
  } catch (error) {
    console.error('Error getting share code:', error)
    return null
  }
}

/**
 * Deactivate all share codes for a user
 * Called when resetting a match or creating a new code
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<boolean>} Success status
 */
export async function deactivateShareCodes(userId) {
  if (!userId) {
    return true // Nothing to deactivate if no user
  }

  try {
    const { error } = await supabase
      .from('match_shares')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Failed to deactivate share codes:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deactivating share codes:', error)
    return false
  }
}

/**
 * Check if a share code is valid and active
 * @param {string} code - The share code to validate
 * @returns {Promise<{valid: boolean, userId: string|null}>} Validation result with owner's user ID
 */
export async function validateShareCode(code) {
  if (!validateShareCodeFormat(code)) {
    return { valid: false, userId: null }
  }

  try {
    const { data, error } = await supabase
      .from('match_shares')
      .select('user_id')
      .eq('share_code', code)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Code not found or inactive
        return { valid: false, userId: null }
      }
      console.error('Failed to validate share code:', error)
      return { valid: false, userId: null }
    }

    return { valid: true, userId: data.user_id }
  } catch (error) {
    console.error('Error validating share code:', error)
    return { valid: false, userId: null }
  }
}

/**
 * Get match data using a share code (for spectators)
 * This works for unauthenticated users due to RLS policies
 * @param {string} code - The share code
 * @returns {Promise<{matchData: object|null, error: string|null}>} Match data or error
 */
export async function getMatchByShareCode(code) {
  if (!validateShareCodeFormat(code)) {
    return { matchData: null, error: 'Invalid code format' }
  }

  try {
    // First, validate the code and get the user ID
    const { valid, userId } = await validateShareCode(code)

    if (!valid || !userId) {
      return { matchData: null, error: 'Invalid or expired code' }
    }

    // Fetch the match data for that user
    // This works because our RLS policy allows reading match data
    // when a valid share code exists for that user
    const { data, error } = await supabase
      .from('user_current_match')
      .select('match_data')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { matchData: null, error: 'No match found' }
      }
      console.error('Failed to get match by share code:', error)
      return { matchData: null, error: 'Failed to load match' }
    }

    return { matchData: data?.match_data || null, error: null }
  } catch (error) {
    console.error('Error getting match by share code:', error)
    return { matchData: null, error: 'Failed to load match' }
  }
}
