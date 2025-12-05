import { useState, useEffect } from 'react';
import ErrorMessage from './common/ErrorMessage.jsx';
import LoadingSpinner from './common/LoadingSpinner.jsx';
import PageLayout from './common/PageLayout.jsx';
import Card from './common/Card.jsx';

/**
 * MatchSetup component for entering 4 player names and starting a match
 * @param {Object} props
 * @param {Function} props.onStartMatch - Callback function to start the match with player names
 * @param {Function} props.canResumeMatch - Async function to check if there is a saved match that can be resumed
 */
function MatchSetup({ onStartMatch, canResumeMatch }) {
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [errors, setErrors] = useState([]);
  const [duplicateIndices, setDuplicateIndices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);

  // Check if there's a saved match that can be resumed
  useEffect(() => {
    async function checkForSavedMatch() {
      try {
        const hasMatch = await canResumeMatch();
        setCanResume(hasMatch);
      } catch (error) {
        console.error('Error checking for saved match:', error);
        setCanResume(false);
      } finally {
        setCheckingResume(false);
      }
    }

    checkForSavedMatch();
  }, [canResumeMatch]);

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
      setDuplicateIndices([]);
    }
  };

  /**
   * Validate player names before starting match
   * @returns {string[]} Array of error messages, empty if valid
   */
  const validatePlayerNames = () => {
    const validationErrors = [];
    const duplicates = [];
    
    // Check for empty names
    const emptyNames = playerNames.some(name => !name.trim());
    if (emptyNames) {
      validationErrors.push('All player names must be filled in');
    }
    
    // Check for duplicate names and track which indices have duplicates
    const trimmedNames = playerNames.map(name => name.trim().toLowerCase());
    const nameMap = new Map();
    
    // Build a map of names to their indices
    trimmedNames.forEach((name, index) => {
      if (name) { // Only check non-empty names
        if (!nameMap.has(name)) {
          nameMap.set(name, []);
        }
        nameMap.get(name).push(index);
      }
    });
    
    // Find all indices that have duplicate names
    nameMap.forEach((indices) => {
      if (indices.length > 1) {
        duplicates.push(...indices);
      }
    });
    
    if (duplicates.length > 0) {
      validationErrors.push('All player names must be unique');
      setDuplicateIndices(duplicates);
    } else {
      setDuplicateIndices([]);
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
    setDuplicateIndices([]);
  };

  if (checkingResume) {
    return (
      <PageLayout>
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
        {canResume && (
          <Card
            title="Resume Match"
            description="You have a saved match in progress. Would you like to continue where you left off?"
            className="resume-card"
          >
            <div className="button-group">
              <button
                type="button"
                onClick={() => {
                  // Match state is already loaded by persistence layer
                  // No action needed - saved data is already displayed
                }}
                className="resume-match-button"
              >
                Resume Saved Match
              </button>
            </div>
          </Card>
        )}

        <Card
          title={canResume ? 'Or Start New Match' : 'Setup New Match'}
          description="Enter the names of all 4 players to begin your round robin golf match."
        >
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
                  className={`form-input ${duplicateIndices.includes(index) ? 'form-input-error' : ''}`}
                  placeholder={`Enter player ${index + 1} name`}
                  maxLength={30}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
              </div>
            ))}

            <ErrorMessage errors={errors} className="form-errors" />

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
        </Card>
    </PageLayout>
  );
}

export default MatchSetup;