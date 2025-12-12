import { useParams, Link } from 'react-router-dom'
import { useSpectatorMatch } from '../../hooks/useSpectatorMatch.js'
import PointsTable from '../PointsTable.jsx'
import LoadingSpinner from '../common/LoadingSpinner.jsx'
import ErrorMessage from '../common/ErrorMessage.jsx'

/**
 * Format a date as a time string (e.g., "2:30 PM")
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string
 */
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/**
 * Spectator view for viewing match standings
 * Displays live standings with auto-refresh
 */
export default function SpectatorView() {
  const { code } = useParams()
  const { matchData, loading, error, lastUpdated } = useSpectatorMatch(code)

  // Loading state
  if (loading) {
    return (
      <div className="app">
        <main className="app-main">
          <LoadingSpinner />
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="app">
        <header className="app-header spectator-header">
          <div className="header-content">
            <h1>Round Robin Golf</h1>
          </div>
        </header>
        <main className="app-main">
          <div className="spectator-error">
            <ErrorMessage error={error} />
            <div className="spectator-actions">
              <Link to="/view" className="auth-button secondary">
                Try Different Code
              </Link>
              <Link to="/" className="link-button">
                Sign In
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // No match data
  if (!matchData) {
    return (
      <div className="app">
        <header className="app-header spectator-header">
          <div className="header-content">
            <h1>Round Robin Golf</h1>
          </div>
        </header>
        <main className="app-main">
          <div className="spectator-error">
            <ErrorMessage error="Match not found" />
            <div className="spectator-actions">
              <Link to="/view" className="auth-button secondary">
                Try Different Code
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const { players, currentHole, phase } = matchData
  const isComplete = phase === 'complete'
  const holesCompleted = isComplete ? 18 : currentHole - 1

  return (
    <div className="app">
      <header className="app-header spectator-header">
        <div className="header-content">
          <h1>Round Robin Golf</h1>
          <div className="spectator-badge">
            Viewing Match
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="spectator-container">
          {/* Match Status */}
          <div className="spectator-status">
            <div className="status-info">
              {isComplete ? (
                <span className="status-complete">Match Complete</span>
              ) : (
                <span className="status-in-progress">
                  Hole {currentHole} of 18
                </span>
              )}
            </div>
            {lastUpdated && (
              <div className="last-updated">
                Updated {formatTime(lastUpdated)}
              </div>
            )}
          </div>

          {/* Standings */}
          <div className="standings-card">
            <h3 className="standings-title">
              {isComplete ? 'Final Standings' : 'Current Standings'}
            </h3>
            <PointsTable
              players={players}
              currentHole={currentHole}
              showWinnerHighlight={isComplete}
            />
          </div>

          {/* Progress indicator */}
          {!isComplete && (
            <div className="spectator-progress">
              <div className="progress-label">
                {holesCompleted} of 18 holes completed
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(holesCompleted / 18) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="spectator-footer">
            <Link to="/view" className="link-button">
              View Different Match
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
