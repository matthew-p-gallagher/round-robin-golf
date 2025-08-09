import { useState } from 'react';

/**
 * MatchSetup component for entering 4 player names and starting a match
 * @param {Object} props
 * @param {Function} props.onStartMatch - Callback function to start the match with player names
 * @param {Function} props.onResumeMatch - Callback function to resume a saved match
 * @param {boolean} props.canResume - Whether there is a saved match that can be resumed
 */
function MatchSetup({ onStartMatch, onResumeMatch, canResume }) {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change for player name fields
   * @param {number} index - Index of the player name being changed
   * @param {string} value - New value for the player name
   */
  const handlePlayerNameChange = (index, value) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = value;
    setPlayerNames(newPlayerNames);
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  /**
   * Validate player names before starting match
   * @returns {string[]} Array of error messages, empty if valid
   */
  const validatePlayerNames = () => {
    const validationErrors = [];
    
    // Check for empty names
    const emptyNames = playerNames.some(name => !name.trim());
    if (emptyNames) {
      validationErrors.push('All player names must be filled in');
    }
    
    // Check for duplicate names
    const trimmedNames = playerNames.map(name => name.trim().toLowerCase());
    const uniqueNames = new Set(trimmedNames);
    if (uniqueNames.size !== 4) {
      validationErrors.push('All player names must be unique');
    }
    

    
    return validationErrors;
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validatePlayerNames();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors([]);
    
    try {
      // Trim names and pass to parent component
      const trimmedNames = playerNames.map(name => name.trim());
      await onStartMatch(trimmedNames);
    } catch (error) {
      setErrors([error.message || 'Failed to start match. Please try again.']);
      setIsSubmitting(false);
    }
  };

  /**
   * Clear all player names
   */
  const handleClear = () => {
    setPlayerNames(['', '', '', '']);
    setErrors([]);
  };

  /**
   * Handle resuming a saved match
   */
  const handleResumeMatch = () => {
    if (onResumeMatch) {
      onResumeMatch();
    }
  };

  return (
    <div className="screen">
      <div className="container">
        {canResume && (
          <div className="card resume-card">
            <div className="card-header">
              <h2 className="card-title">Resume Match</h2>
              <p>You have a saved match in progress. Would you like to continue where you left off?</p>
            </div>
            <div className="button-group">
              <button
                type="button"
                onClick={handleResumeMatch}
                className="resume-match-button"
              >
                Resume Saved Match
              </button>
            </div>
          </div>
        )}
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">{canResume ? 'Or Start New Match' : 'Setup New Match'}</h2>
            <p>Enter the names of all 4 players to begin your round robin golf match.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="match-setup-form" role="form">
            {playerNames.map((name, index) => (
              <div key={index} className="form-group">
                <label htmlFor={`player-${index + 1}`} className="form-label">
                  Player {index + 1}
                </label>
                <input
                  id={`player-${index + 1}`}
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  className="form-input"
                  placeholder={`Enter player ${index + 1} name`}
                  maxLength={30}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              </div>
            ))}
            
            {errors.length > 0 && (
              <div className="form-errors">
                {errors.map((error, index) => (
                  <div key={index} className="form-error">
                    {error}
                  </div>
                ))}
              </div>
            )}
            
            <div className="button-group">
              <button
                type="button"
                onClick={handleClear}
                className="secondary"
                disabled={isSubmitting}
              >
                Clear All
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="start-match-button"
              >
                {isSubmitting ? 'Starting Match...' : 'Start Match'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MatchSetup;