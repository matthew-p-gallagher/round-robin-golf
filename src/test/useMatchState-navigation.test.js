import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMatchState } from '../hooks/useMatchState.js';
import { validPlayerNames } from './mock-data.js';

// Mock Supabase for persistence tests
vi.mock('../lib/supabase.js');
import { supabase } from '../lib/supabase.js';

describe('useMatchState Navigation State Management', () => {
  let result;

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useMatchState());
    result = hookResult;
  });

  describe('Initial State', () => {
    it('should initialize with maxHoleReached set to 1', () => {
      expect(result.current.matchState.maxHoleReached).toBe(1);
      expect(result.current.matchState.currentHole).toBe(1);
    });

    it('should maintain maxHoleReached in setup phase', () => {
      expect(result.current.matchState.phase).toBe('setup');
      expect(result.current.matchState.maxHoleReached).toBe(1);
    });
  });

  describe('Match Start Navigation State', () => {
    it('should set maxHoleReached to 1 when starting a match', () => {
      act(() => {
        result.current.startMatch(validPlayerNames);
      });

      expect(result.current.matchState.phase).toBe('scoring');
      expect(result.current.matchState.currentHole).toBe(1);
      expect(result.current.matchState.maxHoleReached).toBe(1);
    });
  });

  describe('Hole Progression Navigation State', () => {
    beforeEach(() => {
      // Start a match first
      act(() => {
        result.current.startMatch(validPlayerNames);
      });
    });

    it('should update maxHoleReached when advancing to hole 2', () => {
      // Get current matchups and record results
      const matchups = result.current.getCurrentMatchups();
      const matchupResults = [
        { ...matchups[0], result: 'player1' },
        { ...matchups[1], result: 'draw' }
      ];

      act(() => {
        result.current.recordHoleResult(matchupResults);
      });

      expect(result.current.matchState.currentHole).toBe(2);
      expect(result.current.matchState.maxHoleReached).toBe(2);
    });

    it('should continue updating maxHoleReached as holes progress', () => {
      // Progress through multiple holes
      for (let hole = 1; hole <= 5; hole++) {
        const matchups = result.current.getCurrentMatchups();
        const matchupResults = [
          { ...matchups[0], result: 'player1' },
          { ...matchups[1], result: 'draw' }
        ];

        act(() => {
          result.current.recordHoleResult(matchupResults);
        });

        const expectedHole = hole + 1;
        expect(result.current.matchState.currentHole).toBe(expectedHole);
        expect(result.current.matchState.maxHoleReached).toBe(expectedHole);
      }
    });

    it('should set maxHoleReached to 18 when match completes', () => {
      // Progress through all 18 holes
      for (let hole = 1; hole <= 18; hole++) {
        const matchups = result.current.getCurrentMatchups();
        const matchupResults = [
          { ...matchups[0], result: 'player1' },
          { ...matchups[1], result: 'draw' }
        ];

        act(() => {
          result.current.recordHoleResult(matchupResults);
        });
      }

      expect(result.current.matchState.phase).toBe('complete');
      expect(result.current.matchState.currentHole).toBe(18);
      expect(result.current.matchState.maxHoleReached).toBe(18);
    });
  });

  describe('Navigation Boundaries', () => {
    beforeEach(() => {
      // Start a match and progress to hole 3
      act(() => {
        result.current.startMatch(validPlayerNames);
      });

      // Complete holes 1 and 2
      for (let hole = 1; hole <= 2; hole++) {
        const matchups = result.current.getCurrentMatchups();
        const matchupResults = [
          { ...matchups[0], result: 'player1' },
          { ...matchups[1], result: 'draw' }
        ];

        act(() => {
          result.current.recordHoleResult(matchupResults);
        });
      }
    });

    it('should track navigation boundaries correctly', () => {
      // Should be on hole 3 with maxHoleReached = 3
      expect(result.current.matchState.currentHole).toBe(3);
      expect(result.current.matchState.maxHoleReached).toBe(3);
    });

    it('should maintain maxHoleReached when navigating backwards (future implementation)', () => {
      // This test validates that maxHoleReached represents the furthest progress
      // Even if currentHole changes in future navigation implementation,
      // maxHoleReached should remain at the furthest point reached
      expect(result.current.matchState.maxHoleReached).toBe(3);
      
      // The maxHoleReached should not decrease even if we implement
      // navigation that changes currentHole to a previous hole
      expect(result.current.matchState.maxHoleReached).toBeGreaterThanOrEqual(
        result.current.matchState.currentHole
      );
    });
  });

  describe('Reset Match Navigation State', () => {
    it('should reset maxHoleReached to 1 when match is reset', async () => {
      // Start a match and progress
      act(() => {
        result.current.startMatch(validPlayerNames);
      });

      const matchups = result.current.getCurrentMatchups();
      const matchupResults = [
        { ...matchups[0], result: 'player1' },
        { ...matchups[1], result: 'draw' }
      ];

      act(() => {
        result.current.recordHoleResult(matchupResults);
      });

      // Verify we progressed
      expect(result.current.matchState.maxHoleReached).toBe(2);

      // Reset match
      await act(async () => {
        await result.current.resetMatch();
      });

      // Verify reset state
      expect(result.current.matchState.currentHole).toBe(1);
      expect(result.current.matchState.maxHoleReached).toBe(1);
      expect(result.current.matchState.phase).toBe('setup');
    });
  });

  describe('State Persistence with Navigation', () => {
    const mockUser = { id: 'test-user-123', email: 'test@example.com' };
    let mockSupabaseClient;

    beforeEach(() => {
      vi.clearAllMocks();

      // Create fresh mock for each test
      mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'No rows found' }
              })
            })
          }),
          upsert: vi.fn().mockResolvedValue({ error: null })
        })
      };

      supabase.from = mockSupabaseClient.from;
    });

    it('should persist maxHoleReached to Supabase', async () => {
      const { result: testResult } = renderHook(() => useMatchState(mockUser));

      // Wait for initial load
      await waitFor(() => {
        expect(testResult.current.matchState.phase).toBe('setup');
      });

      vi.useFakeTimers();

      // Start a match and progress
      act(() => {
        testResult.current.startMatch(validPlayerNames);
      });

      // Advance timers for first save
      await act(async () => {
        vi.advanceTimersByTime(800);
        await vi.runAllTimersAsync();
      });

      const matchups = testResult.current.getCurrentMatchups();
      const matchupResults = [
        { ...matchups[0], result: 'player1' },
        { ...matchups[1], result: 'draw' }
      ];

      act(() => {
        testResult.current.recordHoleResult(matchupResults);
      });

      // Advance timers to trigger debounced save
      await act(async () => {
        vi.advanceTimersByTime(800);
        await vi.runAllTimersAsync();
      });

      vi.useRealTimers();

      // Verify Supabase upsert was called with maxHoleReached
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_current_match');
      expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          match_data: expect.objectContaining({
            maxHoleReached: 2,
            currentHole: 2
          })
        })
      );
    });

    it('should restore maxHoleReached from Supabase', async () => {
      // Mock Supabase to return state with maxHoleReached
      const savedState = {
        players: validPlayerNames.map(name => ({ name, points: 0, wins: 0, draws: 0, losses: 0 })),
        currentHole: 5,
        phase: 'scoring',
        holeResults: [],
        maxHoleReached: 5
      };

      mockSupabaseClient.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { match_data: savedState },
              error: null
            })
          })
        })
      });
      supabase.from = mockSupabaseClient.from;

      // Create new hook instance with user (simulating app restart)
      const { result: newResult } = renderHook(() => useMatchState(mockUser));

      // Wait for state to load from Supabase
      await waitFor(() => {
        expect(newResult.current.matchState.currentHole).toBe(5);
      });

      expect(newResult.current.matchState.maxHoleReached).toBe(5);
      expect(newResult.current.matchState.phase).toBe('scoring');
    });
  });
});