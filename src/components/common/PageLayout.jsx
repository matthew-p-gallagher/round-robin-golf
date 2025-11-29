/**
 * Reusable page layout wrapper component
 * Provides consistent screen/container structure across pages
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} [props.className] - Additional CSS class for the screen div
 */
export default function PageLayout({ children, className = '' }) {
  return (
    <div className={`screen ${className}`.trim()}>
      <div className="container">
        {children}
      </div>
    </div>
  )
}
