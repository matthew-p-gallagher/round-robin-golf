import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMatchState } from './useMatchState.js';

// Mock Supabase
vi.mock('../lib/supabase.js');

// Import the mocked supabase
import { supabase } from '../lib/supabase.js';

// Mock user for testing
const mockUser = { id: 'test-user-123', email: 'test@example.com' };

// Helper to create Supabase mock responses
let mockSupabaseClient;

describe('useMatchState Persistence Integration', () => {
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
        upsert: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })
    };

    // Apply mock to supabase
    supabase.from = mockSupabaseClient.from;
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
      maxHoleReached: 3,
      shareCode: '1234'
    };

    // Mock Supabase to return saved state
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

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for async load to complete
    await waitFor(() => {
      expect(result.current.matchState).toEqual(savedState);
    });

    expect(await result.current.canResumeMatch()).toBe(true);
  });

  it('should initialize with default state when no saved state exists', async () => {
    // Mock Supabase to return no data (PGRST116 error)
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116', message: 'No rows found' }
          })
        })
      })
    });
    supabase.from = mockSupabaseClient.from;

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for async load to complete
    await waitFor(() => {
      expect(result.current.matchState).toEqual({
        players: [],
        currentHole: 1,
        phase: 'setup',
        holeResults: [],
        maxHoleReached: 1,
        shareCode: null
      });
    });

    expect(await result.current.canResumeMatch()).toBe(false);
  });

  it('should save state to Supabase when match is started', async () => {
    // Mock Supabase for load (no saved state)
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    });
    supabase.from = mockSupabaseClient.from;

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.matchState.phase).toBe('setup');
    });

    vi.useFakeTimers();

    act(() => {
      result.current.startMatch(['Alice', 'Bob', 'Charlie', 'David']);
    });

    // Advance timers to trigger debounced save
    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runAllTimersAsync();
    });

    vi.useRealTimers();

    // Verify Supabase upsert was called
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_current_match');
    expect(mockSupabaseClient.from().upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: mockUser.id,
        match_data: expect.objectContaining({
          phase: 'scoring',
          currentHole: 1,
          players: expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' })
          ])
        })
      })
    );
  });

  it('should save state to Supabase when hole results are recorded', async () => {
    // Create persistent mock objects
    const upsertSpy = vi.fn().mockResolvedValue({ error: null });
    const mockTable = {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })
      }),
      upsert: upsertSpy
    };

    // Mock Supabase for load (no saved state)
    mockSupabaseClient.from = vi.fn().mockReturnValue(mockTable);
    supabase.from = mockSupabaseClient.from;

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.matchState.phase).toBe('setup');
    });

    vi.useFakeTimers();

    act(() => {
      result.current.startMatch(['Alice', 'Bob', 'Charlie', 'David']);
    });

    // Advance timers for first save
    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runAllTimersAsync();
    });

    // Clear previous calls
    upsertSpy.mockClear();

    const matchups = result.current.getCurrentMatchups();
    const matchupResults = [
      { ...matchups[0], result: 'player1' },
      { ...matchups[1], result: 'draw' }
    ];

    act(() => {
      result.current.recordHoleResult(matchupResults);
    });

    // Advance timers to trigger debounced save
    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runAllTimersAsync();
    });

    vi.useRealTimers();

    // Verify Supabase upsert was called with updated state
    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: mockUser.id,
        match_data: expect.objectContaining({
          currentHole: 2,
          holeResults: expect.arrayContaining([
            expect.objectContaining({ holeNumber: 1 })
          ])
        })
      })
    );
  });

  it('should clear Supabase when match is reset', async () => {
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
      maxHoleReached: 3,
      shareCode: '1234'
    };

    // Mock Supabase to return saved state
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { match_data: savedState },
            error: null
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      })
    });
    supabase.from = mockSupabaseClient.from;

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for state to load
    await waitFor(() => {
      expect(result.current.matchState.phase).toBe('scoring');
    });

    await act(async () => {
      await result.current.resetMatch();
    });

    // Verify Supabase delete was called
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_current_match');
    expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
    expect(mockSupabaseClient.from().delete().eq).toHaveBeenCalledWith('user_id', mockUser.id);

    // Verify state is reset
    expect(result.current.matchState).toEqual({
      players: [],
      currentHole: 1,
      phase: 'setup',
      holeResults: [],
      maxHoleReached: 1,
      shareCode: null
    });
  });

  it('should not save initial setup state with no players', async () => {
    // Mock Supabase for load (no saved state)
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    });
    supabase.from = mockSupabaseClient.from;

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.matchState.phase).toBe('setup');
    });

    vi.useFakeTimers();

    // Advance timers past debounce
    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runAllTimersAsync();
    });

    vi.useRealTimers();

    // Should not save the initial empty state
    expect(mockSupabaseClient.from().upsert).not.toHaveBeenCalled();
  });

  it('should handle Supabase errors gracefully during initialization', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock Supabase to throw error on load
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockRejectedValue(new Error('Network error'))
        })
      })
    });
    supabase.from = mockSupabaseClient.from;

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for error handling to complete and default state to be set
    await waitFor(() => {
      expect(result.current).toBeTruthy();
      expect(result.current.matchState).toEqual({
        players: [],
        currentHole: 1,
        phase: 'setup',
        holeResults: [],
        maxHoleReached: 1,
        shareCode: null
      });
    }, { timeout: 3000 });

    consoleError.mockRestore();
  });

  it('should persist match through completion', async () => {
    // Mock Supabase for load (no saved state)
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    });
    supabase.from = mockSupabaseClient.from;

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.matchState.phase).toBe('setup');
    });

    vi.useFakeTimers();

    // Start match
    act(() => {
      result.current.startMatch(['Alice', 'Bob', 'Charlie', 'David']);
    });

    // Advance timers for initial save
    await act(async () => {
      vi.advanceTimersByTime(800);
      await vi.runAllTimersAsync();
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

      // Advance timers after each hole
      await act(async () => {
        vi.advanceTimersByTime(800);
        await vi.runAllTimersAsync();
      });
    }

    vi.useRealTimers();

    expect(result.current.matchState.phase).toBe('complete');
    expect(result.current.matchState.currentHole).toBe(18);

    // Verify final state was saved with complete phase
    const lastUpsertCall = mockSupabaseClient.from().upsert.mock.calls[mockSupabaseClient.from().upsert.mock.calls.length - 1];
    expect(lastUpsertCall[0].match_data.phase).toBe('complete');
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
      maxHoleReached: 10,
      shareCode: '5678'
    };

    // Mock Supabase to return mid-game state
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { match_data: midGameState },
            error: null
          })
        })
      })
    });
    supabase.from = mockSupabaseClient.from;

    const { result } = renderHook(() => useMatchState(mockUser));

    // Wait for state to load
    await waitFor(() => {
      expect(result.current.matchState).toEqual(midGameState);
    });

    expect(await result.current.canResumeMatch()).toBe(true);

    // Should be able to continue playing
    const matchups = result.current.getCurrentMatchups();
    expect(matchups).toHaveLength(2);
    expect(matchups[0]).toBeTruthy();
    expect(matchups[1]).toBeTruthy();
  });
});
