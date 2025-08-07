import React, { useState, useEffect } from 'react';

// Use Vite env variable for Gemini API key
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Helper component for the calendar grid
const EnergyFlowTracker = ({ entries }) => {
    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i);
        return date.toLocaleDateString();
    }).reverse();

    const getColor = (flow) => {
        switch (flow) {
            case 'Positive Flow': return 'bg-amber-400';
            case 'Turbulent Flow': return 'bg-red-400';
            case 'Stagnant Flow': return 'bg-blue-400';
            default: return 'bg-stone-200';
        }
    };

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold text-stone-800 mb-4">Your 30-Day Energy Flow</h3>
            <div className="grid grid-cols-10 gap-2">
                {days.map(day => {
                    const entry = entries.find(e => e.date === day);
                    const color = entry ? getColor(entry.flow) : 'bg-stone-200';
                    const tooltip = entry ? `${day}: ${entry.flow}` : `${day}: No Entry`;

                    return (
                        <div key={day} className="relative group">
                            <div className={`w-full h-8 rounded ${color}`}></div>
                            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-stone-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                {tooltip}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end space-x-4 mt-4 text-sm">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>Positive</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>Turbulent</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>Stagnant</div>
            </div>
        </div>
    );
};

export default function JournalPage() {
    const [entries, setEntries] = useState([
        {
            id: 1,
            date: new Date().toLocaleDateString(),
            text: "Today was a good day. I completed all my tasks and felt a sense of accomplishment.",
            flow: "Positive Flow"
        }
    ]);
    const [newEntry, setNewEntry] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const analyzeEntry = async (text) => {
        if (!GEMINI_API_KEY) {
            console.error("API Key is missing.");
            return "No Analysis";
        }

        const prompt = `Analyze the emotional tone of this text and classify its energy state as ONLY one of the following exact phrases: "Positive Flow", "Turbulent Flow", or "Stagnant Flow". Do not add any other text or explanation. Text: "${text}"`;

        try {
            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("API call failed");

            const result = await response.json();
            const flowState = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (['Positive Flow', 'Turbulent Flow', 'Stagnant Flow'].includes(flowState)) {
                return flowState;
            }
            return "Analysis Failed";
        } catch (error) {
            console.error("Sentiment Analysis Error:", error);
            return "Analysis Failed";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newEntry.trim()) return;

        setIsLoading(true);
        setError('');

        const energyFlow = await analyzeEntry(newEntry);

        const entry = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            text: newEntry,
            flow: energyFlow
        };
        setEntries([entry, ...entries]);
        setNewEntry('');
        setIsLoading(false);
    };

    return (
        <div className="container mx-auto max-w-4xl p-6 md:py-12">
            <h2 className="text-3xl font-bold text-stone-800 mb-2">My Journal</h2>
            <p className="text-stone-600 mb-8">A private space for your thoughts, reflections, and energy tracking.</p>

            <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={newEntry}
                        onChange={(e) => setNewEntry(e.target.value)}
                        className="w-full p-3 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        rows="6"
                        placeholder="What's on your mind today?"
                    ></textarea>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition disabled:bg-stone-400"
                    >
                        {isLoading ? 'Analyzing & Saving...' : 'Save Entry'}
                    </button>
                    {!GEMINI_API_KEY && (
                        <p className="text-xs text-center text-red-500 mt-2">
                            API Key is missing. Energy Flow Tracker will be disabled.
                        </p>
                    )}
                </form>
            </div>

            <EnergyFlowTracker entries={entries} />

            <div className="space-y-6 mt-12">
                <h3 className="text-2xl font-bold text-stone-800">Past Entries</h3>
                {entries.length > 0 ? (
                    entries.map(entry => (
                        <div key={entry.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-stone-500 font-semibold">{entry.date}</p>
                                {entry.flow && entry.flow !== "No Analysis" && entry.flow !== "Analysis Failed" && (
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        entry.flow === 'Positive Flow' ? 'bg-amber-100 text-amber-800' :
                                        entry.flow === 'Turbulent Flow' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {entry.flow}
                                    </span>
                                )}
                            </div>
                            <p className="text-stone-700 whitespace-pre-wrap">{entry.text}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-stone-500 text-center">You have no journal entries yet.</p>
                )}
            </div>
        </div>
    );
}
