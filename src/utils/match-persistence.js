/**
 * Utility functions for persisting match state to localStorage
 */

const MATCH_STATE_KEY = 'golf-match-state';

/**
 * Save match state to localStorage
 * @param {import('../types/index.js').MatchState} matchState - The match state to save
 */
export function saveMatchState(matchState) {
  try {
    const serializedState = JSON.stringify(matchState);
    localStorage.setItem(MATCH_STATE_KEY, serializedState);
  } catch (error) {
    console.warn('Failed to save match state to localStorage:', error);
  }
}

/**
 * Load match state from localStorage
 * @returns {import('../types/index.js').MatchState|null} The saved match state or null if none exists
 */
export function loadMatchState() {
  try {
    const serializedState = localStorage.getItem(MATCH_STATE_KEY);
    if (serializedState === null) {
      return null;
    }
    
    const matchState = JSON.parse(serializedState);
    
    // Validate the loaded state has the expected structure
    if (!isValidMatchState(matchState)) {
      console.warn('Invalid match state found in localStorage, ignoring');
      clearMatchState();
      return null;
    }
    
    return matchState;
  } catch (error) {
    console.warn('Failed to load match state from localStorage:', error);
    clearMatchState();
    return null;
  }
}

/**
 * Clear match state from localStorage
 */
export function clearMatchState() {
  try {
    localStorage.removeItem(MATCH_STATE_KEY);
  } catch (error) {
    console.warn('Failed to clear match state from localStorage:', error);
  }
}

/**
 * Check if there is a saved match state
 * @returns {boolean} True if there is a saved match state
 */
export function hasSavedMatchState() {
  try {
    return localStorage.getItem(MATCH_STATE_KEY) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Validate that a loaded match state has the expected structure
 * @param {any} state - The state to validate
 * @returns {boolean} True if the state is valid
 */
function isValidMatchState(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }
  
  // Check required properties exist
  if (!Array.isArray(state.players) || 
      typeof state.currentHole !== 'number' || 
      typeof state.phase !== 'string' || 
      !Array.isArray(state.holeResults)) {
    return false;
  }
  
  // Check phase is valid
  if (!['setup', 'scoring', 'complete'].includes(state.phase)) {
    return false;
  }
  
  // Check currentHole is in valid range
  if (state.currentHole < 1 || state.currentHole > 18) {
    return false;
  }
  
  // If in scoring or complete phase, should have 4 players
  if ((state.phase === 'scoring' || state.phase === 'complete') && state.players.length !== 4) {
    return false;
  }
  
  // Validate player structure
  for (const player of state.players) {
    if (!player || typeof player !== 'object' ||
        typeof player.name !== 'string' ||
        typeof player.points !== 'number' ||
        typeof player.wins !== 'number' ||
        typeof player.draws !== 'number' ||
        typeof player.losses !== 'number') {
      return false;
    }
  }
  
  return true;
}