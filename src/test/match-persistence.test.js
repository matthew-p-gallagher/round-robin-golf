import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  saveMatchState, 
  loadMatchState, 
  clearMatchState, 
  hasSavedMatchState 
} from '../utils/match-persistence.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

describe('Match Persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveMatchState', () => {
    it('should save match state to localStorage', () => {
      const matchState = {
        players: [
          { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 0 },
          { name: 'Bob', points: 3, wins: 1, draws: 0, losses: 1 },
          { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 1 },
          { name: 'David', points: 2, wins: 0, draws: 2, losses: 0 }
        ],
        currentHole: 3,
        phase: 'scoring',
        holeResults: [
          {
            holeNumber: 1,
            matchups: [
              { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
              { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'draw' }
            ]
          }
        ]
      };

      saveMatchState(matchState);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'golf-match-state',
        JSON.stringify(matchState)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const matchState = { players: [], currentHole: 1, phase: 'setup', holeResults: [] };

      expect(() => saveMatchState(matchState)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save match state to localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('loadMatchState', () => {
    it('should load valid match state from localStorage', () => {
      const matchState = {
        players: [
          { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 0 },
          { name: 'Bob', points: 3, wins: 1, draws: 0, losses: 1 },
          { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 1 },
          { name: 'David', points: 2, wins: 0, draws: 2, losses: 0 }
        ],
        currentHole: 3,
        phase: 'scoring',
        holeResults: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(matchState));

      const result = loadMatchState();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('golf-match-state');
      expect(result).toEqual(matchState);
    });

    it('should return null when no saved state exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadMatchState();

      expect(result).toBeNull();
    });

    it('should return null and clear invalid state', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidState = { invalid: 'state' };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidState));

      const result = loadMatchState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('golf-match-state');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid match state found in localStorage, ignoring'
      );

      consoleSpy.mockRestore();
    });

    it('should handle JSON parse errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = loadMatchState();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('golf-match-state');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load match state from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clearMatchState', () => {
    it('should remove match state from localStorage', () => {
      clearMatchState();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('golf-match-state');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearMatchState()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear match state from localStorage:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('hasSavedMatchState', () => {
    it('should return true when saved state exists', () => {
      localStorageMock.getItem.mockReturnValue('{"some": "state"}');

      const result = hasSavedMatchState();

      expect(result).toBe(true);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('golf-match-state');
    });

    it('should return false when no saved state exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = hasSavedMatchState();

      expect(result).toBe(false);
    });

    it('should return false on localStorage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = hasSavedMatchState();

      expect(result).toBe(false);
    });
  });

  describe('State validation', () => {
    it('should accept valid setup phase state', () => {
      const validState = {
        players: [],
        currentHole: 1,
        phase: 'setup',
        holeResults: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validState));

      const result = loadMatchState();

      expect(result).toEqual(validState);
    });

    it('should accept valid scoring phase state', () => {
      const validState = {
        players: [
          { name: 'Alice', points: 3, wins: 1, draws: 0, losses: 0 },
          { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 1 },
          { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 0 },
          { name: 'David', points: 1, wins: 0, draws: 1, losses: 0 }
        ],
        currentHole: 5,
        phase: 'scoring',
        holeResults: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validState));

      const result = loadMatchState();

      expect(result).toEqual(validState);
    });

    it('should accept valid complete phase state', () => {
      const validState = {
        players: [
          { name: 'Alice', points: 30, wins: 10, draws: 0, losses: 8 },
          { name: 'Bob', points: 25, wins: 8, draws: 1, losses: 9 },
          { name: 'Charlie', points: 20, wins: 6, draws: 2, losses: 10 },
          { name: 'David', points: 15, wins: 4, draws: 3, losses: 11 }
        ],
        currentHole: 18,
        phase: 'complete',
        holeResults: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(validState));

      const result = loadMatchState();

      expect(result).toEqual(validState);
    });

    it('should reject state with invalid phase', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidState = {
        players: [],
        currentHole: 1,
        phase: 'invalid',
        holeResults: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidState));

      const result = loadMatchState();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should reject state with invalid hole number', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidState = {
        players: [],
        currentHole: 19,
        phase: 'setup',
        holeResults: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidState));

      const result = loadMatchState();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should reject scoring phase state without 4 players', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidState = {
        players: [
          { name: 'Alice', points: 3, wins: 1, draws: 0, losses: 0 }
        ],
        currentHole: 5,
        phase: 'scoring',
        holeResults: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidState));

      const result = loadMatchState();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should reject state with invalid player structure', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidState = {
        players: [
          { name: 'Alice' }, // Missing required properties
          { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 0 },
          { name: 'Charlie', points: 0, wins: 0, draws: 0, losses: 0 },
          { name: 'David', points: 0, wins: 0, draws: 0, losses: 0 }
        ],
        currentHole: 1,
        phase: 'scoring',
        holeResults: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidState));

      const result = loadMatchState();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});