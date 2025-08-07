/**
 * Matchup rotation utility for 4-player golf matches
 */

/**
 * Gets the matchup pattern for a given hole number
 * @param {number} holeNumber - Hole number (1-18)
 * @returns {[[number, number], [number, number]]} Array of two matchups, each as [playerIndex1, playerIndex2]
 */
export function getMatchupPattern(holeNumber) {
  if (holeNumber < 1 || holeNumber > 18) {
    throw new Error('Hole number must be between 1 and 18');
  }

  // Calculate which pattern to use (0, 1, or 2)
  const patternIndex = (holeNumber - 1) % 3;
  
  const patterns = [
    [[0, 1], [2, 3]], // Pattern 1: P1 vs P2, P3 vs P4
    [[0, 2], [1, 3]], // Pattern 2: P1 vs P3, P2 vs P4
    [[0, 3], [1, 2]]  // Pattern 3: P1 vs P4, P2 vs P3
  ];
  
  return patterns[patternIndex];
}

/**
 * Creates matchup objects for a specific hole
 * @param {Player[]} players - Array of 4 players
 * @param {number} holeNumber - Hole number (1-18)
 * @returns {[Matchup, Matchup]} Array of two matchup objects
 */
export function createMatchupsForHole(players, holeNumber) {
  if (!Array.isArray(players) || players.length !== 4) {
    throw new Error('Must provide exactly 4 players');
  }

  const pattern = getMatchupPattern(holeNumber);
  
  return [
    {
      player1: players[pattern[0][0]],
      player2: players[pattern[0][1]],
      result: null
    },
    {
      player1: players[pattern[1][0]],
      player2: players[pattern[1][1]], 
      result: null
    }
  ];
}

/**
 * Gets all matchup patterns for all 18 holes
 * @returns {Array<[[number, number], [number, number]]>} Array of patterns for holes 1-18
 */
export function getAllMatchupPatterns() {
  const patterns = [];
  for (let hole = 1; hole <= 18; hole++) {
    patterns.push(getMatchupPattern(hole));
  }
  return patterns;
}