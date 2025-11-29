/**
 * Reusable card wrapper component
 * Provides consistent card structure with optional header
 *
 * @param {Object} props
 * @param {string} [props.title] - Card title
 * @param {string} [props.description] - Card description
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes for the card
 */
export default function Card({ title, description, children, className = '' }) {
  return (
    <div className={`card ${className}`.trim()}>
      {(title || description) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {description && <p>{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
