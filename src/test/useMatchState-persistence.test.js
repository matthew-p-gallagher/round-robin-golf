import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMatchState } from '../hooks/useMatchState.js';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

describe('useMatchState Persistence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with saved state when available', async () => {
    const savedState = {
      players: [
        { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 0 },
        { name: 'Bob', points: 3, wins: 1, draws: 0, losses: 1 },
        { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 1 },
        { name: 'David', points: 2, wins: 0, draws: 2, losses: 0 }
      ],
      currentHole: 3,
      phase: 'scoring',
      holeResults: [],
      maxHoleReached: 3
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useMatchState());

    expect(result.current.matchState).toEqual(savedState);
    expect(await result.current.canResumeMatch()).toBe(true);
  });

  it('should initialize with default state when no saved state exists', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useMatchState());

    expect(result.current.matchState).toEqual({
      players: [],
      currentHole: 1,
      phase: 'setup',
      holeResults: [],
      maxHoleReached: 1
    });
    expect(await result.current.canResumeMatch()).toBe(false);
  });

  it('should save state to localStorage when match is started', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useMatchState());

    act(() => {
      result.current.startMatch(['Alice', 'Bob', 'Charlie', 'David']);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'golf-match-state',
      expect.stringContaining('"phase":"scoring"')
    );

    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.players).toHaveLength(4);
    expect(savedData.phase).toBe('scoring');
    expect(savedData.currentHole).toBe(1);
  });

  it('should save state to localStorage when hole results are recorded', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useMatchState());

    act(() => {
      result.current.startMatch(['Alice', 'Bob', 'Charlie', 'David']);
    });

    // Clear previous calls
    localStorageMock.setItem.mockClear();

    const matchups = result.current.getCurrentMatchups();
    const matchupResults = [
      { ...matchups[0], result: 'player1' },
      { ...matchups[1], result: 'draw' }
    ];

    act(() => {
      result.current.recordHoleResult(matchupResults);
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();

    const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(savedData.currentHole).toBe(2);
    expect(savedData.holeResults).toHaveLength(1);
  });

  it('should clear localStorage when match is reset', () => {
    const savedState = {
      players: [
        { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 0 },
        { name: 'Bob', points: 3, wins: 1, draws: 0, losses: 1 },
        { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 1 },
        { name: 'David', points: 2, wins: 0, draws: 2, losses: 0 }
      ],
      currentHole: 3,
      phase: 'scoring',
      holeResults: [],
      maxHoleReached: 3
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

    const { result } = renderHook(() => useMatchState());

    expect(result.current.matchState.phase).toBe('scoring');

    act(() => {
      result.current.resetMatch();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('golf-match-state');
    expect(result.current.matchState).toEqual({
      players: [],
      currentHole: 1,
      phase: 'setup',
      holeResults: [],
      maxHoleReached: 1
    });
  });

  it('should not save initial setup state with no players', () => {
    localStorageMock.getItem.mockReturnValue(null);

    renderHook(() => useMatchState());

    // Should not save the initial empty state
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should handle localStorage errors gracefully during initialization', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useMatchState());

    expect(result.current.matchState).toEqual({
      players: [],
      currentHole: 1,
      phase: 'setup',
      holeResults: [],
      maxHoleReached: 1
    });

    consoleSpy.mockRestore();
  });

  it('should persist match through completion', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useMatchState());

    // Start match
    act(() => {
      result.current.startMatch(['Alice', 'Bob', 'Charlie', 'David']);
    });

    // Play through to hole 18
    for (let hole = 1; hole <= 18; hole++) {
      const matchups = result.current.getCurrentMatchups();
      const matchupResults = [
        { ...matchups[0], result: 'player1' },
        { ...matchups[1], result: 'player2' }
      ];

      act(() => {
        result.current.recordHoleResult(matchupResults);
      });
    }

    expect(result.current.matchState.phase).toBe('complete');
    expect(result.current.matchState.currentHole).toBe(18);

    // Verify final state was saved
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'golf-match-state',
      expect.stringContaining('"phase":"complete"')
    );
  });

  it('should resume match in the middle of play', async () => {
    const midGameState = {
      players: [
        { name: 'Alice', points: 9, wins: 3, draws: 0, losses: 2 },
        { name: 'Bob', points: 6, wins: 2, draws: 0, losses: 3 },
        { name: 'Charlie', points: 4, wins: 1, draws: 1, losses: 3 },
        { name: 'David', points: 5, wins: 1, draws: 2, losses: 2 }
      ],
      currentHole: 10,
      phase: 'scoring',
      holeResults: [
        {
          holeNumber: 1,
          matchups: [
            { player1: { name: 'Alice' }, player2: { name: 'Bob' }, result: 'player1' },
            { player1: { name: 'Charlie' }, player2: { name: 'David' }, result: 'draw' }
          ]
        }
        // ... more hole results would be here
      ],
      maxHoleReached: 10
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(midGameState));

    const { result } = renderHook(() => useMatchState());

    expect(result.current.matchState).toEqual(midGameState);
    expect(await result.current.canResumeMatch()).toBe(true);

    // Should be able to continue playing
    const matchups = result.current.getCurrentMatchups();
    expect(matchups).toHaveLength(2);
    expect(matchups[0]).toBeTruthy();
    expect(matchups[1]).toBeTruthy();
  });
});