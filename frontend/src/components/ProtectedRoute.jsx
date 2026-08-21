import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Skeleton loader for auth check
const AuthLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 rounded-full border-4 border-primary-600/30 border-t-primary-500 animate-spin mx-auto mb-4" />
      <p className="text-gray-400 text-sm">Loading KaaryaSetu...</p>
    </div>
  </div>
);

/**
 * ProtectedRoute — requires authentication
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

/**
 * AdminRoute — requires admin or hr role
 */
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!['admin', 'hr'].includes(user.role)) return <Navigate to="/employee/dashboard" replace />;
  return children;
};

/**
 * EmployeeRoute — redirects admin to admin dashboard
 */
export const EmployeeRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (['admin', 'hr'].includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
  return children;
};

/**
 * PublicRoute — redirects logged-in users to their dashboard
 */
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoader />;
  if (user) {
    if (['admin', 'hr'].includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/employee/dashboard" replace />;
  }
  return children;
};
