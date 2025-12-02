import { useState, useEffect, useRef } from 'react';
import {
  saveMatchStateToSupabase,
  loadMatchStateFromSupabase,
  clearMatchStateFromSupabase,
  hasMatchStateInSupabase
} from '../utils/supabase-match-persistence.js';

/**
 * Custom hook for managing match state persistence to Supabase
 * Handles loading, saving, and clearing match data
 * @param {Object} matchState - The current match state to persist
 * @param {Object} user - The authenticated user object (with id property)
 * @param {Function} setMatchState - Callback to update match state with loaded data
 * @returns {Object} Persistence state and functions
 */
export function useMatchPersistence(matchState, user, setMatchState) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for managing save behavior
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef(null);

  // Load user's match state when they log in, reset to default when they log out
  useEffect(() => {
    async function loadUserMatchState() {
      if (!user?.id) {
        // User logged out - reset to default empty state
        setMatchState({
          players: [],
          currentHole: 1,
          phase: 'setup',
          holeResults: [],
          maxHoleReached: 1
        });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const savedState = await loadMatchStateFromSupabase(user.id);
        if (savedState) {
          setMatchState(savedState);
        }
      } catch (err) {
        console.error('Error loading match state:', err);
        setError('Connection lost.');
      } finally {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    }

    loadUserMatchState();
  }, [user?.id, setMatchState]);

  // Save state to Supabase whenever it changes (debounced)
  useEffect(() => {
    // Skip saves during initial load to prevent race conditions
    if (isInitialLoadRef.current) {
      return;
    }

    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves with 800ms delay
    saveTimeoutRef.current = setTimeout(async () => {
      // Only save if we're not in the initial setup phase with no players
      if (matchState.phase === 'setup' && matchState.players.length === 0) {
        return;
      }

      // Only save if user is authenticated
      if (user?.id) {
        try {
          await saveMatchStateToSupabase(matchState, user.id);
        } catch (err) {
          console.error('Error saving to Supabase:', err);
          setError('Connection lost.');
        }
      }
    }, 800);

    // Cleanup timeout on unmount or before next save
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [matchState, user?.id]);

  /**
   * Clear persisted match data from Supabase
   */
  const clearPersistedState = async () => {
    setLoading(true);
    setError(null);

    try {
      // Clear from Supabase if user is authenticated
      if (user?.id) {
        await clearMatchStateFromSupabase(user.id);
      }
    } catch (err) {
      console.error('Error clearing persisted state:', err);
      setError('Connection lost.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if there is a saved match that can be resumed
   * @returns {Promise<boolean>} True if there is a saved match
   */
  const canResumeMatch = async () => {
    if (user?.id) {
      try {
        return await hasMatchStateInSupabase(user.id);
      } catch (err) {
        console.error('Error checking for saved match:', err);
        return false;
      }
    }

    return false;
  };

  return {
    loading,
    error,
    clearPersistedState,
    canResumeMatch
  };
}
