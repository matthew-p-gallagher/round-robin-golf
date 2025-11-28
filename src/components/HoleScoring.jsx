import { useState, useEffect } from 'react';
import PointsTable from './PointsTable.jsx';

/**
 * HoleScoring component for recording matchup results on each hole
 * @param {Object} props
 * @param {number} props.currentHole - Current hole number (1-18)
 * @param {number} props.maxHoleReached - Maximum hole reached in the match
 * @param {[Matchup, Matchup]} props.matchups - Array of 2 matchups for current hole
 * @param {Function} props.onRecordResults - Callback to record hole results
 * @param {Function} props.onNavigateToHole - Callback to navigate to a specific hole
 * @param {Function} props.onUpdateHoleResult - Callback to update results for a specific hole
 * @param {Player[]} props.players - Array of players for stats display
 */
function HoleScoring({ 
  currentHole, 
  maxHoleReached = currentHole, // Default to currentHole if not provided
  matchups, 
  onRecordResults, 
  onNavigateToHole = () => {}, // Default empty function for tests
  onUpdateHoleResult = () => {}, // Default empty function for tests
  players 
}) {
  const [matchupResults, setMatchupResults] = useState([
    { ...matchups[0], result: matchups[0].result || null },
    { ...matchups[1], result: matchups[1].result || null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // null, 'saving', 'saved'

  // Reset results when hole changes or matchups change
  useEffect(() => {
    setMatchupResults([
      { ...matchups[0], result: matchups[0].result || null },
      { ...matchups[1], result: matchups[1].result || null }
    ]);
    setIsSubmitting(false);
  }, [currentHole, matchups]);

  /**
   * Handle result selection for a matchup
   * @param {number} matchupIndex - Index of the matchup (0 or 1)
   * @param {'player1'|'player2'|'draw'} result - Selected result
   */
  const handleResultSelect = async (matchupIndex, result) => {
    const newResults = [...matchupResults];
    newResults[matchupIndex] = {
      ...newResults[matchupIndex],
      result: result
    };
    setMatchupResults(newResults);

    // Check if both matchups are now complete and auto-save
    const bothComplete = newResults.every(matchup => matchup.result !== null);
    if (bothComplete) {
      await handleAutoSave(newResults);
    }
  };

/**
* Handle automatic saving when both matchups are complete
* @param {Array} results - Array of 2 matchup results
*/
const handleAutoSave = async (results) => {
setAutoSaveStatus('saving');

try {
  if (currentHole === maxHoleReached) {
    // Recording new results - add delay before auto-advancing
    setTimeout(async () => {
      await onRecordResults(results);
    }, 800); // 1 second delay
  } else {
    // Updating existing results
    await onUpdateHoleResult(currentHole, results);
  }
  
  setAutoSaveStatus('saved');
  // Clear the saved status after 2 seconds
  setTimeout(() => setAutoSaveStatus(null), 2000);
} catch (error) {
  console.error('Error auto-saving results:', error);
  setAutoSaveStatus(null);
}
};

  /**
   * Check if both matchups have results selected
   * @returns {boolean} True if both matchups are complete
   */
  const areBothMatchupsComplete = () => {
    return matchupResults.every(matchup => matchup.result !== null);
  };

  /**
   * Handle navigating to previous hole
   */
  const handlePreviousHole = () => {
    if (currentHole > 1) {
      onNavigateToHole(currentHole - 1);
    }
  };

  /**
   * Handle navigating to next hole
   */
  const handleNextHole = () => {
    if (currentHole < maxHoleReached) {
      onNavigateToHole(currentHole + 1);
    }
  };

  /**
   * Handle proceeding to next hole (recording results)
   */
  const handleRecordAndProceed = async () => {
    if (!areBothMatchupsComplete()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (currentHole === maxHoleReached) {
        // Recording new results
        await onRecordResults(matchupResults);
      } else {
        // Updating existing results
        await onUpdateHoleResult(currentHole, matchupResults);
      }
    } catch (error) {
      console.error('Error recording results:', error);
      // Reset submitting state on error
      setIsSubmitting(false);
    }
  };

  /**
   * Check if we're viewing a completed hole (not the current frontier)
   * @returns {boolean} True if viewing a previously completed hole
   */
  const isViewingCompletedHole = () => {
    return currentHole < maxHoleReached;
  };

  /**
   * Check if we can navigate to the next hole
   * @returns {boolean} True if next hole navigation is allowed
   */
  const canNavigateNext = () => {
    return currentHole < maxHoleReached;
  };

  /**
   * Check if we can proceed to record results for next hole
   * @returns {boolean} True if we can record and proceed
   */
  const canRecordAndProceed = () => {
    return areBothMatchupsComplete() && currentHole === maxHoleReached;
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
        {/* Hole Header with Navigation */}
        <div className="hole-header">
          <div className="hole-navigation">
            <button
              type="button"
              className="nav-button nav-button-prev"
              onClick={handlePreviousHole}
              disabled={currentHole === 1 || isSubmitting}
            >
              ← Previous
            </button>
            
            <div className="hole-info">
              <h2 className="hole-title">Hole {currentHole}</h2>
            </div>
            
            <button
              type="button"
              className="nav-button nav-button-next"
              onClick={handleNextHole}
              disabled={!canNavigateNext() || isSubmitting}
            >
              Next →
            </button>
          </div>
          
          <div className="hole-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentHole - 1) / 18) * 100}%` }}
              >
                <img 
                  src="./flag.png" 
                  alt="Progress marker" 
                  className="progress-flag"
                />
              </div>
            </div>
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

        
      </div>
    </div>
  );
}

export default HoleScoring;