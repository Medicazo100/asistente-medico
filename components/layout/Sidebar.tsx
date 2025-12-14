import React from 'react';
import { Section } from '../../constants';

interface SidebarProps {
    activeSection: Section;
    onSectionChange: (section: Section) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
    { id: Section.Welcome, title: 'Inicio', icon: '🏠' },
    { id: Section.Simulator, title: 'Simulador Médico', icon: '🩺' },
    { id: Section.Quiz, title: 'Quizzes Interactivos', icon: '🧠' },
    { id: Section.Scores, title: 'Scores & Cálculos', icon: '🧮' },
    { id: Section.Notes, title: 'Guías para Notas', icon: '📝' },
    { id: Section.Guides, title: 'Guías Rápidas', icon: '📚' },
    { id: Section.ChatBot, title: 'DoctorIA', icon: '💬' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, isOpen, setIsOpen }) => {
    const handleSectionClick = (section: Section) => {
        onSectionChange(section);
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 768) { 
            setIsOpen(false);
        }
    };
    
    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            ></div>

            <aside className={`fixed top-0 left-0 h-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl border-r border-gray-200 dark:border-slate-700 w-64 z-40 transform transition-transform md:relative md:translate-x-0 md:shadow-lg ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex items-center justify-center gap-2 border-b dark:border-slate-700 cursor-pointer h-[65px]" onClick={() => handleSectionClick(Section.Welcome)}>
                     <span className="text-3xl" role="img" aria-label="Stethoscope">⚕️</span>
                     <h2 className="text-lg font-bold text-blue-900 dark:text-cyan-300">Asistente Médico</h2>
                </div>
                <nav className="p-2">
                    <ul className="space-y-1">
                        {navItems.map(item => (
                            <li key={item.id}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleSectionClick(item.id);
                                    }}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                                        activeSection === item.id
                                            ? 'bg-blue-100 text-blue-800 dark:bg-purple-900/50 dark:text-purple-200'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span className="text-xl w-6 text-center">{item.icon}</span>
                                    <span>{item.title}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;