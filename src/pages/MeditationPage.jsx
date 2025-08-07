import React, { useState, useRef } from 'react';

export default function MeditationPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleSound = () => {
    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 p-6 text-center">
      <h2 className="text-4xl font-bold text-stone-800 mb-4">Find Your Center</h2>
      <p className="text-lg text-stone-600 mb-8 max-w-md">Close your eyes, breathe deeply, and let the sound guide you to stillness.</p>
      <button onClick={toggleSound} className="w-48 h-48 rounded-full bg-white shadow-2xl flex items-center justify-center transition-transform duration-300 transform hover:scale-105">
        <div className={`w-40 h-40 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-3xl transition-all duration-300 ${isPlaying ? 'animate-pulse bg-amber-600' : ''}`}>
          {isPlaying ? '||' : 'OM'}
        </div>
      </button>
      <audio
        ref={audioRef}
        src="/omchanting.mp3"
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />
      <p className="mt-8 text-stone-500">{isPlaying ? 'Playing...' : 'Tap to begin'}</p>
    </div>
  );
}