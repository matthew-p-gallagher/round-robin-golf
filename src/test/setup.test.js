import { describe, it, expect } from 'vitest'
import { mockPlayers, mockMatchState, validPlayerNames } from './mock-data'

describe('Test Setup Verification', () => {
  it('should have access to vitest globals', () => {
    expect(true).toBe(true)
  })

  it('should load mock data correctly', () => {
    expect(mockPlayers).toHaveLength(4)
    expect(mockPlayers[0]).toHaveProperty('name')
    expect(mockPlayers[0]).toHaveProperty('points')
    expect(mockPlayers[0]).toHaveProperty('wins')
    expect(mockPlayers[0]).toHaveProperty('draws')
    expect(mockPlayers[0]).toHaveProperty('losses')
  })

  it('should have valid test data for match state', () => {
    expect(mockMatchState).toHaveProperty('players')
    expect(mockMatchState).toHaveProperty('currentHole')
    expect(mockMatchState).toHaveProperty('phase')
    expect(mockMatchState).toHaveProperty('holeResults')
    expect(mockMatchState.phase).toBe('setup')
    expect(mockMatchState.currentHole).toBe(1)
  })

  it('should have valid player names for testing', () => {
    expect(validPlayerNames).toHaveLength(4)
    expect(validPlayerNames.every(name => typeof name === 'string' && name.length > 0)).toBe(true)
  })
})