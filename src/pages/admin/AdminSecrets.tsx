import { useState, useEffect } from 'react';
import type { User } from '../../store/useStore';
import { Trash2, ShieldAlert } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';

interface SecretMission {
  id: string;
  userId: string;
  text: string;
  isCompleted: boolean;
}

export default function AdminSecrets() {
  const [secrets, setSecrets] = useState<SecretMission[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [missionText, setMissionText] = useState('');

  // We could rely on `useStore.users`, but it might be empty on reload since Users.tsx is the only one populating it right now.
  // Wait, I should fetch users here too or ensure they are in global store.
  // Actually, I'll just fetch users with role 'user' locally for the dropdown.
  const [targetUsers, setTargetUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'user')), (snap) => {
      setTargetUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as User[]);
    });

    const unsubSecrets = onSnapshot(collection(db, 'secrets'), (snap) => {
      setSecrets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as SecretMission[]);
    });

    return () => {
      unsubUsers();
      unsubSecrets();
    };
  }, []);

  const userSecrets = secrets.filter(s => s.userId === selectedUserId);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && missionText.trim()) {
      await addDoc(collection(db, 'secrets'), {
        userId: selectedUserId,
        text: missionText.trim(),
        isCompleted: false
      });
      setMissionText('');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'secrets', id));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Secret Missions</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <ShieldAlert size={20} className="text-budapest-red" />
          Assign Target Student
        </h2>
        
        <div className="mb-6">
          <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
          <select
            id="user-select"
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:ring-budapest-red focus:border-budapest-red"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="" disabled>-- Choose a student --</option>
            {targetUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {selectedUserId && (
          <form onSubmit={handleAddSubmit} className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="mission" className="sr-only">Secret Mission</label>
              <input
                type="text"
                id="mission"
                placeholder="e.g., Convince someone you speak fluent Hungarian"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-budapest-red focus:border-budapest-red"
                value={missionText}
                onChange={(e) => setMissionText(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="px-6 py-2 bg-budapest-red text-white font-medium rounded-md hover:bg-red-800 transition-colors whitespace-nowrap"
            >
              Assign Secret Task
            </button>
          </form>
        )}
      </div>

      {selectedUserId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
              Assigned Missions
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {userSecrets.map((s) => (
              <li key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.isCompleted ? 'bg-budapest-green' : 'bg-red-400'}`} />
                  <p className={`text-sm ${s.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900 font-medium'}`}>
                    {s.text}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove Mission"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
            
            {userSecrets.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No active secret missions for this student.
              </div>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
