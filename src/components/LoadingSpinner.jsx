import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-background-light dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Smart Bus Tracker...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

