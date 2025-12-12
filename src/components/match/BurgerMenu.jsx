import { useState, useEffect } from 'react'

/**
 * Burger menu component for app header
 * Provides access to share, end match and sign out
 * @param {Object} props
 * @param {string} props.phase - Current match phase ('setup' | 'scoring' | 'complete')
 * @param {Function} props.onSignOut - Callback to sign out
 * @param {Function} [props.onEndMatch] - Callback to end match (scoring phase only)
 * @param {Function} [props.onShowShare] - Callback to show share overlay (scoring phase only)
 */
export default function BurgerMenu({
  phase,
  onSignOut,
  onEndMatch,
  onShowShare
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [confirmingAction, setConfirmingAction] = useState(null) // null | 'signOut' | 'endMatch'

  // Auto-reset confirmation after 2 seconds
  useEffect(() => {
    if (confirmingAction) {
      const timeout = setTimeout(() => {
        setConfirmingAction(null)
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [confirmingAction])

  const handleToggle = () => {
    if (isOpen) {
      // Closing menu - reset confirmation state
      setConfirmingAction(null)
    }
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
    setConfirmingAction(null)
  }

  const handleEndMatchClick = () => {
    if (confirmingAction === 'endMatch') {
      // Second click - perform action
      handleClose()
      onEndMatch?.()
    } else {
      // First click - ask for confirmation
      setConfirmingAction('endMatch')
    }
  }

  const handleSignOutClick = () => {
    if (confirmingAction === 'signOut') {
      // Second click - perform action
      handleClose()
      onSignOut?.()
    } else {
      // First click - ask for confirmation
      setConfirmingAction('signOut')
    }
  }

  const handleShareClick = () => {
    handleClose()
    onShowShare?.()
  }

  const isScoring = phase === 'scoring'

  return (
    <div className="burger-menu">
      <button
        type="button"
        className="burger-menu-button"
        onClick={handleToggle}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>

      {isOpen && (
        <>
          <div
            className="burger-menu-backdrop"
            onClick={handleClose}
          />
          <div className="burger-menu-dropdown">
            {/* Share option - scoring phase only */}
            {isScoring && (
              <>
                <button
                  type="button"
                  className="burger-menu-item"
                  onClick={handleShareClick}
                >
                  Share Match
                </button>
                <div className="burger-menu-divider" />
              </>
            )}

            {/* End match option - scoring phase only */}
            {isScoring && (
              <>
                <button
                  type="button"
                  className={`burger-menu-item ${confirmingAction === 'endMatch' ? 'confirming' : ''}`}
                  onClick={handleEndMatchClick}
                >
                  {confirmingAction === 'endMatch' ? 'Are you sure?' : 'End Match'}
                </button>
                <div className="burger-menu-divider" />
              </>
            )}

            {/* Always available */}
            <button
              type="button"
              className={`burger-menu-item ${confirmingAction === 'signOut' ? 'confirming' : ''}`}
              onClick={handleSignOutClick}
            >
              {confirmingAction === 'signOut' ? 'Are you sure?' : 'Sign Out'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
