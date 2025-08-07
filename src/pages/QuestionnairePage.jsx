import React, { useState } from 'react';
import { questions } from '../data/questions';
import LoadingScreen from '../components/LoadingScreen';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Make sure this is your Firestore instance

export default function QuestionnairePage({ userData, onPlanGenerated }) {
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ageGroup = userData?.ageGroup;
  const currentQuestions = questions[ageGroup] || [];

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null) || !problem) {
      setError('Please answer all questions and describe your challenge.');
      return;
    }
    if (!GEMINI_API_KEY) {
      setError("API Key is missing. Please add it to your .env file.");
      return;
    }
    setError('');
    setLoading(true);
    const prompt = `
A user aged ${userData.age} is seeking guidance.
Their main challenge is: "${problem}".
Based on their answers below and their primary challenge, create a 14-day transformative plan rooted in principles of self-discipline, mindfulness, and traditional Indian wisdom (like Brahmacharya).
The tone should be gentle, supportive, and encouraging.
Each day must have exactly 5 actionable tasks. The tasks should start very light and gradually increase in difficulty or commitment.

User's Questionnaire Answers:
${currentQuestions.map((q, i) => `${i + 1}. ${q.q} - Answer: ${answers[i]}`).join('\n')}

IMPORTANT: Your entire response must be ONLY the raw JSON array, starting with '[' and ending with ']'. Do not include any other text, explanations, or markdown formatting.
For example: [{"day": "Day 1", "tasks": ["Task 1", "Task 2", "Task 3", "Task 4", "Task 5"]}, ...]
`;
    try {
      let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistory };
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
        let responseText = result.candidates[0].content.parts[0].text;
        const startIndex = responseText.indexOf('[');
        const endIndex = responseText.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1) {
          const jsonString = responseText.substring(startIndex, endIndex + 1);
          try {
            const plan = JSON.parse(jsonString);

            // Save to Firestore under UID
            await setDoc(doc(db, "users", userData.id), {
              ...userData,
              questionnaire: {
                answers,
                problem,
                ageGroup,
                age: userData.age,
                timestamp: new Date().toISOString()
              },
              plan
            });

            onPlanGenerated(plan);
          } catch (parseError) {
            console.error("JSON Parsing Error:", parseError, "--- Original Text:", responseText);
            throw new Error("Failed to parse the generated plan.");
          }
        } else { 
          console.error("Invalid response format from API:", responseText);
          throw new Error("Could not find a valid plan in the API response."); 
        }
      } else { 
        console.error("Malformed API response:", result);
        throw new Error("The response from the API was empty or malformed."); 
      }
    } catch (e) {
      console.error("Error generating plan:", e);
      setError("Sorry, we couldn't create your plan right now. Please try again later.");
    } finally { setLoading(false); }
  };

  if (!ageGroup) return <LoadingScreen text="Loading your profile..." />;
  if (loading) return <LoadingScreen text="Crafting your personalized journey..." />;
  return (
    <div className="container mx-auto max-w-3xl p-6 md:py-12">
      <h2 className="text-3xl font-bold text-stone-800 mb-2">A Few Steps to Begin</h2>
      <p className="text-stone-600 mb-8">Your honest answers will help us create a path just for you.</p>
      <div className="space-y-8">
        {currentQuestions.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <p className="font-semibold text-lg mb-4 text-stone-700">{index + 1}. {item.q}</p>
            <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
              {item.o.map(option => (
                <button key={option} onClick={() => handleAnswer(index, option)}
                  className={`flex-1 p-3 rounded-lg border-2 transition ${answers[index] === option ? 'bg-amber-600 text-white border-amber-600' : 'bg-stone-100 hover:bg-stone-200 border-transparent'}`}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <label className="font-semibold text-lg mb-4 block text-stone-700">Lastly, in your own words, what is the main challenge you are facing right now?</label>
          <textarea value={problem} onChange={(e) => setProblem(e.target.value)}
            className="w-full p-3 mt-2 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows="4" placeholder="e.g., I feel lost about my career, I struggle with focus..."></textarea>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button onClick={handleSubmit} className="w-full py-4 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 shadow-lg">
          Create My 14-Day Plan
        </button>
      </div>
    </div>
  );
}