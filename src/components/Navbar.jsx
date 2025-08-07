import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onLogout, isLoggedIn }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-2xl font-bold text-amber-600 hover:text-amber-700 transition">Rise Up</button>
        <div className="hidden md:flex items-center space-x-6">
          <button onClick={() => navigate('/')} className="text-stone-600 hover:text-amber-600 transition">Home</button>
          {isLoggedIn && <button onClick={() => navigate('/dashboard')} className="text-stone-600 hover:text-amber-600 transition">Dashboard</button>}
          <button onClick={() => navigate('/chatbot')} className="text-stone-600 hover:text-amber-600 transition">AI Chat</button>
          <button onClick={() => navigate('/meditation')} className="text-stone-600 hover:text-amber-600 transition">Meditation</button>
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-stone-600 hover:text-amber-600 transition flex items-center">
              Features
              <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50">
                <button onClick={() => { navigate('/breathing'); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-stone-600 hover:bg-amber-50 hover:text-amber-600">Breathing Exercise</button>
                <button onClick={() => { navigate('/recipes'); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-stone-600 hover:bg-amber-50 hover:text-amber-600">AI Recipes</button>
                <button onClick={() => { navigate('/articles'); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-stone-600 hover:bg-amber-50 hover:text-amber-600">Articles</button>
                <button onClick={() => { navigate('/journal'); setIsDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-stone-600 hover:bg-amber-50 hover:text-amber-600">Journal</button>
              </div>
            )}
          </div>
          <button onClick={() => navigate('/consult')} className="text-stone-600 hover:text-amber-600 transition">Consult</button>
          <button onClick={() => navigate('/community')} className="text-stone-600 hover:text-amber-600 transition">Community</button>
        </div>
        <div className="flex items-center">
          {isLoggedIn ? (
            <button onClick={onLogout} className="bg-amber-600 text-white px-5 py-2 rounded-full hover:bg-amber-700 transition shadow-md">Logout</button>
          ) : (
            <button onClick={() => navigate('/login')} className="bg-amber-600 text-white px-5 py-2 rounded-full hover:bg-amber-700 transition shadow-md">Get Started</button>
          )}
        </div>
      </div>
    </nav>
  );
}