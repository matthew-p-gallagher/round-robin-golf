import PointsTable from '../PointsTable.jsx'

/**
 * Full-screen overlay for displaying current standings
 * @param {Object} props
 * @param {Player[]} props.players - Array of players for stats display
 * @param {number} props.currentHole - Current hole number
 * @param {Function} props.onClose - Callback to close the overlay
 */
export default function StandingsOverlay({ players, currentHole, onClose }) {
  return (
    <div className="overlay-container">
      <div className="overlay-header">
        <button
          type="button"
          className="overlay-back-button"
          onClick={onClose}
          aria-label="Close standings"
        >
          &larr; Back
        </button>
        <h2 className="overlay-title">Current Standings</h2>
        <div className="overlay-header-spacer"></div>
      </div>

      <div className="overlay-content">
        <div className="overlay-card">
          <PointsTable
            players={players}
            currentHole={currentHole}
            showWinnerHighlight={false}
          />
        </div>
      </div>
    </div>
  )
}
