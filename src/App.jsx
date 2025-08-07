import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import QuestionnairePage from './pages/QuestionnairePage';
import DashboardPage from './pages/DashboardPage';
import MeditationPage from './pages/MeditationPage';
import BreathingPage from './pages/BreathingPage';
import RecipePage from './pages/RecipePage';
import CommunityPage from './pages/CommunityPage';
import ArticlesPage from './pages/ArticlesPage';
import ConsultPage from './pages/ConsultPage';
import BookingPage from './pages/BookingPage';
import ChatbotPage from './pages/ChatbotPage';
import JournalPage from './pages/JournalPage';
import LoadingScreen from './components/LoadingScreen';

export const getMockUserId = () => `user_${Math.random().toString(36).substr(2, 9)}`;

export default function App() {
  const [userData, setUserData] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (newUserData) => {
    setUserData(newUserData);
    navigate('/questionnaire');
  };

  const handleLogout = () => {
    setUserData(null);
    navigate('/');
  };

  const handlePlanGenerated = (plan) => {
    setUserData(prevData => ({ ...prevData, plan }));
    navigate('/dashboard');
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    navigate('/booking');
  };

  return (
    <div className="bg-stone-50 min-h-screen font-sans text-stone-800">
      <Navbar
        navigate={navigate}
        onLogout={handleLogout}
        isLoggedIn={!!userData}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/questionnaire" element={<QuestionnairePage userData={userData} onPlanGenerated={handlePlanGenerated} />} />
        <Route path="/dashboard" element={<DashboardPage userData={userData} />} />
        <Route path="/meditation" element={<MeditationPage />} />
        <Route path="/breathing" element={<BreathingPage />} />
        <Route path="/recipes" element={<RecipePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/consult" element={<ConsultPage onBookAppointment={handleBookAppointment} />} />
        <Route path="/booking" element={<BookingPage doctor={selectedDoctor} setPage={navigate} />} />
        <Route path="/chatbot" element={<ChatbotPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}