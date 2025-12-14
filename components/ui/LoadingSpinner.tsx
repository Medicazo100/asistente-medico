
import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-blue-500 dark:border-purple-500"></div>
        </div>
    );
};

export default LoadingSpinner;
