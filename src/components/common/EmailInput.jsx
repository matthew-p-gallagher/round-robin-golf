/**
 * Reusable email input component
 *
 * @param {Object} props
 * @param {string} props.id - Input field ID
 * @param {string} props.label - Label text
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.disabled] - Disabled state
 * @param {boolean} [props.autoFocus] - Auto focus on mount
 * @param {boolean} [props.required] - Required field
 */
export default function EmailInput({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  autoFocus = false,
  required = false
}) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        type="email"
        value={value}
        onChange={onChange}
        className="form-input"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="email"
        autoFocus={autoFocus}
        required={required}
      />
    </div>
  )
}
