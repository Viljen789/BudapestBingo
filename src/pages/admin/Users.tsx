import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Trash2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useStore, type User } from '../../store/useStore';

export default function Users() {
  const { currentUser } = useStore();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Listen to real-time updates from Firestore
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetchedUsers = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as User[];
      setUsers(fetchedUsers);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user record (Auth must be deleted separately in Firebase Console)?')) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  const toggleAdmin = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateDoc(doc(db, 'users', id), { role: newRole });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-help" title={`ID: ${user.id}`}>
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-budapest-red text-white' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.id !== currentUser?.id ? (
                    <div className="flex items-center justify-end gap-2">
                       <button
                        onClick={() => toggleAdmin(user.id, user.role)}
                        className={`p-2 rounded-full transition-colors ${
                          user.role === 'admin' 
                            ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                            : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                        title={user.role === 'admin' ? "Revoke Admin" : "Make Admin"}
                      >
                        {user.role === 'admin' ? <ShieldAlert size={18} /> : <Shield size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete user data"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Current</span>
                  )}
                </td>
              </tr>
            ))}
            
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
