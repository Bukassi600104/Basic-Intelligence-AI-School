import React from 'react';
import Icon from '../AppIcon';

const ErrorMessage = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <Icon 
            name="AlertCircle" 
            size={24} 
            className="text-red-600" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-red-800">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-red-700">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;