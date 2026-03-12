import { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useStore, type User, type Challenge, type UserCompletion } from '../store/useStore';

interface LeaderboardEntry {
  user: User;
  score: number;
}

export default function Leaderboard() {
  const { currentUser } = useStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<UserCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    // Fetch users (only roles 'user', or all mapped)
    const qUsers = query(collection(db, 'users'), where('role', '==', 'user'));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as User[]);
    });
    unsubs.push(unsubUsers);

    // Fetch challenges
    const unsubChallenges = onSnapshot(collection(db, 'challenges'), (snap) => {
      setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Challenge[]);
    });
    unsubs.push(unsubChallenges);

    // Fetch completions
    const unsubCompletions = onSnapshot(collection(db, 'completions'), (snap) => {
      setCompletions(snap.docs.map(d => ({ id: d.id, ...d.data() })) as UserCompletion[]);
      setLoading(false);
    });
    unsubs.push(unsubCompletions);

    return () => {
      unsubs.forEach(u => u());
    };
  }, []);

  const leaderboard = useMemo(() => {
    const ChallengePoints = new Map<string, number>();
    challenges.forEach(c => ChallengePoints.set(c.id, c.points));

    const UserScores = new Map<string, number>();
    users.forEach(u => UserScores.set(u.id, 0));

    completions.forEach(comp => {
      if (UserScores.has(comp.userId)) {
        const pts = ChallengePoints.get(comp.challengeId) || 0;
        UserScores.set(comp.userId, UserScores.get(comp.userId)! + pts);
      }
    });

    const entries: LeaderboardEntry[] = users.map(user => ({
      user,
      score: UserScores.get(user.id) || 0
    }));

    return entries.sort((a, b) => b.score - a.score);
  }, [users, challenges, completions]);

  if (loading) {
    return <div className="flex justify-center py-12 text-gray-500">Loading Leaderboard...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
        <h1 className="text-4xl font-extrabold text-gray-900">Global Leaderboard</h1>
        <p className="text-gray-500 mt-2">See who is dominating Budapest!</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <ul className="divide-y divide-gray-100">
          {leaderboard.map((entry, index) => {
            const isMe = entry.user.id === currentUser?.id;
            
            return (
              <li 
                key={entry.user.id} 
                className={`flex items-center p-4 sm:p-6 transition-colors ${
                  isMe ? 'bg-budapest-green/10' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center w-12 flex-shrink-0">
                  {index === 0 && <Crown className="text-yellow-500 w-8 h-8" />}
                  {index === 1 && <Medal className="text-gray-400 w-8 h-8" />}
                  {index === 2 && <Medal className="text-amber-600 w-8 h-8" />}
                  {index > 2 && <span className="text-xl font-bold text-gray-400">#{index + 1}</span>}
                </div>
                
                <div className="ml-4 flex-1">
                  <p className={`text-lg font-bold flex items-center gap-2 ${isMe ? 'text-budapest-green' : 'text-gray-900'}`}>
                    {entry.user.name}
                    {isMe && <span className="text-xs font-semibold bg-budapest-green text-white px-2 py-0.5 rounded-full">YOU</span>}
                  </p>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-gray-900">
                    {entry.score}
                  </p>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Points
                  </p>
                </div>
              </li>
            );
          })}
          
          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No users have registered yet.
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
