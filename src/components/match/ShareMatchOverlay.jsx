import { useState, useEffect } from 'react'
import { getShareCode, createShareCode } from '../../utils/supabase-share-persistence.js'
import LoadingSpinner from '../common/LoadingSpinner.jsx'

/**
 * Full-screen overlay for displaying match share code
 * Uses cached shareCode from match state when available to avoid DB round-trip
 * @param {Object} props
 * @param {string} props.userId - The authenticated user's ID
 * @param {string|null} props.shareCode - Cached share code from match state
 * @param {Function} props.onShareCodeCreated - Callback when a new code is created (to cache it)
 * @param {Function} props.onClose - Callback to close the overlay
 */
export default function ShareMatchOverlay({ userId, shareCode: cachedCode, onShareCodeCreated, onClose }) {
  const [shareCode, setShareCode] = useState(cachedCode)
  const [loading, setLoading] = useState(!cachedCode)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  /**
   * Build the full share URL and copy to clipboard
   */
  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/view/${shareCode}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  useEffect(() => {
    // If we have a cached code, no need to fetch
    if (cachedCode) {
      setShareCode(cachedCode)
      setLoading(false)
      return
    }

    let isMounted = true

    async function initShareCode() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        let code = await getShareCode(userId)

        if (!code) {
          code = await createShareCode(userId)
        }

        if (isMounted) {
          if (code) {
            setShareCode(code)
            setError(null)
            // Cache the code in match state for future use
            onShareCodeCreated?.(code)
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
  }, [userId, cachedCode, onShareCodeCreated])

  return (
    <div className="overlay-container">
      <div className="overlay-header">
        <button
          type="button"
          className="overlay-back-button"
          onClick={onClose}
          aria-label="Close share"
        >
          &larr; Back
        </button>
        <h2 className="overlay-title">Share Match</h2>
        <div className="overlay-header-spacer"></div>
      </div>

      <div className="overlay-content">
        <div className="overlay-card share-overlay-card">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="share-overlay-error">{error}</div>
          ) : (
            <>
              <div className="share-overlay-label">Match Code</div>
              <div className="share-overlay-code">{shareCode}</div>
              <div className="share-overlay-hint">
                Share this code with others so they can view your match standings in real-time.
              </div>
              <button
                type="button"
                className="share-overlay-copy-button"
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy Share Link'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
