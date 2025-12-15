import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import AuthLayout from '../common/AuthLayout.jsx'
import EmailInput from '../common/EmailInput.jsx'
import ErrorMessage from '../common/ErrorMessage.jsx'
import SuccessMessage from '../common/SuccessMessage.jsx'

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
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a password reset link"
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
              placeholder="Enter your email address"
              disabled={loading}
              required
            />

            <ErrorMessage error={error} className="auth-error" />

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
            Back to Log In
          </button>
        </div>
    </AuthLayout>
  )
}