import { useState, useEffect } from 'react'
import { getShareCode, createShareCode } from '../../utils/supabase-share-persistence.js'

/**
 * Share code display component for match owners
 * Auto-generates a code on first render and displays it prominently
 * @param {Object} props
 * @param {string} props.userId - The authenticated user's ID
 */
export default function ShareCodeDisplay({ userId }) {
  const [shareCode, setShareCode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load or create share code on mount
  useEffect(() => {
    let isMounted = true

    async function initShareCode() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        // First, try to get existing code
        let code = await getShareCode(userId)

        // If no code exists, create one
        if (!code) {
          code = await createShareCode(userId)
        }

        if (isMounted) {
          if (code) {
            setShareCode(code)
            setError(null)
          } else {
            setError('Failed to generate code')
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load share code')
          setLoading(false)
        }
      }
    }

    initShareCode()

    return () => {
      isMounted = false
    }
  }, [userId])

  // Don't render anything if no userId
  if (!userId) {
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="share-code-card">
        <div className="share-code-loading">Loading match code...</div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="share-code-card">
        <div className="share-code-error">{error}</div>
      </div>
    )
  }

  // Display the share code
  return (
    <div className="share-code-card">
      <div className="share-code-label">Match Code</div>
      <div className="share-code-value">{shareCode}</div>
      <div className="share-code-hint">
        Others can view standings at /view
      </div>
    </div>
  )
}
