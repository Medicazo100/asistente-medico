import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, ClinicalCase, LabResult, ImagingResult, GroundingSource } from '../types';

function getAi(): GoogleGenAI {
    // CRITICAL: Create a new instance every time to ensure the latest API key
    // selected via window.aistudio.openSelectKey() is used.
    // Do not cache the instance.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

// Helper function for robust JSON parsing
function safeJsonParse(jsonString: string): any {
    try {
        const trimmedString = jsonString.trim();
        if (!trimmedString) {
            throw new Error("Received empty response from the AI model.");
        }
        return JSON.parse(trimmedString);
    } catch (e: any) {
        console.error("Failed to parse JSON response:", e.message);
        console.error("Raw API response text:", jsonString);
        throw new Error(`Failed to parse the response from the AI model. Details: ${e.message}`);
    }
}

export async function generateQuiz(topic: string, difficulty: string, numQuestions: number): Promise<QuizQuestion[]> {
    const difficultyDescriptions: { [key: string]: string } = {
        'Interno': 'con un nivel de dificultad para un médico interno en sus primeras rotaciones. Las preguntas deben cubrir conceptos fundamentales, presentaciones clínicas típicas y tratamientos de primera línea.',
        'Temerario': 'con un nivel de dificultad para un médico interno avanzado o residente de primer año. Las preguntas deben ser más desafiantes, involucrando diagnósticos diferenciales complejos, conocimiento de guías de práctica clínica específicas o tratamientos de segunda línea.',
        'Dr. House': 'con un nivel de dificultad para un especialista o para un desafío diagnóstico tipo "Dr. House". Las preguntas deben ser sobre casos atípicos, enfermedades raras (zebras), detalles sutiles de la fisiopatología, o interacciones farmacológicas poco comunes.'
    };
    const difficultyPrompt = difficultyDescriptions[difficulty] || difficultyDescriptions['Interno'];
    const prompt = `Genera un cuestionario de ${numQuestions} preguntas de opción múltiple sobre "${topic}" para médicos internos, ${difficultyPrompt}. Cada pregunta debe tener 4 opciones. Una opción debe ser la correcta. Proporciona la respuesta correcta en texto y una retroalimentación concisa para cada pregunta, explicando por qué la respuesta es correcta.`;

    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctAnswer: { type: Type.STRING },
                        feedback: { type: Type.STRING }
                    },
                    required: ['question', 'options', 'correctAnswer', 'feedback']
                }
            }
        }
    });
    return safeJsonParse(response.text);
}

export async function generateClinicalCase(topic: string, difficulty: string): Promise<ClinicalCase> {
    const difficultyDescriptions: { [key: string]: string } = {
        'Interno': 'para un médico interno. El caso debe centrarse en una presentación clásica de una patología común.',
        'Adscrito': 'para un médico adscrito o residente de último año. El caso debe ser más complejo, presentar "red herrings" (pistas falsas), o involucrar comorbilidades que compliquen el diagnóstico y manejo.',
        'Dr. House': 'para un desafío diagnóstico tipo "Dr. House". El caso debe ser sobre una enfermedad rara (zebra), una presentación atípica de una enfermedad común, o requerir una integración profunda de hallazgos sutiles.'
    };
    const difficultyPrompt = difficultyDescriptions[difficulty] || difficultyDescriptions['Interno'];
    const prompt = `Genera un caso clínico detallado y desafiante ${difficultyPrompt}, basado en la siguiente presentación o frase médica: "${topic}". El caso debe tener un título o "frase alusiva" que genere intriga sin revelar el diagnóstico (ej: "Un corazón fuera de ritmo"). IMPORTANTE: NO menciones ni insinúes el diagnóstico final en ninguna parte de la descripción del caso. El objetivo es que el interno lo descubra. El caso debe incluir: un título alusivo, perfil del paciente, historia de la enfermedad actual, signos vitales y hallazgos del examen físico. Sé realista y educativo.`;

    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    caseTitle: { type: Type.STRING },
                    patientProfile: { type: Type.STRING },
                    historyOfPresentIllness: { type: Type.STRING },
                    vitalSigns: {
                        type: Type.OBJECT, properties: {
                            presionArterial: { type: Type.STRING },
                            frecuenciaCardiaca: { type: Type.STRING },
                            frecuenciaRespiratoria: { type: Type.STRING },
                            temperatura: { type: Type.STRING },
                            saturacionOxigeno: { type: Type.STRING },
                        }
                    },
                    physicalExam: { type: Type.STRING }
                },
                required: ['caseTitle', 'patientProfile', 'historyOfPresentIllness', 'vitalSigns', 'physicalExam']
            }
        }
    });
    return safeJsonParse(response.text);
}

