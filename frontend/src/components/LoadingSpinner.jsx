import React from 'react';

function LoadingSpinner({ message = 'Loading...', size = 'medium' }) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin`}></div>
      {message && <p className="mt-4 text-gray-600 font-medium">{message}</p>}
    </div>
  );
}

export default LoadingSpinner;
