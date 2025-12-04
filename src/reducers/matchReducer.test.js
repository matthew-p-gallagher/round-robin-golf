/**
 * Tests for match state reducer
 */

import { describe, it, expect, vi } from 'vitest'
import { matchReducer, INITIAL_STATE, ACTIONS } from './matchReducer.js'
import * as playerStatsModule from '../utils/player-stats.js'

describe('matchReducer', () => {
  describe('INITIAL_STATE', () => {
    it('should have correct initial state structure', () => {
      expect(INITIAL_STATE).toEqual({
        players: [],
        currentHole: 1,
        phase: 'setup',
        holeResults: [],
        maxHoleReached: 1
      })
    })
  })

  describe('START_MATCH action', () => {
    it('should transition from setup to scoring phase', () => {
      const action = {
        type: ACTIONS.START_MATCH,
        payload: {
          playerNames: ['Alice', 'Bob', 'Charlie', 'Diana']
        }
      }

      const newState = matchReducer(INITIAL_STATE, action)

      expect(newState.phase).toBe('scoring')
      expect(newState.currentHole).toBe(1)
      expect(newState.maxHoleReached).toBe(1)
    })

    it('should create players with zero stats', () => {
      const action = {
        type: ACTIONS.START_MATCH,
        payload: {
          playerNames: ['Alice', 'Bob', 'Charlie', 'Diana']
        }
      }

      const newState = matchReducer(INITIAL_STATE, action)

      expect(newState.players).toHaveLength(4)
      newState.players.forEach(player => {
        expect(player).toHaveProperty('name')
        expect(player).toHaveProperty('points', 0)
        expect(player).toHaveProperty('wins', 0)
        expect(player).toHaveProperty('draws', 0)
        expect(player).toHaveProperty('losses', 0)
      })
    })

    it('should clear any existing hole results', () => {
      const stateWithResults = {
        ...INITIAL_STATE,
        holeResults: [{ holeNumber: 1, matchups: [] }]
      }

      const action = {
        type: ACTIONS.START_MATCH,
        payload: {
          playerNames: ['Alice', 'Bob', 'Charlie', 'Diana']
        }
      }

      const newState = matchReducer(stateWithResults, action)

      expect(newState.holeResults).toEqual([])
    })

    it('should not mutate original state', () => {
      const action = {
        type: ACTIONS.START_MATCH,
        payload: {
          playerNames: ['Alice', 'Bob', 'Charlie', 'Diana']
        }
      }

      const originalState = { ...INITIAL_STATE }
      matchReducer(INITIAL_STATE, action)

      expect(INITIAL_STATE).toEqual(originalState)
    })
  })

  describe('RECORD_HOLE_RESULT action', () => {
    const setupState = {
      players: [
        { name: 'Alice', points: 0, wins: 0, draws: 0, losses: 0 },
        { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 0 },
        { name: 'Charlie', points: 0, wins: 0, draws: 0, losses: 0 },
        { name: 'Diana', points: 0, wins: 0, draws: 0, losses: 0 }
      ],
      currentHole: 1,
      phase: 'scoring',
      holeResults: [],
      maxHoleReached: 1
    }

    it('should advance to next hole', () => {
      const action = {
        type: ACTIONS.RECORD_HOLE_RESULT,
        payload: {
          matchupResults: [
            { player1: setupState.players[0], player2: setupState.players[1], result: 'player1' },
            { player1: setupState.players[2], player2: setupState.players[3], result: 'draw' }
          ]
        }
      }

      const newState = matchReducer(setupState, action)

      expect(newState.currentHole).toBe(2)
      expect(newState.maxHoleReached).toBe(2)
    })

    it('should add hole result to history', () => {
      const action = {
        type: ACTIONS.RECORD_HOLE_RESULT,
        payload: {
          matchupResults: [
            { player1: setupState.players[0], player2: setupState.players[1], result: 'player1' },
            { player1: setupState.players[2], player2: setupState.players[3], result: 'draw' }
          ]
        }
      }

      const newState = matchReducer(setupState, action)

      expect(newState.holeResults).toHaveLength(1)
      expect(newState.holeResults[0].holeNumber).toBe(1)
      expect(newState.holeResults[0].matchups).toEqual(action.payload.matchupResults)
    })

    it('should transition to complete phase after hole 18', () => {
      const hole18State = {
        ...setupState,
        currentHole: 18,
        maxHoleReached: 18
      }

      const action = {
        type: ACTIONS.RECORD_HOLE_RESULT,
        payload: {
          matchupResults: [
            { player1: setupState.players[0], player2: setupState.players[1], result: 'player1' },
            { player1: setupState.players[2], player2: setupState.players[3], result: 'draw' }
          ]
        }
      }

      const newState = matchReducer(hole18State, action)

      expect(newState.phase).toBe('complete')
      expect(newState.currentHole).toBe(18)
      expect(newState.maxHoleReached).toBe(18)
    })

    it('should update maxHoleReached correctly', () => {
      const action = {
        type: ACTIONS.RECORD_HOLE_RESULT,
        payload: {
          matchupResults: [
            { player1: setupState.players[0], player2: setupState.players[1], result: 'player1' },
            { player1: setupState.players[2], player2: setupState.players[3], result: 'draw' }
          ]
        }
      }

      const newState = matchReducer(setupState, action)

      expect(newState.maxHoleReached).toBe(2)
    })

    it('should not mutate original state', () => {
      const action = {
        type: ACTIONS.RECORD_HOLE_RESULT,
        payload: {
          matchupResults: [
            { player1: setupState.players[0], player2: setupState.players[1], result: 'player1' },
            { player1: setupState.players[2], player2: setupState.players[3], result: 'draw' }
          ]
        }
      }

      const originalState = { ...setupState }
      matchReducer(setupState, action)

      expect(setupState.currentHole).toBe(originalState.currentHole)
      expect(setupState.holeResults).toEqual(originalState.holeResults)
    })

    it('should preserve existing hole results', () => {
      const stateWithHistory = {
        ...setupState,
        currentHole: 2,
        maxHoleReached: 2,
        holeResults: [
          {
            holeNumber: 1,
            matchups: [
              { player1: setupState.players[0], player2: setupState.players[1], result: 'player1' },
              { player1: setupState.players[2], player2: setupState.players[3], result: 'draw' }
            ]
          }
        ]
      }

      const action = {
        type: ACTIONS.RECORD_HOLE_RESULT,
        payload: {
          matchupResults: [
            { player1: setupState.players[0], player2: setupState.players[2], result: 'player2' },
            { player1: setupState.players[1], player2: setupState.players[3], result: 'player1' }
          ]
        }
      }

      const newState = matchReducer(stateWithHistory, action)

      expect(newState.holeResults).toHaveLength(2)
      expect(newState.holeResults[0].holeNumber).toBe(1)
      expect(newState.holeResults[1].holeNumber).toBe(2)
    })
  })

  describe('NAVIGATE_TO_HOLE action', () => {
    const navigationState = {
      players: [
        { name: 'Alice', points: 3, wins: 1, draws: 0, losses: 0 },
        { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 1 },
        { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 0 },
        { name: 'Diana', points: 1, wins: 0, draws: 1, losses: 0 }
      ],
      currentHole: 5,
      phase: 'scoring',
      holeResults: [],
      maxHoleReached: 5
    }

    it('should update currentHole to specified hole', () => {
      const action = {
        type: ACTIONS.NAVIGATE_TO_HOLE,
        payload: { holeNumber: 3 }
      }

      const newState = matchReducer(navigationState, action)

      expect(newState.currentHole).toBe(3)
    })

    it('should preserve all other state', () => {
      const action = {
        type: ACTIONS.NAVIGATE_TO_HOLE,
        payload: { holeNumber: 2 }
      }

      const newState = matchReducer(navigationState, action)

      expect(newState.players).toEqual(navigationState.players)
      expect(newState.phase).toBe(navigationState.phase)
      expect(newState.holeResults).toEqual(navigationState.holeResults)
      expect(newState.maxHoleReached).toBe(navigationState.maxHoleReached)
    })

    it('should allow navigating to any hole', () => {
      const action1 = {
        type: ACTIONS.NAVIGATE_TO_HOLE,
        payload: { holeNumber: 1 }
      }
      const action18 = {
        type: ACTIONS.NAVIGATE_TO_HOLE,
        payload: { holeNumber: 18 }
      }

      expect(matchReducer(navigationState, action1).currentHole).toBe(1)
      expect(matchReducer(navigationState, action18).currentHole).toBe(18)
    })

    it('should not mutate original state', () => {
      const action = {
        type: ACTIONS.NAVIGATE_TO_HOLE,
        payload: { holeNumber: 2 }
      }

      const originalHole = navigationState.currentHole
      matchReducer(navigationState, action)

      expect(navigationState.currentHole).toBe(originalHole)
    })
  })

  describe('UPDATE_HOLE_RESULT action', () => {
    const stateWithResults = {
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
          matchups: [
            { player1: 'Alice', player2: 'Bob', result: 'player1' },
            { player1: 'Charlie', player2: 'Diana', result: 'draw' }
          ]
        },
        {
          holeNumber: 2,
          matchups: [
            { player1: 'Alice', player2: 'Charlie', result: 'player1' },
            { player1: 'Bob', player2: 'Diana', result: 'player2' }
          ]
        }
      ],
      maxHoleReached: 3
    }

    it('should update existing hole result', () => {
      const recalculatedPlayers = [
        { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 0 },
        { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 2 },
        { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 1 },
        { name: 'Diana', points: 4, wins: 1, draws: 1, losses: 0 }
      ]

      const action = {
        type: ACTIONS.UPDATE_HOLE_RESULT,
        payload: {
          holeNumber: 2,
          matchupResults: [
            { player1: 'Alice', player2: 'Charlie', result: 'player1' },
            { player1: 'Bob', player2: 'Diana', result: 'player2' }
          ],
          recalculatedPlayers
        }
      }

      const newState = matchReducer(stateWithResults, action)

      expect(newState.holeResults[1].matchups).toEqual(action.payload.matchupResults)
      expect(newState.players).toEqual(recalculatedPlayers)
    })

    it('should add new hole result if not found', () => {
      const recalculatedPlayers = stateWithResults.players

      const action = {
        type: ACTIONS.UPDATE_HOLE_RESULT,
        payload: {
          holeNumber: 3,
          matchupResults: [
            { player1: 'Alice', player2: 'Diana', result: 'player1' },
            { player1: 'Bob', player2: 'Charlie', result: 'draw' }
          ],
          recalculatedPlayers
        }
      }

      const newState = matchReducer(stateWithResults, action)

      expect(newState.holeResults).toHaveLength(3)
      expect(newState.holeResults[2].holeNumber).toBe(3)
    })

    it('should maintain sorted order when adding new result', () => {
      const recalculatedPlayers = stateWithResults.players

      // Add hole 5 result (out of order)
      const action = {
        type: ACTIONS.UPDATE_HOLE_RESULT,
        payload: {
          holeNumber: 5,
          matchupResults: [
            { player1: 'Alice', player2: 'Bob', result: 'draw' },
            { player1: 'Charlie', player2: 'Diana', result: 'draw' }
          ],
          recalculatedPlayers
        }
      }

      const stateWithGap = {
        ...stateWithResults,
        holeResults: [
          ...stateWithResults.holeResults,
          {
            holeNumber: 3,
            matchups: [
              { player1: 'Alice', player2: 'Diana', result: 'player1' },
              { player1: 'Bob', player2: 'Charlie', result: 'draw' }
            ]
          }
        ]
      }

      const newState = matchReducer(stateWithGap, action)

      // Verify results are sorted by hole number
      for (let i = 1; i < newState.holeResults.length; i++) {
        expect(newState.holeResults[i].holeNumber).toBeGreaterThan(
          newState.holeResults[i - 1].holeNumber
        )
      }
    })

    it('should not mutate original state', () => {
      const recalculatedPlayers = stateWithResults.players

      const action = {
        type: ACTIONS.UPDATE_HOLE_RESULT,
        payload: {
          holeNumber: 1,
          matchupResults: [
            { player1: 'Alice', player2: 'Bob', result: 'draw' },
            { player1: 'Charlie', player2: 'Diana', result: 'draw' }
          ],
          recalculatedPlayers
        }
      }

      const originalResults = [...stateWithResults.holeResults]
      matchReducer(stateWithResults, action)

      expect(stateWithResults.holeResults).toEqual(originalResults)
    })
  })

  describe('RESET_MATCH action', () => {
    it('should return to initial state', () => {
      const anyState = {
        players: [
          { name: 'Alice', points: 10, wins: 3, draws: 1, losses: 0 }
        ],
        currentHole: 15,
        phase: 'scoring',
        holeResults: [{ holeNumber: 1, matchups: [] }],
        maxHoleReached: 15
      }

      const action = { type: ACTIONS.RESET_MATCH }

      const newState = matchReducer(anyState, action)

      expect(newState).toEqual(INITIAL_STATE)
    })

    it('should clear all player data', () => {
      const stateWithPlayers = {
        players: [
          { name: 'Alice', points: 10, wins: 3, draws: 1, losses: 0 },
          { name: 'Bob', points: 7, wins: 2, draws: 1, losses: 1 }
        ],
        currentHole: 10,
        phase: 'scoring',
        holeResults: [],
        maxHoleReached: 10
      }

      const action = { type: ACTIONS.RESET_MATCH }

      const newState = matchReducer(stateWithPlayers, action)

      expect(newState.players).toEqual([])
      expect(newState.holeResults).toEqual([])
    })
  })

  describe('LOAD_MATCH action', () => {
    it('should replace entire state with loaded state', () => {
      const loadedState = {
        players: [
          { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 0 },
          { name: 'Bob', points: 3, wins: 1, draws: 0, losses: 1 },
          { name: 'Charlie', points: 1, wins: 0, draws: 1, losses: 1 },
          { name: 'Diana', points: 2, wins: 0, draws: 2, losses: 0 }
        ],
        currentHole: 5,
        phase: 'scoring',
        holeResults: [
          { holeNumber: 1, matchups: [] },
          { holeNumber: 2, matchups: [] }
        ],
        maxHoleReached: 5
      }

      const action = {
        type: ACTIONS.LOAD_MATCH,
        payload: { matchState: loadedState }
      }

      const newState = matchReducer(INITIAL_STATE, action)

      expect(newState).toEqual(loadedState)
    })

    it('should work from any current state', () => {
      const currentState = {
        players: [{ name: 'Old', points: 0, wins: 0, draws: 0, losses: 0 }],
        currentHole: 1,
        phase: 'setup',
        holeResults: [],
        maxHoleReached: 1
      }

      const loadedState = {
        players: [{ name: 'New', points: 10, wins: 3, draws: 1, losses: 0 }],
        currentHole: 10,
        phase: 'scoring',
        holeResults: [],
        maxHoleReached: 10
      }

      const action = {
        type: ACTIONS.LOAD_MATCH,
        payload: { matchState: loadedState }
      }

      const newState = matchReducer(currentState, action)

      expect(newState).toEqual(loadedState)
    })
  })

  describe('Unknown action type', () => {
    it('should return state unchanged for unknown action', () => {
      const state = {
        players: [],
        currentHole: 1,
        phase: 'setup',
        holeResults: [],
        maxHoleReached: 1
      }

      const action = { type: 'UNKNOWN_ACTION' }

      const newState = matchReducer(state, action)

      expect(newState).toBe(state)
    })
  })
})
