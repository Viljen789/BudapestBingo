import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // I need to fix export to default if it isn't
import Navbar from './components/Navbar';
import AuthProvider from './components/AuthProvider';
import Login from './pages/Login';

// Admin Pages
import Users from './pages/admin/Users';
import Challenges from './pages/admin/Challenges';
import AdminSecrets from './pages/admin/AdminSecrets';

// User Pages
import UserChallenges from './pages/user/UserChallenges';
import Secrets from './pages/user/Secrets';
import Leaderboard from './pages/Leaderboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Login />} />
            
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route path="/admin/users" element={<Users />} />
              <Route path="/admin/challenges" element={<Challenges />} />
              <Route path="/admin/secrets" element={<AdminSecrets />} />
            </Route>

            <Route element={<ProtectedRoute allowedRole="user" />}>
              <Route path="/user/challenges" element={<UserChallenges />} />
              <Route path="/user/secrets" element={<Secrets />} />
            </Route>

            <Route path="/leaderboard" element={<Leaderboard />} />

            {/* Fallback */}
            <Route path="*" element={<Login />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}
