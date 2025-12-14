import React, { useState, useMemo, FC, useRef, useEffect } from 'react';

// --- UI Components ---
const FormRow: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 items-center ${className}`}>{children}</div>;
const Label: FC<{ id?: string; htmlFor?: string; children: React.ReactNode; }> = ({ id, htmlFor, children }) => <label id={id} htmlFor={htmlFor} className="font-medium text-sm text-gray-700 dark:text-gray-300">{children}</label>;
const Select: FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => <select {...props} className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600" />;
const Input: FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => <input {...props} className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600" />;
const Checkbox: FC<{ checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, children: React.ReactNode }> = ({ checked, onChange, children }) => <label className="flex items-center space-x-2 text-sm p-2 bg-white dark:bg-slate-800/50 rounded-md border dark:border-slate-600"><input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded" /><span>{children}</span></label>;
const AlertIcon: FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);
const ResultDisplay: FC<{ title: string; result: string | number; interpretation?: string; className?: string; alertLevel?: 'none' | 'warning' | 'critical' }> = ({ title, result, interpretation, className, alertLevel = 'none' }) => {
    const styles = {
        none: 'bg-blue-50 dark:bg-slate-700/50 border-blue-200 dark:border-slate-600',
        warning: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700',
        critical: 'bg-red-50 dark:bg-red-900/50 border-red-300 dark:border-red-700'
    };
    const textStyles = {
        none: 'text-blue-900 dark:text-cyan-300',
        warning: 'text-yellow-800 dark:text-yellow-300',
        critical: 'text-red-800 dark:text-red-300'
    }

    const showIcon = alertLevel === 'warning' || alertLevel === 'critical';

    return (
        <div className={`mt-4 p-3 rounded-lg border text-center transition-colors duration-300 ${styles[alertLevel]} ${className}`}>
            <h4 className={`font-semibold ${textStyles[alertLevel]}`}>
                {showIcon && <AlertIcon />}
                {title}
            </h4>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{result}</p>
            {interpretation && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{interpretation}</p>}
        </div>
    );
};
const ResetButton: FC<{ onClick: () => void }> = ({ onClick }) => <button onClick={onClick} className="text-xs text-gray-500 hover:underline mt-2">Reset</button>;
const SubSection: FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => <div className="mt-4 pt-4 border-t dark:border-slate-600"><h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2">{title}</h4>{children}</div>;


// --- Calculators ---

const AcidBaseAnalysis: FC = () => {
    const initialState = { ph: 7.35, pco2: 40, hco3: 24, na: 140, cl: 104, albumin: 4.0, be: 0 };
    const [params, setParams] = useState(initialState);
    const updateParam = (key: keyof typeof initialState, value: string) => {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setParams(prev => ({ ...prev, [key]: numValue }));
        }
    };
    
    const { ph, pco2, hco3, na, cl, albumin, be } = params;

    const ETIOLOGIES = {
        HAGMA: { title: "Causas de Acidosis Metabólica con Anion Gap Elevado (MUDPILES)", causes: ["Metanol", "Uremia", "Cetoacidosis Diabética/Alcohólica", "Paraldehído/Fenformina", "Isoniazida/Hierro", "Acidosis Láctica", "Etilenglicol", "Salicilatos"] },
        NAGMA: { title: "Causas de Acidosis Metabólica con Anion Gap Normal (HARDUPS)", causes: ["Hiperalimentación", "Acidosis Tubular Renal", "Diarrea", "Fístula Uretero-entérica", "Derivación Pancreática", "Inhibidores de anhidrasa carbónica"] },
        MET_ALKALOSIS: { title: "Causas de Alcalosis Metabólica", causes: ["Pérdidas GI (vómito, succión nasogástrica)", "Pérdidas Renales (diuréticos, hiperaldosteronismo)", "Administración de álcalis (bicarbonato)"] },
        RESP_ACIDOSIS: { title: "Causas de Acidosis Respiratoria", causes: ["Depresión del SNC (fármacos, EVC)", "EPOC, asma severo", "Trastornos neuromusculares (Guillain-Barré)", "Neumotórax, edema pulmonar severo", "Ventilación mecánica inadecuada"] },
        RESP_ALKALOSIS: { title: "Causas de Alcalosis Respiratoria", causes: ["Estimulación del SNC (ansiedad, dolor, fiebre)", "Hipoxemia (altitud, neumonía, TEP)", "Fármacos (salicilatos, progesterona)", "Sepsis, embarazo, enfermedad hepática"] }
    };

    const pHAnalysis = useMemo(() => {
        if (ph < 7.35) return { status: "Acidemia", text: `pH ${ph} indica Acidemia.` };
        if (ph > 7.45) return { status: "Alkalemia", text: `pH ${ph} indica Alkalemia.` };
        return { status: "Normal", text: `pH ${ph} está en rango normal.` };
    }, [ph]);

    const primaryDisorder = useMemo(() => {
        let disorder = "Indeterminado";
        let isMetabolic = false, isRespiratory = false, isAcidosis = false, isAlkalosis = false;

        if (pHAnalysis.status === "Acidemia") {
            isAcidosis = true;
            if (pco2 > 45) { disorder = "Acidosis Respiratoria"; isRespiratory = true; }
            else if (hco3 < 22) { disorder = "Acidosis Metabólica"; isMetabolic = true; }
        } else if (pHAnalysis.status === "Alkalemia") {
            isAlkalosis = true;
            if (pco2 < 35) { disorder = "Alcalosis Respiratoria"; isRespiratory = true; }
            else if (hco3 > 26) { disorder = "Alcalosis Metabólica"; isMetabolic = true; }
        } else { // pH Normal
            if ((pco2 > 45 && hco3 > 26) || (pco2 < 35 && hco3 < 22)) {
                disorder = "Trastorno Mixto con pH normal";
            } else if (pco2 > 45 || pco2 < 35 || hco3 > 26 || hco3 < 22) {
                disorder = "Trastorno compensado con pH normal";
            } else {
                disorder = "Equilibrio Ácido-Base Normal";
            }
        }
        return { disorder, isMetabolic, isRespiratory, isAcidosis, isAlkalosis };
    }, [pHAnalysis.status, pco2, hco3]);
    
    const anionGap = useMemo(() => {
        const ag = na - (cl + hco3);
        const correctedAg = ag + 2.5 * (4.0 - albumin);
        let text = `Anion Gap: ${ag.toFixed(1)}. Corregido para albúmina: ${correctedAg.toFixed(1)}.`;
        let isHAGMA = false;
        if (primaryDisorder.disorder === "Acidosis Metabólica") {
            if (correctedAg > 12) {
                text += " Esto indica una Acidosis Metabólica con Anion Gap Elevado (AMAGE).";
                isHAGMA = true;
            } else {
                text += " Esto indica una Acidosis Metabólica con Anion Gap Normal (AMAGN).";
            }
        }
        return { ag, correctedAg, text, isHAGMA };
    }, [na, cl, hco3, albumin, primaryDisorder.disorder]);

    const compensation = useMemo(() => {
        let text = "No aplica compensación para este trastorno primario.";
        let expected = { lower: 0, upper: 0 };
        let isAdequate = null;

        if (primaryDisorder.isMetabolic) {
            if (primaryDisorder.isAcidosis) { // Winter's Formula
                expected = { lower: (1.5 * hco3) + 6, upper: (1.5 * hco3) + 10 };
                text = `Para una Acidosis Metabólica, la PCO₂ esperada (Fórmula de Winter) es de ${expected.lower.toFixed(1)} a ${expected.upper.toFixed(1)} mmHg.`;
                if (pco2 < expected.lower) { text += " La PCO₂ actual es más baja, sugiriendo una Alcalosis Respiratoria concurrente."; isAdequate = false; }
                else if (pco2 > expected.upper) { text += " La PCO₂ actual es más alta, sugiriendo una Acidosis Respiratoria concurrente."; isAdequate = false; }
                else { text += " La PCO₂ actual está dentro del rango esperado, indicando una compensación respiratoria adecuada."; isAdequate = true; }
            } else if (primaryDisorder.isAlkalosis) {
                expected = { lower: (0.7 * hco3) + 19, upper: (0.7 * hco3) + 23 };
                text = `Para una Alcalosis Metabólica, la PCO₂ esperada es de ${expected.lower.toFixed(1)} a ${expected.upper.toFixed(1)} mmHg.`;
                if (pco2 > expected.upper) { text += " La PCO₂ actual es más alta, sugiriendo una Acidosis Respiratoria concurrente."; isAdequate = false; }
                else { text += " La compensación respiratoria parece adecuada."; isAdequate = true; }
            }
        } else if (primaryDisorder.isRespiratory) {
            const deltaPCO2 = pco2 - 40;
            const isChronic = Math.abs(be) > 2;
            let expectedHCO3 = 24;

            if (primaryDisorder.isAcidosis) {
                if (isChronic) { // Chronic Resp Acidosis
                    expectedHCO3 = 24 + (0.35 * deltaPCO2);
                    text = `Para una Acidosis Respiratoria Crónica (DB alterado), el HCO₃ esperado es ~${expectedHCO3.toFixed(1)}.`;
                } else { // Acute Resp Acidosis
                    expectedHCO3 = 24 + (0.1 * deltaPCO2);
                    text = `Para una Acidosis Respiratoria Aguda (DB normal), el HCO₃ esperado es ~${expectedHCO3.toFixed(1)}.`;
                }
            } else { // Resp Alkalosis
                if (isChronic) {
                    expectedHCO3 = 24 + (0.5 * deltaPCO2);
                    text = `Para una Alcalosis Respiratoria Crónica (DB alterado), el HCO₃ esperado es ~${expectedHCO3.toFixed(1)}.`;
                } else {
                    expectedHCO3 = 24 + (0.2 * deltaPCO2);
                    text = `Para una Alcalosis Respiratoria Aguda (DB normal), el HCO₃ esperado es ~${expectedHCO3.toFixed(1)}.`;
                }
            }
            if (Math.abs(hco3 - expectedHCO3) > 3) { text += " El HCO₃ actual está fuera del rango esperado, sugiriendo un trastorno metabólico mixto."; isAdequate = false; }
            else { text += " La compensación metabólica parece adecuada."; isAdequate = true; }
        }
        return { text, isAdequate };
    }, [primaryDisorder, hco3, pco2, be]);
    
    const deltaRatio = useMemo(() => {
        if (!anionGap.isHAGMA) return { text: "No aplica (no es AMAGE)." };
        const ratio = (anionGap.ag - 12) / (24 - hco3);
        let text = `El Delta Ratio (ΔAG/ΔHCO₃) es ${ratio.toFixed(2)}.`;
        if (ratio < 1.0) text += " Un ratio < 1.0 sugiere una Acidosis Metabólica con Anion Gap Normal concurrente.";
        else if (ratio > 2.0) text += " Un ratio > 2.0 sugiere una Alcalosis Metabólica concurrente.";
        else text += " Un ratio entre 1.0 y 2.0 es consistente con una AMAGE pura.";
        return { text };
    }, [anionGap, hco3]);

    const finalDiagnosis = useMemo(() => {
        let diagnosis = [primaryDisorder.disorder];
        if (primaryDisorder.isMetabolic && primaryDisorder.isAcidosis) {
            diagnosis[0] = anionGap.isHAGMA ? "Acidosis Metabólica con Anion Gap Elevado" : "Acidosis Metabólica con Anion Gap Normal";
        }
        if (primaryDisorder.isRespiratory) {
            diagnosis[0] += Math.abs(be) > 2 ? " Crónica" : " Aguda";
        }
        if(compensation.isAdequate === false) {
            diagnosis.push("con un segundo trastorno ácido-base concurrente.");
        } else if (compensation.isAdequate === true) {
            diagnosis.push("con compensación adecuada.");
        }
        return diagnosis.join(" ");
    }, [primaryDisorder, anionGap.isHAGMA, be, compensation.isAdequate]);

    const etiologies = useMemo(() => {
        if (primaryDisorder.disorder.includes("Acidosis Metabólica")) {
            return anionGap.isHAGMA ? ETIOLOGIES.HAGMA : ETIOLOGIES.NAGMA;
        }
        if (primaryDisorder.disorder.includes("Alcalosis Metabólica")) return ETIOLOGIES.MET_ALKALOSIS;
        if (primaryDisorder.disorder.includes("Acidosis Respiratoria")) return ETIOLOGIES.RESP_ACIDOSIS;
        if (primaryDisorder.disorder.includes("Alcalosis Respiratoria")) return ETIOLOGIES.RESP_ALKALOSIS;
        return null;
    }, [primaryDisorder.disorder, anionGap.isHAGMA]);

    return (
        <div className="space-y-4">
            <SubSection title="1. Parámetros Gasométricos y Electrolitos">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><Label htmlFor="ph">pH</Label><Input id="ph" type="number" step="0.01" value={params.ph} onChange={e => updateParam('ph', e.target.value)} /></div>
                    <div><Label htmlFor="pco2">PCO₂</Label><Input id="pco2" type="number" value={params.pco2} onChange={e => updateParam('pco2', e.target.value)} /></div>
                    <div><Label htmlFor="hco3">HCO₃⁻</Label><Input id="hco3" type="number" value={params.hco3} onChange={e => updateParam('hco3', e.target.value)} /></div>
                    <div><Label htmlFor="be">DB/EB</Label><Input id="be" type="number" value={params.be} onChange={e => updateParam('be', e.target.value)} /></div>
                    <div><Label htmlFor="na">Na⁺</Label><Input id="na" type="number" value={params.na} onChange={e => updateParam('na', e.target.value)} /></div>
                    <div><Label htmlFor="cl">Cl⁻</Label><Input id="cl" type="number" value={params.cl} onChange={e => updateParam('cl', e.target.value)} /></div>
                    <div><Label htmlFor="albumin">Albúmina</Label><Input id="albumin" type="number" step="0.1" value={params.albumin} onChange={e => updateParam('albumin', e.target.value)} /></div>
                </div>
            </SubSection>

            <SubSection title="2. Análisis Sistemático">
                <ResultDisplay title="Paso 1: Estado del pH" result={pHAnalysis.status} interpretation={pHAnalysis.text} />
                <ResultDisplay title="Paso 2: Trastorno Primario" result={primaryDisorder.disorder} interpretation="Determinado usando la regla ROME y la dirección de los cambios." />
                <ResultDisplay title="Paso 3: Anion Gap (si aplica)" result={`${anionGap.correctedAg.toFixed(1)} mEq/L`} interpretation={anionGap.text} />
                <ResultDisplay title="Paso 4: Compensación" result={compensation.isAdequate === null ? 'N/A' : compensation.isAdequate ? 'Adecuada' : 'Inadecuada/Mixta'} interpretation={compensation.text} />
                <ResultDisplay title="Paso 5: Delta Ratio (si AMAGE)" result={anionGap.isHAGMA ? deltaRatio.text.split(' ')[4] : 'N/A'} interpretation={deltaRatio.text} />
            </SubSection>

            <SubSection title="3. Conclusión Diagnóstica Integrada">
                <ResultDisplay title="Diagnóstico Final" result={finalDiagnosis} interpretation="Este es un resumen integrado de los hallazgos anteriores." alertLevel="critical" />
            </SubSection>

            {etiologies && (
                <SubSection title="4. Posibles Etiologías">
                    <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border dark:border-slate-700">
                        <h5 className="font-semibold text-gray-800 dark:text-gray-200">{etiologies.title}</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                            {etiologies.causes.map(cause => <li key={cause}>{cause}</li>)}
                        </ul>
                    </div>
                </SubSection>
            )}

            <div className="text-center"><ResetButton onClick={() => setParams(initialState)} /></div>
        </div>
    );
};

const GlasgowComaScale: FC = () => {
    const [eyes, setEyes] = useState<number>(4);
    const [verbal, setVerbal] = useState<number>(5);
    const [motor, setMotor] = useState<number>(6);
    
    const total = useMemo(() => eyes + verbal + motor, [eyes, verbal, motor]);
    const interpretation = useMemo(() => {
        if (total >= 13) return "Leve (13-15)";
        if (total >= 9) return "Moderado (9-12)";
        return "Grave (≤8)";
    }, [total]);

    const reset = () => { setEyes(4); setVerbal(5); setMotor(6); };

    return <div className="space-y-3">
        <FormRow>
            <Label htmlFor="gcs-eyes">Respuesta Ocular</Label>
            <Select id="gcs-eyes" value={eyes} onChange={e => setEyes(Number(e.target.value))}>
                <option value={4}>Espontánea (4)</option><option value={3}>A la orden (3)</option><option value={2}>Al dolor (2)</option><option value={1}>Ninguna (1)</option>
            </Select>
        </FormRow>
        <FormRow>
            <Label htmlFor="gcs-verbal">Respuesta Verbal</Label>
            <Select id="gcs-verbal" value={verbal} onChange={e => setVerbal(Number(e.target.value))}>
                <option value={5}>Orientado (5)</option><option value={4}>Confuso (4)</option><option value={3}>Palabras inapropiadas (3)</option><option value={2}>Sonidos incomprensibles (2)</option><option value={1}>Ninguna (1)</option>
            </Select>
        </FormRow>
        <FormRow>
            <Label htmlFor="gcs-motor">Respuesta Motora</Label>
            <Select id="gcs-motor" value={motor} onChange={e => setMotor(Number(e.target.value))}>
                <option value={6}>Obedece órdenes (6)</option><option value={5}>Localiza el dolor (5)</option><option value={4}>Retirada al dolor (4)</option><option value={3}>Flexión anormal (decorticación) (3)</option><option value={2}>Extensión anormal (descerebración) (2)</option><option value={1}>Ninguna (1)</option>
            </Select>
        </FormRow>
        <ResultDisplay title="Puntuación GCS Total" result={total} interpretation={interpretation} />
        <ResetButton onClick={reset} />
    </div>;
};

const QSOFAScore: FC = () => {
    const [fr, setFr] = useState(false);
    const [pas, setPas] = useState(false);
    const [gcs, setGcs] = useState(false);
    
    const score = useMemo(() => Number(fr) + Number(pas) + Number(gcs), [fr, pas, gcs]);
    const interpretation = score >= 2 ? "Riesgo elevado de mal pronóstico (sepsis)" : "Bajo riesgo";
    const alertLevel = score >= 2 ? 'critical' : 'none';

    const reset = () => { setFr(false); setPas(false); setGcs(false); };

    return <div className="space-y-2">
        <Checkbox checked={fr} onChange={e => setFr(e.target.checked)}>Frecuencia respiratoria ≥ 22/min</Checkbox>
        <Checkbox checked={pas} onChange={e => setPas(e.target.checked)}>Presión arterial sistólica ≤ 100 mmHg</Checkbox>
        <Checkbox checked={gcs} onChange={e => setGcs(e.target.checked)}>Alteración del estado mental (GCS &lt; 15)</Checkbox>
        <ResultDisplay title="Puntuación qSOFA" result={`${score} puntos`} interpretation={interpretation} alertLevel={alertLevel} />
        <ResetButton onClick={reset} />
    </div>;
};

const SOFA2Score: FC = () => {
    const initialState = {
        gcs: 15,
        delirium: false,
        sedated: false,
        pao2fio2: 350,
        advancedVentilation: false,
        ecmoRespiratory: false,
        map: 80,
        norepi: 0,
        epi: 0,
        otherVaso: false,
        mechanicalSupport: false,
        bilirubin: 1.0,
        creatinine: 1.0,
        urineOutput: 1.0,
        weight: 70,
        onRRT: false,
        platelets: 200,
    };
    const [state, setState] = useState(initialState);
    const updateState = (key: string, value: any) => setState(prev => ({ ...prev, [key]: value }));

    const brainScore = useMemo(() => {
        if (state.sedated) return 0;
        if (state.gcs >= 15) return state.delirium ? 1 : 0;
        if (state.gcs >= 13) return 1;
        if (state.gcs >= 9) return 2;
        if (state.gcs >= 6) return 3;
        return 4;
    }, [state.gcs, state.delirium, state.sedated]);

    const respiratoryScore = useMemo(() => {
        if (state.ecmoRespiratory) return 4;
        const ratio = state.pao2fio2;
        if (ratio <= 75 && state.advancedVentilation) return 4;
        if (ratio <= 150 && state.advancedVentilation) return 3;
        if (ratio <= 225) return 2;
        if (ratio <= 300) return 1;
        return 0;
    }, [state.pao2fio2, state.advancedVentilation, state.ecmoRespiratory]);

    const cardiovascularScore = useMemo(() => {
        const { map, norepi, epi, otherVaso, mechanicalSupport } = state;
        const norepiEpiSum = norepi + epi;
        
        if (mechanicalSupport) return 4;
        if (norepiEpiSum > 0.4 || (norepiEpiSum > 0.2 && otherVaso)) return 4;
        if (norepiEpiSum > 0.2 || (norepiEpiSum > 0 && otherVaso)) return 3;
        if (norepiEpiSum > 0 || otherVaso) return 2;
        if (map < 70) return 1;
        return 0;
    }, [state.map, state.norepi, state.epi, state.otherVaso, state.mechanicalSupport]);
    
    const liverScore = useMemo(() => {
        const bili = state.bilirubin;
        if (bili > 12.0) return 4;
        if (bili > 6.0) return 3;
        if (bili > 3.0) return 2;
        if (bili > 1.2) return 1;
        return 0;
    }, [state.bilirubin]);

    const kidneyScore = useMemo(() => {
        if (state.onRRT) return 4;
        
        let scoreFromCreatinine = 0;
        const creat = state.creatinine;
        if (creat > 3.5) scoreFromCreatinine = 3;
        else if (creat > 2.0) scoreFromCreatinine = 2;
        else if (creat > 1.2) scoreFromCreatinine = 1;

        let scoreFromUrine = 0;
        const uo_ml_kg_h = (state.urineOutput * 1000) / (state.weight * 24); // Assuming UO is in L/24h for simplicity
        if (uo_ml_kg_h < 0.3) scoreFromUrine = 3;
        else if (uo_ml_kg_h < 0.5) scoreFromUrine = 2;
        
        return Math.max(scoreFromCreatinine, scoreFromUrine);
    }, [state.creatinine, state.urineOutput, state.weight, state.onRRT]);

    const hemostasisScore = useMemo(() => {
        const plts = state.platelets;
        if (plts < 50) return 4;
        if (plts < 80) return 3;
        if (plts < 100) return 2;
        if (plts < 150) return 1;
        return 0;
    }, [state.platelets]);

    const totalScore = useMemo(() => {
        return brainScore + respiratoryScore + cardiovascularScore + liverScore + kidneyScore + hemostasisScore;
    }, [brainScore, respiratoryScore, cardiovascularScore, liverScore, kidneyScore, hemostasisScore]);

    return (
        <div className="space-y-4">
             <p className="text-xs text-gray-500 dark:text-gray-400">Evalúa la disfunción orgánica secuencial en pacientes críticamente enfermos. Los valores deben ser los peores de las últimas 24h.</p>
            <SubSection title="SNC (Cerebro)">
                <div className="space-y-3">
                    <FormRow><Label>Escala de Coma de Glasgow</Label><Input type="number" value={state.gcs} onChange={e => updateState('gcs', +e.target.value)} min={3} max={15} disabled={state.sedated} /></FormRow>
                    <Checkbox checked={state.delirium} onChange={e => updateState('delirium', e.target.checked)}>Recibe tratamiento para delirium (+1 si GCS=15)</Checkbox>
                    <Checkbox checked={state.sedated} onChange={e => updateState('sedated', e.target.checked)}>Sedado (se usa último GCS; si no se conoce, puntúa 0)</Checkbox>
                    <ResultDisplay title="Puntuación SNC" result={brainScore} />
                </div>
            </SubSection>

            <SubSection title="Respiratorio">
                <div className="space-y-3">
                    <FormRow><Label>PaO₂/FiO₂ (mmHg)</Label><Input type="number" value={state.pao2fio2} onChange={e => updateState('pao2fio2', +e.target.value)} /></FormRow>
                    <Checkbox checked={state.advancedVentilation} onChange={e => updateState('advancedVentilation', e.target.checked)}>Soporte ventilatorio avanzado</Checkbox>
                    <Checkbox checked={state.ecmoRespiratory} onChange={e => updateState('ecmoRespiratory', e.target.checked)}>ECMO por fallo respiratorio</Checkbox>
                    <ResultDisplay title="Puntuación Respiratoria" result={respiratoryScore} />
                </div>
            </SubSection>

            <SubSection title="Cardiovascular">
                 <div className="space-y-3">
                    <FormRow><Label>Presión Arterial Media (PAM)</Label><Input type="number" value={state.map} onChange={e => updateState('map', +e.target.value)} /></FormRow>
                    <FormRow><Label>Norepinefrina (µg/kg/min)</Label><Input type="number" step="0.1" value={state.norepi} onChange={e => updateState('norepi', +e.target.value)} /></FormRow>
                    <FormRow><Label>Epinefrina (µg/kg/min)</Label><Input type="number" step="0.1" value={state.epi} onChange={e => updateState('epi', +e.target.value)} /></FormRow>
                    <Checkbox checked={state.otherVaso} onChange={e => updateState('otherVaso', e.target.checked)}>Otro vasopresor/inotrópico (ej. Dopamina, Dobutamina)</Checkbox>
                    <Checkbox checked={state.mechanicalSupport} onChange={e => updateState('mechanicalSupport', e.target.checked)}>Soporte mecánico (ECMO VA, balón, etc.)</Checkbox>
                    <ResultDisplay title="Puntuación Cardiovascular" result={cardiovascularScore} />
                </div>
            </SubSection>

            <SubSection title="Hígado">
                 <div className="space-y-3">
                    <FormRow><Label>Bilirrubina total (mg/dL)</Label><Input type="number" step="0.1" value={state.bilirubin} onChange={e => updateState('bilirubin', +e.target.value)} /></FormRow>
                     <ResultDisplay title="Puntuación Hepática" result={liverScore} />
                </div>
            </SubSection>

            <SubSection title="Riñón">
                <div className="space-y-3">
                    <FormRow><Label>Creatinina (mg/dL)</Label><Input type="number" step="0.1" value={state.creatinine} onChange={e => updateState('creatinine', +e.target.value)} /></FormRow>
                    <FormRow><Label>Gasto Urinario (L/24h)</Label><Input type="number" step="0.1" value={state.urineOutput} onChange={e => updateState('urineOutput', +e.target.value)} /></FormRow>
                    <FormRow><Label>Peso (kg)</Label><Input type="number" value={state.weight} onChange={e => updateState('weight', +e.target.value)} /></FormRow>
                    <Checkbox checked={state.onRRT} onChange={e => updateState('onRRT', e.target.checked)}>Recibe Terapia de Reemplazo Renal (TRR)</Checkbox>
                    <ResultDisplay title="Puntuación Renal" result={kidneyScore} />
                </div>
            </SubSection>

             <SubSection title="Hemostasia">
                 <div className="space-y-3">
                    <FormRow><Label>Plaquetas (x10³/µL)</Label><Input type="number" value={state.platelets} onChange={e => updateState('platelets', +e.target.value)} /></FormRow>
                    <ResultDisplay title="Puntuación de Hemostasia" result={hemostasisScore} />
                </div>
            </SubSection>
            
            <ResultDisplay title="Puntuación SOFA-2 Total" result={`${totalScore} / 24`} interpretation="Puntuaciones más altas indican mayor disfunción orgánica y riesgo de mortalidad." alertLevel={totalScore > 12 ? 'critical' : totalScore > 6 ? 'warning' : 'none'} />
            <div className="text-center"><ResetButton onClick={() => setState(initialState)} /></div>
        </div>
    );
};

const ParklandFormula: FC = () => {
    const [weight, setWeight] = useState(70);
    const [bsa, setBsa] = useState(20);

    const { total, first8h, next16h } = useMemo(() => {
        const totalVol = 4 * weight * bsa;
        return { total: totalVol, first8h: totalVol / 2, next16h: totalVol / 2 };
    }, [weight, bsa]);
    
    const reset = () => { setWeight(70); setBsa(20); };

    return <div className="space-y-3">
        <FormRow>
            <Label htmlFor="parkland-weight">Peso (kg)</Label>
            <Input id="parkland-weight" type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} min={0}/>
        </FormRow>
        <FormRow>
            <Label htmlFor="parkland-bsa">Superficie Corporal Quemada (%)</Label>
            <Input id="parkland-bsa" type="number" value={bsa} onChange={e => setBsa(Number(e.target.value))} min={0} max={100} />
        </FormRow>
        <ResultDisplay title="Volumen Total en 24h" result={`${total.toFixed(0)} mL`} />
        <div className="grid grid-cols-2 gap-2 text-center text-sm mt-2">
            <div><p className="font-semibold">Primeras 8h</p><p>{first8h.toFixed(0)} mL</p></div>
            <div><p className="font-semibold">Siguientes 16h</p><p>{next16h.toFixed(0)} mL</p></div>
        </div>
        <ResetButton onClick={reset} />
    </div>;
};

const BrookeFormula: FC = () => {
    const [weight, setWeight] = useState(70);
    const [bsa, setBsa] = useState(20);

    const { crystalloids, colloids, total, first8h, next16h } = useMemo(() => {
        const crystalloidsVol = 1.5 * weight * bsa;
        const colloidsVol = 0.5 * weight * bsa;
        const totalVol = crystalloidsVol + colloidsVol;
        return { crystalloids: crystalloidsVol, colloids: colloidsVol, total: totalVol, first8h: totalVol / 2, next16h: totalVol / 2 };
    }, [weight, bsa]);

    const reset = () => { setWeight(70); setBsa(20); };

    return <div className="space-y-3">
        <FormRow><Label htmlFor="brooke-weight">Peso (kg)</Label><Input id="brooke-weight" type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} min={0} /></FormRow>
        <FormRow><Label htmlFor="brooke-bsa">Superficie Corporal Quemada (%)</Label><Input id="brooke-bsa" type="number" value={bsa} onChange={e => setBsa(Number(e.target.value))} min={0} max={100} /></FormRow>
        <ResultDisplay title="Volumen Total en 24h" result={`${total.toFixed(0)} mL`} interpretation={`Cristaloides: ${crystalloids.toFixed(0)} mL, Coloides: ${colloids.toFixed(0)} mL`} />
        <div className="grid grid-cols-2 gap-2 text-center text-sm mt-2">
            <div><p className="font-semibold">Primeras 8h</p><p>{first8h.toFixed(0)} mL</p></div>
            <div><p className="font-semibold">Siguientes 16h</p><p>{next16h.toFixed(0)} mL</p></div>
        </div>
        <ResetButton onClick={reset} />
    </div>
};

const RomaIVCriteria: FC = () => {
    const [pain, setPain] = useState(false);
    const [crit1, setCrit1] = useState(false);
    const [crit2, setCrit2] = useState(false);
    const [crit3, setCrit3] = useState(false);

    const { met, message } = useMemo(() => {
        const criteriaCount = [crit1, crit2, crit3].filter(Boolean).length;
        if (pain && criteriaCount >= 2) {
            return { met: true, message: "Los criterios para el diagnóstico de Síndrome de Intestino Irritable se cumplen." };
        }
        return { met: false, message: "Los criterios para el diagnóstico de Síndrome de Intestino Irritable NO se cumplen." };
    }, [pain, crit1, crit2, crit3]);

    const reset = () => { setPain(false); setCrit1(false); setCrit2(false); setCrit3(false); };

    return <div className="space-y-2 text-sm">
        <p className="mb-2">Diagnóstico de Síndrome de Intestino Irritable (SII). Criterios deben cumplirse en los últimos 3 meses, con inicio de síntomas ≥6 meses antes.</p>
        <Checkbox checked={pain} onChange={e => setPain(e.target.checked)}><strong>Criterio Principal:</strong> Dolor abdominal recurrente (al menos 1 día/semana de media).</Checkbox>
        <p className="mt-2">El dolor se asocia con 2 o más de los siguientes:</p>
        <Checkbox checked={crit1} onChange={e => setCrit1(e.target.checked)}>Relacionado con la defecación.</Checkbox>
        <Checkbox checked={crit2} onChange={e => setCrit2(e.target.checked)}>Asociado a un cambio en la frecuencia de las deposiciones.</Checkbox>
        <Checkbox checked={crit3} onChange={e => setCrit3(e.target.checked)}>Asociado a un cambio en la forma (apariencia) de las deposiciones.</Checkbox>
        <ResultDisplay title="Resultado" result={met ? "Criterios Cumplidos" : "Criterios No Cumplidos"} interpretation={message} className={met ? 'bg-green-50 dark:bg-green-900/50 border-green-200' : 'bg-red-50 dark:bg-red-900/50 border-red-200'}/>
        <ResetButton onClick={reset} />
    </div>;
};

const MeldChildPugh: FC = () => {
    // Child-Pugh states
    const [bilirubinCP, setBilirubinCP] = useState(1);
    const [albuminCP, setAlbuminCP] = useState(1);
    const [inrCP, setInrCP] = useState(1);
    const [ascites, setAscites] = useState(1);
    const [encephalopathy, setEncephalopathy] = useState(1);
    
    // MELD states
    const [bilirubinMELD, setBilirubinMELD] = useState(1.0);
    const [creatinineMELD, setCreatinineMELD] = useState(1.0);
    const [inrMELD, setInrMELD] = useState(1.0);
    const [sodiumMELD, setSodiumMELD] = useState(135);
    const [dialysis, setDialysis] = useState(false);

    const { score: scoreCP, class: classCP } = useMemo(() => {
        const score = bilirubinCP + albuminCP + inrCP + ascites + encephalopathy;
        let c = "A";
        if (score >= 7 && score <= 9) c = "B";
        else if (score >= 10) c = "C";
        return { score, class: c };
    }, [bilirubinCP, albuminCP, inrCP, ascites, encephalopathy]);
    
    const scoreMELDNa = useMemo(() => {
        const bili = Math.max(1.0, bilirubinMELD);
        const inr = Math.max(1.0, inrMELD);
        let creat = Math.max(1.0, creatinineMELD);
        if (dialysis || creat > 4.0) creat = 4.0;
        
        const meld = 0.957 * Math.log(creat) + 0.378 * Math.log(bili) + 1.120 * Math.log(inr);
        let score = (meld * 10) + 6.43;

        if (score > 11) {
            let na = sodiumMELD;
            if (na < 125) na = 125;
            if (na > 137) na = 137;
            score = score + 1.32 * (137 - na) - (0.033 * score * (137 - na));
        }

        return Math.round(score);
    }, [bilirubinMELD, creatinineMELD, inrMELD, sodiumMELD, dialysis]);

    const resetCP = () => { setBilirubinCP(1); setAlbuminCP(1); setInrCP(1); setAscites(1); setEncephalopathy(1); };
    const resetMELD = () => { setBilirubinMELD(1.0); setCreatinineMELD(1.0); setInrMELD(1.0); setSodiumMELD(135); setDialysis(false); };

    return (
        <div>
            <SubSection title="Child-Pugh">
                <div className="space-y-3">
                    <FormRow><Label>Bilirrubina (mg/dL)</Label><Select value={bilirubinCP} onChange={e => setBilirubinCP(Number(e.target.value))}><option value={1}>&lt; 2 (1)</option><option value={2}>2 - 3 (2)</option><option value={3}>&gt; 3 (3)</option></Select></FormRow>
                    <FormRow><Label>Albúmina (g/dL)</Label><Select value={albuminCP} onChange={e => setAlbuminCP(Number(e.target.value))}><option value={1}>&gt; 3.5 (1)</option><option value={2}>2.8 - 3.5 (2)</option><option value={3}>&lt; 2.8 (3)</option></Select></FormRow>
                    <FormRow><Label>INR</Label><Select value={inrCP} onChange={e => setInrCP(Number(e.target.value))}><option value={1}>&lt; 1.7 (1)</option><option value={2}>1.7 - 2.3 (2)</option><option value={3}>&gt; 2.3 (3)</option></Select></FormRow>
                    <FormRow><Label>Ascitis</Label><Select value={ascites} onChange={e => setAscites(Number(e.target.value))}><option value={1}>Ausente (1)</option><option value={2}>Leve/Moderada (2)</option><option value={3}>Severa (3)</option></Select></FormRow>
                    <FormRow><Label>Encefalopatía</Label><Select value={encephalopathy} onChange={e => setEncephalopathy(Number(e.target.value))}><option value={1}>Ninguna (1)</option><option value={2}>Grado 1-2 (2)</option><option value={3}>Grado 3-4 (3)</option></Select></FormRow>
                    <ResultDisplay title="Score Child-Pugh" result={`${scoreCP} (Clase ${classCP})`} interpretation={`Supervivencia a 1 año: Clase A (~100%), B (~81%), C (~45%)`} />
                    <ResetButton onClick={resetCP} />
                </div>
            </SubSection>
             <SubSection title="MELD-Na">
                <div className="space-y-3">
                    <FormRow><Label htmlFor="meld-bili">Bilirrubina (mg/dL)</Label><Input id="meld-bili" type="number" step="0.1" value={bilirubinMELD} onChange={e => setBilirubinMELD(Number(e.target.value))} min={0} /></FormRow>
                    <FormRow><Label htmlFor="meld-creat">Creatinina (mg/dL)</Label><Input id="meld-creat" type="number" step="0.1" value={creatinineMELD} onChange={e => setCreatinineMELD(Number(e.target.value))} min={0}/></FormRow>
                    <FormRow><Label htmlFor="meld-inr">INR</Label><Input id="meld-inr" type="number" step="0.1" value={inrMELD} onChange={e => setInrMELD(Number(e.target.value))} min={0} /></FormRow>
                    <FormRow><Label htmlFor="meld-na">Sodio (mEq/L)</Label><Input id="meld-na" type="number" value={sodiumMELD} onChange={e => setSodiumMELD(Number(e.target.value))} min={0} /></FormRow>
                    <Checkbox checked={dialysis} onChange={e => setDialysis(e.target.checked)}>Paciente en diálisis (≥2 veces en la última semana)</Checkbox>
                    <ResultDisplay title="Score MELD-Na" result={scoreMELDNa} interpretation={`Mortalidad a 3 meses: ${scoreMELDNa < 10 ? '1.9%' : scoreMELDNa < 20 ? '6.0%' : scoreMELDNa < 30 ? '19.6%' : scoreMELDNa < 40 ? '52.6%' : '71.3%'}`} />
                    <ResetButton onClick={resetMELD} />
                </div>
            </SubSection>
        </div>
    );
};

const RansomBisap: FC = () => {
    // Ranson state
    const [ransonAdmission, setRansonAdmission] = useState<Record<string, boolean>>({});
    const [ranson48h, setRanson48h] = useState<Record<string, boolean>>({});
    
    // BISAP state
    const [bisap, setBisap] = useState<Record<string, boolean>>({});

    const ransonCriteria = {
        admission: [ { key: 'age', label: 'Edad > 55 años' }, { key: 'wbc', label: 'Leucocitos > 16,000/mm³' }, { key: 'glucose', label: 'Glucosa > 200 mg/dL' }, { key: 'ldh', label: 'LDH > 350 IU/L' }, { key: 'ast', label: 'AST > 250 IU/L' }, ],
        at48h: [ { key: 'hct', label: 'Caída del Hto > 10%' }, { key: 'bun', label: 'Aumento del BUN > 5 mg/dL' }, { key: 'ca', label: 'Calcio < 8 mg/dL' }, { key: 'pao2', label: 'PaO₂ < 60 mmHg' }, { key: 'bd', label: 'Déficit de base > 4 mEq/L' }, { key: 'fs', label: 'Secuestro de líquidos > 6 L' }, ]
    };

    const bisapCriteria = [ { key: 'bun', label: 'BUN > 25 mg/dL' }, { key: 'mental', label: 'Estado mental alterado (GCS < 15)' }, { key: 'sirs', label: 'SIRS presente' }, { key: 'age', label: 'Edad > 60 años' }, { key: 'pleural', label: 'Derrame pleural' }, ];

    const ransonScore = useMemo(() => Object.values(ransonAdmission).filter(Boolean).length + Object.values(ranson48h).filter(Boolean).length, [ransonAdmission, ranson48h]);
    const ransonInterp = useMemo(() => {
        if (ransonScore <= 2) return "Mortalidad ~1%";
        if (ransonScore <= 4) return "Mortalidad ~15%";
        if (ransonScore <= 6) return "Mortalidad ~40%";
        return "Mortalidad ~100%";
    }, [ransonScore]);
    const ransonAlertLevel = ransonScore >= 5 ? 'critical' : ransonScore >= 3 ? 'warning' : 'none';

    const bisapScore = useMemo(() => Object.values(bisap).filter(Boolean).length, [bisap]);
    const bisapInterp = useMemo(() => `Mortalidad: ${['<1%', '1.9%', '3.6%', '7.3%', '13.1%', '22.5%'][bisapScore] || ''}`, [bisapScore]);
    const bisapAlertLevel = bisapScore >= 3 ? 'critical' : bisapScore >= 2 ? 'warning' : 'none';

    const handleRansonChange = (set: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, key: string, value: boolean) => set(prev => ({...prev, [key]: value}));
    const handleBisapChange = (key: string, value: boolean) => setBisap(prev => ({...prev, [key]: value}));

    const resetRanson = () => { setRansonAdmission({}); setRanson48h({}); };
    const resetBisap = () => { setBisap({}); };

    return (
        <div>
            <SubSection title="Criterios de Ranson">
                <div className="space-y-4">
                    <div><h5 className="font-semibold text-sm mb-2">Al ingreso</h5><div className="space-y-1">{ransonCriteria.admission.map(c => <Checkbox key={c.key} checked={!!ransonAdmission[c.key]} onChange={e => handleRansonChange(setRansonAdmission, c.key, e.target.checked)}>{c.label}</Checkbox>)}</div></div>
                    <div><h5 className="font-semibold text-sm mb-2">A las 48 horas</h5><div className="space-y-1">{ransonCriteria.at48h.map(c => <Checkbox key={c.key} checked={!!ranson48h[c.key]} onChange={e => handleRansonChange(setRanson48h, c.key, e.target.checked)}>{c.label}</Checkbox>)}</div></div>
                    <ResultDisplay title="Score de Ranson" result={ransonScore} interpretation={ransonInterp} alertLevel={ransonAlertLevel} />
                    <ResetButton onClick={resetRanson} />
                </div>
            </SubSection>
            <SubSection title="Score BISAP">
                <div className="space-y-2">
                    {bisapCriteria.map(c => <Checkbox key={c.key} checked={!!bisap[c.key]} onChange={e => handleBisapChange(c.key, e.target.checked)}>{c.label}</Checkbox>)}
                    <ResultDisplay title="Score BISAP" result={bisapScore} interpretation={bisapInterp} alertLevel={bisapAlertLevel} />
                    <ResetButton onClick={resetBisap} />
                </div>
            </SubSection>
        </div>
    );
};

const CockcroftGaultContent: FC = () => {
    const [age, setAge] = useState(60);
    const [weight, setWeight] = useState(70);
    const [creatinine, setCreatinine] = useState(1.2);
    const [gender, setGender] = useState<'male' | 'female'>('male');

    const result = useMemo(() => {
        if (creatinine <= 0) return 0;
        const crCl = ((140 - age) * weight) / (72 * creatinine);
        return gender === 'female' ? crCl * 0.85 : crCl;
    }, [age, weight, creatinine, gender]);
    
    const reset = () => { setAge(60); setWeight(70); setCreatinine(1.2); setGender('male'); };

    return <div className="space-y-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Estima el aclaramiento de creatinina, útil para el ajuste de dosis de fármacos.</p>
        <FormRow><Label htmlFor="cg-age">Edad (años)</Label><Input id="cg-age" type="number" value={age} onChange={e => setAge(Number(e.target.value))} min={0}/></FormRow>
        <FormRow><Label htmlFor="cg-weight">Peso (kg)</Label><Input id="cg-weight" type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} min={0}/></FormRow>
        <FormRow><Label htmlFor="cg-creatinine">Creatinina Sérica (mg/dL)</Label><Input id="cg-creatinine" type="number" step="0.1" value={creatinine} onChange={e => setCreatinine(Number(e.target.value))} min={0}/></FormRow>
        <FormRow><Label>Género</Label><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" value="male" checked={gender === 'male'} onChange={() => setGender('male')} /> Hombre</label><label className="flex items-center gap-2"><input type="radio" value="female" checked={gender === 'female'} onChange={() => setGender('female')} /> Mujer</label></div></FormRow>
        <ResultDisplay title="Aclaramiento de Creatinina" result={`${result.toFixed(2)} mL/min`} />
        <ResetButton onClick={reset} />
    </div>
};

const CKDEPIContent: FC = () => {
    const [creatinine, setCreatinine] = useState(1.2);
    const [age, setAge] = useState(60);
    const [gender, setGender] = useState<'male' | 'female'>('female');
    const [race, setRace] = useState<'black' | 'other'>('other');

    const result = useMemo(() => {
        if (creatinine <= 0) return 0;
        
        let gfr;
        if(gender === 'female') {
            gfr = 144 * Math.pow(Math.min(creatinine / 0.7, 1), -0.329) * Math.pow(Math.max(creatinine / 0.7, 1), -1.209) * Math.pow(0.993, age);
        } else { // male
            gfr = 141 * Math.pow(Math.min(creatinine / 0.9, 1), -0.411) * Math.pow(Math.max(creatinine / 0.9, 1), -1.209) * Math.pow(0.993, age);
        }

        if (race === 'black') {
            gfr *= 1.159;
        }

        return gfr;
    }, [creatinine, age, gender, race]);
    
    const interpretation = useMemo(() => {
        const r = result;
        if (r >= 90) return "Estadio G1: FG normal o alta (≥90)";
        if (r >= 60) return "Estadio G2: Levemente disminuida (60-89)";
        if (r >= 45) return "Estadio G3a: Leve a moderadamente disminuida (45-59)";
        if (r >= 30) return "Estadio G3b: Moderada a severamente disminuida (30-44)";
        if (r >= 15) return "Estadio G4: Severamente disminuida (15-29)";
        return "Estadio G5: Falla renal (<15)";
    }, [result]);

    const reset = () => { setCreatinine(1.2); setAge(60); setGender('female'); setRace('other'); };

    return (
        <div className="space-y-3">
             <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Método preferido para estimar la TFG y clasificar la enfermedad renal crónica (ERC).</p>
            <FormRow><Label htmlFor="ckdepi-age">Edad (años)</Label><Input id="ckdepi-age" type="number" value={age} onChange={e => setAge(Number(e.target.value))} min={0}/></FormRow>
            <FormRow><Label htmlFor="ckdepi-creatinine">Creatinina Sérica (mg/dL)</Label><Input id="ckdepi-creatinine" type="number" step="0.1" value={creatinine} onChange={e => setCreatinine(Number(e.target.value))} min={0}/></FormRow>
            <FormRow><Label>Género</Label><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" value="male" checked={gender === 'male'} onChange={() => setGender('male')} /> Hombre</label><label className="flex items-center gap-2"><input type="radio" value="female" checked={gender === 'female'} onChange={() => setGender('female')} /> Mujer</label></div></FormRow>
            <FormRow><Label>Raza (según fórmula original)</Label><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" value="black" checked={race === 'black'} onChange={() => setRace('black')} /> Negra</label><label className="flex items-center gap-2"><input type="radio" value="other" checked={race === 'other'} onChange={() => setRace('other')} /> Otra</label></div></FormRow>
            <ResultDisplay title="Tasa de Filtrado Glomerular (TFG)" result={`${result.toFixed(2)} mL/min/1.73m²`} interpretation={interpretation} />
            <ResetButton onClick={reset} />
        </div>
    );
};

const RenalFunctionCalculators: FC = () => {
    return (
        <div>
            <SubSection title="Fórmula de Cockcroft-Gault">
                <CockcroftGaultContent />
            </SubSection>
            <SubSection title="Ecuación CKD-PI">
                <CKDEPIContent />
            </SubSection>
        </div>
    );
};


const ApgarScore: FC = () => {
    const [appearance, setAppearance] = useState(2);
    const [pulse, setPulse] = useState(2);
    const [grimace, setGrimace] = useState(2);
    const [activity, setActivity] = useState(2);
    const [respiration, setRespiration] = useState(2);

    const total = useMemo(() => appearance + pulse + grimace + activity + respiration, [appearance, pulse, grimace, activity, respiration]);
    const interpretation = useMemo(() => {
        if (total >= 7) return "Sin depresión (7-10)";
        if (total >= 4) return "Depresión moderada (4-6)";
        return "Depresión severa (0-3)";
    }, [total]);

    const reset = () => { setAppearance(2); setPulse(2); setGrimace(2); setActivity(2); setRespiration(2); };

    return <div className="space-y-2 text-sm">
        <FormRow><Label>Apariencia (Color)</Label><Select value={appearance} onChange={e => setAppearance(Number(e.target.value))}><option value={2}>Completamente rosado (2)</option><option value={1}>Cuerpo rosado, extremidades azules (1)</option><option value={0}>Azul, pálido (0)</option></Select></FormRow>
        <FormRow><Label>Pulso (Frecuencia Cardiaca)</Label><Select value={pulse} onChange={e => setPulse(Number(e.target.value))}><option value={2}>&gt; 100 lpm (2)</option><option value={1}>&lt; 100 lpm (1)</option><option value={0}>Ausente (0)</option></Select></FormRow>
        <FormRow><Label>Gesticulación (Respuesta a estímulos)</Label><Select value={grimace} onChange={e => setGrimace(Number(e.target.value))}><option value={2}>Estornudo, tos, pataleo (2)</option><option value={1}>Muecas (1)</option><option value={0}>Sin respuesta (0)</option></Select></FormRow>
        <FormRow><Label>Actividad (Tono muscular)</Label><Select value={activity} onChange={e => setActivity(Number(e.target.value))}><option value={2}>Movimiento activo (2)</option><option value={1}>Algo de flexión (1)</option><option value={0}>Flácido (0)</option></Select></FormRow>
        <FormRow><Label>Respiración (Esfuerzo respiratorio)</Label><Select value={respiration} onChange={e => setRespiration(Number(e.target.value))}><option value={2}>Llanto fuerte (2)</option><option value={1}>Lenta, irregular (1)</option><option value={0}>Ausente (0)</option></Select></FormRow>
        <ResultDisplay title="Puntuación APGAR" result={total} interpretation={interpretation} />
        <ResetButton onClick={reset} />
    </div>
};

const SilvermanAndersonScore: FC = () => {
    const [movToracoAbd, setMovToracoAbd] = useState(0);
    const [tiraje, setTiraje] = useState(0);
    const [retraccion, setRetraccion] = useState(0);
    const [aleteo, setAleteo] = useState(0);
    const [quejido, setQuejido] = useState(0);
    
    const total = useMemo(() => movToracoAbd + tiraje + retraccion + aleteo + quejido, [movToracoAbd, tiraje, retraccion, aleteo, quejido]);
    const interpretation = useMemo(() => {
        if (total === 0) return "Sin dificultad respiratoria";
        if (total <= 3) return "Dificultad respiratoria leve";
        if (total <= 6) return "Dificultad respiratoria moderada";
        return "Dificultad respiratoria grave";
    }, [total]);

    const reset = () => { setMovToracoAbd(0); setTiraje(0); setRetraccion(0); setAleteo(0); setQuejido(0); };

    return <div className="space-y-2 text-sm">
        <FormRow><Label>Mov. Toraco-abdominales</Label><Select value={movToracoAbd} onChange={e => setMovToracoAbd(Number(e.target.value))}><option value={0}>Rítmicos y regulares (0)</option><option value={1}>Tórax inmóvil, abdomen en movimiento (1)</option><option value={2}>Disociación toraco-abdominal (2)</option></Select></FormRow>
        <FormRow><Label>Tiraje Intercostal</Label><Select value={tiraje} onChange={e => setTiraje(Number(e.target.value))}><option value={0}>Ausente (0)</option><option value={1}>Leve (1)</option><option value={2}>Intenso y generalizado (2)</option></Select></FormRow>
        <FormRow><Label>Retracción Xifoidea</Label><Select value={retraccion} onChange={e => setRetraccion(Number(e.target.value))}><option value={0}>Ausente (0)</option><option value={1}>Leve (1)</option><option value={2}>Intensa (2)</option></Select></FormRow>
        <FormRow><Label>Aleteo Nasal</Label><Select value={aleteo} onChange={e => setAleteo(Number(e.target.value))}><option value={0}>Ausente (0)</option><option value={1}>Leve (1)</option><option value={2}>Intenso (2)</option></Select></FormRow>
        <FormRow><Label>Quejido Espiratorio</Label><Select value={quejido} onChange={e => setQuejido(Number(e.target.value))}><option value={0}>Ausente (0)</option><option value={1}>Leve, intermitente (1)</option><option value={2}>Intenso y constante (2)</option></Select></FormRow>
        <ResultDisplay title="Score de Silverman-Anderson" result={total} interpretation={interpretation} />
        <ResetButton onClick={reset} />
    </div>;
};

const CapurroMethod: FC = () => {
    const [pezon, setPezon] = useState(0);
    const [piel, setPiel] = useState(0);
    const [oreja, setOreja] = useState(0);
    const [glandula, setGlandula] = useState(0);
    const [pliegues, setPliegues] = useState(0);

    const score = useMemo(() => pezon + piel + oreja + glandula + pliegues, [pezon, piel, oreja, glandula, pliegues]);
    const { weeks, days, interpretation } = useMemo(() => {
        const totalDays = (score + 204);
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays % 7;
        let interp = "A término (37-41 sem)";
        if (weeks < 37) interp = "Pretérmino (<37 sem)";
        else if (weeks >= 42) interp = "Postérmino (≥42 sem)";
        return { weeks, days, interpretation: interp };
    }, [score]);

    const reset = () => { setPezon(0); setPiel(0); setOreja(0); setGlandula(0); setPliegues(0); };

    return <div className="space-y-2 text-sm">
        <FormRow><Label>Forma del pezón</Label><Select value={pezon} onChange={e => setPezon(Number(e.target.value))}><option value={0}>Apenas visible (0)</option><option value={5}>Diámetro &lt; 7.5mm, areola lisa (5)</option><option value={10}>Diámetro &gt; 7.5mm, areola punteada (10)</option><option value={15}>Diámetro &gt; 7.5mm, areola punteada, borde levantado (15)</option></Select></FormRow>
        <FormRow><Label>Textura de la piel</Label><Select value={piel} onChange={e => setPiel(Number(e.target.value))}><option value={0}>Muy fina, gelatinosa (0)</option><option value={5}>Fina, lisa (5)</option><option value={10}>Más gruesa, discreta descamación (10)</option><option value={15}>Gruesa, grietas superficiales (15)</option><option value={20}>Gruesa, grietas profundas (20)</option></Select></FormRow>
        <FormRow><Label>Forma de la oreja</Label><Select value={oreja} onChange={e => setOreja(Number(e.target.value))}><option value={0}>Aplanada, sin incurvación (0)</option><option value={8}>Pabellón parcialmente incurvado (8)</option><option value={16}>Pabellón totalmente incurvado (16)</option><option value={24}>Pabellón totalmente incurvado, cartílago grueso (24)</option></Select></FormRow>
        <FormRow><Label>Tamaño glándula mamaria</Label><Select value={glandula} onChange={e => setGlandula(Number(e.target.value))}><option value={0}>No palpable (0)</option><option value={5}>Palpable &lt; 5mm (5)</option><option value={10}>Palpable 5-10mm (10)</option><option value={15}>Palpable &gt; 10mm (15)</option></Select></FormRow>
        <FormRow><Label>Pliegues plantares</Label><Select value={pliegues} onChange={e => setPliegues(Number(e.target.value))}><option value={0}>Sin pliegues (0)</option><option value={5}>Marcas mal definidas en 1/3 anterior (5)</option><option value={10}>Marcas bien definidas en 1/2 anterior (10)</option><option value={15}>Surcos en 1/2 anterior (15)</option><option value={20}>Surcos en más de 1/2 anterior (20)</option></Select></FormRow>
        <ResultDisplay title="Edad Gestacional Estimada" result={`${weeks} semanas y ${days} días`} interpretation={interpretation} />
        <ResetButton onClick={reset} />
    </div>;
};

const ModifiedRankinScale: FC = () => {
    const [score, setScore] = useState(0);

    const options = [
        { value: 0, text: "0 - Sin síntomas." },
        { value: 1, text: "1 - Sin discapacidad significativa a pesar de los síntomas." },
        { value: 2, text: "2 - Discapacidad leve; incapaz de llevar a cabo todas las actividades previas." },
        { value: 3, text: "3 - Discapacidad moderada; requiere algo de ayuda." },
        { value: 4, text: "4 - Discapacidad moderadamente severa; incapaz de caminar sin ayuda." },
        { value: 5, text: "5 - Discapacidad severa; postrado en cama, incontinente." },
        { value: 6, text: "6 - Muerte." }
    ];

    return <div className="space-y-3">
        <FormRow>
            <Label htmlFor="mrs-score">Grado de Discapacidad</Label>
            <Select id="mrs-score" value={score} onChange={e => setScore(Number(e.target.value))}>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
            </Select>
        </FormRow>
        <ResultDisplay title="Escala de Rankin Modificada (mRS)" result={`Puntuación: ${score}`} interpretation={options[score].text} />
        <ResetButton onClick={() => setScore(0)} />
    </div>
};

const NIHSS: FC = () => {
    const [s, setS] = useState<Record<string, number>>({
        "1a": 0, "1b": 0, "1c": 0, "2": 0, "3": 0, "4": 0,
        "5a": 0, "5b": 0, "6a": 0, "6b": 0, "7": 0, "8": 0,
        "9": 0, "10": 0, "11": 0
    });

    // Fix: Explicitly type accumulator and value in reduce to avoid 'unknown' type errors.
    const total = useMemo(() => Object.values(s).reduce((a: number, b: number) => a + b, 0), [s]);
    const interpretation = useMemo(() => {
        if (total === 0) return "Sin ictus";
        if (total <= 4) return "Ictus menor";
        if (total <= 15) return "Ictus moderado";
        if (total <= 20) return "Ictus moderado a severo";
        return "Ictus severo";
    }, [total]);
    
    const update = (key: string, val: number) => setS(prev => ({...prev, [key]: val}));
    const reset = () => setS({ "1a": 0, "1b": 0, "1c": 0, "2": 0, "3": 0, "4": 0, "5a": 0, "5b": 0, "6a": 0, "6b": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0 });

    return <div className="space-y-3 text-sm">
        <FormRow><Label>1a. Nivel de Conciencia</Label><Select value={s["1a"]} onChange={e => update("1a", +e.target.value)}><option value={0}>Alerta (0)</option><option value={1}>Somnoliento (1)</option><option value={2}>Estuporoso (2)</option><option value={3}>Coma (3)</option></Select></FormRow>
        <FormRow><Label>1b. Orientación (Mes, Edad)</Label><Select value={s["1b"]} onChange={e => update("1b", +e.target.value)}><option value={0}>Ambas correctas (0)</option><option value={1}>Una correcta (1)</option><option value={2}>Ninguna correcta (2)</option></Select></FormRow>
        <FormRow><Label>1c. Órdenes (Abrir/cerrar ojos, puño)</Label><Select value={s["1c"]} onChange={e => update("1c", +e.target.value)}><option value={0}>Ambas correctas (0)</option><option value={1}>Una correcta (1)</option><option value={2}>Ninguna correcta (2)</option></Select></FormRow>
        <FormRow><Label>2. Mirada Conjugada</Label><Select value={s["2"]} onChange={e => update("2", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Paresia parcial (1)</option><option value={2}>Desviación forzada (2)</option></Select></FormRow>
        <FormRow><Label>3. Campos Visuales</Label><Select value={s["3"]} onChange={e => update("3", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Hemianopsia parcial (1)</option><option value={2}>Hemianopsia completa (2)</option><option value={3}>Bilateral (3)</option></Select></FormRow>
        <FormRow><Label>4. Paresia Facial</Label><Select value={s["4"]} onChange={e => update("4", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Menor (1)</option><option value={2}>Parcial (2)</option><option value={3}>Completa (3)</option></Select></FormRow>
        <FormRow><Label>5a. Motor Brazo Izquierdo</Label><Select value={s["5a"]} onChange={e => update("5a", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Cae (1)</option><option value={2}>Vence gravedad (2)</option><option value={3}>No vence gravedad (3)</option><option value={4}>No movimiento (4)</option></Select></FormRow>
        <FormRow><Label>5b. Motor Brazo Derecho</Label><Select value={s["5b"]} onChange={e => update("5b", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Cae (1)</option><option value={2}>Vence gravedad (2)</option><option value={3}>No vence gravedad (3)</option><option value={4}>No movimiento (4)</option></Select></FormRow>
        <FormRow><Label>6a. Motor Pierna Izquierda</Label><Select value={s["6a"]} onChange={e => update("6a", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Cae (1)</option><option value={2}>Vence gravedad (2)</option><option value={3}>No vence gravedad (3)</option><option value={4}>No movimiento (4)</option></Select></FormRow>
        <FormRow><Label>6b. Motor Pierna Derecha</Label><Select value={s["6b"]} onChange={e => update("6b", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Cae (1)</option><option value={2}>Vence gravedad (2)</option><option value={3}>No vence gravedad (3)</option><option value={4}>No movimiento (4)</option></Select></FormRow>
        <FormRow><Label>7. Ataxia de Miembros</Label><Select value={s["7"]} onChange={e => update("7", +e.target.value)}><option value={0}>Ausente (0)</option><option value={1}>En un miembro (1)</option><option value={2}>En dos miembros (2)</option></Select></FormRow>
        <FormRow><Label>8. Sensibilidad</Label><Select value={s["8"]} onChange={e => update("8", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Pérdida leve-moderada (1)</option><option value={2}>Pérdida severa-total (2)</option></Select></FormRow>
        <FormRow><Label>9. Lenguaje (Afasia)</Label><Select value={s["9"]} onChange={e => update("9", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Leve-moderada (1)</option><option value={2}>Severa (2)</option><option value={3}>Global / Mutismo (3)</option></Select></FormRow>
        <FormRow><Label>10. Disartria</Label><Select value={s["10"]} onChange={e => update("10", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Leve-moderada (1)</option><option value={2}>Severa (2)</option></Select></FormRow>
        <FormRow><Label>11. Extinción / Inatención</Label><Select value={s["11"]} onChange={e => update("11", +e.target.value)}><option value={0}>Normal (0)</option><option value={1}>Parcial (1)</option><option value={2}>Completa (2)</option></Select></FormRow>
        <ResultDisplay title="Puntuación NIHSS Total" result={total} interpretation={interpretation} />
        <ResetButton onClick={reset} />
    </div>
};

const WellsGenevaScales: FC = () => {
    const [dvt, setDvt] = useState<Record<string, boolean>>({});
    const [pe, setPe] = useState<Record<string, { value: number, checked: boolean }>>({
        'prev': { value: 1.5, checked: false }, 'hr': { value: 1.5, checked: false },
        'surgery': { value: 1.5, checked: false }, 'cancer': { value: 1, checked: false },
        'hemoptysis': { value: 1, checked: false }, 'signs': { value: 3, checked: false },
        'alt': { value: 3, checked: false }
    });
     const [geneva, setGeneva] = useState<Record<string, { value: number, checked: boolean }>>({
        'age': { value: 1, checked: false }, 'prev': { value: 3, checked: false },
        'surgery': { value: 2, checked: false }, 'cancer': { value: 2, checked: false },
        'limb': { value: 3, checked: false }, 'hemoptysis': { value: 2, checked: false },
        'hr1': { value: 3, checked: false }, 'hr2': { value: 5, checked: false },
        'pain': { value: 4, checked: false }
    });

    const dvtCriteria = [ { key: 'cancer', label: 'Cáncer activo' }, { key: 'paralysis', label: 'Parálisis, paresia o inmovilización reciente de MMII' }, { key: 'bedridden', label: 'Encamamiento >3 días o cirugía mayor <12 sem' }, { key: 'tenderness', label: 'Dolor localizado en trayecto venoso profundo' }, { key: 'swelling', label: 'Hinchazón de toda la pierna' }, { key: 'calf', label: 'Hinchazón de pantorrilla >3 cm' }, { key: 'pitting', label: 'Edema con fóvea (mayor en pierna sintomática)' }, { key: 'collateral', label: 'Venas superficiales colaterales (no varicosas)' }, { key: 'prev', label: 'TVP previa documentada' }, { key: 'alt', label: 'Diagnóstico alternativo tan o más probable (-2 pts)', value: -2 } ];
    const dvtScore = useMemo(() => dvtCriteria.reduce((sum, crit) => sum + (dvt[crit.key] ? (crit.value || 1) : 0), 0), [dvt]);
    const dvtInterp = useMemo(() => {
        if (dvtScore >= 3) return "Alta probabilidad (>75%)";
        if (dvtScore >= 1) return "Probabilidad moderada (17-53%)";
        return "Baja probabilidad (<5%)";
    }, [dvtScore]);
    const dvtAlertLevel = dvtScore >= 3 ? 'critical' : dvtScore >= 1 ? 'warning' : 'none';

    // Fix: Explicitly type accumulator and item in reduce to avoid 'unknown' type errors.
    const peScore = useMemo(() => Object.values(pe).reduce((sum: number, item: { value: number; checked: boolean; }) => sum + (item.checked ? item.value : 0), 0), [pe]);
    const peInterp = useMemo(() => {
        if (peScore > 6) return "Alta probabilidad";
        if (peScore > 1) return "Probabilidad moderada";
        return "Baja probabilidad";
    }, [peScore]);
    const peAlertLevel = peScore > 6 ? 'critical' : peScore > 1 ? 'warning' : 'none';
    
    // Fix: Explicitly type accumulator and item in reduce to avoid 'unknown' type errors.
    const genevaScore = useMemo(() => Object.values(geneva).reduce((sum: number, item: { value: number; checked: boolean; }) => sum + (item.checked ? item.value : 0), 0), [geneva]);
    const genevaInterp = useMemo(() => {
        if (genevaScore >= 11) return "Alta probabilidad (>70%)";
        if (genevaScore >= 4) return "Probabilidad intermedia (30-70%)";
        return "Baja probabilidad (<10%)";
    }, [genevaScore]);
    const genevaAlertLevel = genevaScore >= 11 ? 'critical' : genevaScore >= 4 ? 'warning' : 'none';
    
    return <div>
        <SubSection title="Criterios de Wells para TVP">
            <div className="space-y-1">{dvtCriteria.map(c => <Checkbox key={c.key} checked={!!dvt[c.key]} onChange={e => setDvt(p => ({ ...p, [c.key]: e.target.checked }))}>{c.label}</Checkbox>)}</div>
            <ResultDisplay title="Score de Wells (TVP)" result={dvtScore} interpretation={dvtInterp} alertLevel={dvtAlertLevel} />
            <ResetButton onClick={() => setDvt({})} />
        </SubSection>
        <SubSection title="Criterios de Wells para TEP">
             <div className="space-y-1">
                <Checkbox checked={pe.signs.checked} onChange={e => setPe(p => ({...p, signs: {...p.signs, checked: e.target.checked}}))}>Signos clínicos de TVP (+3)</Checkbox>
                <Checkbox checked={pe.alt.checked} onChange={e => setPe(p => ({...p, alt: {...p.alt, checked: e.target.checked}}))}>Diagnóstico alternativo menos probable que TEP (+3)</Checkbox>
                <Checkbox checked={pe.hr.checked} onChange={e => setPe(p => ({...p, hr: {...p.hr, checked: e.target.checked}}))}>{'Frecuencia cardíaca > 100 lpm (+1.5)'}</Checkbox>
                <Checkbox checked={pe.surgery.checked} onChange={e => setPe(p => ({...p, surgery: {...p.surgery, checked: e.target.checked}}))}>Inmovilización o cirugía en las 4 semanas previas (+1.5)</Checkbox>
                <Checkbox checked={pe.prev.checked} onChange={e => setPe(p => ({...p, prev: {...p.prev, checked: e.target.checked}}))}>TEP o TVP previa (+1.5)</Checkbox>
                <Checkbox checked={pe.hemoptysis.checked} onChange={e => setPe(p => ({...p, hemoptysis: {...p.hemoptysis, checked: e.target.checked}}))}>Hemoptisis (+1)</Checkbox>
                <Checkbox checked={pe.cancer.checked} onChange={e => setPe(p => ({...p, cancer: {...p.cancer, checked: e.target.checked}}))}>Cáncer activo (+1)</Checkbox>
            </div>
            <ResultDisplay title="Score de Wells (TEP)" result={peScore} interpretation={peInterp} alertLevel={peAlertLevel} />
            <ResetButton onClick={() => setPe(p => Object.fromEntries(Object.keys(p).map(k => [k, { ...p[k], checked: false }])))} />
        </SubSection>
        <SubSection title="Score de Ginebra Revisado para TEP">
             <div className="space-y-1">
                 <Checkbox checked={geneva.hr2.checked} onChange={e => setGeneva(p => ({...p, hr2: {...p.hr2, checked: e.target.checked}}))}>{'FC > 95 lpm (+5)'}</Checkbox>
                 <Checkbox checked={geneva.pain.checked} onChange={e => setGeneva(p => ({...p, pain: {...p.pain, checked: e.target.checked}}))}>Dolor a la palpación venosa profunda y edema de MMII (+4)</Checkbox>
                 <Checkbox checked={geneva.prev.checked} onChange={e => setGeneva(p => ({...p, prev: {...p.prev, checked: e.target.checked}}))}>TEP o TVP previa (+3)</Checkbox>
                 <Checkbox checked={geneva.hr1.checked} onChange={e => setGeneva(p => ({...p, hr1: {...p.hr1, checked: e.target.checked}}))}>FC 75-94 lpm (+3)</Checkbox>
                 <Checkbox checked={geneva.limb.checked} onChange={e => setGeneva(p => ({...p, limb: {...p.limb, checked: e.target.checked}}))}>Dolor unilateral en MMII (+3)</Checkbox>
                 <Checkbox checked={geneva.surgery.checked} onChange={e => setGeneva(p => ({...p, surgery: {...p.surgery, checked: e.target.checked}}))}>Cirugía o fractura en el último mes (+2)</Checkbox>
                 <Checkbox checked={geneva.cancer.checked} onChange={e => setGeneva(p => ({...p, cancer: {...p.cancer, checked: e.target.checked}}))}>Cáncer activo (+2)</Checkbox>
                 <Checkbox checked={geneva.hemoptysis.checked} onChange={e => setGeneva(p => ({...p, hemoptysis: {...p.hemoptysis, checked: e.target.checked}}))}>Hemoptisis (+2)</Checkbox>
                 <Checkbox checked={geneva.age.checked} onChange={e => setGeneva(p => ({...p, age: {...p.age, checked: e.target.checked}}))}>{'Edad > 65 años (+1)'}</Checkbox>
            </div>
            <ResultDisplay title="Score de Ginebra (TEP)" result={genevaScore} interpretation={genevaInterp} alertLevel={genevaAlertLevel} />
             <ResetButton onClick={() => setGeneva(p => Object.fromEntries(Object.keys(p).map(k => [k, { ...p[k], checked: false }])))} />
        </SubSection>
    </div>
};

const AnionGapWintersFormula: FC = () => {
    const [na, setNa] = useState(140);
    const [cl, setCl] = useState(104);
    const [hco3, setHco3] = useState(24);
    const [paco2, setPaco2] = useState(40);

    const anionGap = useMemo(() => na - (cl + hco3), [na, cl, hco3]);
    const agInterp = useMemo(() => {
        if(anionGap > 12) return "Acidosis Metabólica con Anion Gap Elevado";
        if(anionGap < 6) return "Anion Gap Bajo (raro, considerar hipoalbuminemia)";
        return "Anion Gap Normal (6-12 mEq/L)";
    }, [anionGap]);
    
    const winters = useMemo(() => {
        const expected = (1.5 * hco3) + 8;
        return { lower: expected - 2, upper: expected + 2 };
    }, [hco3]);

    const wintersInterp = useMemo(() => {
        if(anionGap <= 12) return "No aplica (no hay acidosis con Anion Gap elevado).";
        if(paco2 < winters.lower) return "Compensación respiratoria + Alcalosis respiratoria primaria.";
        if(paco2 > winters.upper) return "Compensación inadecuada (Acidosis respiratoria concurrente).";
        return "Compensación respiratoria adecuada.";
    }, [paco2, winters, anionGap]);

    const reset = () => { setNa(140); setCl(104); setHco3(24); setPaco2(40); };

    return <div>
        <SubSection title="Anion Gap (Brecha Aniónica)">
            <div className="space-y-3">
                <FormRow><Label htmlFor="ag-na">Sodio (Na⁺) mEq/L</Label><Input id="ag-na" type="number" value={na} onChange={e => setNa(Number(e.target.value))} /></FormRow>
                <FormRow><Label htmlFor="ag-cl">Cloro (Cl⁻) mEq/L</Label><Input id="ag-cl" type="number" value={cl} onChange={e => setCl(Number(e.target.value))} /></FormRow>
                <FormRow><Label htmlFor="ag-hco3">Bicarbonato (HCO₃⁻) mEq/L</Label><Input id="ag-hco3" type="number" value={hco3} onChange={e => setHco3(Number(e.target.value))} /></FormRow>
                <ResultDisplay title="Anion Gap" result={`${anionGap.toFixed(1)} mEq/L`} interpretation={agInterp} />
            </div>
        </SubSection>
        <SubSection title="Fórmula de Winter">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Evalúa la compensación respiratoria en la Acidosis Metabólica.</p>
            <div className="space-y-3">
                 <FormRow><Label htmlFor="win-paco2">PaCO₂ medido (mmHg)</Label><Input id="win-paco2" type="number" value={paco2} onChange={e => setPaco2(Number(e.target.value))} /></FormRow>
                 <ResultDisplay title="PaCO₂ Esperado" result={`${winters.lower.toFixed(1)} - ${winters.upper.toFixed(1)} mmHg`} interpretation={wintersInterp} />
            </div>
        </SubSection>
        <div className="text-center"><ResetButton onClick={reset} /></div>
    </div>
};

const WaterSodiumDeficit: FC = () => {
    const [weight, setWeight] = useState(70);
    const [gender, setGender] = useState(0.6);
    const [currentNa, setCurrentNa] = useState(150);
    const [desiredNa, setDesiredNa] = useState(135);

    const tbw = useMemo(() => weight * gender, [weight, gender]);
    const waterDeficit = useMemo(() => {
        if (currentNa <= 145) return 0;
        return ((currentNa / 140) - 1) * tbw;
    }, [currentNa, tbw]);

    const sodiumDeficit = useMemo(() => {
        if (currentNa >= 135) return 0;
        return (desiredNa - currentNa) * tbw;
    }, [currentNa, desiredNa, tbw]);

    const reset = () => { setWeight(70); setGender(0.6); setCurrentNa(150); setDesiredNa(135); };

    return <div>
        <div className="space-y-3">
            <FormRow><Label htmlFor="wsd-weight">Peso (kg)</Label><Input id="wsd-weight" type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} /></FormRow>
            <FormRow><Label>Género</Label><Select value={gender} onChange={e => setGender(Number(e.target.value))}><option value={0.6}>Hombre</option><option value={0.5}>Mujer</option><option value={0.5}>Anciano</option><option value={0.45}>Anciana</option></Select></FormRow>
            <FormRow><Label htmlFor="wsd-current-na">Sodio Actual (mEq/L)</Label><Input id="wsd-current-na" type="number" value={currentNa} onChange={e => setCurrentNa(Number(e.target.value))} /></FormRow>
        </div>
        <SubSection title="Déficit de Agua (Hipernatremia)">
            <ResultDisplay title="Déficit de Agua Libre" result={waterDeficit > 0 ? `${waterDeficit.toFixed(2)} L` : "N/A"} interpretation={waterDeficit > 0 ? "Corregir lentamente (ej. en 48-72h) para evitar edema cerebral." : "Sodio actual no está en rango de hipernatremia."} />
        </SubSection>
        <SubSection title="Déficit de Sodio (Hiponatremia)">
            <FormRow className="mb-2"><Label htmlFor="wsd-desired-na">Sodio Deseado (mEq/L)</Label><Input id="wsd-desired-na" type="number" value={desiredNa} onChange={e => setDesiredNa(Number(e.target.value))} /></FormRow>
             <ResultDisplay title="Déficit de Sodio" result={sodiumDeficit > 0 ? `${sodiumDeficit.toFixed(2)} mEq` : "N/A"} interpretation={sodiumDeficit > 0 ? "¡PRECAUCIÓN! Corregir máx. 8-10 mEq/L en 24h para evitar mielinólisis pontina." : "Sodio actual no está en rango de hiponatremia."} />
        </SubSection>
        <div className="text-center"><ResetButton onClick={reset} /></div>
    </div>;
};

const ChadsvascScore: FC = () => {
    const [criteria, setCriteria] = useState<Record<string, boolean>>({});

    const score = useMemo(() => {
        let total = 0;
        if (criteria.chf) total += 1;
        if (criteria.htn) total += 1;
        if (criteria.age75) total += 2;
        if (criteria.dm) total += 1;
        if (criteria.stroke) total += 2;
        if (criteria.vascular) total += 1;
        if (criteria.age65_74 && !criteria.age75) total += 1;
        if (criteria.female) total += 1;
        return total;
    }, [criteria]);
    
    const isMale = !criteria.female;
    
    const interpretation = useMemo(() => {
        if ((isMale && score === 0) || (!isMale && score === 1)) return "Riesgo bajo. Considerar no tratar.";
        if ((isMale && score === 1) || (!isMale && score === 2)) return "Riesgo intermedio. Considerar anticoagulación oral.";
        return "Riesgo alto. Se recomienda anticoagulación oral.";
    }, [score, isMale]);

    const alertLevel = useMemo(() => {
        if ((isMale && score >= 2) || (!isMale && score >= 3)) return 'critical';
        if ((isMale && score === 1) || (!isMale && score === 2)) return 'warning';
        return 'none';
    }, [score, isMale]);

    const handleChange = (key: string, checked: boolean) => {
        setCriteria(prev => ({ ...prev, [key]: checked }));
    };

    const reset = () => setCriteria({});

    return <div className="space-y-2">
        <Checkbox checked={!!criteria.chf} onChange={e => handleChange('chf', e.target.checked)}>Insuficiencia Cardiaca Congestiva (C)</Checkbox>
        <Checkbox checked={!!criteria.htn} onChange={e => handleChange('htn', e.target.checked)}>Hipertensión (H)</Checkbox>
        <Checkbox checked={!!criteria.age75} onChange={e => handleChange('age75', e.target.checked)}>Edad ≥ 75 años (A₂)</Checkbox>
        <Checkbox checked={!!criteria.dm} onChange={e => handleChange('dm', e.target.checked)}>Diabetes Mellitus (D)</Checkbox>
        <Checkbox checked={!!criteria.stroke} onChange={e => handleChange('stroke', e.target.checked)}>Ictus/AIT/TE previo (S₂)</Checkbox>
        <Checkbox checked={!!criteria.vascular} onChange={e => handleChange('vascular', e.target.checked)}>Enfermedad vascular (IAM previo, EAP, placa aórtica) (V)</Checkbox>
        <Checkbox checked={!!criteria.age65_74} onChange={e => handleChange('age65_74', e.target.checked)}>Edad 65-74 años (A)</Checkbox>
        <Checkbox checked={!!criteria.female} onChange={e => handleChange('female', e.target.checked)}>Sexo Femenino (Sc)</Checkbox>
        <ResultDisplay title="Score CHADS₂-VASc" result={score} interpretation={interpretation} alertLevel={alertLevel} />
        <ResetButton onClick={reset} />
    </div>
};

const NortonBradenScales: FC = () => {
    const [braden, setBraden] = useState<Record<string, number>>({ sensory: 4, moisture: 4, activity: 4, mobility: 4, nutrition: 4, friction: 3 });
    const [norton, setNorton] = useState<Record<string, number>>({ physical: 4, mental: 4, activity: 4, mobility: 4, incontinence: 4 });

    // Fix: Explicitly type accumulator and value in reduce to avoid 'unknown' type errors.
    const bradenScore = useMemo(() => Object.values(braden).reduce((a: number, b: number) => a + b, 0), [braden]);
    const bradenInterp = useMemo(() => {
        if (bradenScore <= 9) return "Riesgo muy alto";
        if (bradenScore <= 12) return "Riesgo alto";
        if (bradenScore <= 14) return "Riesgo moderado";
        if (bradenScore <= 18) return "Riesgo bajo (en riesgo)";
        return "Sin riesgo";
    }, [bradenScore]);
    const bradenAlertLevel = bradenScore <= 9 ? 'critical' : bradenScore <= 12 ? 'warning' : 'none';

    // Fix: Explicitly type accumulator and value in reduce to avoid 'unknown' type errors.
    const nortonScore = useMemo(() => Object.values(norton).reduce((a: number, b: number) => a + b, 0), [norton]);
    const nortonInterp = useMemo(() => {
        if (nortonScore < 12) return "Riesgo muy alto";
        if (nortonScore <= 14) return "Riesgo alto";
        return "Riesgo bajo / Sin riesgo aparente";
    }, [nortonScore]);
    const nortonAlertLevel = nortonScore < 12 ? 'critical' : nortonScore <= 14 ? 'warning' : 'none';

    const updateBraden = (key: string, value: number) => setBraden(prev => ({...prev, [key]: value}));
    const resetBraden = () => setBraden({ sensory: 4, moisture: 4, activity: 4, mobility: 4, nutrition: 4, friction: 3 });
    const updateNorton = (key: string, value: number) => setNorton(prev => ({...prev, [key]: value}));
    const resetNorton = () => setNorton({ physical: 4, mental: 4, activity: 4, mobility: 4, incontinence: 4 });

    return <div>
        <SubSection title="Escala de Braden">
            <div className="space-y-3 text-sm">
                <FormRow><Label>Percepción Sensorial</Label><Select value={braden.sensory} onChange={e => updateBraden('sensory', +e.target.value)}><option value={4}>Sin limitación (4)</option><option value={3}>Ligeramente limitado (3)</option><option value={2}>Muy limitado (2)</option><option value={1}>Completamente limitado (1)</option></Select></FormRow>
                <FormRow><Label>Humedad</Label><Select value={braden.moisture} onChange={e => updateBraden('moisture', +e.target.value)}><option value={4}>Raramente húmedo (4)</option><option value={3}>Ocasionalmente húmedo (3)</option><option value={2}>A menudo húmedo (2)</option><option value={1}>Constantemente húmedo (1)</option></Select></FormRow>
                <FormRow><Label>Actividad</Label><Select value={braden.activity} onChange={e => updateBraden('activity', +e.target.value)}><option value={4}>Camina frecuentemente (4)</option><option value={3}>Camina ocasionalmente (3)</option><option value={2}>En silla (2)</option><option value={1}>En cama (1)</option></Select></FormRow>
                <FormRow><Label>Movilidad</Label><Select value={braden.mobility} onChange={e => updateBraden('mobility', +e.target.value)}><option value={4}>Sin limitaciones (4)</option><option value={3}>Ligeramente limitado (3)</option><option value={2}>Muy limitado (2)</option><option value={1}>Completamente inmóvil (1)</option></Select></FormRow>
                <FormRow><Label>Nutrición</Label><Select value={braden.nutrition} onChange={e => updateBraden('nutrition', +e.target.value)}><option value={4}>Excelente (4)</option><option value={3}>Adecuada (3)</option><option value={2}>Probablemente inadecuada (2)</option><option value={1}>Muy pobre (1)</option></Select></FormRow>
                <FormRow><Label>Fricción y Cizallamiento</Label><Select value={braden.friction} onChange={e => updateBraden('friction', +e.target.value)}><option value={3}>Sin problema aparente (3)</option><option value={2}>Problema potencial (2)</option><option value={1}>Problema (1)</option></Select></FormRow>
                <ResultDisplay title="Score de Braden" result={bradenScore} interpretation={bradenInterp} alertLevel={bradenAlertLevel} />
                <ResetButton onClick={resetBraden} />
            </div>
        </SubSection>
        <SubSection title="Escala de Norton">
            <div className="space-y-3 text-sm">
                <FormRow><Label>Condición Física</Label><Select value={norton.physical} onChange={e => updateNorton('physical', +e.target.value)}><option value={4}>Buena (4)</option><option value={3}>Justa (3)</option><option value={2}>Pobre (2)</option><option value={1}>Muy mala (1)</option></Select></FormRow>
                <FormRow><Label>Estado Mental</Label><Select value={norton.mental} onChange={e => updateNorton('mental', +e.target.value)}><option value={4}>Alerta (4)</option><option value={3}>Apático (3)</option><option value={2}>Confuso (2)</option><option value={1}>Estuporoso (1)</option></Select></FormRow>
                <FormRow><Label>Actividad</Label><Select value={norton.activity} onChange={e => updateNorton('activity', +e.target.value)}><option value={4}>Ambulante (4)</option><option value={3}>Camina con ayuda (3)</option><option value={2}>En silla (2)</option><option value={1}>En cama (1)</option></Select></FormRow>
                <FormRow><Label>Movilidad</Label><Select value={norton.mobility} onChange={e => updateNorton('mobility', +e.target.value)}><option value={4}>Completa (4)</option><option value={3}>Ligeramente limitada (3)</option><option value={2}>Muy limitada (2)</option><option value={1}>Inmóvil (1)</option></Select></FormRow>
                <FormRow><Label>Incontinencia</Label><Select value={norton.incontinence} onChange={e => updateNorton('incontinence', +e.target.value)}><option value={4}>Ninguna (4)</option><option value={3}>Ocasional (3)</option><option value={2}>Urinaria (2)</option><option value={1}>Urinaria y Fecal (1)</option></Select></FormRow>
                <ResultDisplay title="Score de Norton" result={nortonScore} interpretation={nortonInterp} alertLevel={nortonAlertLevel} />
                <ResetButton onClick={resetNorton} />
            </div>
        </SubSection>
    </div>
};

const WestHavenClassification: FC = () => {
    const [grade, setGrade] = useState(0);
    const options = [
        { value: 0, text: "Grado 0: Sin anormalidades detectables." },
        { value: 1, text: "Grado 1: Patrón de sueño alterado, falta de atención, euforia/ansiedad." },
        { value: 2, text: "Grado 2: Letargo, desorientación temporal, cambios de personalidad, asterixis." },
        { value: 3, text: "Grado 3: Somnolencia a estupor pero responde a estímulos, confusión, desorientación." },
        { value: 4, text: "Grado 4: Coma, no responde al dolor." }
    ];
    return (
        <div className="space-y-3">
            <FormRow>
                <Label htmlFor="wh-grade">Grado de Encefalopatía Hepática</Label>
                <Select id="wh-grade" value={grade} onChange={e => setGrade(Number(e.target.value))}>
                    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.text}</option>)}
                </Select>
            </FormRow>
            <ResultDisplay title="Clasificación de West Haven" result={`Grado ${grade}`} interpretation={options[grade].text} />
            <ResetButton onClick={() => setGrade(0)} />
        </div>
    );
};

const GlasgowBlatchfordScore: FC = () => {
    const [bun, setBun] = useState(18); // mg/dL
    const [hb, setHb] = useState(12); // g/dL
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [sbp, setSbp] = useState(110); // mmHg
    const [other, setOther] = useState<Record<string, boolean>>({});

    const score = useMemo(() => {
        let total = 0;
        // BUN
        if (bun >= 70) total += 6;
        else if (bun >= 28) total += 4;
        else if (bun >= 22.4) total += 3;
        else if (bun >= 18.2) total += 2;
        // Hb
        if (gender === 'male') {
            if (hb < 10) total += 6;
            else if (hb < 12) total += 3;
            else if (hb < 13) total += 1;
        } else { // female
            if (hb < 10) total += 6;
            else if (hb < 12) total += 1;
        }
        // SBP
        if (sbp < 90) total += 3;
        else if (sbp < 100) total += 2;
        else if (sbp < 110) total += 1;
        // Other
        if (other.melena) total += 1;
        if (other.syncope) total += 2;
        if (other.hepatic) total += 2;
        if (other.cardiac) total += 2;

        return total;
    }, [bun, hb, gender, sbp, other]);

    const interpretation = useMemo(() => {
        if (score === 0) return "Riesgo muy bajo (0.5% de intervención). Considerar manejo ambulatorio.";
        return `Alto riesgo (> ${score > 5 ? '50' : '6'}%) de necesitar intervención (transfusión, endoscopia, cirugía).`;
    }, [score]);

    const alertLevel = score >= 6 ? 'critical' : score > 0 ? 'warning' : 'none';

    const reset = () => { setBun(18); setHb(12); setGender('male'); setSbp(110); setOther({}); };

    return (
        <div className="space-y-3">
            <FormRow><Label htmlFor="gbs-bun">BUN (mg/dL)</Label><Input id="gbs-bun" type="number" value={bun} onChange={e => setBun(Number(e.target.value))} /></FormRow>
            <FormRow><Label>Género (para Hemoglobina)</Label><Select value={gender} onChange={e => setGender(e.target.value as any)}><option value="male">Hombre</option><option value="female">Mujer</option></Select></FormRow>
            <FormRow><Label htmlFor="gbs-hb">Hemoglobina (g/dL)</Label><Input id="gbs-hb" type="number" value={hb} onChange={e => setHb(Number(e.target.value))} /></FormRow>
            <FormRow><Label htmlFor="gbs-sbp">PAS (mmHg)</Label><Input id="gbs-sbp" type="number" value={sbp} onChange={e => setSbp(Number(e.target.value))} /></FormRow>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Checkbox checked={!!other.melena} onChange={e => setOther(p => ({ ...p, melena: e.target.checked }))}>Melena</Checkbox>
                <Checkbox checked={!!other.syncope} onChange={e => setOther(p => ({ ...p, syncope: e.target.checked }))}>Síncope</Checkbox>
                <Checkbox checked={!!other.hepatic} onChange={e => setOther(p => ({ ...p, hepatic: e.target.checked }))}>Enfermedad hepática</Checkbox>
                <Checkbox checked={!!other.cardiac} onChange={e => setOther(p => ({ ...p, cardiac: e.target.checked }))}>Insuficiencia cardiaca</Checkbox>
            </div>
            <ResultDisplay title="Score de Glasgow-Blatchford (GBS)" result={score} interpretation={interpretation} alertLevel={alertLevel} />
            <ResetButton onClick={reset} />
        </div>
    );
};

const AIRScore: FC = () => {
    const [scores, setScores] = useState<Record<string, number>>({
        vomiting: 0, pain: 0, defense: 0, temp: 0, wbc: 0, neutrophils: 0, crp: 0,
    });

    // Fix: Explicitly type accumulator and value in reduce to avoid 'unknown' type errors.
    const totalScore = useMemo(() => Object.values(scores).reduce((sum: number, val: number) => sum + val, 0), [scores]);

    const interpretation = useMemo(() => {
        if (totalScore <= 4) return "Riesgo Bajo de Apendicitis";
        if (totalScore <= 8) return "Riesgo Intermedio. Considerar estudios de imagen.";
        return "Riesgo Alto de Apendicitis. Considerar valoración quirúrgica.";
    }, [totalScore]);

    const alertLevel = totalScore > 8 ? 'critical' : totalScore > 4 ? 'warning' : 'none';

    const updateScore = (key: string, value: number) => {
        setScores(prev => ({ ...prev, [key]: value }));
    };
    
    const reset = () => {
        setScores({ vomiting: 0, pain: 0, defense: 0, temp: 0, wbc: 0, neutrophils: 0, crp: 0 });
    };

    return (
        <div className="space-y-3 text-sm">
            <FormRow>
                <Label>Signos y Síntomas</Label>
                <div className="space-y-2">
                    <Checkbox checked={scores.vomiting === 1} onChange={e => updateScore('vomiting', e.target.checked ? 1 : 0)}>Vómitos (1 pt)</Checkbox>
                    <Checkbox checked={scores.pain === 1} onChange={e => updateScore('pain', e.target.checked ? 1 : 0)}>Dolor en Fosa Ilíaca Derecha (1 pt)</Checkbox>
                     <Checkbox checked={scores.temp === 1} onChange={e => updateScore('temp', e.target.checked ? 1 : 0)}>Temperatura ≥ 38.5°C (1 pt)</Checkbox>
                </div>
            </FormRow>
             <FormRow>
                <Label htmlFor="air-defense">Defensa Muscular / Rebote</Label>
                <Select id="air-defense" value={scores.defense} onChange={e => updateScore('defense', Number(e.target.value))}>
                    <option value={0}>Ausente (0 pts)</option>
                    <option value={1}>Moderado (1 pt)</option>
                    <option value={2}>Severo (2 pts)</option>
                </Select>
            </FormRow>
            <FormRow>
                <Label htmlFor="air-wbc">Leucocitos (x10⁹/L)</Label>
                <Select id="air-wbc" value={scores.wbc} onChange={e => updateScore('wbc', Number(e.target.value))}>
                    <option value={0}>&lt; 10 (0 pts)</option>
                    <option value={1}>10 - 14.9 (1 pt)</option>
                    <option value={2}>≥ 15 (2 pts)</option>
                </Select>
            </FormRow>
            <FormRow>
                <Label htmlFor="air-neutrophils">Proporción de Neutrófilos (%)</Label>
                <Select id="air-neutrophils" value={scores.neutrophils} onChange={e => updateScore('neutrophils', Number(e.target.value))}>
                    <option value={0}>&lt; 75% (0 pts)</option>
                    <option value={1}>75% - 84% (1 pt)</option>
                    <option value={2}>≥ 85% (2 pts)</option>
                </Select>
            </FormRow>
            <FormRow>
                <Label htmlFor="air-crp">Proteína C Reactiva (mg/L)</Label>
                <Select id="air-crp" value={scores.crp} onChange={e => updateScore('crp', Number(e.target.value))}>
                    <option value={0}>&lt; 10 (0 pts)</option>
                    <option value={1}>10 - 49 (1 pt)</option>
                    <option value={2}>≥ 50 (2 pts)</option>
                </Select>
            </FormRow>
            <ResultDisplay title="Score AIR" result={totalScore} interpretation={interpretation} alertLevel={alertLevel} />
            <ResetButton onClick={reset} />
        </div>
    );
};

const ObstetricCalculator: FC = () => {
    const [mode, setMode] = useState<'fum' | 'usg'>('fum');
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // --- FUM Mode States ---
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    const defaultFum = threeMonthsAgo.toISOString().split('T')[0];
    const [fum, setFum] = useState(defaultFum);

    // --- USG Mode States ---
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const defaultUsgDate = oneMonthAgo.toISOString().split('T')[0];
    const [usgDate, setUsgDate] = useState(defaultUsgDate);
    const [usgWeeks, setUsgWeeks] = useState(8);
    const [usgDays, setUsgDays] = useState(0);
    const [currentDate, setCurrentDate] = useState(todayString);
    
    // --- FUM Calculation ---
    const { gestationalAgeFUM, eddFUM } = useMemo(() => {
        if (!fum) return { gestationalAgeFUM: null, eddFUM: null };
        const [year, month, day] = fum.split('-').map(Number);
        const fumDate = new Date(Date.UTC(year, month - 1, day));
        const currentDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        
        if (isNaN(fumDate.getTime()) || fumDate > currentDate) {
            return { gestationalAgeFUM: "Fecha inválida", eddFUM: "Fecha inválida" };
        }

        const diffTime = currentDate.getTime() - fumDate.getTime();
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(totalDays / 7);
        const days = totalDays % 7;
        const gestationalAgeFUM = `${weeks} semanas y ${days} ${days === 1 ? 'día' : 'días'}`;

        const eddDate = new Date(fumDate.getTime());
        eddDate.setUTCDate(eddDate.getUTCDate() + 280);
        const eddFUM = eddDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

        return { gestationalAgeFUM, eddFUM };
    }, [fum, today]);

    // --- USG Calculation ---
    const { gestationalAgeUSG, eddUSG } = useMemo(() => {
        if (!usgDate || usgWeeks < 0 || usgDays < 0 || !currentDate) {
            return { gestationalAgeUSG: null, eddUSG: null };
        }
        const [uy, um, ud] = usgDate.split('-').map(Number);
        const [cy, cm, cd] = currentDate.split('-').map(Number);
        const usgD = new Date(Date.UTC(uy, um - 1, ud));
        const currentD = new Date(Date.UTC(cy, cm - 1, cd));
        
        if (isNaN(usgD.getTime()) || isNaN(currentD.getTime()) || usgD > currentD) {
            return { gestationalAgeUSG: "Fechas inválidas", eddUSG: "Fechas inválidas" };
        }

        const gestationAtUsgInDays = (usgWeeks * 7) + usgDays;
        const daysSinceUsg = (currentD.getTime() - usgD.getTime()) / (1000 * 60 * 60 * 24);
        const currentGestationInDays = gestationAtUsgInDays + daysSinceUsg;

        const currentWeeks = Math.floor(currentGestationInDays / 7);
        const currentDaysValue = Math.round(currentGestationInDays % 7);
        const gestationalAgeUSG = `${currentWeeks} semanas y ${currentDaysValue} ${currentDaysValue === 1 ? 'día' : 'días'}`;

        const daysRemainingInPregnancy = 280 - gestationAtUsgInDays;
        const eddDate = new Date(usgD.getTime());
        eddDate.setUTCDate(eddDate.getUTCDate() + daysRemainingInPregnancy);
        const eddUSG = eddDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

        return { gestationalAgeUSG, eddUSG };
    }, [usgDate, usgWeeks, usgDays, currentDate]);

    const resetFUM = () => setFum(defaultFum);
    const resetUSG = () => {
        setUsgDate(defaultUsgDate);
        setUsgWeeks(8);
        setUsgDays(0);
        setCurrentDate(todayString);
    };

    return (
        <div>
             <div className="flex justify-center mb-4 space-x-1 rounded-lg p-1 bg-gray-200 dark:bg-slate-700">
                <button onClick={() => setMode('fum')} className={`flex-1 py-2 px-2 text-sm font-semibold rounded-md transition-all ${mode === 'fum' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-purple-300' : 'bg-transparent text-gray-600 hover:bg-gray-300/50 dark:text-gray-300 dark:hover:bg-slate-600'}`}>Por FUM</button>
                <button onClick={() => setMode('usg')} className={`flex-1 py-2 px-2 text-sm font-semibold rounded-md transition-all ${mode === 'usg' ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-purple-300' : 'bg-transparent text-gray-600 hover:bg-gray-300/50 dark:text-gray-300 dark:hover:bg-slate-600'}`}>Por Ultrasonido</button>
            </div>

            {mode === 'fum' && (
                <div className="space-y-3 animate-fade-in">
                    <FormRow>
                        <Label htmlFor="fum-date">Fecha de Última Menstruación (FUM)</Label>
                        <Input id="fum-date" type="date" value={fum} onChange={e => setFum(e.target.value)} max={todayString} />
                    </FormRow>
                    {gestationalAgeFUM && eddFUM && (<>
                        <ResultDisplay title="Edad Gestacional Actual" result={gestationalAgeFUM} />
                        <ResultDisplay title="Fecha Probable de Parto (FPP)" result={eddFUM} />
                    </>)}
                    <ResetButton onClick={resetFUM} />
                </div>
            )}

            {mode === 'usg' && (
                <div className="space-y-3 animate-fade-in">
                    <FormRow>
                        <Label htmlFor="usg-date">Fecha del Ultrasonido</Label>
                        <Input id="usg-date" type="date" value={usgDate} onChange={e => setUsgDate(e.target.value)} max={todayString} />
                    </FormRow>
                     <FormRow>
                        <Label>Edad Gestacional en el USG</Label>
                        <div className="flex items-center gap-2">
                           <Input type="number" value={usgWeeks} onChange={e => setUsgWeeks(Number(e.target.value))} min="0" aria-label="Semanas USG"/>
                           <span className="text-sm">semanas</span>
                           <Input type="number" value={usgDays} onChange={e => setUsgDays(Number(e.target.value))} min="0" max="6" aria-label="Días USG"/>
                           <span className="text-sm">días</span>
                        </div>
                    </FormRow>
                     <FormRow>
                        <Label htmlFor="current-date">Fecha de Cálculo Actual</Label>
                        <Input id="current-date" type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} max={todayString} />
                    </FormRow>
                    {gestationalAgeUSG && eddUSG && (<>
                        <ResultDisplay title="Edad Gestacional Actual" result={gestationalAgeUSG} />
                        <ResultDisplay title="Fecha Probable de Parto (FPP)" result={eddUSG} />
                    </>)}
                    <ResetButton onClick={resetUSG} />
                </div>
            )}
        </div>
    );
};

