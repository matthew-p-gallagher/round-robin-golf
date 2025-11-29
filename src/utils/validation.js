/**
 * Validation utilities for form inputs
 */

/**
 * Validate password meets minimum requirements
 * @param {string} password - Password to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validatePassword(password) {
  if (password.length < 6) {
    return 'Password must be at least 6 characters long'
  }
  return null
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  return null
}
