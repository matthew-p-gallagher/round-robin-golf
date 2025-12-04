/**
 * Tests for useMatchCore custom hook
 * Focuses on validation logic, error scenarios, and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMatchCore } from './useMatchCore.js'

describe('useMatchCore', () => {
  describe('startMatch', () => {
    it('should throw error if playerNames is not an array', async () => {
      const { result } = renderHook(() => useMatchCore())

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch('not an array')
        })
      }).rejects.toThrow('Exactly 4 player names are required')
    })

    it('should throw error if not exactly 4 players', async () => {
      const { result } = renderHook(() => useMatchCore())

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', 'Bob', 'Charlie'])
        })
      }).rejects.toThrow('Exactly 4 player names are required')

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'])
        })
      }).rejects.toThrow('Exactly 4 player names are required')
    })

    it('should throw error if player names are not unique', async () => {
      const { result } = renderHook(() => useMatchCore())

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', 'Bob', 'Alice', 'Diana'])
        })
      }).rejects.toThrow('All player names must be unique')
    })

    it('should throw error if player names have leading/trailing spaces that make them duplicates', async () => {
      const { result } = renderHook(() => useMatchCore())

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', 'Bob', ' Alice ', 'Diana'])
        })
      }).rejects.toThrow('All player names must be unique')
    })

    it('should throw error if any player name is empty', async () => {
      const { result } = renderHook(() => useMatchCore())

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', '', 'Charlie', 'Diana'])
        })
      }).rejects.toThrow('All player names must be non-empty')

      await expect(async () => {
        await act(async () => {
          await result.current.startMatch(['Alice', '   ', 'Charlie', 'Diana'])
        })
      }).rejects.toThrow('All player names must be non-empty')
    })

    it('should start match successfully with valid player names', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      expect(result.current.matchState.phase).toBe('scoring')
      expect(result.current.matchState.players).toHaveLength(4)
      expect(result.current.matchState.currentHole).toBe(1)
    })
  })

  describe('getCurrentMatchups', () => {
    it('should return [null, null] if not in scoring phase', () => {
      const { result } = renderHook(() => useMatchCore())

      const matchups = result.current.getCurrentMatchups()
      expect(matchups).toEqual([null, null])
    })

    it('should return [null, null] if not 4 players', async () => {
      const { result } = renderHook(() => useMatchCore())

      // Force a state where phase is scoring but no players
      await act(async () => {
        await result.current.setMatchState({
          players: [],
          currentHole: 1,
          phase: 'scoring',
          holeResults: [],
          maxHoleReached: 1
        })
      })

      const matchups = result.current.getCurrentMatchups()
      expect(matchups).toEqual([null, null])
    })

    it('should return matchups if in scoring phase with 4 players', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()
      expect(matchups).toHaveLength(2)
      expect(matchups[0]).toHaveProperty('player1')
      expect(matchups[0]).toHaveProperty('player2')
    })
  })

  describe('recordHoleResult', () => {
    beforeEach(async () => {
      // Helper to set up a match in progress
    })

    it('should throw error if matchupResults is not an array', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      await expect(async () => {
        await act(async () => {
          await result.current.recordHoleResult('not an array')
        })
      }).rejects.toThrow('Exactly 2 matchup results are required')
    })

    it('should throw error if not exactly 2 matchup results', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      await expect(async () => {
        await act(async () => {
          await result.current.recordHoleResult([
            { ...matchups[0], result: 'player1' }
          ])
        })
      }).rejects.toThrow('Exactly 2 matchup results are required')
    })

    it('should throw error if any matchup is missing result', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      await expect(async () => {
        await act(async () => {
          await result.current.recordHoleResult([
            { ...matchups[0], result: 'player1' },
            matchups[1] // Missing result
          ])
        })
      }).rejects.toThrow('Both matchups must have results before proceeding')
    })

    it('should record hole result successfully with valid data', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      await act(async () => {
        await result.current.recordHoleResult([
          { ...matchups[0], result: 'player1' },
          { ...matchups[1], result: 'draw' }
        ])
      })

      expect(result.current.matchState.currentHole).toBe(2)
      expect(result.current.matchState.holeResults).toHaveLength(1)
    })
  })

  describe('getPlayerThru', () => {
    it('should throw error if player not found', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      expect(() => {
        result.current.getPlayerThru('Eve')
      }).toThrow('Player Eve not found')
    })

    it('should return holes completed for valid player', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const thru = result.current.getPlayerThru('Alice')
      expect(typeof thru).toBe('number')
      expect(thru).toBeGreaterThanOrEqual(0)
    })
  })

  describe('navigateToHole', () => {
    it('should throw error if hole number is out of range', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      expect(() => {
        act(() => {
          result.current.navigateToHole(0)
        })
      }).toThrow('Hole number must be between 1 and 18')

      expect(() => {
        act(() => {
          result.current.navigateToHole(19)
        })
      }).toThrow('Hole number must be between 1 and 18')
    })

    it('should throw error if navigating beyond maxHoleReached', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      // maxHoleReached should be 1 initially
      expect(() => {
        act(() => {
          result.current.navigateToHole(5)
        })
      }).toThrow('Cannot navigate beyond hole 1')
    })

    it('should navigate to valid hole within maxHoleReached', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      // Navigate to hole 1 (should be allowed)
      act(() => {
        result.current.navigateToHole(1)
      })

      expect(result.current.matchState.currentHole).toBe(1)
    })
  })

  describe('updateHoleResult', () => {
    it('should throw error if hole number is out of range', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      expect(() => {
        act(() => {
          result.current.updateHoleResult(0, [
            { ...matchups[0], result: 'player1' },
            { ...matchups[1], result: 'draw' }
          ])
        })
      }).toThrow('Hole number must be between 1 and 18')

      expect(() => {
        act(() => {
          result.current.updateHoleResult(19, [
            { ...matchups[0], result: 'player1' },
            { ...matchups[1], result: 'draw' }
          ])
        })
      }).toThrow('Hole number must be between 1 and 18')
    })

    it('should throw error if not exactly 2 matchup results', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      expect(() => {
        act(() => {
          result.current.updateHoleResult(1, [
            { ...matchups[0], result: 'player1' }
          ])
        })
      }).toThrow('Exactly 2 matchup results are required')
    })

    it('should throw error if any matchup is missing result', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      expect(() => {
        act(() => {
          result.current.updateHoleResult(1, [
            { ...matchups[0], result: 'player1' },
            matchups[1] // Missing result
          ])
        })
      }).toThrow('Both matchups must have results')
    })

    it('should update hole result successfully', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      // Record initial result
      await act(async () => {
        await result.current.recordHoleResult([
          { ...matchups[0], result: 'player1' },
          { ...matchups[1], result: 'draw' }
        ])
      })

      // Update the result
      act(() => {
        result.current.updateHoleResult(1, [
          { ...matchups[0], result: 'player2' },
          { ...matchups[1], result: 'player1' }
        ])
      })

      expect(result.current.matchState.holeResults).toHaveLength(1)
    })
  })

  describe('getMatchupsForHole', () => {
    it('should return [null, null] if not in scoring phase', () => {
      const { result } = renderHook(() => useMatchCore())

      const matchups = result.current.getMatchupsForHole(1)
      expect(matchups).toEqual([null, null])
    })

    it('should return [null, null] if not 4 players', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.setMatchState({
          players: [],
          currentHole: 1,
          phase: 'scoring',
          holeResults: [],
          maxHoleReached: 1
        })
      })

      const matchups = result.current.getMatchupsForHole(1)
      expect(matchups).toEqual([null, null])
    })

    it('should throw error if hole number is out of range', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      expect(() => {
        result.current.getMatchupsForHole(0)
      }).toThrow('Hole number must be between 1 and 18')

      expect(() => {
        result.current.getMatchupsForHole(19)
      }).toThrow('Hole number must be between 1 and 18')
    })

    it('should return matchups for valid hole', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getMatchupsForHole(5)
      expect(matchups).toHaveLength(2)
      expect(matchups[0]).toHaveProperty('player1')
      expect(matchups[0]).toHaveProperty('player2')
    })

    it('should return existing results if hole has been played', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      // Record result for hole 1
      await act(async () => {
        await result.current.recordHoleResult([
          { ...matchups[0], result: 'player1' },
          { ...matchups[1], result: 'draw' }
        ])
      })

      // Get matchups for hole 1 should return results
      const hole1Matchups = result.current.getMatchupsForHole(1)
      expect(hole1Matchups[0]).toHaveProperty('result')
      expect(hole1Matchups[1]).toHaveProperty('result')
    })
  })

  describe('calculatePlayerStats', () => {
    it('should return sorted players by ranking', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const stats = result.current.calculatePlayerStats()
      expect(stats).toHaveLength(4)
      expect(stats[0]).toHaveProperty('points')
      expect(stats[0]).toHaveProperty('name')
    })
  })

  describe('resetMatchState', () => {
    it('should reset match to initial state', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      act(() => {
        result.current.resetMatchState()
      })

      expect(result.current.matchState.phase).toBe('setup')
      expect(result.current.matchState.players).toHaveLength(0)
      expect(result.current.matchState.currentHole).toBe(1)
    })
  })

  describe('setMatchState', () => {
    it('should load match state', async () => {
      const { result } = renderHook(() => useMatchCore())

      const mockState = {
        players: [
          { name: 'Alice', points: 3, wins: 1, draws: 0, losses: 0 },
          { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 1 },
          { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 0 },
          { name: 'Diana', points: 1, wins: 0, draws: 1, losses: 0 }
        ],
        currentHole: 3,
        phase: 'scoring',
        holeResults: [
          {
            holeNumber: 1,
            matchups: []
          }
        ],
        maxHoleReached: 3
      }

      await act(async () => {
        await result.current.setMatchState(mockState)
      })

      expect(result.current.matchState.currentHole).toBe(3)
      expect(result.current.matchState.phase).toBe('scoring')
      expect(result.current.matchState.players).toHaveLength(4)
    })
  })

  describe('recalculateStatsFromHole', () => {
    it('should recalculate stats from specific hole', async () => {
      const { result } = renderHook(() => useMatchCore())

      await act(async () => {
        await result.current.startMatch(['Alice', 'Bob', 'Charlie', 'Diana'])
      })

      const matchups = result.current.getCurrentMatchups()

      // Record hole 1
      await act(async () => {
        await result.current.recordHoleResult([
          { ...matchups[0], result: 'player1' },
          { ...matchups[1], result: 'draw' }
        ])
      })

      const recalculated = result.current.recalculateStatsFromHole(1, result.current.matchState.holeResults)
      expect(recalculated).toHaveLength(4)
      expect(recalculated.every(p => typeof p.points === 'number')).toBe(true)
    })
  })
})
