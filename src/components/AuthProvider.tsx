import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useStore, type User } from '../store/useStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch user document from Firestore to get role and name
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let userData: User;
          
          if (userDoc.exists()) {
            userData = userDoc.data() as User;
          } else {
            // Fallback if document hasn't been created yet (e.g. just registered)
            userData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email || 'Unknown',
              role: 'user', // Default role
            };
            await setDoc(userDocRef, userData);
          }
          
          setCurrentUser(userData);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCurrentUser(null); // Fallback to unauthenticated state if db fails
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setCurrentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-budapest-green border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
