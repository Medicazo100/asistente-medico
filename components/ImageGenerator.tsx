
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isKeySelected, setIsKeySelected] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        await (window as any).aistudio.openSelectKey();
        // Optimistically assume key is selected to improve UX
        setIsKeySelected(true);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Por favor, ingresa una descripción para la imagen.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        try {
            const result = await generateImage(prompt);
            setImageUrl(result);
        } catch (e) {
             if (e instanceof Error && e.message.includes('Requested entity was not found')) {
                setError('La clave de API no es válida. Por favor, selecciona una clave válida para continuar.');
                setIsKeySelected(false);
            } else {
                setError('Error al generar la imagen. Inténtalo de nuevo.');
            }
            console.error(e);
        }
        setIsLoading(false);
    };

    const handleReset = () => {
        setPrompt('');
        setImageUrl(null);
        setError(null);
        setIsLoading(false);
    };

    if (!isKeySelected) {
        return (
            <Card className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-cyan-300 mb-4">🖼️ Generador de Imágenes</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Esta función utiliza modelos de IA avanzados que requieren una clave de API con facturación habilitada.
                </p>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-500">
                    Para obtener más información sobre la facturación, visita la{' '}
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        documentación de facturación de la API de Gemini
                    </a>.
                </p>
                <button
                    onClick={handleSelectKey}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                    Seleccionar Clave de API
                </button>
                 {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-blue-800 dark:text-cyan-300">🖼️ Generador de Imágenes</h2>
                 {(imageUrl || error || isLoading) && (
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
                <p className="text-gray-600 dark:text-gray-400">Describe la imagen que quieres crear. Puedes generar desde ilustraciones médicas hasta arte conceptual.</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Ej: Un cerebro humano con redes neuronales iluminadas"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg"
                        onKeyDown={e => e.key === 'Enter' && handleGenerate}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
                    >
                        {isLoading ? '...' : 'Generar'}
                    </button>
                </div>
            </div>
            {isLoading && <LoadingSpinner />}
            {imageUrl && (
                <div className="mt-6 text-center animate-fade-in">
                    <h3 className="text-lg font-semibold mb-4">Imagen Generada:</h3>
                    <img src={imageUrl} alt={prompt} className="rounded-lg shadow-lg mx-auto max-w-full h-auto" />
                     <a 
                        href={imageUrl} 
                        download={`generated-image-${Date.now()}.jpg`}
                        className="mt-4 inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Descargar
                    </a>
                </div>
            )}
        </Card>
    );
};

export default ImageGenerator;