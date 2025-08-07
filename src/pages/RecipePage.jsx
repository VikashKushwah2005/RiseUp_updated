import React, { useState } from 'react';

export default function RecipePage() {
    const [ingredients, setIngredients] = useState('');
    const [recipe, setRecipe] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    const handleGenerateRecipe = async () => {
        if (!ingredients.trim() || !GEMINI_API_KEY) {
            setError('Please enter some ingredients and ensure your API key is set.');
            return;
        }
        setError('');
        setIsLoading(true);
        setRecipe('');

        const prompt = `You are an expert chef specializing in simple, healthy, Sattvic (yogic) cuisine. A user has the following ingredients: "${ingredients}". Create a simple recipe for them. The recipe should be vegetarian, use minimal spices (no onion, no garlic), and be easy to prepare. Format the response with "Recipe Title:", "Ingredients:", and "Instructions:".`;

        try {
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error("API call failed");
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
                setRecipe(result.candidates[0].content.parts[0].text);
            } else {
                setError("Could not generate a recipe at this moment. Please try again.");
            }
        } catch (err) {
            console.error("Recipe Generation Error:", err);
            setError("Sorry, an error occurred while generating your recipe.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl p-6 md:py-12">
            <h2 className="text-4xl font-bold text-center text-stone-800 mb-4">AI Sattvic Recipe Generator</h2>
            <p className="text-center text-stone-600 max-w-2xl mx-auto mb-8">Nourish your body and mind. Enter the ingredients you have, and our AI will create a simple, calming Sattvic recipe for you.</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl">
                <label className="text-sm font-bold text-stone-600 block mb-2">Your Ingredients (e.g., rice, lentils, spinach, tomato)</label>
                <textarea
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full p-3 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows="3"
                    placeholder="List your ingredients here, separated by commas..."
                ></textarea>
                <button onClick={handleGenerateRecipe} disabled={isLoading || !GEMINI_API_KEY} className="mt-4 w-full py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:bg-stone-400">
                    {isLoading ? 'Creating...' : 'Generate Recipe ✨'}
                </button>
                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
            </div>

            {recipe && (
                <div className="mt-8 bg-white p-8 rounded-2xl shadow-xl">
                    {recipe.split('\n').map((line, index) => {
                        // Remove leading stars and spaces for better readability
                        const cleanLine = line.replace(/^\s*[\*\-]\s?/, '').trim();

                        if (line.startsWith('Recipe Title:')) {
                            return <h3 key={index} className="text-2xl font-bold text-amber-700 mb-4">{line.replace('Recipe Title:', '').trim()}</h3>;
                        }
                        if (line.startsWith('Ingredients:')) {
                            return <h4 key={index} className="text-xl font-bold text-stone-800 mt-4 mb-2">{line.trim()}</h4>;
                        }
                        if (line.startsWith('Instructions:')) {
                            return <h4 key={index} className="text-xl font-bold text-stone-800 mt-4 mb-2">{line.trim()}</h4>;
                        }
                        // Only render cleaned lines that aren't empty or section headers
                        if (
                            cleanLine &&
                            !line.startsWith('Recipe Title:') &&
                            !line.startsWith('Ingredients:') &&
                            !line.startsWith('Instructions:')
                        ) {
                            return <p key={index} className="text-stone-700 my-1">{cleanLine}</p>;
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
}