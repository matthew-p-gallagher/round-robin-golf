/**
 * Reusable loading spinner component
 *
 * @param {Object} props
 * @param {string} [props.message] - Loading message to display (default: "Loading...")
 */
export default function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  )
}
