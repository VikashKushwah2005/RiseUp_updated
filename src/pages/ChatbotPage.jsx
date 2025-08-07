import React, { useState, useEffect, useRef } from 'react';

export default function ChatbotPage() {
    const [messages, setMessages] = useState([
        { text: "Namaste. The path to inner peace begins with understanding the self. How may I assist you on your journey today?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    // Get Gemini API key from .env (Vite convention)
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !GEMINI_API_KEY) return;
        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const prompt = `You are an AI psychologist with 10+ years of experience, specializing in integrating modern psychology with traditional Indian wisdom and the principles of Brahmacharya (mindful energy conservation). Your tone is calm, empathetic, and wise. You do not give direct medical advice but offer perspective, gentle guidance, and reflective questions. A user has said: "${input}". Respond to them.`;

        try {
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("API call failed");
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
                const botMessage = { text: result.candidates[0].content.parts[0].text, sender: 'bot' };
                setMessages(prev => [...prev, botMessage]);
            } else {
                const errorMessage = { text: "I am finding it difficult to respond at this moment. Could you please rephrase?", sender: 'bot' };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error("Chatbot Error:", error);
            const errorMessage = { text: "I apologize, I am unable to process your request right now. Let's try again in a moment.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-68px)] bg-stone-100">
            <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={chatContainerRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-amber-600 flex-shrink-0"></div>}
                        <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-amber-600 text-white rounded-br-none' : 'bg-white text-stone-800 rounded-bl-none shadow-md'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-amber-600 flex-shrink-0"></div>
                        <div className="max-w-lg p-3 rounded-2xl bg-white text-stone-800 rounded-bl-none shadow-md">
                            <div className="flex items-center justify-center gap-1">
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-pulse delay-0"></span>
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-pulse delay-150"></span>
                                <span className="w-2 h-2 bg-stone-400 rounded-full animate-pulse delay-300"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 bg-white border-t border-stone-200">
                <div className="flex items-center gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder={GEMINI_API_KEY ? "Speak your mind..." : "API Key needed for chat"}
                        className="w-full p-3 text-stone-700 bg-stone-100 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={!GEMINI_API_KEY}
                    />
                    <button onClick={handleSend} disabled={isLoading || !GEMINI_API_KEY} className="bg-amber-600 text-white p-3 rounded-full hover:bg-amber-700 transition disabled:bg-stone-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>
                 <p className="text-xs text-center text-stone-400 mt-2">Disclaimer: This AI Chat is for supportive guidance and not a substitute for professional medical advice.</p>
            </div>
        </div>
    );
}