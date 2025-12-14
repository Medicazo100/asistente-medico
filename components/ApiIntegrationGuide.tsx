import React from 'react';
import Card from './ui/Card';

const ApiIntegrationGuide: React.FC = () => {
    return (
        <Card className="max-w-4xl mx-auto animate-fade-in-slow">
            <h2 className="text-3xl font-bold text-blue-900 dark:text-cyan-300 text-center mb-4">🔑 Guía de Integración de API Key</h2>
            <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-8">
                Para utilizar todas las funciones de IA de esta aplicación en tu despliegue de Vercel, necesitas configurar tu propia clave de API de Google AI Studio o Google Cloud de forma segura. Sigue estos pasos:
            </p>

            <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-semibold text-green-800 dark:text-pink-400">Paso 1: Ve a la Configuración de tu Proyecto en Vercel</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Inicia sesión en tu cuenta de Vercel y navega hasta el dashboard de tu proyecto. Una vez allí, haz clic en la pestaña <strong>"Settings"</strong> (Configuración).
                        </p>
                    </div>
                    <div className="flex-shrink-0 md:w-1/2">
                        <img src="/assets/vercel-step-1.png" alt="Dashboard de Vercel con la pestaña Settings resaltada" className="rounded-lg shadow-lg border dark:border-slate-700" />
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-6">
                    <div className="flex-1 space-y-2">
                        <h3 className="text-xl font-semibold text-green-800 dark:text-pink-400">Paso 2: Añade la Variable de Entorno</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            En el menú de configuración, busca y selecciona <strong>"Environment Variables"</strong> (Variables de Entorno). Aquí es donde guardarás tu clave de forma segura.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Crea una nueva variable con el nombre exacto <code className="bg-gray-200 dark:bg-slate-700 rounded px-1 font-mono text-sm">API_KEY</code>. En el campo del valor, pega tu clave de API que obtuviste de Google.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            Asegúrate de que la variable esté disponible en todos los entornos (Producción, Vista Previa y Desarrollo). Guarda los cambios.
                        </p>
                    </div>
                    <div className="flex-shrink-0 md:w-1/2">
                        <img src="/assets/vercel-step-2.png" alt="Sección de Environment Variables en Vercel mostrando cómo añadir la API_KEY" className="rounded-lg shadow-lg border dark:border-slate-700" />
                    </div>
                </div>
                
                {/* Step 3 */}
                <div className="text-center bg-blue-50 dark:bg-slate-800/50 p-6 rounded-lg border border-blue-200 dark:border-slate-700">
                     <h3 className="text-xl font-semibold text-green-800 dark:text-pink-400">Paso 3: Vuelve a Desplegar (Redeploy)</h3>
                     <p className="text-gray-600 dark:text-gray-400 mt-2">
                         Para que los cambios surtan efecto, Vercel necesita reconstruir tu aplicación. Ve a la pestaña <strong>"Deployments"</strong> y crea un nuevo despliegue (o "redeploy") de tu rama más reciente.
                     </p>
                     <p className="font-bold text-lg mt-4 text-blue-800 dark:text-cyan-300">¡Y listo! Tu aplicación ahora usará tu clave de API para todas las solicitudes a la API de Gemini.</p>
                </div>
            </div>
        </Card>
    );
};

export default ApiIntegrationGuide;