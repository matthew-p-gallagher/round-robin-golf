/**
 * Hook for spectator match viewing with auto-refresh
 * Fetches match data by share code and polls for updates
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getMatchByShareCode } from '../utils/supabase-share-persistence.js'

const POLL_INTERVAL = 15000 // 15 seconds

/**
 * @typedef {Object} SpectatorMatchState
 * @property {object|null} matchData - The match data (players, currentHole, phase, etc.)
 * @property {boolean} loading - Whether data is being loaded
 * @property {string|null} error - Error message if any
 * @property {Date|null} lastUpdated - Timestamp of last successful fetch
 * @property {function} refresh - Manual refresh function
 */

/**
 * Hook for spectator to view a match by share code
 * @param {string} shareCode - The 4-digit share code
 * @returns {SpectatorMatchState} The spectator match state
 */
export function useSpectatorMatch(shareCode) {
  const [matchData, setMatchData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)
  const pollIntervalRef = useRef(null)

  /**
   * Fetch match data from the server
   */
  const fetchMatch = useCallback(async (isInitialLoad = false) => {
    if (!shareCode) {
      setError('No share code provided')
      setLoading(false)
      return
    }

    // Only show loading spinner on initial load
    if (isInitialLoad) {
      setLoading(true)
    }

    try {
      const result = await getMatchByShareCode(shareCode)

      // Check if component is still mounted
      if (!isMountedRef.current) {
        return
      }

      if (result.error) {
        setError(result.error)
        setMatchData(null)
      } else {
        setError(null)
        setMatchData(result.matchData)
        setLastUpdated(new Date())
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError('Failed to load match')
        setMatchData(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [shareCode])

  /**
   * Manual refresh function
   */
  const refresh = useCallback(() => {
    fetchMatch(false)
  }, [fetchMatch])

  // Initial fetch and polling setup
  useEffect(() => {
    isMountedRef.current = true

    // Initial fetch
    fetchMatch(true)

    // Set up polling
    pollIntervalRef.current = setInterval(() => {
      fetchMatch(false)
    }, POLL_INTERVAL)

    // Cleanup
    return () => {
      isMountedRef.current = false
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [fetchMatch])

  return {
    matchData,
    loading,
    error,
    lastUpdated,
    refresh
  }
}
