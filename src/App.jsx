import { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './context/AuthContext.jsx'
import { useMatchState } from './hooks/useMatchState.js'
import Login from './components/auth/Login.jsx'
import Signup from './components/auth/Signup.jsx'
import ResetPassword from './components/auth/ResetPassword.jsx'
import UpdatePassword from './components/auth/UpdatePassword.jsx'
import MatchSetup from './components/MatchSetup.jsx'
import HoleScoring from './components/HoleScoring.jsx'
import FinalResults from './components/FinalResults.jsx'
import ErrorMessage from './components/common/ErrorMessage.jsx'
import LoadingSpinner from './components/common/LoadingSpinner.jsx'

function App() {
  const { user, loading, signOut } = useAuth()
  const [authView, setAuthView] = useState('login')
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  
  const {
    matchState,
    loading: matchLoading,
    error: matchError,
    startMatch,
    getCurrentMatchups,
    recordHoleResult,
    resetMatch,
    canResumeMatch,
    navigateToHole,
    updateHoleResult,
    getMatchupsForHole
  } = useMatchState(user);

  // Detect password recovery mode from URL hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      setIsRecoveryMode(true)
    }
  }, [])

  /**
   * Handle password update completion
   */
  const handlePasswordUpdated = () => {
    // Clear the hash and recovery mode
    window.location.hash = ''
    setIsRecoveryMode(false)
  }

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
   * The match state is already loaded from Supabase/localStorage in useMatchState
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || matchLoading) {
    return (
      <div className="app">
        <main className="app-main">
          <LoadingSpinner />
        </main>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        <main className="app-main">
          {authView === 'login' && (
            <Login
              onShowSignup={() => setAuthView('signup')}
              onShowResetPassword={() => setAuthView('reset')}
            />
          )}
          {authView === 'signup' && (
            <Signup
              onShowLogin={() => setAuthView('login')}
            />
          )}
          {authView === 'reset' && (
            <ResetPassword
              onShowLogin={() => setAuthView('login')}
            />
          )}
        </main>
      </div>
    )
  }

  // Show password update form if in recovery mode
  if (isRecoveryMode) {
    return (
      <div className="app">
        <main className="app-main">
          <UpdatePassword onPasswordUpdated={handlePasswordUpdated} />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Round Robin Golf</h1>
          <div className="user-info">
            <span>{user.email}</span>
            <button onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <ErrorMessage error={matchError} />

        {matchState.phase === 'setup' && (
          <MatchSetup
            onStartMatch={handleStartMatch}
            onResumeMatch={handleResumeMatch}
            canResumeMatch={canResumeMatch}
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
