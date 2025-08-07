import React, { useState, useEffect, useRef } from 'react';

export default function BreathingPage() {
    const [isBreathing, setIsBreathing] = useState(false);
    const [text, setText] = useState('Start');
    const timerRef = useRef(null);
    const cycleRef = useRef(0);

    const breathCycle = ['Inhale', 'Hold', 'Exhale', 'Hold'];

    const startBreathing = () => {
        setIsBreathing(true);
        cycleRef.current = 0;
        const animate = () => {
            setText(breathCycle[cycleRef.current % 4]);
            cycleRef.current++;
            timerRef.current = setTimeout(animate, 4000);
        };
        animate();
    };

    const stopBreathing = () => {
        setIsBreathing(false);
        clearTimeout(timerRef.current);
        setText('Start');
    };

    const handleToggle = () => {
        if (isBreathing) {
            stopBreathing();
        } else {
            startBreathing();
        }
    };
    
    useEffect(() => {
        return () => clearTimeout(timerRef.current); // Cleanup on unmount
    }, []);

    return (
        <div className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-teal-100 p-6 text-center">
            <h2 className="text-4xl font-bold text-stone-800 mb-4">Box Breathing</h2>
            <p className="text-lg text-stone-600 mb-8 max-w-md">Follow the visual guide to calm your mind and regulate your breath. Each phase is 4 seconds.</p>
            <div className="relative w-64 h-64 flex items-center justify-center">
                <div 
                    className={`absolute w-full h-full bg-teal-300 rounded-full transition-transform duration-[4000ms] ease-in-out`}
                    style={{ animation: isBreathing ? `breathe 16s infinite ease-in-out` : 'none', transform: isBreathing ? 'scale(1)' : 'scale(0.5)' }}
                ></div>
                <div className="relative z-10 w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <p className="text-2xl font-bold text-teal-700">{text}</p>
                </div>
            </div>
            <button onClick={handleToggle} className="mt-12 bg-amber-600 text-white font-bold py-3 px-10 rounded-full hover:bg-amber-700 transition shadow-lg text-lg">
                {isBreathing ? 'Stop' : 'Begin Exercise'}
            </button>
            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(0.5); }
                    25% { transform: scale(1); }
                    50% { transform: scale(1); }
                    75% { transform: scale(0.5); }
                }
            `}</style>
        </div>
    );
}