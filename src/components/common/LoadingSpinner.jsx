/**
 * Reusable loading spinner component
 *
 * @param {Object} props
 * @param {string} [props.message] - Loading message to display (default: "Loading...")
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  )
}
