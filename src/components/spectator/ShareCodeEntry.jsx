import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../common/AuthLayout.jsx'
import ErrorMessage from '../common/ErrorMessage.jsx'
import { validateShareCodeFormat, normalizeShareCode } from '../../utils/share-code.js'

/**
 * Share code entry form for spectators
 * Validates the code format and navigates to the spectator view
 */
export default function ShareCodeEntry() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const normalizedCode = normalizeShareCode(code)

    if (!normalizedCode) {
      setError('Please enter a match code')
      return
    }

    if (!validateShareCodeFormat(normalizedCode)) {
      setError('Please enter a valid 4-digit code')
      return
    }

    setLoading(true)

    // Navigate to the spectator view
    // The SpectatorView component will validate the code against the database
    navigate(`/view/${normalizedCode}`)
  }

  /**
   * Handle code input change - only allow numeric input
   */
  const handleCodeChange = (e) => {
    const value = e.target.value
    // Only allow digits, max 4 characters
    if (/^\d{0,4}$/.test(value)) {
      setCode(value)
      setError('')
    }
  }

  return (
    <AuthLayout
      title="View Match"
      subtitle="Enter a 4-digit match code to view standings"
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-field">
          <label htmlFor="share-code" className="form-label">
            Match Code
          </label>
          <input
            id="share-code"
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={code}
            onChange={handleCodeChange}
            placeholder="0000"
            disabled={loading}
            className="share-code-input"
            autoComplete="off"
            autoFocus
          />
        </div>

        <ErrorMessage error={error} className="auth-error" />

        <button
          type="submit"
          className="auth-button primary"
          disabled={loading || code.length !== 4}
        >
          {loading ? 'Loading...' : 'View Standings'}
        </button>
      </form>

      <div className="auth-links">
        <div className="auth-divider">
          <span>Have an account?</span>
          <Link to="/" className="link-button">
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
