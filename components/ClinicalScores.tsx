import React, { useState } from 'react';
import Card from './ui/Card';
import { calculators } from './scores/calculators';

type CalculatorsByCategory = {
    [category: string]: typeof calculators;
};

const ClinicalScores: React.FC = () => {
    const [activeCalculatorId, setActiveCalculatorId] = useState<string | null>(null);

    const toggleCalculator = (id: string) => {
        setActiveCalculatorId(prevId => (prevId === id ? null : id));
    };

    const calculatorsByCategory = calculators.reduce((acc, calculator) => {
        const { category } = calculator;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(calculator);
        return acc;
    }, {} as CalculatorsByCategory);

    return (
        <Card className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-800 dark:text-cyan-300">🧮 Scores & Cálculos clínicos</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Mejora tu práctica. Decide con certeza.</p>

            <div className="space-y-6">
                {Object.entries(calculatorsByCategory).map(([category, calcs]) => (
                    <div key={category}>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b pb-2 dark:border-slate-700">{category}</h3>
                        <div className="space-y-2">
                            {calcs.map((calc) => {
                                const isActive = activeCalculatorId === calc.id;
                                return (
                                    <div key={calc.id} className="border dark:border-slate-700 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleCalculator(calc.id)}
                                            className="w-full text-left p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-semibold text-green-800 dark:text-pink-400">{calc.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{calc.description}</p>
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${isActive ? 'rotate-180' : ''}`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </button>
                                        {isActive && (
                                            <div className="p-4 bg-white dark:bg-slate-800/50 animate-fade-in">
                                                <calc.component />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ClinicalScores;
