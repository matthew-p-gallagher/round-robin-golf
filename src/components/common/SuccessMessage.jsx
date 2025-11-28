/**
 * Reusable success message component
 * Displays success message with optional action button
 *
 * @param {Object} props
 * @param {string} [props.message] - Success message to display
 * @param {string} [props.action] - Action button text
 * @param {Function} [props.onAction] - Action button click handler
 * @param {string} [props.className] - Custom CSS class (default: 'auth-success')
 */
export default function SuccessMessage({ message, action, onAction, className = 'auth-success' }) {
  // Return null if no message
  if (!message) {
    return null
  }

  return (
    <div className={className}>
      <p>{message}</p>
      {action && onAction && (
        <button
          type="button"
          className="auth-button primary"
          onClick={onAction}
        >
          {action}
        </button>
      )}
    </div>
  )
}
