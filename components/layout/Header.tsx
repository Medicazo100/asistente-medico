import React, { useState } from 'react';
import ThemeToggle from '../ui/ThemeToggle';
import QrModal from '../ui/QrModal';

interface HeaderProps {
    onNavigateHome: () => void;
    onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome, onToggleSidebar }) => {
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    return (
        <>
            <header className="bg-gradient-to-r from-emerald-400 to-teal-500 dark:from-purple-600 dark:to-pink-500 shadow-md sticky top-0 z-20 text-white">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between h-[65px]">
                     <div className="flex items-center gap-2">
                        {/* Hamburger menu for mobile */}
                        <button
                            onClick={onToggleSidebar}
                            className="md:hidden p-2 -ml-2 rounded-full hover:bg-white/20"
                            aria-label="Abrir menú"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <ThemeToggle />
                    </div>
                    <div className="flex items-center justify-center gap-3 cursor-pointer flex-grow text-center" onClick={onNavigateHome}>
                         <span className="text-3xl hidden md:block" role="img" aria-label="Stethoscope">⚕️</span>
                        <div>
                            <h1 className="text-xl font-bold">Asistente Médico</h1>
                            <p className="text-sm text-green-100 dark:text-pink-100 hidden sm:block">Hospital General de Apatzingán</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsQrModalOpen(true)}
                        className="w-10 h-10 p-2 rounded-full bg-pink-500 hover:bg-pink-600 dark:bg-pink-400 dark:hover:bg-pink-500 text-white focus:outline-none focus:ring-2 focus:ring-white transition-all transform hover:scale-105 shadow-md font-semibold"
                        aria-label="Mostrar QR"
                    >
                        QR
                    </button>
                </div>
            </header>
            {isQrModalOpen && <QrModal onClose={() => setIsQrModalOpen(false)} />}
        </>
    );
};

export default Header;