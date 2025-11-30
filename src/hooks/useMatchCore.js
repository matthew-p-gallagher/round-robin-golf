import { useState } from 'react';
import { createMatchupsForHole } from '../utils/matchup-rotation.js';
import { createPlayer, processHoleResult, sortPlayersByRanking, calculateHolesCompleted } from '../utils/player-stats.js';

/**
 * Default initial match state
 */
const DEFAULT_MATCH_STATE = {
  players: [],
  currentHole: 1,
  phase: 'setup',
  holeResults: [],
  maxHoleReached: 1
};

/**
 * Custom hook for core match state management (no persistence)
 * Handles all match state operations and queries
 * @returns {Object} Match state and functions to manipulate it
 */
export function useMatchCore() {
  const [matchState, setMatchState] = useState(DEFAULT_MATCH_STATE);

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

    // Create player objects with initial stats
    const players = playerNames.map(name => createPlayer(name));

    setMatchState({
      players,
      currentHole: 1,
      phase: 'scoring',
      holeResults: [],
      maxHoleReached: 1
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
  const recordHoleResult = async (matchupResults) => {
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
      holeResults: [...prevState.holeResults, holeResult],
      maxHoleReached: Math.max(prevState.maxHoleReached, nextPhase === 'complete' ? 18 : nextHole)
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
   * Reset the match state to initial state (does not clear persistence)
   */
  const resetMatchState = () => {
    setMatchState(DEFAULT_MATCH_STATE);
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

    setMatchState(prevState => ({
      ...prevState,
      currentHole: holeNumber
    }));
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

    // Update the hole result in the holeResults array
    const updatedHoleResults = [...matchState.holeResults];
    const existingResultIndex = updatedHoleResults.findIndex(hr => hr.holeNumber === holeNumber);

    const newHoleResult = {
      holeNumber,
      matchups: matchupResults
    };

    if (existingResultIndex >= 0) {
      updatedHoleResults[existingResultIndex] = newHoleResult;
    } else {
      updatedHoleResults.push(newHoleResult);
      updatedHoleResults.sort((a, b) => a.holeNumber - b.holeNumber);
    }

    // Recalculate all player stats from scratch
    const recalculatedPlayers = recalculateStatsFromHole(1, updatedHoleResults);

    setMatchState(prevState => ({
      ...prevState,
      holeResults: updatedHoleResults,
      players: recalculatedPlayers
    }));
  };

  /**
   * Recalculate player statistics from a specific hole forward
   * @param {number} startingHole - Hole to start recalculation from
   * @param {HoleResult[]} holeResults - Optional hole results array (uses current state if not provided)
   * @returns {Player[]} Updated players array with recalculated stats
   */
  const recalculateStatsFromHole = (startingHole, holeResults = matchState.holeResults) => {
    // Reset all players to initial state
    let updatedPlayers = matchState.players.map(player => ({
      ...player,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0
    }));

    // Process all hole results from the beginning
    for (const holeResult of holeResults) {
      if (holeResult.holeNumber >= startingHole) {
        updatedPlayers = processHoleResult(updatedPlayers, holeResult.matchups);
      }
    }

    return updatedPlayers;
  };

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
    getMatchupsForHole
  };
}
