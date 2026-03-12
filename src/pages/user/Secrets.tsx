import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { ShieldAlert, CheckCircle2, Circle } from 'lucide-react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';

interface SecretMission {
  id: string;
  userId: string;
  text: string;
  isCompleted: boolean;
}

export default function Secrets() {
  const { currentUser } = useStore();
  const [secrets, setSecrets] = useState<SecretMission[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'secrets'), where('userId', '==', currentUser.id));
    const unsub = onSnapshot(q, (snap) => {
      setSecrets(snap.docs.map(d => ({ id: d.id, ...d.data() })) as SecretMission[]);
    });
    return () => unsub();
  }, [currentUser]);

  if (!currentUser) return null;

  const toggleChallengeComplete = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'secrets', id), { isCompleted: !currentStatus });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-budapest-red" />
            Secret Missions
          </h1>
          <p className="text-gray-500 mt-1">
            Complete these tasks without anyone finding out they were on your list!
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {secrets.map(secret => (
          <div 
            key={secret.id}
            onClick={() => toggleChallengeComplete(secret.id, secret.isCompleted)}
            className={`
              w-full text-left p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center gap-4
              ${secret.isCompleted 
                ? 'bg-green-50 border-budapest-green shadow-sm opacity-80' 
                : 'bg-white border-gray-200 shadow-md hover:border-gray-300 hover:shadow-lg'
              }
            `}
          >
            <div className="flex-shrink-0">
              {secret.isCompleted ? (
                <CheckCircle2 size={28} className="text-budapest-green transition-transform duration-500 scale-110" />
              ) : (
                <Circle size={28} className="text-gray-300 hover:text-gray-400 transition-colors" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-lg font-medium transition-colors ${secret.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                {secret.text}
              </h3>
            </div>
          </div>
        ))}

        {secrets.length === 0 && (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
            <ShieldAlert size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No active secrets.</h3>
            <p className="text-gray-500 mt-2">You haven't been assigned any covert operations yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
