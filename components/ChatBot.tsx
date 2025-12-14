import React, { useState, useEffect, useRef } from 'react';
import { createChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import Card from './ui/Card';
import { marked } from 'marked';
import { Chat } from '@google/genai';

const ChatBot: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const startNewChat = () => {
        setChat(createChat());
        setMessages([{ role: 'model', text: '¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?' }]);
        setInput('');
        setIsLoading(false);
    };

    useEffect(() => {
        startNewChat();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !chat) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessageStream({ message: input });
            let text = '';
            for await (const chunk of result) {
                 text += chunk.text;
                 setMessages(prev => {
                     const newMessages = [...prev];
                     if (newMessages.length > 0) {
                        newMessages[newMessages.length - 1].text = text;
                     }
                     return newMessages;
                 });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages.length > 0) {
                    newMessages[newMessages.length - 1].text = 'Lo siento, ocurrió un error al procesar tu solicitud.';
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="max-w-2xl mx-auto flex flex-col h-[80vh]">
            <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-slate-600">
                <div>
                    <h2 className="text-2xl font-bold text-blue-800 dark:text-cyan-300">💬 DoctorIA</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Un Médico virtual apoyando a un médico real</p>
                </div>
                <button
                    onClick={startNewChat}
                    className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 font-semibold py-1 px-3 rounded-lg"
                >
                    Reset
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                           {msg.role === 'model' && msg.text === '' ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                                </div>
                           ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}></div>
                           )}
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 pt-4 border-t dark:border-slate-600">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Escribe tu pregunta..."
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg"
                        onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-slate-600 transition-colors dark:bg-purple-600 dark:hover:bg-purple-700"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default ChatBot;