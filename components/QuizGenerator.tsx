
import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';

const QuizGenerator: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Interno');
    const [numQuestions, setNumQuestions] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const isQuizFinished = questions.length > 0 && currentQuestionIndex >= questions.length;

    const handleGenerateQuiz = async () => {
        if (!topic.trim()) {
            setError('Por favor, ingresa un tema.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setQuestions([]);
        try {
            const quizQuestions = await generateQuiz(topic, difficulty, numQuestions);
            if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
                setError('El cuestionario generado está vacío o no es válido. Por favor, intenta con otro tema.');
            } else {
                setQuestions(quizQuestions);
                setCurrentQuestionIndex(0);
                setScore(0);
                setIsAnswered(false);
                setSelectedAnswer(null);
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Error al generar el cuestionario. Inténtalo de nuevo.';
            setError(message);
            console.error(e);
        }
        setIsLoading(false);
    };

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        if (answer === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
    };

    const resetQuiz = () => {
        setTopic('');
        setDifficulty('Interno');
        setNumQuestions(10);
        setQuestions([]);
        setError(null);
    };

    const getButtonClass = (option: string) => {
        if (!isAnswered) return "bg-white hover:bg-blue-50 border-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-600";
        if (option === questions[currentQuestionIndex].correctAnswer) return "bg-green-200 border-green-400 dark:bg-green-800/50 dark:border-green-600 text-gray-900 dark:text-white";
        if (option === selectedAnswer) return "bg-red-200 border-red-400 dark:bg-red-800/50 dark:border-red-600 text-gray-900 dark:text-white";
        return "bg-white border-gray-300 dark:bg-slate-700 dark:border-slate-600 opacity-70";
    };

    const renderQuizContent = () => {
        if (questions.length === 0) {
            return (
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">Ingresa un tema médico y selecciona la dificultad para generar un cuestionario.</p>

                    <div className="grid sm:grid-cols-2 gap-4 items-center">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de Preguntas</label>
                            <div className="flex space-x-1 rounded-lg p-1 bg-pink-100 dark:bg-pink-900/50 border border-pink-400 dark:border-pink-700 shadow-[0_0_10px_theme(colors.pink.400)]">
                                {[10, 15, 20].map(num =>
                                    <button
                                        key={num}
                                        onClick={() => setNumQuestions(num)}
                                        className={`flex-1 py-2 px-2 text-sm font-semibold rounded-md transition-all ${numQuestions === num ? 'bg-pink-500 text-white shadow-md dark:bg-pink-600' : 'bg-transparent text-pink-600 hover:bg-pink-200 dark:text-pink-300 dark:hover:bg-pink-800/60'}`}
                                    >
                                        {num}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nivel de Dificultad</label>
                            <div className="flex space-x-2 rounded-lg p-1 bg-gray-200 dark:bg-slate-700">
                                {['Interno', 'Temerario', 'Dr. House'].map(level =>
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        className={`flex-1 py-2 px-2 text-sm font-semibold rounded-md transition-all ${difficulty === level ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-purple-300' : 'bg-transparent text-gray-600 hover:bg-gray-300/50 dark:text-gray-300 dark:hover:bg-slate-600'}`}
                                    >
                                        {level === 'Interno' ? '😇 Interno' : level === 'Temerario' ? '🧐 Temerario' : '😈 Dr. House'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ej: Diabetes Mellitus" className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-purple-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-purple-500 transition-all duration-200" onKeyDown={e => e.key === 'Enter' && handleGenerateQuiz()} />
                    <button onClick={handleGenerateQuiz} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700 dark:disabled:bg-purple-400">
                        {isLoading ? 'Generando...' : 'Generar Quiz'}
                    </button>
                    {isLoading && <LoadingSpinner />}
                </div>
            );
        } else if (isQuizFinished) {
            return (
                <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold dark:text-white">¡Quiz completado!</h3>
                    <p className="text-2xl">Tu puntuación: <span className="font-bold text-green-600 dark:text-green-400">{score} / {questions.length}</span></p>
                    <button onClick={resetQuiz} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 dark:bg-purple-600 dark:hover:bg-purple-700">
                        Crear otro quiz
                    </button>
                </div>
            );
        } else {
            const q = questions[currentQuestionIndex];
            return (
                <div>
                    <div className="flex justify-between items-baseline mb-2">
                        <p className="text-lg font-semibold dark:text-gray-100">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
                        <p className="text-sm font-medium dark:text-gray-300">Puntuación: {score}</p>
                    </div>
                    <p className="mb-4 text-gray-800 dark:text-gray-200 text-lg">{q.question}</p>
                    <div className="space-y-3">
                        {q.options.map((option, index) =>
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                                className={`w-full text-left p-3 border rounded-lg transition-colors ${getButtonClass(option)}`}
                            >
                                {option}
                            </button>
                        )}
                    </div>
                    {isAnswered && (
                        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg dark:bg-green-900/50 dark:border-green-700 animate-fade-in">
                            <h4 className="font-bold text-green-800 dark:text-green-300">Retroalimentación:</h4>
                            <p className="text-green-700 dark:text-green-200">{q.feedback}</p>
                            <button onClick={handleNextQuestion} className="mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 dark:bg-purple-600 dark:hover:bg-purple-700">
                                Siguiente Pregunta
                            </button>
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-800 dark:text-cyan-300 mb-4 text-center">🧠 Generador de Quizzes</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
            {renderQuizContent()}
        </Card>
    );
};

export default QuizGenerator;
