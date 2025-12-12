import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
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
import ShareCodeEntry from './components/spectator/ShareCodeEntry.jsx'
import SpectatorView from './components/spectator/SpectatorView.jsx'
import BurgerMenu from './components/match/BurgerMenu.jsx'
import StandingsOverlay from './components/match/StandingsOverlay.jsx'
import ShareMatchOverlay from './components/match/ShareMatchOverlay.jsx'

/**
 * Authenticated app flow - handles match management for logged-in users
 */
function AuthenticatedApp({ user, onSignOut }) {
  const {
    matchState,
    loading: matchLoading,
    error: matchError,
    startMatch,
    recordHoleResult,
    resetMatch,
    canResumeMatch,
    navigateToHole,
    updateHoleResult,
    getMatchupsForHole,
    setShareCode
  } = useMatchState(user);

  // Overlay states for standings and share
  const [showStandings, setShowStandings] = useState(false);
  const [showShare, setShowShare] = useState(false);

  if (matchLoading) {
    return (
      <div className="app">
        <main className="app-main">
          <LoadingSpinner />
        </main>
      </div>
    )
  }

  const isScoring = matchState.phase === 'scoring';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Round Robin Golf</h1>
          <div className="user-info">
            <img src="./RRGLogo.png" alt="RRG Logo" className="header-logo" />
            <BurgerMenu
              phase={matchState.phase}
              onSignOut={onSignOut}
              onEndMatch={isScoring ? resetMatch : undefined}
              onShowShare={() => setShowShare(true)}
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <ErrorMessage error={matchError} />

        {matchState.phase === 'setup' && (
          <MatchSetup
            onStartMatch={startMatch}
            canResumeMatch={canResumeMatch}
          />
        )}

        {matchState.phase === 'scoring' && (
          <HoleScoring
            currentHole={matchState.currentHole}
            maxHoleReached={matchState.maxHoleReached}
            matchups={getMatchupsForHole(matchState.currentHole)}
            onRecordResults={recordHoleResult}
            onNavigateToHole={navigateToHole}
            onUpdateHoleResult={updateHoleResult}
            players={matchState.players}
            onShowStandings={() => setShowStandings(true)}
          />
        )}

        {matchState.phase === 'complete' && (
          <FinalResults
            players={matchState.players}
            onNewMatch={resetMatch}
          />
        )}
      </main>

      {/* Standings Overlay */}
      {showStandings && (
        <StandingsOverlay
          players={matchState.players}
          currentHole={matchState.currentHole}
          onClose={() => setShowStandings(false)}
        />
      )}

      {/* Share Match Overlay */}
      {showShare && (
        <ShareMatchOverlay
          userId={user.id}
          shareCode={matchState.shareCode}
          onShareCodeCreated={setShareCode}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}

/**
 * Unauthenticated app flow - handles login/signup screens
 */
function UnauthenticatedApp() {
  const [authView, setAuthView] = useState('login')

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

function App() {
  const { user, loading, signOut } = useAuth()
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="app">
        <main className="app-main">
          <LoadingSpinner />
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
    <Routes>
      {/* Public spectator routes - no auth required */}
      <Route path="/view" element={<ShareCodeEntry />} />
      <Route path="/view/:code" element={<SpectatorView />} />

      {/* Main app route - auth required */}
      <Route
        path="/*"
        element={
          user
            ? <AuthenticatedApp user={user} onSignOut={handleSignOut} />
            : <UnauthenticatedApp />
        }
      />
    </Routes>
  )
}

export default App
