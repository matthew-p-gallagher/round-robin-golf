/**
 * Reusable error message component
 * Handles both single errors and error arrays
 *
 * @param {Object} props
 * @param {string} [props.error] - Single error message
 * @param {string[]} [props.errors] - Array of error messages
 * @param {string} [props.className] - Custom CSS class (default: 'error-message')
 */
export default function ErrorMessage({ error, errors, className = 'error-message' }) {
  // Return null if no errors
  if (!error && (!errors || errors.length === 0)) {
    return null
  }

  // Handle single error
  if (error) {
    return <div className={className}>{error}</div>
  }

  // Handle multiple errors
  return (
    <div className={className}>
      {errors.map((err, index) => (
        <div key={index}>{err}</div>
      ))}
    </div>
  )
}
