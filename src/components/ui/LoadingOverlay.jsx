import React from 'react';
import Icon from '../AppIcon';

const LoadingOverlay = ({ isOpen, message = 'Processing...', submessage = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-slideUp">
        {/* Spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon name="Loader" size={24} className="text-primary animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
        {submessage && (
          <p className="text-sm text-gray-600">{submessage}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
