import { useState, useEffect, useMemo } from 'react';
import { useStore, type Challenge } from '../../store/useStore';
import { db } from '../../firebase';
import { collection, doc, onSnapshot, query, setDoc, deleteDoc } from 'firebase/firestore';

export default function UserChallenges() {
  const { currentUser } = useStore();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<string[]>([]); // Array of completed challenge IDs

  // Fetch all challenges and current user's completions
  useEffect(() => {
    if (!currentUser) return;

    // Fetch Challenges
    const unsubscribeChallenges = onSnapshot(collection(db, 'challenges'), (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Challenge[];
      setChallenges(fetched);
    });

    // Fetch user completions (assuming a 'completions' subcollection under users, or a global 'completions' collection. Global is easier: { userId, challengeId })
    const qCompletions = query(collection(db, 'completions'));
    const unsubscribeCompletions = onSnapshot(qCompletions, (snapshot) => {
      const userComps = snapshot.docs
        .filter(d => d.data().userId === currentUser.id)
        .map(d => d.data().challengeId);
      setCompletions(userComps);
    });

    return () => {
      unsubscribeChallenges();
      unsubscribeCompletions();
    };
  }, [currentUser]);

  // Group challenges by category, sort points, etc.
  const categories = useMemo(() => {
    const map = new Map<string, Challenge[]>();
    challenges.forEach(c => {
      if (!map.has(c.category)) {
        map.set(c.category, []);
      }
      map.get(c.category)?.push(c);
    });

    // Sort challenges within each category by points ascending
    map.forEach((catChallenges) => {
      catChallenges.sort((a, b) => a.points - b.points);
    });

    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [challenges]);

  const toggleChallenge = async (challengeId: string, isCompleted: boolean) => {
    if (!currentUser) return;
    const docId = `${currentUser.id}_${challengeId}`;
    
    if (isCompleted) {
      // Un-complete
      await deleteDoc(doc(db, 'completions', docId));
    } else {
      // Complete
      await setDoc(doc(db, 'completions', docId), {
        userId: currentUser.id,
        challengeId,
        completedAt: Date.now()
      });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Challenges</h1>
        <p className="text-gray-500 mt-2">Rack up points by completing categorized challenges!</p>
      </div>

      <div className="space-y-12">
        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No challenges available yet.
          </div>
        )}

        {categories.map(([category, catChallenges]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-bold text-budapest-red border-b-2 border-budapest-red pb-2 inline-block">
              {category}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {catChallenges.map(challenge => {
                const isCompleted = completions.includes(challenge.id);
                
                return (
                  <button
                    key={challenge.id}
                    onClick={() => toggleChallenge(challenge.id, isCompleted)}
                    className={`
                      relative group h-32 flex flex-col p-4 rounded-xl shadow-md border-2 transition-all duration-300 text-left
                      ${isCompleted 
                        ? 'bg-budapest-green/10 border-budapest-green shadow-inner transform scale-[0.98]' 
                        : 'bg-white border-transparent hover:border-budapest-green hover:shadow-lg hover:-translate-y-1'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-black text-lg ${isCompleted ? 'text-budapest-green' : 'text-gray-800'}`}>
                        {challenge.points}
                      </span>
                      {isCompleted && (
                        <div className="text-budapest-green font-bold text-xs uppercase tracking-wider bg-budapest-green/20 px-2 py-1 rounded">
                          Done
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-sm leading-snug flex-grow overflow-hidden ${isCompleted ? 'text-gray-600' : 'text-gray-700'}`}>
                      {challenge.text}
                    </p>
                    
                    {/* Stamp overlay effect when checked */}
                    {isCompleted && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                        <div className="border-4 border-budapest-green rounded-full p-6 transform -rotate-12">
                          <span className="text-budapest-green font-black text-3xl uppercase tracking-widest">Completed</span>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
