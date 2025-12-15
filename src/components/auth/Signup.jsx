import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthLayout from '../common/AuthLayout.jsx'
import EmailInput from '../common/EmailInput.jsx'
import PasswordInput from '../common/PasswordInput.jsx'
import ErrorMessage from '../common/ErrorMessage.jsx'
import SuccessMessage from '../common/SuccessMessage.jsx'
import { validatePassword } from '../../utils/validation.js'

export default function Signup({ onShowLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signUp } = useAuth()

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
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to start tracking your golf matches"
    >
      {success ? (
        <SuccessMessage
          message={success}
          action="Back to Log In"
          onAction={onShowLogin}
        />
      ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <EmailInput
              id="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
              required
            />

            <PasswordInput
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min 6 characters)"
              disabled={loading}
              autoComplete="new-password"
              required
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
              autoComplete="new-password"
              required
            />

            <ErrorMessage error={error} className="auth-error" />

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
    </AuthLayout>
  )
}