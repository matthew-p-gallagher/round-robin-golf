import { useState, useEffect } from 'react';
import PointsTable from './PointsTable.jsx';

/**
 * HoleScoring component for recording matchup results on each hole
 * @param {Object} props
 * @param {number} props.currentHole - Current hole number (1-18)
 * @param {[Matchup, Matchup]} props.matchups - Array of 2 matchups for current hole
 * @param {Function} props.onRecordResults - Callback to record hole results
 * @param {Player[]} props.players - Array of players for stats display
 */
function HoleScoring({ currentHole, matchups, onRecordResults, players }) {
  const [matchupResults, setMatchupResults] = useState([
    { ...matchups[0], result: null },
    { ...matchups[1], result: null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset results when hole changes
  useEffect(() => {
    setMatchupResults([
      { ...matchups[0], result: null },
      { ...matchups[1], result: null }
    ]);
    setIsSubmitting(false);
  }, [currentHole]);

  /**
   * Handle result selection for a matchup
   * @param {number} matchupIndex - Index of the matchup (0 or 1)
   * @param {'player1'|'player2'|'draw'} result - Selected result
   */
  const handleResultSelect = (matchupIndex, result) => {
    const newResults = [...matchupResults];
    newResults[matchupIndex] = {
      ...newResults[matchupIndex],
      result: result
    };
    setMatchupResults(newResults);
  };

  /**
   * Check if both matchups have results selected
   * @returns {boolean} True if both matchups are complete
   */
  const areBothMatchupsComplete = () => {
    return matchupResults.every(matchup => matchup.result !== null);
  };

  /**
   * Handle proceeding to next hole
   */
  const handleNextHole = async () => {
    if (!areBothMatchupsComplete()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onRecordResults(matchupResults);
    } catch (error) {
      console.error('Error recording results:', error);
      // Reset submitting state on error
      setIsSubmitting(false);
    }
  };

  /**
   * Get button class based on selection state
   * @param {boolean} isSelected - Whether this option is selected
   * @returns {string} CSS class name
   */
  const getButtonClass = (isSelected) => {
    return isSelected ? 'matchup-button selected' : 'matchup-button';
  };



  return (
    <div className="screen">
      <div className="container">
        {/* Hole Header */}
        <div className="hole-header">
          <h2 className="hole-title">Hole {currentHole}</h2>
          <div className="hole-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(currentHole / 18) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">{currentHole} of 18</span>
          </div>
        </div>

        {/* Matchups */}
        <div className="matchups-container">
          {matchupResults.map((matchup, index) => (
            <div key={index} className="matchup">
              <div className="matchup-header">
                <h3 className="matchup-title">Matchup {index + 1}</h3>
              </div>
              
              <div className="matchup-controls">
                <button
                  type="button"
                  className={getButtonClass(matchup.result === 'player1')}
                  onClick={() => handleResultSelect(index, 'player1')}
                  disabled={isSubmitting}
                >
                  {matchup.player1.name}
                </button>
                
                <button
                  type="button"
                  className={getButtonClass(matchup.result === 'draw')}
                  onClick={() => handleResultSelect(index, 'draw')}
                  disabled={isSubmitting}
                >
                  Draw
                </button>
                
                <button
                  type="button"
                  className={getButtonClass(matchup.result === 'player2')}
                  onClick={() => handleResultSelect(index, 'player2')}
                  disabled={isSubmitting}
                >
                  {matchup.player2.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Current Standings */}
        <div className="standings-card">
          <h3 className="standings-title">Current Standings</h3>
          <PointsTable 
            players={players}
            currentHole={currentHole}
            showWinnerHighlight={false}
          />
        </div>

        {/* Next Hole Button */}
        <div className="next-hole-container">

          
          <button
            type="button"
            className="next-hole-button"
            onClick={handleNextHole}
            disabled={!areBothMatchupsComplete() || isSubmitting}
          >
            {isSubmitting ? 'Recording Results...' : 
             currentHole === 18 ? 'Finish Match' : 'Next Hole'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HoleScoring;