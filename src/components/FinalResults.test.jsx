/**
 * Tests for FinalResults component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FinalResults from './FinalResults.jsx'

// Mock PointsTable component
vi.mock('./PointsTable.jsx', () => ({
  default: ({ players, currentHole, showWinnerHighlight, className }) => (
    <div data-testid="points-table">
      <div>Players: {players.length}</div>
      <div>Current Hole: {currentHole}</div>
      <div>Show Winner: {showWinnerHighlight ? 'yes' : 'no'}</div>
      <div>Class: {className}</div>
    </div>
  )
}))

describe('FinalResults', () => {
  const mockPlayers = [
    { name: 'Alice', points: 15, wins: 5, draws: 0, losses: 1 },
    { name: 'Bob', points: 12, wins: 4, draws: 0, losses: 2 },
    { name: 'Charlie', points: 9, wins: 3, draws: 0, losses: 3 },
    { name: 'David', points: 6, wins: 2, draws: 0, losses: 4 }
  ]

  let mockOnNewMatch

  beforeEach(() => {
    mockOnNewMatch = vi.fn()
  })

  describe('Rendering', () => {
    it('should render final results with all elements', () => {
      render(<FinalResults players={mockPlayers} onNewMatch={mockOnNewMatch} />)

      expect(screen.getByText('Match Complete!')).toBeInTheDocument()
      expect(screen.getByText('Final Results')).toBeInTheDocument()
      expect(screen.getByTestId('points-table')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /start new match/i })).toBeInTheDocument()
    })

    it('should render PointsTable with correct props', () => {
      render(<FinalResults players={mockPlayers} onNewMatch={mockOnNewMatch} />)

      expect(screen.getByText('Players: 4')).toBeInTheDocument()
      expect(screen.getByText('Current Hole: 19')).toBeInTheDocument()
      expect(screen.getByText('Show Winner: yes')).toBeInTheDocument()
      expect(screen.getByText('Class: final-table')).toBeInTheDocument()
    })

    it('should pass all players to PointsTable', () => {
      render(<FinalResults players={mockPlayers} onNewMatch={mockOnNewMatch} />)

      expect(screen.getByText('Players: 4')).toBeInTheDocument()
    })
  })

  describe('Interaction', () => {
    it('should call onNewMatch when Start New Match button is clicked', async () => {
      const user = userEvent.setup()
      render(<FinalResults players={mockPlayers} onNewMatch={mockOnNewMatch} />)

      const newMatchButton = screen.getByRole('button', { name: /start new match/i })
      await user.click(newMatchButton)

      expect(mockOnNewMatch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Edge cases', () => {
    it('should render with empty players array', () => {
      render(<FinalResults players={[]} onNewMatch={mockOnNewMatch} />)

      expect(screen.getByText('Match Complete!')).toBeInTheDocument()
      expect(screen.getByTestId('points-table')).toBeInTheDocument()
      expect(screen.getByText('Players: 0')).toBeInTheDocument()
    })
  })
})
