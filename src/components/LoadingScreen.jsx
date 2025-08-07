import React from 'react';

export default function LoadingScreen({ text = "Loading..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-amber-500"></div>
      <p className="text-lg text-stone-600 mt-4">{text}</p>
    </div>
  );
}