const BeckDepressionInventoryContent: FC = () => {
    const initialBeckState = { 'q1':0,'q2':0,'q3':0,'q4':0,'q5':0,'q6':0,'q7':0,'q8':0,'q9':0,'q10':0,'q11':0,'q12':0,'q13':0,'q14':0,'q15':0,'q16':0,'q17':0,'q18':0,'q19':0,'q20':0,'q21':0 };
    const [beck, setBeck] = useState<Record<string, number>>(initialBeckState);

    const beckQuestions = [
        { key: 'q1', label: '1. Tristeza' }, { key: 'q2', label: '2. Pesimismo' }, { key: 'q3', label: '3. Fracaso' }, { key: 'q4', label: '4. Pérdida de Placer' },
        { key: 'q5', label: '5. Sentimientos de Culpa' }, { key: 'q6', label: '6. Sentimientos de Castigo' }, { key: 'q7', label: '7. Disconformidad con uno mismo' }, { key: 'q8', label: '8. Autocrítica' },
        { key: 'q9', label: '9. Pensamientos/Deseos Suicidas' }, { key: 'q10', label: '10. Llanto' }, { key: 'q11', label: '11. Agitación' }, { key: 'q12', label: '12. Pérdida de Interés' },
        { key: 'q13', label: '13. Indecisión' }, { key: 'q14', label: '14. Inutilidad' }, { key: 'q15', label: '15. Pérdida de Energía' }, { key: 'q16', label: '16. Cambios en el Sueño' },
        { key: 'q17', label: '17. Irritabilidad' }, { key: 'q18', label: '18. Cambios en el Apetito' }, { key: 'q19', label: '19. Dificultad de Concentración' }, { key: 'q20', label: '20. Cansancio o Fatiga' },
        { key: 'q21', label: '21. Pérdida de Interés en el Sexo' }
    ];

    const beckTotal = useMemo(() => Object.values(beck).reduce((a: number, b: number) => a + b, 0), [beck]);
    const beckInterp = useMemo(() => {
        if (beckTotal <= 13) return "Depresión mínima";
        if (beckTotal <= 19) return "Depresión leve";
        if (beckTotal <= 28) return "Depresión moderada";
        return "Depresión grave";
    }, [beckTotal]);
    const beckAlertLevel = beckTotal > 28 ? 'critical' : beckTotal > 19 ? 'warning' : 'none';
    
    const updateBeck = (key: string, value: number) => setBeck(prev => ({ ...prev, [key]: value }));
    const resetBeck = () => setBeck(initialBeckState);

    return (
        <div className="space-y-3 text-sm">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Cuestionario autoadministrado de 21 ítems para evaluar la gravedad de la depresión.</p>
            {beckQuestions.map(q => (
                <FormRow key={q.key}>
                    <Label>{q.label}</Label>
                    <Select value={beck[q.key]} onChange={e => updateBeck(q.key, +e.target.value)}>
                        <option value={0}>Ausente / Leve (0)</option>
                        <option value={1}>Moderado (1)</option>
                        <option value={2}>Intenso (2)</option>
                        <option value={3}>Grave (3)</option>
                    </Select>
                </FormRow>
            ))}
            <ResultDisplay title="Puntuación Total BDI-II" result={beckTotal} interpretation={beckInterp} alertLevel={beckAlertLevel} />
            <ResetButton onClick={resetBeck} />
        </div>
    );
};

