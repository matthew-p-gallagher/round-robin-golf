// Mock data for golf match scenarios

export const mockPlayers = [
  { name: 'Alice', points: 0, wins: 0, draws: 0, losses: 0 },
  { name: 'Bob', points: 0, wins: 0, draws: 0, losses: 0 },
  { name: 'Charlie', points: 0, wins: 0, draws: 0, losses: 0 },
  { name: 'Diana', points: 0, wins: 0, draws: 0, losses: 0 }
]

export const mockPlayersWithStats = [
  { name: 'Alice', points: 9, wins: 3, draws: 0, losses: 0 },
  { name: 'Bob', points: 4, wins: 1, draws: 1, losses: 1 },
  { name: 'Charlie', points: 3, wins: 1, draws: 0, losses: 2 },
  { name: 'Diana', points: 2, wins: 0, draws: 2, losses: 1 }
]

export const mockMatchState = {
  players: mockPlayers,
  currentHole: 1,
  phase: 'setup',
  holeResults: []
}

export const mockMatchStateInProgress = {
  players: mockPlayersWithStats,
  currentHole: 5,
  phase: 'scoring',
  holeResults: [
    {
      holeNumber: 1,
      matchups: [
        { player1: mockPlayers[0], player2: mockPlayers[1], result: 'player1' },
        { player1: mockPlayers[2], player2: mockPlayers[3], result: 'draw' }
      ]
    },
    {
      holeNumber: 2,
      matchups: [
        { player1: mockPlayers[0], player2: mockPlayers[2], result: 'player1' },
        { player1: mockPlayers[1], player2: mockPlayers[3], result: 'player2' }
      ]
    }
  ]
}

export const mockMatchStateComplete = {
  players: mockPlayersWithStats,
  currentHole: 19,
  phase: 'complete',
  holeResults: [] // Would contain all 18 holes in real scenario
}

// Mock matchup patterns for testing rotation logic
export const expectedMatchupPatterns = [
  // Pattern 1: A vs B, C vs D
  [
    { player1Index: 0, player2Index: 1 },
    { player1Index: 2, player2Index: 3 }
  ],
  // Pattern 2: A vs C, B vs D  
  [
    { player1Index: 0, player2Index: 2 },
    { player1Index: 1, player2Index: 3 }
  ],
  // Pattern 3: A vs D, B vs C
  [
    { player1Index: 0, player2Index: 3 },
    { player1Index: 1, player2Index: 2 }
  ]
]

// Helper function to create a matchup
export const createMatchup = (player1, player2, result = undefined) => ({
  player1,
  player2,
  result
})

// Helper function to create a hole result
export const createHoleResult = (holeNumber, matchups) => ({
  holeNumber,
  matchups
})

// Mock player names for form testing
export const validPlayerNames = ['Alice', 'Bob', 'Charlie', 'Diana']
export const invalidPlayerNames = ['', 'Bob', 'Charlie', 'Diana'] // Empty name
export const duplicatePlayerNames = ['Alice', 'Bob', 'Alice', 'Diana'] // Duplicate name