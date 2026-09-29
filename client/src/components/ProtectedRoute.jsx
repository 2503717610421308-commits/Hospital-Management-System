import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user?.token) return <Navigate to="/login" replace />;
  return children;
}

export function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user?.token) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}
