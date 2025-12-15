/**
 * Reusable layout wrapper for authentication pages
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle/description
 * @param {React.ReactNode} props.children - Page content
 * @param {boolean} props.showLogo - Whether to show the logo (default: true)
 */
export default function AuthLayout({ title, subtitle, children, showLogo = true }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        {showLogo && (
          <div className="auth-logo-container">
            <img src="/RRGLogo.png" alt="Round Robin Golf" className="auth-logo" />
          </div>
        )}
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  )
}
