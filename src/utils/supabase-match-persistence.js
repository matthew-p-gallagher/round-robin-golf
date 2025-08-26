/**
 * Utility functions for persisting match state to Supabase database
 */

import { supabase } from '../lib/supabase.js'

/**
 * Save match state to Supabase for the current user
 * @param {import('../types/index.js').MatchState} matchState - The match state to save
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<boolean>} Success status
 */
export async function saveMatchStateToSupabase(matchState, userId) {
  if (!userId) {
    throw new Error('User ID is required to save match state')
  }

  try {
    const { error } = await supabase
      .from('user_current_match')
      .upsert({
        user_id: userId,
        match_data: matchState,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to save match state to Supabase:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error saving match state to Supabase:', error)
    return false
  }
}

/**
 * Load match state from Supabase for the current user
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<import('../types/index.js').MatchState|null>} The saved match state or null if none exists
 */
export async function loadMatchStateFromSupabase(userId) {
  if (!userId) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('user_current_match')
      .select('match_data')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found - this is normal for new users
        return null
      }
      console.error('Failed to load match state from Supabase:', error)
      return null
    }

    if (!data?.match_data) {
      return null
    }

    // Validate the loaded state has the expected structure
    if (!isValidMatchState(data.match_data)) {
      console.warn('Invalid match state found in database, clearing it')
      await clearMatchStateFromSupabase(userId)
      return null
    }

    return data.match_data
  } catch (error) {
    console.error('Error loading match state from Supabase:', error)
    return null
  }
}

/**
 * Clear match state from Supabase for the current user
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<boolean>} Success status
 */
export async function clearMatchStateFromSupabase(userId) {
  if (!userId) {
    return true // Nothing to clear if no user
  }

  try {
    const { error } = await supabase
      .from('user_current_match')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Failed to clear match state from Supabase:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error clearing match state from Supabase:', error)
    return false
  }
}

/**
 * Check if there is a saved match state for the current user
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<boolean>} True if there is a saved match state
 */
export async function hasMatchStateInSupabase(userId) {
  if (!userId) {
    return false
  }

  try {
    const { data, error } = await supabase
      .from('user_current_match')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found
        return false
      }
      console.error('Error checking for saved match state:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking for saved match state:', error)
    return false
  }
}

/**
 * Validate that a loaded match state has the expected structure
 * @param {any} state - The state to validate
 * @returns {boolean} True if the state is valid
 */
function isValidMatchState(state) {
  if (!state || typeof state !== 'object') {
    return false
  }
  
  // Check required properties exist
  if (!Array.isArray(state.players) || 
      typeof state.currentHole !== 'number' || 
      typeof state.phase !== 'string' || 
      !Array.isArray(state.holeResults) ||
      typeof state.maxHoleReached !== 'number') {
    return false
  }
  
  // Check phase is valid
  if (!['setup', 'scoring', 'complete'].includes(state.phase)) {
    return false
  }
  
  // Check currentHole is in valid range
  if (state.currentHole < 1 || state.currentHole > 18) {
    return false
  }
  
  // Check maxHoleReached is in valid range and >= currentHole
  if (state.maxHoleReached < 1 || state.maxHoleReached > 18 || state.maxHoleReached < state.currentHole) {
    return false
  }
  
  // If in scoring or complete phase, should have 4 players
  if ((state.phase === 'scoring' || state.phase === 'complete') && state.players.length !== 4) {
    return false
  }
  
  // Validate player structure
  for (const player of state.players) {
    if (!player || typeof player !== 'object' ||
        typeof player.name !== 'string' ||
        typeof player.points !== 'number' ||
        typeof player.wins !== 'number' ||
        typeof player.draws !== 'number' ||
        typeof player.losses !== 'number') {
      return false
    }
  }
  
  return true
}