/**
 * Share code utilities for spectator access
 * Handles generation and validation of 4-digit share codes
 */

/**
 * Generate a random 4-digit share code (0000-9999)
 * @returns {string} 4-digit code with leading zeros preserved
 */
export function generateShareCode() {
  const code = Math.floor(Math.random() * 10000);
  return code.toString().padStart(4, '0');
}

/**
 * Validate share code format (4 digits, numeric only)
 * @param {string} code - The code to validate
 * @returns {boolean} True if valid format
 */
export function validateShareCodeFormat(code) {
  if (typeof code !== 'string') {
    return false;
  }
  return /^\d{4}$/.test(code);
}

/**
 * Normalize share code input (trim whitespace, ensure string)
 * @param {string} code - Raw code input
 * @returns {string} Normalized code
 */
export function normalizeShareCode(code) {
  if (typeof code !== 'string') {
    return '';
  }
  return code.trim();
}
