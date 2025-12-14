
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    feedback: string;
}

export interface VitalSigns {
    presionArterial: string;
    frecuenciaCardiaca: string;
    frecuenciaRespiratoria: string;
    temperatura: string;
    saturacionOxigeno: string;
}

export interface ClinicalCase {
    caseTitle: string;
    patientProfile: string;
    historyOfPresentIllness: string;
    vitalSigns: VitalSigns;
    physicalExam: string;
}

export interface AnamnesisTurn {
    question: string;
    patientResponse: string;
    tutorFeedback: string;
}

export interface LabResultComponent {
    parameter: string;
    value: string;
    units: string;
    referenceRange: string;
    isAbnormal: boolean;
}

export interface LabResult {
    study: string;
    interpretation: string;
    components: LabResultComponent[];
}

export interface ImagingResult {
    study: string;
    findings: string;
    imageUrl?: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}
