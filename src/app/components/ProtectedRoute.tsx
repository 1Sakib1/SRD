import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute:', {
    path: location.pathname,
    isLoading,
    isAuthenticated,
    isAdmin,
    adminOnly,
    userRole: user?.role
  });
  
  // Show nothing while loading to prevent flash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00B150] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Redirecting to /auth - not authenticated');
    return <Navigate to="/auth" replace />;
  }
  
  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute: Redirecting to /dashboard - not admin');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
};