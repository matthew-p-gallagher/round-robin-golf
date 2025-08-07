import PointsTable from './PointsTable.jsx';

/**
 * FinalResults component for displaying the final match results
 * @param {Object} props
 * @param {Player[]} props.players - Array of players with final stats
 * @param {Function} props.onNewMatch - Callback to start a new match
 */
function FinalResults({ players, onNewMatch }) {
  return (
    <div className="screen">
      <div className="container">
        <div className="final-results-header">
          <h2 className="final-results-title">Match Complete!</h2>
          <p className="final-results-subtitle">Final Results</p>
        </div>

        {/* Final Points Table with Winner Highlighting */}
        <div className="final-results-table">
          <PointsTable 
            players={players}
            currentHole={19} // All holes completed
            showWinnerHighlight={true}
            className="final-table"
          />
        </div>

        <div className="new-match-container">
          <button
            type="button"
            className="new-match-button"
            onClick={onNewMatch}
          >
            Start New Match
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinalResults;