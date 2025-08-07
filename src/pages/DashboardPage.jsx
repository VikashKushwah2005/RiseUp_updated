import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Lottie from 'lottie-react';
import plantAnimation from '../assets/lottie/plant-growth.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardPage({ userData: initialUserData }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const [streak, setStreak] = useState(initialUserData?.streak || 0);
  const [todayIndex, setTodayIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [lastCompletionDate, setLastCompletionDate] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalInsight, setJournalInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    async function fetchUserData() {
      if (!initialUserData?.id) {
        navigate('/login');
        return;
      }

      try {
        const userDocRef = doc(db, "users", initialUserData.id);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          const todayStr = new Date().toDateString();

          if (data.lastCompletionDate !== todayStr) {
            setCompletedTasks([]);
          } else {
            setCompletedTasks(data.completedTasks || []);
          }

          setUserData(data);
          setStreak(data.streak || 0);
          setLastCompletionDate(data.lastCompletionDate || null);
          setLoading(false);
        } else {
          navigate('/questionnaire');
        }
      } catch (err) {
        console.error("Error fetching user data from Firestore:", err);
        navigate('/login');
      }
    }

    fetchUserData();
  }, [initialUserData?.id, navigate]);

  useEffect(() => {
    if (!userData) return;
    if (!userData.plan || userData.plan.length === 0) {
      navigate('/questionnaire');
      return;
    }
    setTodayIndex(calculateTodayIndex());
  }, [userData, navigate]);

  const calculateTodayIndex = useCallback(() => {
    if (!userData?.createdAt) return 0;
    const startDate = new Date(userData.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(diffDays, 13);
  }, [userData]);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    if (completedTasks.length < 5 && lastCompletionDate !== todayStr) {
      toast.info("Don’t forget to complete your 5 tasks today 🌅", {
        position: "top-center",
        autoClose: 8000,
      });
    }
    if (completedTasks.length === 5 && lastCompletionDate !== todayStr) {
      toast.success("Great job! Your plant has grown today 🌱", {
        position: "top-center",
        autoClose: 8000,
      });
    }
  }, [completedTasks, lastCompletionDate]);

  const handleTaskToggle = async (task) => {
    const newCompletedTasks = completedTasks.includes(task)
      ? completedTasks.filter(t => t !== task)
      : [...completedTasks, task];

    setCompletedTasks(newCompletedTasks);

    try {
      await updateDoc(doc(db, "users", userData.id), {
        completedTasks: newCompletedTasks
      });
    } catch (err) {
      console.error("Error saving completed tasks:", err);
    }

    if (newCompletedTasks.length === 5) {
      const todayStr = new Date().toDateString();
      if (lastCompletionDate !== todayStr) {
        const newStreak = Math.min(streak + 1, 14);
        setStreak(newStreak);
        setLastCompletionDate(todayStr);

        try {
          await updateDoc(doc(db, "users", userData.id), {
            completedTasks: newCompletedTasks,
            streak: newStreak,
            lastCompletionDate: todayStr
          });
        } catch (err) {
          console.error("Error updating streak:", err);
        }
      }
    }
  };

  const handleJournalAnalysis = async () => {
    if (!journalEntry.trim() || !GEMINI_API_KEY) return;
    setIsInsightLoading(true);
    setJournalInsight('');

    const prompt = `Act as a compassionate, wise friend. A user has shared this journal entry. Do not give medical advice. Reflect their feelings back to them gently, identify one core emotion or theme, and offer one simple, actionable suggestion based on mindfulness or self-care. Keep the entire response to under 60 words. Journal Entry: "${journalEntry}"`;

    try {
      const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
        setJournalInsight(result.candidates[0].content.parts[0].text);
      } else {
        setJournalInsight("Could not get an insight at this moment. Please try again.");
      }
    } catch (error) {
      console.error("Journal Analysis Error:", error);
      setJournalInsight("Sorry, an error occurred while generating your insight.");
    } finally {
      setIsInsightLoading(false);
    }
  };

  if (loading) return <LoadingScreen text="Loading your dashboard..." />;
  if (!userData?.plan?.length) return null;
  const todayPlan = userData.plan[todayIndex];
  if (!todayPlan) return <LoadingScreen text="Finalizing your plan..." />;

  const totalTasks = todayPlan.tasks.length || 1;
  const progress = Math.min((completedTasks.length / totalTasks) * 100, 100);

  return (
    <div className="container mx-auto max-w-4xl p-6 md:py-12 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-stone-800">Welcome, {userData.name}</h2>
          <p className="text-stone-600">This is your path for today. One step at a time.</p>
        </div>
        <div className="text-center bg-white p-4 rounded-xl shadow-md">
          <div className="text-4xl font-bold text-amber-600">{streak}</div>
          <div className="text-sm text-stone-500">Day Streak</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold text-center text-stone-800 mb-6">{todayPlan.day}: Today's Focus</h3>
        <div className="w-full bg-stone-200 rounded-full h-2.5 mb-6 overflow-hidden">
          <div className="bg-green-500 h-2.5 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="space-y-4">
          {todayPlan.tasks.map((task, index) => (
            <div key={index} onClick={() => handleTaskToggle(task)}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition ${
                completedTasks.includes(task) ? 'bg-green-100' : 'bg-stone-50 hover:bg-stone-100'
              }`}>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                completedTasks.includes(task)
                  ? 'bg-green-500 border-green-500'
                  : 'border-stone-300'
              }`}>
                {completedTasks.includes(task) && <span className="text-white font-bold">✓</span>}
              </div>
              <p className={`flex-1 ${
                completedTasks.includes(task)
                  ? 'line-through text-stone-500'
                  : 'text-stone-700'
              }`}>{task}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-xl text-center">
        <h3 className="text-xl font-bold text-stone-800 mb-4">Your Mindful Plant 🌿</h3>
        <Lottie
          animationData={plantAnimation}
          loop={false}
          playSegments={[0, (streak / 14) * 100]}
          style={{ height: 300 }}
        />
        <p className="mt-2 text-stone-500">Every day you complete your tasks, your plant grows 🌱</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <h3 className="text-2xl font-bold text-stone-800 mb-4">Daily Journal</h3>
        <textarea
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          className="w-full p-3 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows="5"
          placeholder="How are you feeling today? What's on your mind?"
        ></textarea>
        <button
          onClick={handleJournalAnalysis}
          disabled={isInsightLoading || !journalEntry}
          className="mt-4 w-full py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition disabled:bg-stone-400"
        >
          {isInsightLoading ? 'Analyzing...' : 'Get Gentle Insights ✨'}
        </button>
        {journalInsight && (
          <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-lg">
            <p className="italic">{journalInsight}</p>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
