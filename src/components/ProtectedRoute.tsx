import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface ProtectedRouteProps {
  allowedRole?: 'admin' | 'user';
}

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  // If a specific role is required and user does not have it
  if (allowedRole && currentUser.role !== allowedRole) {
    // Redirect to their respective dashboard
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin/users" replace />;
    } else {
      return <Navigate to="/user/challenges" replace />;
    }
  }

  return <Outlet />;
}
