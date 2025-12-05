/**
 * Tests for useSpectatorMatch hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSpectatorMatch } from './useSpectatorMatch.js'

// Mock the supabase share persistence module
vi.mock('../utils/supabase-share-persistence.js')

import { getMatchByShareCode } from '../utils/supabase-share-persistence.js'

// Mock match data
const createMockMatchData = () => ({
  players: [
    { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 0 },
    { name: 'Bob', points: 3, wins: 1, draws: 0, losses: 1 },
    { name: 'Charlie', points: 3, wins: 1, draws: 0, losses: 1 },
    { name: 'Diana', points: 0, wins: 0, draws: 0, losses: 2 }
  ],
  currentHole: 3,
  phase: 'scoring',
  holeResults: [],
  maxHoleReached: 3
})

describe('useSpectatorMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should start with loading state', () => {
    getMatchByShareCode.mockResolvedValue({
      matchData: createMockMatchData(),
      error: null
    })

    const { result } = renderHook(() => useSpectatorMatch('1234'))

    expect(result.current.loading).toBe(true)
    expect(result.current.matchData).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should fetch match data on mount', async () => {
    const mockData = createMockMatchData()
    getMatchByShareCode.mockResolvedValue({
      matchData: mockData,
      error: null
    })

    const { result } = renderHook(() => useSpectatorMatch('1234'))

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(getMatchByShareCode).toHaveBeenCalledWith('1234')
    expect(result.current.loading).toBe(false)
    expect(result.current.matchData).toEqual(mockData)
    expect(result.current.error).toBe(null)
    expect(result.current.lastUpdated).toBeInstanceOf(Date)
  })

  it('should handle error response', async () => {
    getMatchByShareCode.mockResolvedValue({
      matchData: null,
      error: 'Invalid or expired code'
    })

    const { result } = renderHook(() => useSpectatorMatch('9999'))

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.matchData).toBe(null)
    expect(result.current.error).toBe('Invalid or expired code')
  })

  it('should set error when no share code provided', async () => {
    const { result } = renderHook(() => useSpectatorMatch(''))

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(result.current.error).toBe('No share code provided')
    expect(result.current.loading).toBe(false)
  })

  it('should poll for updates at interval', async () => {
    const mockData = createMockMatchData()
    getMatchByShareCode.mockResolvedValue({
      matchData: mockData,
      error: null
    })

    renderHook(() => useSpectatorMatch('1234'))

    // Initial fetch (advance just enough to resolve the promise)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    const initialCalls = getMatchByShareCode.mock.calls.length

    // Advance time by 5 seconds (poll interval)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(getMatchByShareCode).toHaveBeenCalledTimes(initialCalls + 1)

    // Advance another 5 seconds
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(getMatchByShareCode).toHaveBeenCalledTimes(initialCalls + 2)
  })

  it('should stop polling on unmount', async () => {
    const mockData = createMockMatchData()
    getMatchByShareCode.mockResolvedValue({
      matchData: mockData,
      error: null
    })

    const { unmount } = renderHook(() => useSpectatorMatch('1234'))

    // Initial fetch
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    const callsBeforeUnmount = getMatchByShareCode.mock.calls.length

    // Unmount the hook
    unmount()

    // Advance time - should not trigger more fetches
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })

    // Should be same number of calls (no polling after unmount)
    expect(getMatchByShareCode).toHaveBeenCalledTimes(callsBeforeUnmount)
  })

  it('should provide a manual refresh function', async () => {
    const mockData = createMockMatchData()
    getMatchByShareCode.mockResolvedValue({
      matchData: mockData,
      error: null
    })

    const { result } = renderHook(() => useSpectatorMatch('1234'))

    // Initial fetch
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    const callsAfterInitial = getMatchByShareCode.mock.calls.length

    // Call manual refresh
    await act(async () => {
      result.current.refresh()
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(getMatchByShareCode).toHaveBeenCalledTimes(callsAfterInitial + 1)
  })

  it('should update matchData when poll returns new data', async () => {
    const initialData = createMockMatchData()
    const updatedData = {
      ...initialData,
      currentHole: 4,
      players: initialData.players.map((p, i) =>
        i === 0 ? { ...p, points: 9 } : p
      )
    }

    // Return initial data for first few calls, then updated data
    getMatchByShareCode.mockResolvedValue({ matchData: initialData, error: null })

    const { result } = renderHook(() => useSpectatorMatch('1234'))

    // Initial fetch
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(result.current.matchData.currentHole).toBe(3)

    // Now switch to returning updated data
    getMatchByShareCode.mockResolvedValue({ matchData: updatedData, error: null })

    // Poll update
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(result.current.matchData.currentHole).toBe(4)
    expect(result.current.matchData.players[0].points).toBe(9)
  })

  it('should handle fetch exceptions gracefully', async () => {
    getMatchByShareCode.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSpectatorMatch('1234'))

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Failed to load match')
    expect(result.current.matchData).toBe(null)
  })

  it('should refetch when share code changes', async () => {
    const mockData = createMockMatchData()
    getMatchByShareCode.mockResolvedValue({
      matchData: mockData,
      error: null
    })

    const { rerender } = renderHook(
      ({ code }) => useSpectatorMatch(code),
      { initialProps: { code: '1234' } }
    )

    // Initial fetch
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(getMatchByShareCode).toHaveBeenCalledWith('1234')

    // Change share code
    rerender({ code: '5678' })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(getMatchByShareCode).toHaveBeenCalledWith('5678')
  })
})
