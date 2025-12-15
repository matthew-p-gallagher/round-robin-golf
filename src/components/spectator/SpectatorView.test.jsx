/**
 * Tests for SpectatorView component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils.jsx'
import SpectatorView from './SpectatorView.jsx'

// Mock react-router-dom's useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ code: '1234' })
  }
})

// Mock useSpectatorMatch hook
vi.mock('../../hooks/useSpectatorMatch.js')

import { useSpectatorMatch } from '../../hooks/useSpectatorMatch.js'

// Mock match data
const createMockMatchData = (overrides = {}) => ({
  players: [
    { name: 'Alice', points: 6, wins: 2, draws: 0, losses: 0 },
    { name: 'Bob', points: 3, wins: 1, draws: 0, losses: 1 },
    { name: 'Charlie', points: 3, wins: 1, draws: 0, losses: 1 },
    { name: 'Diana', points: 0, wins: 0, draws: 0, losses: 2 }
  ],
  currentHole: 3,
  phase: 'scoring',
  holeResults: [],
  maxHoleReached: 3,
  ...overrides
})

describe('SpectatorView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state', () => {
    it('should show loading spinner while loading', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: null,
        loading: true,
        error: null,
        lastUpdated: null,
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    })
  })

  describe('Error state', () => {
    it('should show error message when error occurs', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: null,
        loading: false,
        error: 'Invalid or expired code',
        lastUpdated: null,
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByText('Invalid or expired code')).toBeInTheDocument()
    })

    it('should show try different code link on error', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: null,
        loading: false,
        error: 'Invalid or expired code',
        lastUpdated: null,
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByRole('link', { name: 'Try Different Code' })).toBeInTheDocument()
    })

    it('should show sign in link on error', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: null,
        loading: false,
        error: 'Invalid or expired code',
        lastUpdated: null,
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByRole('link', { name: 'Log In' })).toBeInTheDocument()
    })
  })

  describe('No match data state', () => {
    it('should show match not found when no data', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: null,
        loading: false,
        error: null,
        lastUpdated: null,
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByText('Match not found')).toBeInTheDocument()
    })
  })

  describe('Match data display', () => {
    it('should show header with app title', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData(),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByRole('heading', { name: 'Round Robin Golf' })).toBeInTheDocument()
    })

    it('should show viewing match badge', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData(),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByText('Viewing Match')).toBeInTheDocument()
    })

    it('should show current hole for in-progress match', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData({ currentHole: 5 }),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByText('Hole 5 of 18')).toBeInTheDocument()
    })

    it('should show match complete for finished match', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData({ phase: 'complete' }),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByText('Match Complete')).toBeInTheDocument()
    })

    it('should show current standings title for in-progress match', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData(),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByRole('heading', { name: 'Current Standings' })).toBeInTheDocument()
    })

    it('should show final standings title for complete match', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData({ phase: 'complete' }),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByRole('heading', { name: 'Final Standings' })).toBeInTheDocument()
    })

    it('should display all players', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData(),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('Charlie')).toBeInTheDocument()
      expect(screen.getByText('Diana')).toBeInTheDocument()
    })

    it('should show progress bar for in-progress match', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData({ currentHole: 10 }),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByText('9 of 18 holes completed')).toBeInTheDocument()
    })

    it('should not show progress bar for complete match', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData({ phase: 'complete' }),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.queryByText(/holes completed/)).not.toBeInTheDocument()
    })

    it('should show last updated time', () => {
      const testDate = new Date('2024-01-15T14:30:00')
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData(),
        loading: false,
        error: null,
        lastUpdated: testDate,
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByText(/Updated/)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should show view different match link', () => {
      useSpectatorMatch.mockReturnValue({
        matchData: createMockMatchData(),
        loading: false,
        error: null,
        lastUpdated: new Date(),
        refresh: vi.fn()
      })

      render(<SpectatorView />)

      expect(screen.getByRole('link', { name: 'View Different Match' })).toBeInTheDocument()
    })
  })
})
