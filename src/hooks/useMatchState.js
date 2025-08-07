import { useState, useEffect } from 'react';
import { createMatchupsForHole } from '../utils/matchup-rotation.js';
import { createPlayer, processHoleResult, sortPlayersByRanking, calculateHolesCompleted } from '../utils/player-stats.js';
import { saveMatchState, loadMatchState, clearMatchState, hasSavedMatchState } from '../utils/match-persistence.js';

/**
 * Custom hook for managing golf match state with persistence
 * @returns {Object} Match state and functions to manipulate it
 */
export function useMatchState() {
  const [matchState, setMatchState] = useState(() => {
    // Try to load saved state on initialization
    const savedState = loadMatchState();
    return savedState || {
      players: [],
      currentHole: 1,
      phase: 'setup',
      holeResults: []
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Only save if we're not in the initial setup phase with no players
    if (matchState.phase !== 'setup' || matchState.players.length > 0) {
      saveMatchState(matchState);
    }
  }, [matchState]);

  /**
   * Initialize a new match with 4 players
   * @param {string[]} playerNames - Array of 4 player names
   */
  const startMatch = (playerNames) => {
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

    // Create player objects with initial stats
    const players = playerNames.map(name => createPlayer(name));

    setMatchState({
      players,
      currentHole: 1,
      phase: 'scoring',
      holeResults: []
    });
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
  const recordHoleResult = (matchupResults) => {
    if (!Array.isArray(matchupResults) || matchupResults.length !== 2) {
      throw new Error('Exactly 2 matchup results are required');
    }

    // Validate that both matchups have results
    if (matchupResults.some(matchup => !matchup.result)) {
      throw new Error('Both matchups must have results before proceeding');
    }

    // Process hole result using utility function
    const updatedPlayers = processHoleResult(matchState.players, matchupResults);

    // Create hole result record
    const holeResult = {
      holeNumber: matchState.currentHole,
      matchups: matchupResults
    };

    // Determine next phase and hole
    const nextHole = matchState.currentHole + 1;
    const nextPhase = nextHole > 18 ? 'complete' : 'scoring';

    setMatchState(prevState => ({
      ...prevState,
      players: updatedPlayers,
      currentHole: nextPhase === 'complete' ? 18 : nextHole,
      phase: nextPhase,
      holeResults: [...prevState.holeResults, holeResult]
    }));
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
   * Reset the match to initial state and clear saved data
   */
  const resetMatch = () => {
    clearMatchState();
    setMatchState({
      players: [],
      currentHole: 1,
      phase: 'setup',
      holeResults: []
    });
  };

  /**
   * Check if there is a saved match that can be resumed
   * @returns {boolean} True if there is a saved match
   */
  const canResumeMatch = () => {
    return hasSavedMatchState();
  };

  return {
    matchState,
    startMatch,
    getCurrentMatchups,
    recordHoleResult,
    calculatePlayerStats,
    getPlayerThru,
    resetMatch,
    canResumeMatch
  };
}