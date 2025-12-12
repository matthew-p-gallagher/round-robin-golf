import { createPlayer, processHoleResult } from '../utils/player-stats.js';

/**
 * Initial state for match
 */
export const INITIAL_STATE = {
  players: [],
  currentHole: 1,
  phase: 'setup',
  holeResults: [],
  maxHoleReached: 1,
  shareCode: null
};

/**
 * Action types
 */
export const ACTIONS = {
  START_MATCH: 'START_MATCH',
  RECORD_HOLE_RESULT: 'RECORD_HOLE_RESULT',
  NAVIGATE_TO_HOLE: 'NAVIGATE_TO_HOLE',
  UPDATE_HOLE_RESULT: 'UPDATE_HOLE_RESULT',
  RESET_MATCH: 'RESET_MATCH',
  LOAD_MATCH: 'LOAD_MATCH',
  SET_SHARE_CODE: 'SET_SHARE_CODE'
};

/**
 * Match state reducer
 * @param {Object} state - Current match state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state
 */
export function matchReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_MATCH: {
      const { playerNames } = action.payload;
      const players = playerNames.map(name => createPlayer(name));

      return {
        players,
        currentHole: 1,
        phase: 'scoring',
        holeResults: [],
        maxHoleReached: 1,
        shareCode: null
      };
    }

    case ACTIONS.RECORD_HOLE_RESULT: {
      const { matchupResults } = action.payload;

      // Process hole result using utility function
      const updatedPlayers = processHoleResult(state.players, matchupResults);

      // Create hole result record
      const holeResult = {
        holeNumber: state.currentHole,
        matchups: matchupResults
      };

      // Determine next phase and hole
      const nextHole = state.currentHole + 1;
      const nextPhase = nextHole > 18 ? 'complete' : 'scoring';

      return {
        ...state,
        players: updatedPlayers,
        currentHole: nextPhase === 'complete' ? 18 : nextHole,
        phase: nextPhase,
        holeResults: [...state.holeResults, holeResult],
        maxHoleReached: Math.max(state.maxHoleReached, nextPhase === 'complete' ? 18 : nextHole)
      };
    }

    case ACTIONS.NAVIGATE_TO_HOLE: {
      const { holeNumber } = action.payload;

      return {
        ...state,
        currentHole: holeNumber
      };
    }

    case ACTIONS.UPDATE_HOLE_RESULT: {
      const { holeNumber, matchupResults, recalculatedPlayers } = action.payload;

      // Update the hole result in the holeResults array
      const updatedHoleResults = [...state.holeResults];
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

      return {
        ...state,
        holeResults: updatedHoleResults,
        players: recalculatedPlayers
      };
    }

    case ACTIONS.RESET_MATCH: {
      return INITIAL_STATE;
    }

    case ACTIONS.LOAD_MATCH: {
      const { matchState } = action.payload;
      // Ensure shareCode field exists for backward compatibility
      return {
        ...matchState,
        shareCode: matchState.shareCode || null
      };
    }

    case ACTIONS.SET_SHARE_CODE: {
      const { shareCode } = action.payload;
      return {
        ...state,
        shareCode
      };
    }

    default:
      return state;
  }
}
