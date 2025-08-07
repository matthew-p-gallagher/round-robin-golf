/**
 * Player stats calculation utilities
 */

/**
 * Creates a new player object with initial stats
 * @param {string} name - Player's name
 * @returns {Player} New player object with zero stats
 */
export function createPlayer(name) {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Player name must be a non-empty string');
  }

  return {
    name: name.trim(),
    points: 0,
    wins: 0,
    draws: 0,
    losses: 0
  };
}

/**
 * Updates player stats based on a matchup result
 * @param {Player} player - Player to update
 * @param {'win'|'draw'|'loss'} result - Result for this player
 * @returns {Player} New player object with updated stats
 */
export function updatePlayerStats(player, result) {
  if (!player || typeof player !== 'object') {
    throw new Error('Player must be a valid player object');
  }

  if (!['win', 'draw', 'loss'].includes(result)) {
    throw new Error('Result must be "win", "draw", or "loss"');
  }

  const updatedPlayer = { ...player };

  switch (result) {
    case 'win':
      updatedPlayer.points += 3;
      updatedPlayer.wins += 1;
      break;
    case 'draw':
      updatedPlayer.points += 1;
      updatedPlayer.draws += 1;
      break;
    case 'loss':
      updatedPlayer.losses += 1;
      break;
  }

  return updatedPlayer;
}

/**
 * Calculates how many holes a player has completed based on their total games
 * @param {Player} player - Player object
 * @returns {number} Number of holes completed (each hole = 1 game for each player)
 */
export function calculateHolesCompleted(player) {
  if (!player || typeof player !== 'object') {
    throw new Error('Player must be a valid player object');
  }

  return player.wins + player.draws + player.losses;
}

/**
 * Sorts players by points (descending), then alphabetically by name
 * @param {Player[]} players - Array of players to sort
 * @returns {Player[]} New sorted array of players
 */
export function sortPlayersByRanking(players) {
  if (!Array.isArray(players)) {
    throw new Error('Players must be an array');
  }

  return [...players].sort((a, b) => {
    // First sort by points (highest first)
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    
    // If points are equal, sort alphabetically by name
    return a.name.localeCompare(b.name);
  });
}

/**
 * Processes a completed hole result and updates all player stats
 * @param {Player[]} players - Array of 4 players
 * @param {[Matchup, Matchup]} matchups - Array of 2 completed matchups
 * @returns {Player[]} New array of players with updated stats
 */
export function processHoleResult(players, matchups) {
  if (!Array.isArray(players) || players.length !== 4) {
    throw new Error('Must provide exactly 4 players');
  }

  if (!Array.isArray(matchups) || matchups.length !== 2) {
    throw new Error('Must provide exactly 2 matchups');
  }

  // Validate that both matchups have results
  for (const matchup of matchups) {
    if (!matchup.result) {
      throw new Error('All matchups must have results before processing');
    }
  }

  // Create a map for quick player lookup and updates
  const playerMap = new Map();
  players.forEach(player => {
    playerMap.set(player.name, { ...player });
  });

  // Process each matchup
  for (const matchup of matchups) {
    const player1 = playerMap.get(matchup.player1.name);
    const player2 = playerMap.get(matchup.player2.name);

    if (!player1 || !player2) {
      throw new Error('Matchup contains players not found in players array');
    }

    if (matchup.result === 'draw') {
      playerMap.set(player1.name, updatePlayerStats(player1, 'draw'));
      playerMap.set(player2.name, updatePlayerStats(player2, 'draw'));
    } else if (matchup.result === 'player1') {
      playerMap.set(player1.name, updatePlayerStats(player1, 'win'));
      playerMap.set(player2.name, updatePlayerStats(player2, 'loss'));
    } else if (matchup.result === 'player2') {
      playerMap.set(player1.name, updatePlayerStats(player1, 'loss'));
      playerMap.set(player2.name, updatePlayerStats(player2, 'win'));
    } else {
      throw new Error(`Invalid matchup result: ${matchup.result}. Must be 'player1', 'player2', or 'draw'`);
    }
  }

  // Return updated players in original order
  return players.map(player => playerMap.get(player.name));
}