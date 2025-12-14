
import React, { useState } from 'react';
import { generateQuickGuide } from '../services/geminiService';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';
import { marked } from 'marked';
import { GroundingSource } from '../types';

const getLinkText = (source: GroundingSource) => {
    if (source.title && source.title.trim() !== '') return source.title;
    try {
        return new URL(source.uri).hostname;
    } catch {
        return source.uri; // Fallback if URL is invalid
    }
};

const QuickGuides: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guide, setGuide] = useState<{ text: string, sources: GroundingSource[] } | null>(null);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Por favor, ingresa un tema.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGuide(null);
        try {
            const result = await generateQuickGuide(topic);
            setGuide(result);
        } catch (e) {
            setError('Error al generar la guía. Inténtalo de nuevo.');
            console.error(e);
        }
        setIsLoading(false);
    };

    const handleReset = () => {
        setTopic('');
        setGuide(null);
        setError(null);
        setIsLoading(false);
    };

    return (
        <Card className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-cyan-300">📚 Guías Rápidas de Consulta</h2>
                {guide && (
                     <button
                        onClick={handleReset}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 font-semibold py-1 px-3 rounded-lg"
                    >
                        Reset
                    </button>
                )}
            </div>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            
            <div className="space-y-4 mb-6">
                <p className="text-gray-600 dark:text-gray-400">Obtén un resumen práctico y basado en evidencia, con prioridad en Guías de Práctica Clínica Mexicanas.</p>
                <div className="flex items-center gap-2">
                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ej: Manejo de Crisis Hipertensiva" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-purple-500 transition-all duration-200" onKeyDown={e => e.key === 'Enter' && handleGenerate} />
                    <button onClick={handleGenerate} disabled={isLoading} className="bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700 dark:disabled:bg-purple-400 whitespace-nowrap">
                        {isLoading ? '...' : 'Buscar'}
                    </button>
                </div>
            </div>
            
            {isLoading && <LoadingSpinner />}
            
            {guide && (() => {
                const guideText = guide.text;
                const sourcesHeader = "### Fuentes";
                const sourcesIndex = guideText.lastIndexOf(sourcesHeader);

                const mainGuide = sourcesIndex !== -1 ? guideText.substring(0, sourcesIndex) : guideText;
                const infoSources = sourcesIndex !== -1 ? guideText.substring(sourcesIndex) : "";

                return (
                    <div className="animate-fade-in space-y-4">
                        <div>
                            <h3 className="text-xl font-bold text-green-800 dark:text-pink-400 mb-2">Guía Rápida para: {topic}</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border prose max-w-none dark:prose-invert dark:bg-slate-800 dark:border-slate-700"
                                dangerouslySetInnerHTML={{ __html: marked.parse(mainGuide) }}
                            />
                        </div>
                        
                        {(infoSources || guide.sources.length > 0) && (
                             <details className="pt-4 border-t dark:border-slate-700" open>
                                <summary className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 list-inside">
                                    Fuentes
                                </summary>
                                <div className="mt-2 space-y-4">
                                    {infoSources && (
                                        <div className="p-4 bg-gray-50 rounded-lg border prose max-w-none dark:prose-invert dark:bg-slate-800 dark:border-slate-700 break-words"
                                            dangerouslySetInnerHTML={{ __html: marked.parse(infoSources) }}
                                        />
                                    )}
                                    {guide.sources.length > 0 && (
                                        <div className="p-4 bg-gray-50 rounded-lg border dark:bg-slate-800 dark:border-slate-700">
                                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Fuentes de Google Search</h4>
                                            <ul className="list-disc list-inside text-sm mt-2 space-y-1 pl-4">
                                                {guide.sources.map((source, i) => (
                                                    <li key={i}>
                                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400 break-all">
                                                            {getLinkText(source)}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )}
                    </div>
                );
            })()}
        </Card>
    );
};

export default QuickGuides;
