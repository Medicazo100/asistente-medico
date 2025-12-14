
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
            <p>© {new Date().getFullYear()} Dr. Gabriel Méndez Ortiz. Herramienta de apoyo educativo.</p>
        </footer>
    );
};

export default Footer;
