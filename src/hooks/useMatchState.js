import { useMatchCore } from './useMatchCore.js';
import { useMatchPersistence } from './useMatchPersistence.js';
import { deactivateShareCodes } from '../utils/supabase-share-persistence.js';

/**
 * Custom hook for managing golf match state with persistence
 * Composes useMatchCore (state management) and useMatchPersistence (save/load)
 * @param {Object} user - The authenticated user object (with id property)
 * @returns {Object} Match state and functions to manipulate it
 */
export function useMatchState(user) {
  // Core match state management
  const {
    matchState,
    setMatchState,
    startMatch,
    getCurrentMatchups,
    recordHoleResult,
    calculatePlayerStats,
    getPlayerThru,
    resetMatchState,
    navigateToHole,
    updateHoleResult,
    recalculateStatsFromHole,
    getMatchupsForHole
  } = useMatchCore();

  // Persistence layer
  const {
    loading,
    error,
    clearPersistedState,
    canResumeMatch
  } = useMatchPersistence(matchState, user, setMatchState);

  /**
   * Reset the match to initial state and clear saved data
   */
  const resetMatch = async () => {
    try {
      // Deactivate share codes for this user
      if (user?.id) {
        await deactivateShareCodes(user.id);
      }

      // Clear persisted data
      await clearPersistedState();

      // Then reset local state
      resetMatchState();
    } catch (err) {
      // Error already logged in clearPersistedState
      throw err;
    }
  };

  return {
    matchState,
    loading,
    error,
    startMatch,
    getCurrentMatchups,
    recordHoleResult,
    calculatePlayerStats,
    getPlayerThru,
    resetMatch,
    canResumeMatch,
    navigateToHole,
    updateHoleResult,
    recalculateStatsFromHole,
    getMatchupsForHole
  };
}