const HamiltonDepressionScaleContent: FC = () => {
    const initialHamiltonState = { 'q1':0,'q2':0,'q3':0,'q4':0,'q5':0,'q6':0,'q7':0,'q8':0,'q9':0,'q10':0,'q11':0,'q12':0,'q13':0,'q14':0,'q15':0,'q16':0,'q17':0 };
    const [hamilton, setHamilton] = useState<Record<string, number>>(initialHamiltonState);

    const questions = [
        { key: 'q1', label: '1. Humor deprimido', max: 4 }, { key: 'q2', label: '2. Sentimientos de culpa', max: 4 }, { key: 'q3', label: '3. Suicidio', max: 4 },
        { key: 'q4', label: '4. Insomnio precoz', max: 2 }, { key: 'q5', label: '5. Insomnio intermedio', max: 2 }, { key: 'q6', label: '6. Insomnio tardío', max: 2 },
        { key: 'q7', label: '7. Trabajo y actividades', max: 4 }, { key: 'q8', label: '8. Inhibición psicomotora', max: 4 }, { key: 'q9', label: '9. Agitación', max: 4 },
        { key: 'q10', label: '10. Ansiedad psíquica', max: 4 }, { key: 'q11', label: '11. Ansiedad somática', max: 4 }, { key: 'q12', label: '12. Síntomas somáticos GI', max: 2 },
        { key: 'q13', label: '13. Síntomas somáticos generales', max: 2 }, { key: 'q14', label: '14. Síntomas genitales', max: 2 }, { key: 'q15', label: '15. Hipocondría', max: 4 },
        { key: 'q16', label: '16. Pérdida de peso', max: 2 }, { key: 'q17', label: '17. Insight (Conciencia)', max: 2 },
    ];
    
    const hamiltonTotal = useMemo(() => Object.values(hamilton).reduce((a: number, b: number) => a + b, 0), [hamilton]);
    const hamiltonInterp = useMemo(() => {
        if (hamiltonTotal <= 7) return "No deprimido";
        if (hamiltonTotal <= 13) return "Depresión ligera/menor";
        if (hamiltonTotal <= 18) return "Depresión moderada";
        if (hamiltonTotal <= 22) return "Depresión grave";
        return "Depresión muy grave";
    }, [hamiltonTotal]);
    const hamiltonAlertLevel = hamiltonTotal > 18 ? 'critical' : hamiltonTotal > 13 ? 'warning' : 'none';

    const updateHamilton = (key: string, value: number) => setHamilton(prev => ({ ...prev, [key]: value }));
    const resetHamilton = () => setHamilton(initialHamiltonState);

    return (
        <div className="space-y-3 text-sm">
             <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Escala de 17 ítems administrada por el clínico para evaluar la severidad de la depresión.</p>
            {questions.map(q => (
                <FormRow key={q.key}>
                    <Label>{q.label}</Label>
                    <Select value={hamilton[q.key]} onChange={e => updateHamilton(q.key, +e.target.value)}>
                        <option value={0}>0 - Ausente</option>
                        <option value={1}>1 - Leve</option>
                        <option value={2}>2 - Moderado</option>
                        {q.max === 4 && <option value={3}>3 - Grave</option>}
                        {q.max === 4 && <option value={4}>4 - Muy grave</option>}
                    </Select>
                </FormRow>
            ))}
            <ResultDisplay title="Puntuación Total HAM-D" result={hamiltonTotal} interpretation={hamiltonInterp} alertLevel={hamiltonAlertLevel} />
            <ResetButton onClick={resetHamilton} />
        </div>
    );
};