export async function getAnamnesisFeedback(clinicalCase: ClinicalCase, history: any[], userQuestion: string): Promise<{ patientResponse: string, tutorFeedback: string }> {
    const prompt = `Eres un simulador de paciente y tutor médico. CASO CLÍNICO: ${JSON.stringify(clinicalCase)} HISTORIAL DE ANAMNESIS: ${JSON.stringify(history)} PREGUNTA DEL INTERNO: "${userQuestion}" TAREA: 1. Como PACIENTE, responde la pregunta de manera realista. 2. Como TUTOR, da una retroalimentación concisa sobre la pregunta del interno. Responde únicamente con un objeto JSON.`;
    
    const response = await getAi().models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    patientResponse: { type: Type.STRING },
                    tutorFeedback: { type: Type.STRING }
                },
                required: ['patientResponse', 'tutorFeedback']
            }
        }
    });
    return safeJsonParse(response.text);
}

export async function getSuggestedStudies(clinicalCase: ClinicalCase): Promise<{ suggestedLabs: string[], suggestedImaging: string[] }> {
    const prompt = `Basado en el siguiente caso clínico: ${JSON.stringify(clinicalCase)}, sugiere una lista de los estudios de laboratorio e imagen más pertinentes para llegar al diagnóstico. Responde con un objeto JSON que contenga dos arreglos: "suggestedLabs" y "suggestedImaging". Sé conciso y clínicamente relevante.`;
    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    suggestedLabs: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestedImaging: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['suggestedLabs', 'suggestedImaging']
            }
        }
    });
    return safeJsonParse(response.text);
}

export async function generateStudyResults(fullCaseContext: string, requestedStudies: { labs: string[], imaging: string[] }): Promise<{ labs: LabResult[], imaging: ImagingResult[] }> {
    const prompt = `Basado en el caso clínico: ${fullCaseContext}, genera resultados para los estudios: Labs [${requestedStudies.labs.join(', ')}], Imagen [${requestedStudies.imaging.join(', ')}]. Para laboratorios, proporciona una interpretación clínica y un arreglo 'components' con 'parameter', 'value', 'units', 'referenceRange', y 'isAbnormal'. Para imagen, proporciona 'findings' detallados.`;
    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    labs: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                study: { type: Type.STRING },
                                interpretation: { type: Type.STRING },
                                components: {
                                    type: Type.ARRAY, items: {
                                        type: Type.OBJECT, properties: {
                                            parameter: { type: Type.STRING },
                                            value: { type: Type.STRING },
                                            units: { type: Type.STRING },
                                            referenceRange: { type: Type.STRING },
                                            isAbnormal: { type: Type.BOOLEAN }
                                        },
                                        required: ["parameter", "value", "units", "referenceRange", "isAbnormal"]
                                    }
                                }
                            },
                            required: ['study', 'interpretation', 'components']
                        }
                    },
                    imaging: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                study: { type: Type.STRING },
                                findings: { type: Type.STRING }
                            },
                            required: ['study', 'findings']
                        }
                    }
                },
                required: ['labs', 'imaging']
            }
        }
    });
    return safeJsonParse(response.text);
}

// FIX: Renamed generateMedicalImage to generateImage and made the prompt more generic to support both medical and general use cases.
export async function generateImage(basePrompt: string, findings?: string): Promise<string> {
    const fullPrompt = findings
        ? `Genera una imagen médica diagnóstica precisa de: ${basePrompt}. La imagen DEBE mostrar explícitamente los siguientes hallazgos radiológicos o clínicos: ${findings}. Estilo fotorrealista, calidad alta, anatomía correcta para fines educativos.`
        : `Genera una imagen de alta calidad en estilo fotorrealista, representando: "${basePrompt}". No incluyas texto, etiquetas, ni artefactos irrelevantes en la imagen.`;

    // Using gemini-3-pro-image-preview ("nanobanana pro") as requested for higher quality and better adherence to findings
    const response = await getAi().models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: fullPrompt }]
        },
        config: {
            imageConfig: {
                aspectRatio: "1:1",
                imageSize: "1K"
            }
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No se generó ninguna imagen en la respuesta.");
}

