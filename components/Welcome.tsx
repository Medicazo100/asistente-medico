import React from 'react';
import { Section } from '../constants';
import Card from './ui/Card';

interface WelcomeProps {
    onSectionChange: (section: Section) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onSectionChange }) => {
    const sections = [
        { id: Section.Simulator, title: 'Simulador Médico', description: 'Genera y resuelve casos clínicos interactivos.', icon: '🩺' },
        { id: Section.Quiz, title: 'Quizzes Interactivos', description: 'Pon a prueba tus conocimientos con cuestionarios.', icon: '🧠' },
        { id: Section.Scores, title: 'Scores & Cálculos clínicos', description: 'Mejora tu práctica. Decide con certeza.', icon: '🧮' },
        { id: Section.Notes, title: 'Guías para Notas Médicas', description: 'Aprende a redactar notas SOAP efectivas.', icon: '📝' },
        { id: Section.Guides, title: 'Guías Rápidas', description: 'Consulta resúmenes de GPC y medicina basada en evidencia.', icon: '📚' },
        { id: Section.ChatBot, title: 'DoctorIA', description: 'Un Médico virtual apoyando a un médico real', icon: '💬' },
    ];

    return (
        <div className="space-y-8">
            <Card>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-blue-900 dark:text-cyan-300">¡Bienvenidos, futuros colegas!</h2>
                    <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                        Soy el <strong>Dr. Gabriel Méndez Ortiz</strong>, y con gran entusiasmo les presento esta herramienta, diseñada para ustedes. El año de internado es una etapa de transformación y aprendizaje inmenso. Mi objetivo es que aprovechen cada momento, fortalezcan su juicio clínico y se sientan más seguros en su práctica diaria. ¡Vamos a potenciar al máximo su año en nuestro Hospital General de Apatzingán!
                    </p>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {sections.map(section => (
                    <div
                        key={section.id}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-slate-700 text-center transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer hover:shadow-pink-500/20 dark:hover:shadow-cyan-400/20 flex flex-col justify-center items-center"
                        onClick={() => onSectionChange(section.id)}
                    >
                        <div className="text-5xl mb-4">{section.icon}</div>
                        <h3 className="text-xl font-bold text-green-800 dark:text-pink-400">{section.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{section.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Welcome;