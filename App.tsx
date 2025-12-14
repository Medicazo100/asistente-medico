import React, { useState, useMemo } from 'react';
import { Section } from './constants';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Welcome from './components/Welcome';
import MedicalSimulator from './components/MedicalSimulator';
import QuizGenerator from './components/QuizGenerator';
import NoteGuide from './components/NoteGuide';
import QuickGuides from './components/QuickGuides';
import ChatBot from './components/ChatBot';
import ClinicalScores from './components/ClinicalScores';
import Sidebar from './components/layout/Sidebar';

const App: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>(Section.Welcome);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // useMemo ensures component instances are created only once, preserving their state
    const sections = useMemo(() => [
        { id: Section.Welcome, Component: <Welcome onSectionChange={setActiveSection} /> },
        { id: Section.Simulator, Component: <MedicalSimulator /> },
        { id: Section.Quiz, Component: <QuizGenerator /> },
        { id: Section.Notes, Component: <NoteGuide /> },
        { id: Section.Guides, Component: <QuickGuides /> },
        { id: Section.Scores, Component: <ClinicalScores /> },
        { id: Section.ChatBot, Component: <ChatBot /> },
    ], []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 text-gray-800 dark:from-indigo-900 dark:via-slate-900 dark:to-purple-900 dark:text-gray-200 flex">
            <Sidebar 
                activeSection={activeSection} 
                onSectionChange={setActiveSection}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="flex-1 flex flex-col min-w-0">
                <Header 
                    onNavigateHome={() => setActiveSection(Section.Welcome)} 
                    onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                />
                <main className="container mx-auto px-4 py-8 flex-grow">
                    {sections.map(({ id, Component }) => (
                        <div
                            key={id}
                            className={activeSection === id ? 'animate-fade-in' : 'hidden'}
                        >
                            {Component}
                        </div>
                    ))}
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;