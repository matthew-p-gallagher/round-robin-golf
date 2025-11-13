import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMatchState } from './useMatchState.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

// Mock the matchup rotation utility
vi.mock('../utils/matchup-rotation.js', () => ({
  createMatchupsForHole: vi.fn()
}));

import { createMatchupsForHole } from '../utils/matchup-rotation.js';

describe('useMatchState', () => {
  const testPlayerNames = ['Alice', 'Bob', 'Charlie', 'David'];
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage mock to ensure clean state
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useMatchState());
      
      expect(result.current.matchState).toEqual({
        players: [],
        currentHole: 1,
        phase: 'setup',
        holeResults: [],
        maxHoleReached: 1
      });
    });
  });

  describe('startMatch', () => {
    it('should initialize match with 4 valid players', () => {
      const { result } = renderHook(() => useMatchState());
      
      act(() => {
        result.current.startMatch(testPlayerNames);
      });

      expect(result.current.matchState.phase).toBe('scoring');
      expect(result.current.matchState.currentHole).toBe(1);
      expect(result.current.matchState.players).toHaveLength(4);
      expect(result.current.matchState.players[0]).toEqual({
        name: 'Alice',
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0
      });
    });

    it('should throw error if not exactly 4 players provided', async () => {
      const { result } = renderHook(() => useMatchState());

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', 'Bob']);
        });
      }).rejects.toThrow('Exactly 4 player names are required');
    });

    it('should throw error if player names are not unique', async () => {
      const { result } = renderHook(() => useMatchState());

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', 'Bob', 'Alice', 'David']);
        });
      }).rejects.toThrow('All player names must be unique');
    });

    it('should throw error if any player name is empty', async () => {
      const { result } = renderHook(() => useMatchState());

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', '', 'Charlie', 'David']);
        });
      }).rejects.toThrow('All player names must be non-empty');
    });

    it('should trim whitespace from player names', () => {
      const { result } = renderHook(() => useMatchState());
      
      act(() => {
        result.current.startMatch([' Alice ', ' Bob ', ' Charlie ', ' David ']);
      });

      expect(result.current.matchState.players[0].name).toBe('Alice');
      expect(result.current.matchState.players[1].name).toBe('Bob');
    });
  });

  describe('getCurrentMatchups', () => {
    it('should return null matchups when not in scoring phase', () => {
      const { result } = renderHook(() => useMatchState());
      
      const matchups = result.current.getCurrentMatchups();
      
      expect(matchups).toEqual([null, null]);
    });

    it('should call generateMatchupsForHole with correct parameters', () => {
      const { result } = renderHook(() => useMatchState());
      const mockMatchups = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: null },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: null }
      ];
      
      createMatchupsForHole.mockReturnValue(mockMatchups);
      
      act(() => {
        result.current.startMatch(testPlayerNames);
      });
      
      const matchups = result.current.getCurrentMatchups();
      
      expect(createMatchupsForHole).toHaveBeenCalledWith(result.current.matchState.players, 1);
      expect(matchups).toEqual(mockMatchups);
    });
  });

  describe('recordHoleResult', () => {
    let hook;

    beforeEach(() => {
      hook = renderHook(() => useMatchState());
      act(() => {
        hook.result.current.startMatch(testPlayerNames);
      });
    });

    it('should throw error if not exactly 2 matchup results provided', async () => {
      await expect(async () => {
        await act(async () => {
          await hook.result.current.recordHoleResult([]);
        });
      }).rejects.toThrow('Exactly 2 matchup results are required');
    });

    it('should throw error if any matchup lacks a result', async () => {
      const incompleteResults = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: null }
      ];

      await expect(async () => {
        await act(async () => {
          await hook.result.current.recordHoleResult(incompleteResults);
        });
      }).rejects.toThrow('Both matchups must have results before proceeding');
    });

    it('should award 3 points for wins and update win/loss stats', () => {
      const holeResults = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'player2' }
      ];

      act(() => {
        hook.result.current.recordHoleResult(holeResults);
      });

      const players = hook.result.current.matchState.players;
      const alice = players.find(p => p.name === 'Alice');
      const bob = players.find(p => p.name === 'Bob');
      const charlie = players.find(p => p.name === 'Charlie');
      const david = players.find(p => p.name === 'David');

      expect(alice.points).toBe(3);
      expect(alice.wins).toBe(1);
      expect(alice.losses).toBe(0);

      expect(bob.points).toBe(0);
      expect(bob.wins).toBe(0);
      expect(bob.losses).toBe(1);

      expect(charlie.points).toBe(0);
      expect(charlie.wins).toBe(0);
      expect(charlie.losses).toBe(1);

      expect(david.points).toBe(3);
      expect(david.wins).toBe(1);
      expect(david.losses).toBe(0);
    });

    it('should award 1 point each for draws and update draw stats', () => {
      const holeResults = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'draw' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'draw' }
      ];

      act(() => {
        hook.result.current.recordHoleResult(holeResults);
      });

      const players = hook.result.current.matchState.players;
      
      players.forEach(player => {
        expect(player.points).toBe(1);
        expect(player.draws).toBe(1);
        expect(player.wins).toBe(0);
        expect(player.losses).toBe(0);
      });
    });

    it('should advance to next hole after recording results', () => {
      const holeResults = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'player2' }
      ];

      act(() => {
        hook.result.current.recordHoleResult(holeResults);
      });

      expect(hook.result.current.matchState.currentHole).toBe(2);
      expect(hook.result.current.matchState.phase).toBe('scoring');
    });

    it('should transition to complete phase after hole 18', () => {
      // Set up match at hole 18
      act(() => {
        hook.result.current.matchState.currentHole = 18;
      });

      const holeResults = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'player2' }
      ];

      act(() => {
        hook.result.current.recordHoleResult(holeResults);
      });

      expect(hook.result.current.matchState.phase).toBe('complete');
      expect(hook.result.current.matchState.currentHole).toBe(18);
    });

    it('should store hole results in history', () => {
      const holeResults = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'player2' }
      ];

      act(() => {
        hook.result.current.recordHoleResult(holeResults);
      });

      expect(hook.result.current.matchState.holeResults).toHaveLength(1);
      expect(hook.result.current.matchState.holeResults[0]).toEqual({
        holeNumber: 1,
        matchups: holeResults
      });
    });

    it('should throw error for invalid player in matchup result', async () => {
      const invalidResults = [
        { player1: { name: 'InvalidPlayer' }, player2: { name: 'Bob' }, result: 'player1' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'player2' }
      ];

      await expect(async () => {
        await act(async () => {
          await hook.result.current.recordHoleResult(invalidResults);
        });
      }).rejects.toThrow('Matchup contains players not found in players array');
    });
  });

  describe('calculatePlayerStats', () => {
    let hook;

    beforeEach(() => {
      hook = renderHook(() => useMatchState());
      act(() => {
        hook.result.current.startMatch(testPlayerNames);
      });
    });

    it('should return players sorted by points (highest first)', () => {
      // Manually set different point totals
      act(() => {
        hook.result.current.matchState.players[0].points = 6; // Alice
        hook.result.current.matchState.players[1].points = 3; // Bob
        hook.result.current.matchState.players[2].points = 9; // Charlie
        hook.result.current.matchState.players[3].points = 1; // David
      });

      const sortedPlayers = hook.result.current.calculatePlayerStats();

      expect(sortedPlayers[0].name).toBe('Charlie'); // 9 points
      expect(sortedPlayers[1].name).toBe('Alice');   // 6 points
      expect(sortedPlayers[2].name).toBe('Bob');     // 3 points
      expect(sortedPlayers[3].name).toBe('David');   // 1 point
    });

    it('should sort alphabetically when points are equal', () => {
      // Set equal points for all players
      act(() => {
        hook.result.current.matchState.players.forEach(player => {
          player.points = 3;
        });
      });

      const sortedPlayers = hook.result.current.calculatePlayerStats();

      expect(sortedPlayers[0].name).toBe('Alice');
      expect(sortedPlayers[1].name).toBe('Bob');
      expect(sortedPlayers[2].name).toBe('Charlie');
      expect(sortedPlayers[3].name).toBe('David');
    });

    it('should not mutate original players array', () => {
      const originalPlayers = [...hook.result.current.matchState.players];
      
      hook.result.current.calculatePlayerStats();
      
      expect(hook.result.current.matchState.players).toEqual(originalPlayers);
    });
  });

  describe('getPlayerThru', () => {
    let hook;

    beforeEach(() => {
      hook = renderHook(() => useMatchState());
      act(() => {
        hook.result.current.startMatch(testPlayerNames);
      });
    });

    it('should return 0 for players with no completed holes', () => {
      const thru = hook.result.current.getPlayerThru('Alice');
      expect(thru).toBe(0);
    });

    it('should return correct thru count after playing holes', () => {
      // Play one hole where Alice wins and Charlie draws
      const holeResults = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'draw' }
      ];

      act(() => {
        hook.result.current.recordHoleResult(holeResults);
      });

      expect(hook.result.current.getPlayerThru('Alice')).toBe(1); // 1 win
      expect(hook.result.current.getPlayerThru('Bob')).toBe(1);   // 1 loss
      expect(hook.result.current.getPlayerThru('Charlie')).toBe(1); // 1 draw
      expect(hook.result.current.getPlayerThru('David')).toBe(1);   // 1 draw
    });

    it('should throw error for non-existent player', () => {
      expect(() => {
        hook.result.current.getPlayerThru('NonExistent');
      }).toThrow('Player NonExistent not found');
    });
  });

  describe('resetMatch', () => {
    it('should reset match to initial state', () => {
      const { result } = renderHook(() => useMatchState());
      
      // Start a match and make some progress
      act(() => {
        result.current.startMatch(testPlayerNames);
      });

      const holeResults = [
        { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
        { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'player2' }
      ];

      act(() => {
        result.current.recordHoleResult(holeResults);
      });

      // Reset the match
      act(() => {
        result.current.resetMatch();
      });

      expect(result.current.matchState).toEqual({
        players: [],
        currentHole: 1,
        phase: 'setup',
        holeResults: [],
        maxHoleReached: 1
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete match flow from setup to completion', () => {
      const { result } = renderHook(() => useMatchState());
      
      // Start match
      act(() => {
        result.current.startMatch(testPlayerNames);
      });

      expect(result.current.matchState.phase).toBe('scoring');
      expect(result.current.matchState.currentHole).toBe(1);

      // Play through multiple holes
      for (let hole = 1; hole <= 18; hole++) {
        const holeResults = [
          { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
          { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'draw' }
        ];

        act(() => {
          result.current.recordHoleResult(holeResults);
        });

        if (hole < 18) {
          expect(result.current.matchState.currentHole).toBe(hole + 1);
          expect(result.current.matchState.phase).toBe('scoring');
        }
      }

      // After 18 holes, match should be complete
      expect(result.current.matchState.phase).toBe('complete');
      expect(result.current.matchState.holeResults).toHaveLength(18);

      // Check final stats
      const finalStats = result.current.calculatePlayerStats();
      const alice = finalStats.find(p => p.name === 'Alice');
      const charlie = finalStats.find(p => p.name === 'Charlie');
      const david = finalStats.find(p => p.name === 'David');

      expect(alice.points).toBe(54); // 18 wins * 3 points
      expect(alice.wins).toBe(18);
      expect(charlie.points).toBe(18); // 18 draws * 1 point
      expect(charlie.draws).toBe(18);
      expect(david.points).toBe(18); // 18 draws * 1 point
      expect(david.draws).toBe(18);
    });
  });
});