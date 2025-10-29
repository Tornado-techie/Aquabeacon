// File: client/src/components/LoadingSpinner.jsx

import React from 'react';

const LoadingSpinner = ({ size = 'large', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <h2 className="text-xl font-semibold text-gray-900">{message}</h2>
        <p className="text-gray-600 mt-2">Please wait while we load your content</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;