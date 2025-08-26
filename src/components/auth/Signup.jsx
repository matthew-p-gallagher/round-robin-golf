import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Signup({ onShowLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signUp } = useAuth()

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await signUp(email, password)
      setSuccess('Account created! Please check your email to verify your account.')
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to start tracking your golf matches</p>
        
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
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Create a password (min 6 characters)"
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                placeholder="Confirm your password"
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button 
              type="submit" 
              className="auth-button primary"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div className="auth-links">
          <div className="auth-divider">
            <span>Already have an account?</span>
            <button 
              type="button" 
              className="link-button"
              onClick={onShowLogin}
              disabled={loading}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}