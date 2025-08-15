import './App.css'
import { useMatchState } from './hooks/useMatchState.js'
import MatchSetup from './components/MatchSetup.jsx'
import HoleScoring from './components/HoleScoring.jsx'
import FinalResults from './components/FinalResults.jsx'

function App() {
  const { 
    matchState, 
    startMatch, 
    getCurrentMatchups, 
    recordHoleResult, 
    resetMatch, 
    canResumeMatch,
    navigateToHole,
    updateHoleResult,
    getMatchupsForHole
  } = useMatchState();

  /**
   * Handle starting a new match with player names
   * @param {string[]} playerNames - Array of 4 player names
   */
  const handleStartMatch = async (playerNames) => {
    try {
      startMatch(playerNames);
    } catch (error) {
      // Re-throw error to be handled by MatchSetup component
      throw error;
    }
  };

  /**
   * Handle resuming a saved match
   * The match state is already loaded from localStorage in useMatchState
   */
  const handleResumeMatch = () => {
    // The match state is already loaded, no additional action needed
    // The component will re-render with the loaded state
  };

  /**
   * Handle recording hole results and advancing to next hole
   * @param {Array} matchupResults - Array of 2 matchup results
   */
  const handleRecordResults = async (matchupResults) => {
    try {
      recordHoleResult(matchupResults);
    } catch (error) {
      // Re-throw error to be handled by HoleScoring component
      throw error;
    }
  };

  return (
    <div className="app">
      <main className="app-main">
        {matchState.phase === 'setup' && (
          <MatchSetup 
            onStartMatch={handleStartMatch}
            onResumeMatch={handleResumeMatch}
            canResume={canResumeMatch()}
          />
        )}
        
        {matchState.phase === 'scoring' && (
          <HoleScoring
            currentHole={matchState.currentHole}
            maxHoleReached={matchState.maxHoleReached}
            matchups={getMatchupsForHole(matchState.currentHole)}
            onRecordResults={handleRecordResults}
            onNavigateToHole={navigateToHole}
            onUpdateHoleResult={updateHoleResult}
            players={matchState.players}
          />
        )}
        
        {matchState.phase === 'complete' && (
          <FinalResults
            players={matchState.players}
            onNewMatch={resetMatch}
          />
        )}
      </main>
    </div>
  )
}

export default App
