import { Component } from 'react';

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when an error occurs
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when an error is caught
   * @param {Error} error - The error that was thrown
   * @returns {Object} New state
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Log error details when an error is caught
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - React error info with componentStack
   */
  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    // Update state with error info
    this.setState({
      errorInfo
    });

    // In production, you could send error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  /**
   * Reset error state and try again
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Reload the page to fully reset the app
   */
  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h1>Oops! Something went wrong</h1>
            <p className="error-message">
              We encountered an unexpected error. This has been logged for our team to investigate.
            </p>

            {this.state.error && (
              <details className="error-details">
                <summary>Error details</summary>
                <p className="error-text">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="error-stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="error-actions">
              <button
                onClick={this.handleReset}
                className="btn btn-primary"
                type="button"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="btn btn-secondary"
                type="button"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
