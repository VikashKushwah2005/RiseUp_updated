import React, { useState } from 'react';
import { getMockUserId } from '../App';

const initialStories = [
  { id: 1, text: "The 14-day plan helped me build a routine that I didn't know I needed. Feeling more focused and calm.", authorId: 'user_abc' },
  { id: 2, text: "It's comforting to know I'm not alone. Reading the stories here gives me strength.", authorId: 'user_def' }
];

export default function CommunityPage() {
  const [stories, setStories] = useState(initialStories);
  const [newStory, setNewStory] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newStory.trim()) return;
    const newStoryObj = { id: Date.now(), text: newStory, authorId: getMockUserId() };
    setStories([newStoryObj, ...stories]);
    setNewStory('');
  };
  return (
    <div className="container mx-auto max-w-4xl p-6 md:py-12">
      <h2 className="text-3xl font-bold text-stone-800 mb-2">Shared Journeys</h2>
      <p className="text-stone-600 mb-8">Find strength in the stories of others. You are not alone.</p>
      <div className="bg-white p-6 rounded-2xl shadow-xl mb-8">
        <form onSubmit={handleSubmit}>
          <textarea value={newStory} onChange={(e) => setNewStory(e.target.value)}
            className="w-full p-3 text-stone-700 bg-stone-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows="4" placeholder="Share how Rise Up has helped you, or offer words of encouragement..."></textarea>
          <button type="submit" className="w-full mt-4 py-3 font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition">Share Your Story</button>
        </form>
      </div>
      <div className="space-y-6">
        {stories.map(story => (
          <div key={story.id} className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-stone-700 italic">`"{story.text}"`</p>
            <p className="text-right text-sm text-stone-500 mt-4">- Anonymous User</p>
          </div>
        ))}
      </div>
    </div>
  );
}