// FIX: Added missing editImage function to support image editing functionality.
export async function editImage(prompt: string, base64ImageData: string, mimeType: string): Promise<string> {
    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No se pudo editar la imagen.");
}


export async function getFinalDiagnosis(fullCaseContext: string): Promise<{ text: string, sources: GroundingSource[] }> {
    const prompt = `Basado en la siguiente información clínica completa: ${fullCaseContext}

    Realiza un análisis clínico-educativo exhaustivo para un médico interno y proporciona lo siguiente en formato Markdown estricto. Utiliza los siguientes encabezados exactamente como se indican y en este orden:

    ### Diagnóstico Principal
    Establece el diagnóstico más probable de forma clara y concisa.

    ### Fisiopatología y Correlación Clínica
    Esta es la sección más importante para el aprendizaje. Explica de manera detallada la fisiopatología subyacente del diagnóstico principal. Después, correlaciona de forma explícita CADA UNO de los hallazgos clave (signos, síntomas, resultados de laboratorio e imagen) del caso clínico con la fisiopatología descrita. Por ejemplo: "La fiebre se debe a la liberación de citoquinas pro-inflamatorias como IL-1 y TNF-alfa en respuesta a...", "La leucocitosis con neutrofilia observada en la biometría hemática refleja la respuesta del sistema inmune a...". El objetivo es que el estudiante integre el porqué de cada manifestación.

    ### Plan de Manejo y Tratamiento
    Detalla el plan de manejo inicial y el tratamiento específico para el diagnóstico principal. Basa tus recomendaciones en Guías de Práctica Clínica (GPC) actualizadas y en la medicina basada en evidencia. Sé específico en cuanto a fármacos, dosis y medidas de soporte.

    ### Diagnósticos Diferenciales
    Al final, enumera al menos 2 diagnósticos diferenciales importantes que se consideraron. Para cada uno, explica brevemente por qué es menos probable que el diagnóstico principal en este caso específico.
    
    ### Fuentes de Información
    Al final de todo, busca y proporciona al menos 2 fuentes de alta calidad (Guías de Práctica Clínica, artículos de revisión de PubMed, UpToDate, etc.) que respalden el diagnóstico y manejo. Formatea cada fuente como: "- [Título del artículo o guía](URL directa)".`;

    const response = await getAi().models.generateContent({
        // FIX: Updated model to gemini-3-pro-preview for complex text tasks per guidelines.
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web)
        .filter((web): web is GroundingSource => web !== undefined && web.uri !== undefined && web.uri !== '') || [];
        
    return { text, sources };
}

export async function generateNoteGuide(topic: string): Promise<{ guide: string, template: string }> {
    const prompt = `Para un paciente con "${topic}", genera un objeto JSON con dos propiedades: "guide" (guía detallada en Markdown para redactar una nota SOAP) y "template" (plantilla de nota SOAP en texto plano, pre-llenada con ejemplos y placeholders claros).`;
    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT, properties: {
                    guide: { type: Type.STRING },
                    template: { type: Type.STRING }
                },
                required: ['guide', 'template']
            }
        }
    });
    return safeJsonParse(response.text);
}

export async function generateQuickGuide(topic: string): Promise<{ text: string, sources: GroundingSource[] }> {
    const prompt = `Proporciona una guía de referencia rápida sobre el manejo de "${topic}" para médicos internos. Basa tu respuesta en la información más actualizada posible, dando **prioridad absoluta a las Guías de Práctica Clínica (GPC) de México**. Si no encuentras información mexicana, utiliza guías internacionales reconocidas, **preferiblemente de Estados Unidos** (ej. AAFP, AHA, etc.). 
    
    Utiliza formato Markdown, sé conciso y directo al punto.

    Al final de la guía, incluye una sección titulada "### Fuentes" y lista las fuentes web que utilizaste con enlaces directos, formateadas como: "- [Título de la guía o artículo](URL)".`;
    
    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }]
        }
    });

    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web)
        .filter((web): web is GroundingSource => web !== undefined && web.uri !== undefined && web.uri !== '') || [];
        
    return { text, sources };
}

export function createChat(): Chat {
    return getAi().chats.create({
        model: 'gemini-2.5-flash',
    });
}