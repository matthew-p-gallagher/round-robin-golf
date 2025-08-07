import { describe, it, expect } from 'vitest';
import {
  createPlayer,
  updatePlayerStats,
  calculateHolesCompleted,
  sortPlayersByRanking,
  processHoleResult
} from './player-stats.js';

describe('Player stats Utilities', () => {
  describe('createPlayer', () => {
    it('should create a player with initial zero stats', () => {
      const player = createPlayer('Alice');
      
      expect(player).toEqual({
        name: 'Alice',
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0
      });
    });

    it('should trim whitespace from player name', () => {
      const player = createPlayer('  Bob  ');
      expect(player.name).toBe('Bob');
    });

    it('should throw error for empty or invalid names', () => {
      expect(() => createPlayer('')).toThrow('Player name must be a non-empty string');
      expect(() => createPlayer('   ')).toThrow('Player name must be a non-empty string');
      expect(() => createPlayer(null)).toThrow('Player name must be a non-empty string');
      expect(() => createPlayer(123)).toThrow('Player name must be a non-empty string');
    });
  });

  describe('updatePlayerStats', () => {
    const basePlayer = {
      name: 'Alice',
      points: 5,
      wins: 1,
      draws: 2,
      losses: 1
    };

    it('should update stats for a win (3 points)', () => {
      const updated = updatePlayerStats(basePlayer, 'win');
      
      expect(updated).toEqual({
        name: 'Alice',
        points: 8,
        wins: 2,
        draws: 2,
        losses: 1
      });
      
      // Should not mutate original
      expect(basePlayer.points).toBe(5);
      expect(basePlayer.wins).toBe(1);
    });

    it('should update stats for a draw (1 point)', () => {
      const updated = updatePlayerStats(basePlayer, 'draw');
      
      expect(updated).toEqual({
        name: 'Alice',
        points: 6,
        wins: 1,
        draws: 3,
        losses: 1
      });
    });

    it('should update stats for a loss (0 points)', () => {
      const updated = updatePlayerStats(basePlayer, 'loss');
      
      expect(updated).toEqual({
        name: 'Alice',
        points: 5,
        wins: 1,
        draws: 2,
        losses: 2
      });
    });

    it('should throw error for invalid player', () => {
      expect(() => updatePlayerStats(null, 'win')).toThrow('Player must be a valid player object');
      expect(() => updatePlayerStats('invalid', 'win')).toThrow('Player must be a valid player object');
    });

    it('should throw error for invalid result', () => {
      expect(() => updatePlayerStats(basePlayer, 'invalid')).toThrow('Result must be "win", "draw", or "loss"');
      expect(() => updatePlayerStats(basePlayer, null)).toThrow('Result must be "win", "draw", or "loss"');
    });
  });

  describe('calculateHolesCompleted', () => {
    it('should calculate holes completed correctly', () => {
      const player = {
        name: 'Alice',
        points: 10,
        wins: 2,
        draws: 3,
        losses: 1
      };
      
      expect(calculateHolesCompleted(player)).toBe(6);
    });

    it('should return 0 for player with no games', () => {
      const player = createPlayer('Bob');
      expect(calculateHolesCompleted(player)).toBe(0);
    });

    it('should throw error for invalid player', () => {
      expect(() => calculateHolesCompleted(null)).toThrow('Player must be a valid player object');
      expect(() => calculateHolesCompleted('invalid')).toThrow('Player must be a valid player object');
    });
  });

  describe('sortPlayersByRanking', () => {
    const players = [
      { name: 'Charlie', points: 5, wins: 1, draws: 2, losses: 0 },
      { name: 'Alice', points: 10, wins: 3, draws: 1, losses: 0 },
      { name: 'Bob', points: 10, wins: 2, draws: 4, losses: 0 },
      { name: 'David', points: 3, wins: 1, draws: 0, losses: 2 }
    ];

    it('should sort by points descending, then alphabetically', () => {
      const sorted = sortPlayersByRanking(players);
      
      expect(sorted[0].name).toBe('Alice'); // 10 points, comes before Bob alphabetically
      expect(sorted[1].name).toBe('Bob');   // 10 points, comes after Alice alphabetically
      expect(sorted[2].name).toBe('Charlie'); // 5 points
      expect(sorted[3].name).toBe('David');   // 3 points
    });

    it('should not mutate original array', () => {
      const originalOrder = players.map(p => p.name);
      sortPlayersByRanking(players);
      
      expect(players.map(p => p.name)).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const sorted = sortPlayersByRanking([]);
      expect(sorted).toEqual([]);
    });

    it('should throw error for non-array input', () => {
      expect(() => sortPlayersByRanking(null)).toThrow('Players must be an array');
      expect(() => sortPlayersByRanking('invalid')).toThrow('Players must be an array');
    });
  });

  describe('processHoleResult', () => {
    const players = [
      createPlayer('Alice'),
      createPlayer('Bob'),
      createPlayer('Charlie'),
      createPlayer('David')
    ];

    it('should process hole with two wins correctly', () => {
      const matchups = [
        {
          player1: players[0], // Alice
          player2: players[1], // Bob
          result: 'player1'    // Alice wins
        },
        {
          player1: players[2], // Charlie
          player2: players[3], // David
          result: 'player2'    // David wins
        }
      ];

      const updatedPlayers = processHoleResult(players, matchups);
      
      expect(updatedPlayers[0].points).toBe(3); // Alice: 3 points for win
      expect(updatedPlayers[0].wins).toBe(1);
      expect(updatedPlayers[1].points).toBe(0); // Bob: 0 points for loss
      expect(updatedPlayers[1].losses).toBe(1);
      expect(updatedPlayers[2].points).toBe(0); // Charlie: 0 points for loss
      expect(updatedPlayers[2].losses).toBe(1);
      expect(updatedPlayers[3].points).toBe(3); // David: 3 points for win
      expect(updatedPlayers[3].wins).toBe(1);
    });

    it('should process hole with draws correctly', () => {
      const matchups = [
        {
          player1: players[0], // Alice
          player2: players[1], // Bob
          result: 'draw'
        },
        {
          player1: players[2], // Charlie
          player2: players[3], // David
          result: 'draw'
        }
      ];

      const updatedPlayers = processHoleResult(players, matchups);
      
      // All players should get 1 point for draws
      updatedPlayers.forEach(player => {
        expect(player.points).toBe(1);
        expect(player.draws).toBe(1);
        expect(player.wins).toBe(0);
        expect(player.losses).toBe(0);
      });
    });

    it('should process mixed results correctly', () => {
      const matchups = [
        {
          player1: players[0], // Alice
          player2: players[1], // Bob
          result: 'player2'    // Bob wins
        },
        {
          player1: players[2], // Charlie
          player2: players[3], // David
          result: 'draw'
        }
      ];

      const updatedPlayers = processHoleResult(players, matchups);
      
      expect(updatedPlayers[0].points).toBe(0); // Alice: loss
      expect(updatedPlayers[0].losses).toBe(1);
      expect(updatedPlayers[1].points).toBe(3); // Bob: win
      expect(updatedPlayers[1].wins).toBe(1);
      expect(updatedPlayers[2].points).toBe(1); // Charlie: draw
      expect(updatedPlayers[2].draws).toBe(1);
      expect(updatedPlayers[3].points).toBe(1); // David: draw
      expect(updatedPlayers[3].draws).toBe(1);
    });

    it('should not mutate original players array', () => {
      const matchups = [
        { player1: players[0], player2: players[1], result: 'player1' },
        { player1: players[2], player2: players[3], result: 'draw' }
      ];

      const originalPoints = players.map(p => p.points);
      processHoleResult(players, matchups);
      
      expect(players.map(p => p.points)).toEqual(originalPoints);
    });

    it('should throw error for invalid player count', () => {
      const matchups = [
        { player1: players[0], player2: players[1], result: 'player1' },
        { player1: players[2], player2: players[3], result: 'draw' }
      ];

      expect(() => processHoleResult([], matchups)).toThrow('Must provide exactly 4 players');
      expect(() => processHoleResult([players[0]], matchups)).toThrow('Must provide exactly 4 players');
    });

    it('should throw error for invalid matchup count', () => {
      const matchups = [
        { player1: players[0], player2: players[1], result: 'player1' }
      ];

      expect(() => processHoleResult(players, matchups)).toThrow('Must provide exactly 2 matchups');
      expect(() => processHoleResult(players, [])).toThrow('Must provide exactly 2 matchups');
    });

    it('should throw error for matchups without results', () => {
      const matchups = [
        { player1: players[0], player2: players[1], result: 'player1' },
        { player1: players[2], player2: players[3], result: null }
      ];

      expect(() => processHoleResult(players, matchups)).toThrow('All matchups must have results before processing');
    });

    it('should throw error for matchups with players not in players array', () => {
      const outsidePlayer = createPlayer('Outsider');
      const matchups = [
        { player1: players[0], player2: outsidePlayer, result: 'player1' },
        { player1: players[2], player2: players[3], result: 'draw' }
      ];

      expect(() => processHoleResult(players, matchups)).toThrow('Matchup contains players not found in players array');
    });

    it('should throw error for invalid matchup result values', () => {
      const matchups = [
        { player1: players[0], player2: players[1], result: 'invalid' },
        { player1: players[2], player2: players[3], result: 'draw' }
      ];

      expect(() => processHoleResult(players, matchups)).toThrow('Invalid matchup result: invalid. Must be \'player1\', \'player2\', or \'draw\'');
    });
  });
});