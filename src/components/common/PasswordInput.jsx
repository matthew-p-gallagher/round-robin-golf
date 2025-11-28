import { useState } from 'react'

/**
 * Reusable password input component with show/hide toggle
 *
 * @param {Object} props
 * @param {string} props.id - Input field ID
 * @param {string} props.label - Label text
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.disabled] - Disabled state
 * @param {string} [props.autoComplete] - Autocomplete attribute
 * @param {boolean} [props.autoFocus] - Auto focus on mount
 * @param {boolean} [props.required] - Required field
 */
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = '',
  disabled = false,
  autoComplete = 'current-password',
  autoFocus = false,
  required = false
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="password-input-wrapper">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="form-input"
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required={required}
        />
        {value && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
    </div>
  )
}
