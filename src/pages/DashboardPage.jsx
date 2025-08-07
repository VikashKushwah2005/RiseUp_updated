import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

export default function DashboardPage({ userData: initialUserData }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const [plan, setPlan] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [streak, setStreak] = useState(initialUserData?.streak || 0);
  const [lastCompletionDate, setLastCompletionDate] = useState(initialUserData?.lastCompletionDate || "");
  const [coins, setCoins] = useState(initialUserData?.points || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (!userData?.id) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userData.id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setPlan(data.plan || []);
          setCurrentDayIndex(data.currentDayIndex || 0);
          setCompletedTasks(data.completedTasks || []);
          setStreak(data.streak || 0);
          setLastCompletionDate(data.lastCompletionDate || "");
          setCoins(data.points || 0);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserData();
  }, [userData?.id]);

  const handleTaskToggle = async (task) => {
    const isAlreadyCompleted = completedTasks.includes(task);
    const newCompletedTasks = isAlreadyCompleted
      ? completedTasks.filter(t => t !== task)
      : [...completedTasks, task];

    setCompletedTasks(newCompletedTasks);

    let updatedData = { completedTasks: newCompletedTasks };
    let updatedCoins = coins;

    // ✅ Award 1 coin only when task is newly completed
    if (!isAlreadyCompleted) {
      updatedCoins += 1;
      updatedData.points = updatedCoins;
      setCoins(updatedCoins);
      toast.success("💰 You earned 1 coin!", {
        position: "bottom-left",
        duration: 3000,
      });
    }

    try {
      await updateDoc(doc(db, "users", userData.id), updatedData);
    } catch (err) {
      console.error("Error updating tasks/coins:", err);
    }

    // ✅ Check if all tasks are completed
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

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const todayTasks = plan[currentDayIndex]?.tasks || [];

  const renderTask = (task, index) => {
    const isCompleted = completedTasks.includes(task);
    const isClickable = index === completedTasks.length;

    return (
      <div
        key={task}
        className={`flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow transition-transform duration-300 ${
          isCompleted ? "line-through text-gray-400" : ""
        } ${isClickable && !isCompleted ? "hover:scale-105 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        onClick={() => isClickable && !isCompleted && handleTaskToggle(task)}
      >
        <span>{task}</span>
        {isCompleted && (
          <span className="text-green-500 font-bold">✓</span>
        )}
      </div>
    );
  };

  if (loading) return <div className="text-center py-20">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-amber-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-700">Rise Up Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg shadow hover:bg-amber-700 transition"
          >
            Logout
          </button>
        </div>

        {/* Coins and Streak */}
        <div className="flex gap-4 mb-8">
          <div className="text-center bg-white p-4 rounded-xl shadow-md">
            <div className="text-4xl font-bold text-amber-600">{streak}</div>
            <div className="text-sm text-stone-500">Day Streak</div>
          </div>
          <div className="text-center bg-white p-4 rounded-xl shadow-md">
            <div className="text-4xl font-bold text-yellow-500">{coins}</div>
            <div className="text-sm text-stone-500">Coins</div>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4 text-stone-700">Day {currentDayIndex + 1} Tasks</h2>
          {todayTasks.map((task, index) => renderTask(task, index))}
        </div>
      </div>
    </div>
  );
}
