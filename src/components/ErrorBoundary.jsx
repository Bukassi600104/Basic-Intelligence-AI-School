import React from "react";
import Icon from "./AppIcon";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    error.__ErrorBoundary = true;
    window.__COMPONENT_ERROR__?.(error, errorInfo);
    console.error("❌ Error caught by ErrorBoundary:", error);
    console.error("📋 Error Info:", errorInfo);
  }

  render() {
    if (this.state?.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full border-2 border-red-300">
            <div className="flex justify-center items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px" viewBox="0 0 32 33" fill="none">
                <path d="M16 28.5C22.6274 28.5 28 23.1274 28 16.5C28 9.87258 22.6274 4.5 16 4.5C9.37258 4.5 4 9.87258 4 16.5C4 23.1274 9.37258 28.5 16 28.5Z" stroke="#dc2626" strokeWidth="2" strokeMiterlimit="10" />
                <path d="M11.5 15.5C12.3284 15.5 13 14.8284 13 14C13 13.1716 12.3284 12.5 11.5 12.5C10.6716 12.5 10 13.1716 10 14C10 14.8284 10.6716 15.5 11.5 15.5Z" fill="#dc2626" />
                <path d="M20.5 15.5C21.3284 15.5 22 14.8284 22 14C22 13.1716 21.3284 12.5 20.5 12.5C19.6716 12.5 19 13.1716 19 14C19 14.8284 19.6716 15.5 20.5 15.5Z" fill="#dc2626" />
                <path d="M21 22.5C19.9625 20.7062 18.2213 19.5 16 19.5C13.7787 19.5 12.0375 20.7062 11 22.5" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-red-600 mb-2">⚠️ Render Error</h1>
              <p className="text-gray-700 text-lg">An unexpected error occurred while rendering the page.</p>
            </div>
            <div className="bg-red-100 border border-red-300 rounded p-4 mb-6">
              <p className="text-red-800 font-mono text-sm break-words">
                {this.state?.error?.message || "Unknown error"}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors"
              >
                Go Home
              </button>
            </div>
            <p className="text-center text-gray-500 text-sm mt-6">
              Check the browser console (F12) for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props?.children;
  }
}

export default ErrorBoundary;