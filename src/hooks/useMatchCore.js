import { useReducer, useCallback } from 'react';
import { createMatchupsForHole } from '../utils/matchup-rotation.js';
import { sortPlayersByRanking, calculateHolesCompleted, processHoleResult } from '../utils/player-stats.js';
import { matchReducer, INITIAL_STATE, ACTIONS } from '../reducers/matchReducer.js';

/**
 * Custom hook for core match state management (no persistence)
 * Handles all match state operations and queries using reducer pattern
 * @returns {Object} Match state and functions to manipulate it
 */
export function useMatchCore() {
  const [matchState, dispatch] = useReducer(matchReducer, INITIAL_STATE);

  /**
   * Set match state directly (used by persistence layer to load saved state)
   * @param {Object} newState - New match state to load
   */
  const setMatchState = useCallback((newState) => {
    dispatch({ type: ACTIONS.LOAD_MATCH, payload: { matchState: newState } });
  }, []);

  /**
   * Initialize a new match with 4 players
   * @param {string[]} playerNames - Array of 4 player names
   */
  const startMatch = async (playerNames) => {
    if (!Array.isArray(playerNames) || playerNames.length !== 4) {
      throw new Error('Exactly 4 player names are required');
    }

    // Validate names are unique and not empty
    const uniqueNames = new Set(playerNames.map(name => name.trim()));
    if (uniqueNames.size !== 4) {
      throw new Error('All player names must be unique');
    }

    if (playerNames.some(name => !name.trim())) {
      throw new Error('All player names must be non-empty');
    }

    dispatch({ type: ACTIONS.START_MATCH, payload: { playerNames } });
  };

  /**
   * Get the current matchups for the current hole
   * @returns {[Matchup, Matchup]} Array of 2 matchups for current hole
   */
  const getCurrentMatchups = () => {
    if (matchState.phase !== 'scoring' || matchState.players.length !== 4) {
      return [null, null];
    }

    const matchups = createMatchupsForHole(matchState.players, matchState.currentHole);
    return matchups;
  };

  /**
   * Record the results for the current hole and advance to next hole
   * @param {Array} matchupResults - Array of 2 matchup results
   */
  const recordHoleResult = async (matchupResults) => {
    if (!Array.isArray(matchupResults) || matchupResults.length !== 2) {
      throw new Error('Exactly 2 matchup results are required');
    }

    // Validate that both matchups have results
    if (matchupResults.some(matchup => !matchup.result)) {
      throw new Error('Both matchups must have results before proceeding');
    }

    dispatch({ type: ACTIONS.RECORD_HOLE_RESULT, payload: { matchupResults } });
  };

  /**
   * Calculate player stats with ranking
   * @returns {Player[]} Array of players sorted by points (highest first), then alphabetically
   */
  const calculatePlayerStats = () => {
    return sortPlayersByRanking(matchState.players);
  };

  /**
   * Get the number of holes completed for a specific player
   * @param {string} playerName - Name of the player
   * @returns {number} Number of holes completed
   */
  const getPlayerThru = (playerName) => {
    const player = matchState.players.find(p => p.name === playerName);
    if (!player) {
      throw new Error(`Player ${playerName} not found`);
    }
    return calculateHolesCompleted(player);
  };

  /**
   * Reset the match state to initial state (does not clear persistence)
   */
  const resetMatchState = () => {
    dispatch({ type: ACTIONS.RESET_MATCH });
  };

  /**
   * Navigate to a specific hole
   * @param {number} holeNumber - Hole number to navigate to (1-18)
   */
  const navigateToHole = (holeNumber) => {
    if (holeNumber < 1 || holeNumber > 18) {
      throw new Error('Hole number must be between 1 and 18');
    }

    if (holeNumber > matchState.maxHoleReached) {
      throw new Error(`Cannot navigate beyond hole ${matchState.maxHoleReached}`);
    }

    dispatch({ type: ACTIONS.NAVIGATE_TO_HOLE, payload: { holeNumber } });
  };

  /**
   * Update the result for a specific hole
   * @param {number} holeNumber - Hole number to update (1-18)
   * @param {Array} matchupResults - Array of 2 matchup results
   */
  const updateHoleResult = (holeNumber, matchupResults) => {
    if (holeNumber < 1 || holeNumber > 18) {
      throw new Error('Hole number must be between 1 and 18');
    }

    if (!Array.isArray(matchupResults) || matchupResults.length !== 2) {
      throw new Error('Exactly 2 matchup results are required');
    }

    // Validate that both matchups have results
    if (matchupResults.some(matchup => !matchup.result)) {
      throw new Error('Both matchups must have results');
    }

    // Recalculate all player stats from scratch
    const recalculatedPlayers = recalculateStatsFromHole(1, matchState.holeResults, matchupResults, holeNumber);

    dispatch({
      type: ACTIONS.UPDATE_HOLE_RESULT,
      payload: { holeNumber, matchupResults, recalculatedPlayers }
    });
  };

  /**
   * Recalculate player statistics from a specific hole forward
   * @param {number} startingHole - Hole to start recalculation from
   * @param {HoleResult[]} holeResults - Hole results array to use for calculation
   * @param {Array} newMatchupResults - New matchup results being added (optional)
   * @param {number} updatingHoleNumber - Hole number being updated (optional)
   * @returns {Player[]} Updated players array with recalculated stats
   */
  const recalculateStatsFromHole = (startingHole, holeResults, newMatchupResults = null, updatingHoleNumber = null) => {
    // Reset all players to initial state
    let updatedPlayers = matchState.players.map(player => ({
      ...player,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0
    }));

    // Build the complete hole results array including the update
    let allHoleResults = [...holeResults];
    if (newMatchupResults && updatingHoleNumber) {
      const existingResultIndex = allHoleResults.findIndex(hr => hr.holeNumber === updatingHoleNumber);
      const newHoleResult = {
        holeNumber: updatingHoleNumber,
        matchups: newMatchupResults
      };

      if (existingResultIndex >= 0) {
        allHoleResults[existingResultIndex] = newHoleResult;
      } else {
        allHoleResults.push(newHoleResult);
        allHoleResults.sort((a, b) => a.holeNumber - b.holeNumber);
      }
    }

    // Process all hole results from the beginning
    for (const holeResult of allHoleResults) {
      if (holeResult.holeNumber >= startingHole) {
        updatedPlayers = processHoleResult(updatedPlayers, holeResult.matchups);
      }
    }

    return updatedPlayers;
  };

  /**
   * Set the share code for the current match
   * @param {string} shareCode - The share code to set
   */
  const setShareCode = useCallback((shareCode) => {
    dispatch({ type: ACTIONS.SET_SHARE_CODE, payload: { shareCode } });
  }, []);

  /**
   * Get the matchups for a specific hole
   * @param {number} holeNumber - Hole number (1-18)
   * @returns {[Matchup, Matchup]} Array of 2 matchups for the specified hole
   */
  const getMatchupsForHole = (holeNumber) => {
    if (matchState.phase !== 'scoring' || matchState.players.length !== 4) {
      return [null, null];
    }

    if (holeNumber < 1 || holeNumber > 18) {
      throw new Error('Hole number must be between 1 and 18');
    }

    const matchups = createMatchupsForHole(matchState.players, holeNumber);

    // Check if we have existing results for this hole
    const existingResult = matchState.holeResults.find(hr => hr.holeNumber === holeNumber);
    if (existingResult) {
      // Return matchups with existing results
      return existingResult.matchups;
    }

    return matchups;
  };

  return {
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
    getMatchupsForHole,
    setShareCode
  };
}
