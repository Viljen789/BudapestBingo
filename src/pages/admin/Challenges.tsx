import { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

interface ChallengeData {
  id: string;
  category: string;
  points: number;
  text: string;
  isActive: boolean;
}

export default function Challenges() {
  const [challenges, setChallenges] = useState<ChallengeData[]>([]);
  const [category, setCategory] = useState('');
  const [points, setPoints] = useState(10);
  const [text, setText] = useState('');

  useEffect(() => {
    // Listen to real-time updates from Firestore
    const q = query(collection(db, 'challenges'), orderBy('category'), orderBy('points'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChallenges = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as ChallengeData[];
      setChallenges(fetchedChallenges);
    });
    return () => unsubscribe();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (category.trim() && text.trim() && points > 0) {
      await addDoc(collection(db, 'challenges'), {
        category: category.trim(),
        points,
        text: text.trim(),
        isActive: true
      });
      setCategory('');
      setPoints(10);
      setText('');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      await deleteDoc(doc(db, 'challenges', id));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manage Challenges</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <PlusCircle size={20} className="text-budapest-green" />
          Add New Challenge
        </h2>
        
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                id="category"
                placeholder="e.g., Food, Sightseeing, Nightlife"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-budapest-green focus:border-budapest-green"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            
            <div className="sm:w-32">
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                id="points"
                min="1"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-budapest-green focus:border-budapest-green"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">Challenge Description</label>
            <input
              type="text"
              id="text"
              placeholder="e.g., Eat a full bowl of Goulash"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-budapest-green focus:border-budapest-green"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="self-end px-6 py-2 bg-budapest-green text-white font-medium rounded-md hover:bg-green-800 transition-colors"
          >
            Add Challenge
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {challenges.map((c) => (
            <li key={c.id} className="p-4 hover:bg-gray-50 flex items-center justify-between gap-4 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {c.category}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    {c.points} pts
                  </span>
                </div>
                <p className={`text-sm font-medium ${c.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                  {c.text}
                </p>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
          
          {challenges.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No challenges added yet.
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
