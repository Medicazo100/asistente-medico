import React, { useState, useRef, useEffect } from 'react';
import { editImage } from '../services/geminiService';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [originalImage, setOriginalImage] = useState<{ file: File, url: string } | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
        setIsKeySelected(true); // Optimistic update
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setOriginalImage({ file, url: URL.createObjectURL(file) });
            setEditedImageUrl(null);
            setError(null);
        }
    };

    const handleEdit = async () => {
        if (!prompt.trim()) {
            setError('Por favor, describe la edición que deseas realizar.');
            return;
        }
        if (!originalImage) {
            setError('Por favor, sube una imagen primero.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImageUrl(null);

        try {
            const base64Data = await fileToBase64(originalImage.file);
            const resultUrl = await editImage(prompt, base64Data, originalImage.file.type);
            setEditedImageUrl(resultUrl);
        } catch (e) {
            if (e instanceof Error && e.message.includes('Requested entity was not found')) {
                setError('La clave de API no es válida. Por favor, selecciona una clave válida para continuar.');
                setIsKeySelected(false);
            } else {
                setError('Error al editar la imagen. Inténtalo de nuevo.');
            }
            console.error(e);
        }
        setIsLoading(false);
    };
    
    const handleReset = () => {
        setPrompt('');
        setOriginalImage(null);
        setEditedImageUrl(null);
        setIsLoading(false);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    if (!isKeySelected) {
        return (
            <Card className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-blue-800 dark:text-cyan-300 mb-4">✨ Editor de Imágenes IA</h2>
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
        <Card className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-bold text-blue-800 dark:text-cyan-300">✨ Editor de Imágenes IA</h2>
                 {(originalImage || editedImageUrl || error || isLoading) && (
                     <button
                        onClick={handleReset}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 font-semibold py-1 px-3 rounded-lg"
                    >
                        Reset
                    </button>
                 )}
            </div>
            
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            
            <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">1. Sube una imagen.</p>
                    <div 
                        className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-purple-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {originalImage ? (
                            <img src={originalImage.url} alt="Original" className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center text-gray-500">
                                <p>Haz clic para subir</p>
                                <p className="text-sm">(PNG, JPG, etc.)</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

                    <p className="text-gray-600 dark:text-gray-400">2. Describe tu edición.</p>
                    <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Ej: Añade un filtro retro, elimina el fondo"
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg"
                        onKeyDown={e => e.key === 'Enter' && handleEdit}
                        disabled={!originalImage}
                    />

                    <button
                        onClick={handleEdit}
                        disabled={isLoading || !originalImage || !prompt}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
                    >
                        {isLoading ? 'Editando...' : 'Aplicar Edición'}
                    </button>
                </div>
                
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">3. Resultado.</p>
                    <div className="w-full h-96 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 rounded-lg flex items-center justify-center">
                        {isLoading && <LoadingSpinner />}
                        {editedImageUrl && !isLoading && (
                            <img src={editedImageUrl} alt="Editada" className="max-w-full max-h-full object-contain rounded-md" />
                        )}
                        {!editedImageUrl && !isLoading && (
                             <p className="text-gray-500">Aquí aparecerá la imagen editada.</p>
                        )}
                    </div>
                    {editedImageUrl && !isLoading && (
                        <a 
                            href={editedImageUrl} 
                            download={`edited-image-${Date.now()}.png`}
                            className="mt-4 w-full text-center inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Descargar Resultado
                        </a>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ImageEditor;