import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ResetPassword({ onShowLogin }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await resetPassword(email)
      setSuccess('Password reset email sent! Check your inbox.')
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter your email to receive a password reset link</p>
        
        {success ? (
          <div className="auth-success">
            <p>{success}</p>
            <button 
              type="button" 
              className="auth-button primary"
              onClick={onShowLogin}
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email address"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="auth-links">
          <button 
            type="button" 
            className="link-button"
            onClick={onShowLogin}
            disabled={loading}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}