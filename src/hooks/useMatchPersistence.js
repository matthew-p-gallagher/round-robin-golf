import { useState, useEffect, useRef } from 'react';
import {
  saveMatchStateToSupabase,
  loadMatchStateFromSupabase,
  clearMatchStateFromSupabase,
  hasMatchStateInSupabase
} from '../utils/supabase-match-persistence.js';
// Keep localStorage as fallback for offline support
import { saveMatchState, loadMatchState, clearMatchState, hasSavedMatchState } from '../utils/match-persistence.js';

/**
 * Custom hook for managing match state persistence to Supabase and localStorage
 * Handles loading, saving, and clearing match data with fallback support
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

  // Load user's match state when they log in, clear when they log out
  useEffect(() => {
    async function loadUserMatchState() {
      if (!user?.id) {
        // User logged out - clear match state and load from localStorage as fallback
        setMatchState({
          players: [],
          currentHole: 1,
          phase: 'setup',
          holeResults: [],
          maxHoleReached: 1
        });

        const savedState = loadMatchState();
        if (savedState) {
          setMatchState(savedState);
        }
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
        setError('Failed to load match data');
        // Fallback to localStorage if Supabase fails
        const localState = loadMatchState();
        if (localState) {
          setMatchState(localState);
        }
      } finally {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    }

    loadUserMatchState();
  }, [user?.id, setMatchState]);

  // Save state to Supabase/localStorage whenever it changes (debounced)
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

      // Only save to localStorage if user is authenticated (logged in)
      // When logged out, don't save to localStorage to avoid race conditions
      if (user?.id) {
        // Save to localStorage as fallback for offline support
        saveMatchState(matchState);

        // Also save to Supabase
        try {
          await saveMatchStateToSupabase(matchState, user.id);
        } catch (err) {
          console.error('Error saving to Supabase:', err);
          setError('Failed to save match data to server');
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
   * Clear persisted match data from both Supabase and localStorage
   */
  const clearPersistedState = async () => {
    setLoading(true);
    setError(null);

    try {
      // Clear from localStorage
      clearMatchState();

      // Clear from Supabase if user is authenticated
      if (user?.id) {
        await clearMatchStateFromSupabase(user.id);
      }
    } catch (err) {
      console.error('Error clearing persisted state:', err);
      setError('Failed to clear match data');
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
        // Fallback to localStorage check
      }
    }

    // Fallback for non-authenticated users or if Supabase fails
    return hasSavedMatchState();
  };

  return {
    loading,
    error,
    clearPersistedState,
    canResumeMatch
  };
}
