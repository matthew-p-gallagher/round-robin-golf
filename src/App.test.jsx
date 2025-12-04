/**
 * Tests for App component
 * Integration tests with mocked dependencies (AuthContext, useMatchState)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

// Mock hooks
vi.mock('./context/AuthContext.jsx')
vi.mock('./hooks/useMatchState.js')

// Mock child components
vi.mock('./components/auth/Login.jsx', () => ({
  default: ({ onShowSignup, onShowResetPassword }) => (
    <div data-testid="login">
      <button onClick={onShowSignup}>Show Signup</button>
      <button onClick={onShowResetPassword}>Show Reset</button>
    </div>
  )
}))

vi.mock('./components/auth/Signup.jsx', () => ({
  default: ({ onShowLogin }) => (
    <div data-testid="signup">
      <button onClick={onShowLogin}>Show Login</button>
    </div>
  )
}))

vi.mock('./components/auth/ResetPassword.jsx', () => ({
  default: ({ onShowLogin }) => (
    <div data-testid="reset-password">
      <button onClick={onShowLogin}>Show Login</button>
    </div>
  )
}))

vi.mock('./components/auth/UpdatePassword.jsx', () => ({
  default: ({ onPasswordUpdated }) => (
    <div data-testid="update-password">
      <button onClick={onPasswordUpdated}>Update Password</button>
    </div>
  )
}))

vi.mock('./components/MatchSetup.jsx', () => ({
  default: () => <div data-testid="match-setup">Match Setup</div>
}))

vi.mock('./components/HoleScoring.jsx', () => ({
  default: () => <div data-testid="hole-scoring">Hole Scoring</div>
}))

vi.mock('./components/FinalResults.jsx', () => ({
  default: () => <div data-testid="final-results">Final Results</div>
}))

vi.mock('./components/common/ErrorMessage.jsx', () => ({
  default: ({ error }) => error ? <div data-testid="error-message">{error}</div> : null
}))

vi.mock('./components/common/LoadingSpinner.jsx', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}))

// Import mocked modules
import { useAuth } from './context/AuthContext.jsx'
import { useMatchState } from './hooks/useMatchState.js'

describe('App', () => {
  let mockUseAuth
  let mockUseMatchState

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Default mock implementations
    mockUseAuth = {
      user: null,
      loading: false,
      signOut: vi.fn()
    }

    mockUseMatchState = {
      matchState: {
        phase: 'setup',
        currentHole: 1,
        maxHoleReached: 1,
        players: [],
        holeResults: []
      },
      loading: false,
      error: null,
      startMatch: vi.fn(),
      getCurrentMatchups: vi.fn(),
      recordHoleResult: vi.fn(),
      resetMatch: vi.fn(),
      canResumeMatch: false,
      navigateToHole: vi.fn(),
      updateHoleResult: vi.fn(),
      getMatchupsForHole: vi.fn()
    }

    useAuth.mockReturnValue(mockUseAuth)
    useMatchState.mockReturnValue(mockUseMatchState)

    // Reset location hash
    window.location.hash = ''
  })

  describe('Loading states', () => {
    it('should show loading spinner when auth is loading', () => {
      mockUseAuth.loading = true
      useAuth.mockReturnValue(mockUseAuth)

      render(<App />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    it('should show loading spinner when match is loading', () => {
      mockUseMatchState.loading = true
      useMatchState.mockReturnValue(mockUseMatchState)

      render(<App />)

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Unauthenticated view', () => {
    it('should show login view by default when not authenticated', () => {
      render(<App />)

      expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    it('should switch to signup view', async () => {
      const user = userEvent.setup()
      render(<App />)

      const showSignupButton = screen.getByText('Show Signup')
      await user.click(showSignupButton)

      expect(screen.getByTestId('signup')).toBeInTheDocument()
      expect(screen.queryByTestId('login')).not.toBeInTheDocument()
    })

    it('should switch to reset password view', async () => {
      const user = userEvent.setup()
      render(<App />)

      const showResetButton = screen.getByText('Show Reset')
      await user.click(showResetButton)

      expect(screen.getByTestId('reset-password')).toBeInTheDocument()
      expect(screen.queryByTestId('login')).not.toBeInTheDocument()
    })

    it('should switch back to login from signup', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Go to signup
      await user.click(screen.getByText('Show Signup'))
      expect(screen.getByTestId('signup')).toBeInTheDocument()

      // Go back to login
      await user.click(screen.getByText('Show Login'))
      expect(screen.getByTestId('login')).toBeInTheDocument()
      expect(screen.queryByTestId('signup')).not.toBeInTheDocument()
    })

    it('should switch back to login from reset password', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Go to reset password
      await user.click(screen.getByText('Show Reset'))
      expect(screen.getByTestId('reset-password')).toBeInTheDocument()

      // Go back to login
      await user.click(screen.getByText('Show Login'))
      expect(screen.getByTestId('login')).toBeInTheDocument()
      expect(screen.queryByTestId('reset-password')).not.toBeInTheDocument()
    })
  })

  describe('Recovery mode', () => {
    it('should detect recovery mode from URL hash', () => {
      window.location.hash = '#type=recovery&access_token=abc123'
      mockUseAuth.user = { email: 'test@example.com' }
      useAuth.mockReturnValue(mockUseAuth)

      render(<App />)

      expect(screen.getByTestId('update-password')).toBeInTheDocument()
    })

    it('should clear recovery mode after password update', async () => {
      const user = userEvent.setup()
      window.location.hash = '#type=recovery&access_token=abc123'
      mockUseAuth.user = { email: 'test@example.com' }
      useAuth.mockReturnValue(mockUseAuth)

      render(<App />)

      expect(screen.getByTestId('update-password')).toBeInTheDocument()

      // Click update password button
      await user.click(screen.getByText('Update Password'))

      // Should show match setup (authenticated view)
      await waitFor(() => {
        expect(screen.queryByTestId('update-password')).not.toBeInTheDocument()
        expect(screen.getByTestId('match-setup')).toBeInTheDocument()
      })

      // Hash should be cleared
      expect(window.location.hash).toBe('')
    })
  })

  describe('Authenticated view - routing', () => {
    beforeEach(() => {
      mockUseAuth.user = { email: 'test@example.com' }
      useAuth.mockReturnValue(mockUseAuth)
    })

    it('should show match setup when phase is setup', () => {
      mockUseMatchState.matchState.phase = 'setup'
      useMatchState.mockReturnValue(mockUseMatchState)

      render(<App />)

      expect(screen.getByTestId('match-setup')).toBeInTheDocument()
      expect(screen.queryByTestId('hole-scoring')).not.toBeInTheDocument()
      expect(screen.queryByTestId('final-results')).not.toBeInTheDocument()
    })

    it('should show hole scoring when phase is scoring', () => {
      mockUseMatchState.matchState.phase = 'scoring'
      useMatchState.mockReturnValue(mockUseMatchState)

      render(<App />)

      expect(screen.getByTestId('hole-scoring')).toBeInTheDocument()
      expect(screen.queryByTestId('match-setup')).not.toBeInTheDocument()
      expect(screen.queryByTestId('final-results')).not.toBeInTheDocument()
    })

    it('should show final results when phase is complete', () => {
      mockUseMatchState.matchState.phase = 'complete'
      useMatchState.mockReturnValue(mockUseMatchState)

      render(<App />)

      expect(screen.getByTestId('final-results')).toBeInTheDocument()
      expect(screen.queryByTestId('match-setup')).not.toBeInTheDocument()
      expect(screen.queryByTestId('hole-scoring')).not.toBeInTheDocument()
    })
  })

  describe('Authenticated view - header', () => {
    beforeEach(() => {
      mockUseAuth.user = { email: 'test@example.com' }
      useAuth.mockReturnValue(mockUseAuth)
    })

    it('should display user email in header', () => {
      render(<App />)

      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })

    it('should display Round Robin Golf title', () => {
      render(<App />)

      expect(screen.getByText('Round Robin Golf')).toBeInTheDocument()
    })

    it('should have sign out button', () => {
      render(<App />)

      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    it('should call signOut when sign out button clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const signOutButton = screen.getByText('Sign Out')
      await user.click(signOutButton)

      expect(mockUseAuth.signOut).toHaveBeenCalledTimes(1)
    })

    it('should handle sign out errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const user = userEvent.setup()
      mockUseAuth.signOut = vi.fn().mockRejectedValue(new Error('Sign out failed'))
      useAuth.mockReturnValue(mockUseAuth)

      render(<App />)

      const signOutButton = screen.getByText('Sign Out')
      await user.click(signOutButton)

      expect(consoleError).toHaveBeenCalledWith('Error signing out:', expect.any(Error))

      consoleError.mockRestore()
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      mockUseAuth.user = { email: 'test@example.com' }
      useAuth.mockReturnValue(mockUseAuth)
    })

    it('should display match error when present', () => {
      mockUseMatchState.error = 'Failed to load match'
      useMatchState.mockReturnValue(mockUseMatchState)

      render(<App />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByText('Failed to load match')).toBeInTheDocument()
    })

    it('should not display error message when no error', () => {
      mockUseMatchState.error = null
      useMatchState.mockReturnValue(mockUseMatchState)

      render(<App />)

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument()
    })
  })
})