const DepressionScales: FC = () => {
    return (
        <div>
            <SubSection title="Inventario de Depresión de Beck (BDI-II)">
                <BeckDepressionInventoryContent />
            </SubSection>
            <SubSection title="Escala de Depresión de Hamilton (HDRS/HAM-D)">
                <HamiltonDepressionScaleContent />
            </SubSection>
        </div>
    );
};


// --- Calculator Definitions ---
export const calculators = [
    { id: 'gcs', name: 'Escala de Coma de Glasgow (GCS)', category: 'Cuidados Críticos', description: 'Evalúa el nivel de conciencia y daño neurológico.', component: GlasgowComaScale },
    { id: 'qsofa', name: 'Score qSOFA', category: 'Cuidados Críticos', description: 'Identifica riesgo de mortalidad por sepsis fuera de la UCI.', component: QSOFAScore },
    { id: 'sofa2', name: 'Score SOFA-2', category: 'Cuidados Críticos', description: 'Evalúa la disfunción orgánica secuencial en pacientes críticamente enfermos.', component: SOFA2Score },
    { id: 'gasoapp', name: 'GasoApp: Análisis de Gases Arteriales', category: 'Cuidados Críticos', description: 'Interpreta gasometrías arteriales usando un enfoque sistemático.', component: AcidBaseAnalysis },
    { id: 'mrs', name: 'Escala de Rankin Modificada (mRS)', category: 'Neurología', description: 'Mide el grado de discapacidad o dependencia en actividades diarias.', component: ModifiedRankinScale },
    { id: 'nihss', name: 'Escala de Ictus NIHSS', category: 'Neurología', description: 'Evalúa la severidad de un ictus de forma cuantitativa.', component: NIHSS },
    { id: 'parkland', name: 'Fórmula de Parkland', category: 'Trauma / Quemados', description: 'Calcula la reanimación con líquidos en pacientes quemados.', component: ParklandFormula },
    { id: 'brooke', name: 'Fórmula de Brooke', category: 'Trauma / Quemados', description: 'Alternativa a Parkland para cálculo de líquidos en quemados.', component: BrookeFormula },
    { id: 'romaiv', name: 'Criterios de Roma IV (SII)', category: 'Gastroenterología', description: 'Diagnóstico de trastornos gastrointestinales funcionales.', component: RomaIVCriteria },
    { id: 'meld', name: 'Scores MELD-Na / Child-Pugh', category: 'Gastroenterología', description: 'Evalúa la severidad de la enfermedad hepática crónica.', component: MeldChildPugh },
    { id: 'ransom', name: 'Criterios de RANSOM / Score BISAP', category: 'Gastroenterología', description: 'Evalúa la gravedad de la pancreatitis aguda.', component: RansomBisap },
    { id: 'west-haven', name: 'Clasificación de West Haven', category: 'Gastroenterología', description: 'Evalúa el grado de Encefalopatía Hepática.', component: WestHavenClassification },
    { id: 'glasgow-blatchford', name: 'Escala de Glasgow-Blatchford', category: 'Gastroenterología', description: 'Predice la necesidad de intervención en hemorragia digestiva alta.', component: GlasgowBlatchfordScore },
    { id: 'air-score', name: 'Score AIR (Appendicitis Inflammatory Response)', category: 'Gastroenterología', description: 'Estratifica el riesgo de apendicitis aguda.', component: AIRScore },
    { id: 'renal-function', name: 'Función Renal (Cockcroft-Gault / CKD-EPI)', category: 'Nefrología / Farmacología', description: 'Estima la TFG para evaluar la función renal y ajustar fármacos.', component: RenalFunctionCalculators },
    { id: 'apgar', name: 'Score de APGAR', category: 'Neonatología', description: 'Evaluación de la vitalidad del recién nacido.', component: ApgarScore },
    { id: 'silverman', name: 'Score de Silverman-Anderson', category: 'Neonatología', description: 'Evalúa la dificultad respiratoria en neonatos.', component: SilvermanAndersonScore },
    { id: 'capurro', name: 'Método Capurro', category: 'Neonatología', description: 'Estima la edad gestacional del recién nacido.', component: CapurroMethod },
    { id: 'obstetric-calculator', name: 'Calculadora Obstétrica (FUM / USG)', category: 'Obstetricia', description: 'Calcula edad gestacional y FPP por FUM o por Ultrasonido.', component: ObstetricCalculator },
    { id: 'wells', name: 'Escalas de Wells y Ginebra', category: 'Tromboembolismo', description: 'Evalúa la probabilidad clínica de TEP y TVP.', component: WellsGenevaScales },
    { id: 'acid-base', name: 'Anion Gap y Fórmula de Winter', category: 'Medicina Interna', description: 'Herramientas para el análisis de trastornos ácido-base.', component: AnionGapWintersFormula },
    { id: 'deficit', name: 'Déficit de Agua/Sodio', category: 'Medicina Interna', description: 'Guía la corrección de trastornos del sodio.', component: WaterSodiumDeficit },
    { id: 'chadsvasc', name: 'Score CHADS₂-VASc', category: 'Cardiología', description: 'Calcula el riesgo de ictus en pacientes con Fibrilación Auricular.', component: ChadsvascScore },
    { id: 'norton', name: 'Escalas de Norton y Braden', category: 'Prevención', description: 'Evalúa el riesgo de desarrollar úlceras por presión.', component: NortonBradenScales },
    { id: 'depression', name: 'Escalas de Depresión (Beck / Hamilton)', category: 'Prevención', description: 'Mide la gravedad de la sintomatología depresiva.', component: DepressionScales },
];