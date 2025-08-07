import React, { useState } from 'react';
import { articlesData } from '../data/articles';

export default function ArticlesPage() {
  const [expandedId, setExpandedId] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleArticleSummary = async (articleId, content) => {
    if (summaries[articleId] || !GEMINI_API_KEY) return;
    setLoadingSummary(articleId);
    const prompt = `Summarize the following article into three concise bullet points. Focus on the key takeaways. Article: "${content}"`;
    try {
        let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
        const payload = { contents: chatHistory };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error("API call failed");
        const result = await response.json();
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
            setSummaries(prev => ({ ...prev, [articleId]: result.candidates[0].content.parts[0].text }));
        } else {
            setSummaries(prev => ({ ...prev, [articleId]: "Could not generate a summary." }));
        }
    } catch (error) {
        console.error("Article Summary Error:", error);
        setSummaries(prev => ({ ...prev, [articleId]: "Error generating summary." }));
    } finally {
        setLoadingSummary(null);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 md:py-12">
      <h2 className="text-3xl font-bold text-stone-800 mb-2">Wisdom for the Path</h2>
      <p className="text-stone-600 mb-8">Read and reflect on articles designed to support your journey.</p>
      <div className="space-y-6">
        {articlesData.map((article) => (
          <div key={article.id} className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-300">
            <h3 className="text-2xl font-bold text-stone-800 mb-2">{article.title}</h3>
            <p className="text-stone-600 mb-4 whitespace-pre-wrap">{expandedId === article.id ? article.content : article.excerpt}</p>
            
            {summaries[article.id] && (
                <div className="my-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">
                    <h4 className="font-bold mb-2">✨ AI Summary</h4>
                    <ul className="list-disc list-inside">
                        {summaries[article.id].split('\n').map((item, index) => item.trim() && <li key={index}>{item.replace(/[•*\-]/g, '').trim()}</li>)}
                    </ul>
                </div>
            )}

            <div className="flex items-center gap-4">
                <button onClick={() => handleToggle(article.id)} className="font-semibold text-amber-600 hover:text-amber-700 transition">
                  {expandedId === article.id ? 'Read Less' : 'Read More'} &rarr;
                </button>
                <button 
                    onClick={() => handleArticleSummary(article.id, article.content)} 
                    disabled={loadingSummary === article.id || summaries[article.id] || !GEMINI_API_KEY}
                    className="font-semibold text-blue-600 hover:text-blue-700 transition disabled:text-stone-400 disabled:cursor-not-allowed"
                >
                    {loadingSummary === article.id ? 'Summarizing...' : (summaries[article.id] ? '✓ Summarized' : 'Summarize with AI ✨')}
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}