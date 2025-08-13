/**
 * @typedef {Object} Player
 * @property {string} name - Player's name
 * @property {number} points - Total points earned
 * @property {number} wins - Number of wins
 * @property {number} draws - Number of draws
 * @property {number} losses - Number of losses
 */

/**
 * @typedef {Object} Matchup
 * @property {Player} player1 - First player in the matchup
 * @property {Player} player2 - Second player in the matchup
 * @property {'player1'|'player2'|'draw'|null} result - Result of the matchup
 */

/**
 * @typedef {Object} HoleResult
 * @property {number} holeNumber - The hole number (1-18)
 * @property {[Matchup, Matchup]} matchups - Array of exactly 2 matchups for this hole
 */

/**
 * @typedef {Object} MatchState
 * @property {[Player, Player, Player, Player]} players - Array of exactly 4 players
 * @property {number} currentHole - Current hole number (1-18)
 * @property {'setup'|'scoring'|'complete'} phase - Current phase of the match
 * @property {HoleResult[]} holeResults - Results for completed holes
 * @property {number} maxHoleReached - Furthest hole the user has progressed to (1-18)
 */

export {};