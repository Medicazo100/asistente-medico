
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:border-slate-700 ${className}`}>
            {children}
        </div>
    );
};

export default Card;
