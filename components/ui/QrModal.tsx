
import React, { useEffect } from 'react';

interface QrModalProps {
    onClose: () => void;
}

const QrModal: React.FC<QrModalProps> = ({ onClose }) => {
    const appUrl = "https://asistente-m-dico-para-internos-web-788092376733.us-west1.run.app/";
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${appUrl}`;

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-xs w-full relative transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 flex justify-center items-center text-gray-600 dark:text-gray-300"
                    aria-label="Cerrar modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-cyan-300 mb-2">Código QR del Asistente</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Escanea este código para compartir.</p>
                    <div className="p-4 bg-gray-100 dark:bg-slate-700 rounded-lg inline-block">
                        <img
                            src={qrUrl}
                            alt="Código QR"
                            className="w-52 h-52 md:w-56 md:h-56"
                            onError={(e) => { (e.target as HTMLImageElement).alt = "Error al cargar QR."; }}
                        />
                    </div>
                    <a
                        href={appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-gray-500 dark:text-gray-400 mt-3 break-all hover:underline"
                    >
                        {appUrl}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default QrModal;