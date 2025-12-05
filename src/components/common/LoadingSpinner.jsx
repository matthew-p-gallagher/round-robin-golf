/**
 * Reusable loading spinner component
 *
 * @param {Object} props
 * @param {string} [props.message]
 */
export default function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" role="status" aria-label="Loading"></div>
    </div>
  )
}
