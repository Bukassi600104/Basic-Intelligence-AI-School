import React from 'react';
import { logger } from '../../utils/logger';

class NotificationWizardError extends React.Component {
  state = { 
    hasError: false, 
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error to our monitoring system
    logger.error('Notification Wizard Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-red-700 mb-4">
                Something went wrong
              </h2>
              <p className="text-red-600 mb-4">
                We encountered an error while loading the notification wizard. Our team has been notified.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4">
                  <p className="font-mono text-sm text-red-800 whitespace-pre-wrap">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="mt-2 p-4 bg-red-100 rounded overflow-x-auto text-xs text-red-800">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NotificationWizardError;